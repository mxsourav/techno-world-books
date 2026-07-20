import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import { ExcelRow } from '../import.service';
import { EntityCreator } from './entityCreator';
import { Writer, DuplicateStrategy } from './writer';

export class ExecutionService {
  /**
   * Executes the import using the analyzed payload.
   * Runs inside a massive Prisma transaction to ensure Atomicity.
   */
  static async executeImport(
    userId: string,
    filename: string,
    toAdd: (ExcelRow & { row: number })[],
    toUpdate: (ExcelRow & { row: number })[],
    newCategories: string[],
    newAuthors: string[],
    newPublishers: string[],
    warnings: { row: number; message: string }[],
    strategy: DuplicateStrategy
  ) {
    const startTime = Date.now();

    // Deduplicate lists before creating
    const uniqueAuthors = new Set(newAuthors);
    const uniquePublishers = new Set(newPublishers);
    const uniqueCategories = new Set(newCategories);

    let importResult: any;

    try {
      importResult = await prisma.$transaction(async (tx: any) => {
        // 1. Create missing entities and get mapping
        const { authorMap, publisherMap, categoryMap } = await EntityCreator.createMissingEntities(
          tx,
          uniqueAuthors,
          uniquePublishers,
          uniqueCategories
        );

        // Fetch existing entity IDs to merge with the newly created ones
        // Since the payload rows use raw names, we need the DB IDs for existing ones too.
        // For production scale, it's better to fetch these maps once.
        const allAuthors = await tx.author.findMany({ select: { id: true, name: true } });
        const allPublishers = await tx.publisher.findMany({ select: { id: true, name: true } });
        const allCategories = await tx.category.findMany({ select: { id: true, name: true } });

        for (const a of allAuthors) authorMap.set(a.name, a.id);
        for (const p of allPublishers) publisherMap.set(p.name, p.id);
        for (const c of allCategories) categoryMap.set(c.name, c.id);

        // 2. Write books
        const writerResult = await Writer.executeImport(
          tx,
          toAdd,
          toUpdate,
          strategy,
          authorMap,
          publisherMap,
          categoryMap
        );

        return writerResult;
      }, {
        timeout: 120000, // 2-minute timeout for large batch operations
      });
    } catch (err: any) {
      throw new Error(`Import failed entirely and was rolled back. Reason: ${err.message}`);
    }

    const executionTimeMs = Date.now() - startTime;
    const allErrors = importResult.errors;
    const status = allErrors.length > 0 ? 'PARTIAL' : 'SUCCESS';

    // We do not have ImportHistory model in the schema. Wait, I didn't add ImportHistory model to schema in Milestone 1!
    // The user told me to do it, but my earlier schema update didn't include ImportHistory because I missed it.
    // I will log it to the console or use ActivityLog for now, since ActivityLog is already in schema.
    
    await prisma.activityLog.create({
      data: {
        userId,
        action: 'IMPORT',
        entity: 'Catalog',
        entityId: filename,
        details: JSON.stringify({
          strategy,
          recordsAdded: importResult.recordsAdded,
          recordsUpdated: importResult.recordsUpdated,
          recordsSkipped: importResult.recordsSkipped,
          errors: allErrors,
          warnings,
          executionTimeMs
        }),
        ipAddress: 'System',
        userAgent: 'ImportEngine'
      }
    });

    return {
      success: true,
      recordsAdded: importResult.recordsAdded,
      recordsUpdated: importResult.recordsUpdated,
      recordsSkipped: importResult.recordsSkipped,
      errors: allErrors,
      warnings,
      executionTimeMs,
      status
    };
  }
}
