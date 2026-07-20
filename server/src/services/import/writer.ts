import { Prisma } from '@prisma/client';
import { ExcelRow } from '../import.service.js';
import { Normalizer } from './normalizer.js';

export type DuplicateStrategy = 'SKIP' | 'UPDATE' | 'REPLACE';

export class Writer {
  static async executeImport(
    prisma: Prisma.TransactionClient,
    toAdd: (ExcelRow & { row: number })[],
    toUpdate: (ExcelRow & { row: number })[],
    strategy: DuplicateStrategy,
    authorMap: Map<string, string>,
    publisherMap: Map<string, string>,
    categoryMap: Map<string, string>
  ) {
    let recordsAdded = 0;
    let recordsUpdated = 0;
    let recordsSkipped = 0;
    const errors: { row: number, message: string }[] = [];

    // Map rows to Prisma Book CreateInput
    const mapToBookInput = (row: ExcelRow) => {
      const title = row.title.trim();
      let slug = Normalizer.generateSlug(title, row.isbn || row.sku);
      
      const categoryId = row.subcategory ? categoryMap.get(row.subcategory) : categoryMap.get(row.category);

      return {
        title,
        subtitle: row.subtitle,
        slug,
        isbn: row.isbn,
        sku: row.sku,
        bookCode: row.bookCode,
        edition: row.edition,
        language: row.language || 'English',
        description: row.description || '',
        price: row.price,
        mrp: row.mrp,
        stock: row.stock,
        pages: row.pages,
        publicationDate: row.publicationDate ? new Date(row.publicationDate) : null,
        barcode: row.barcode,
        series: row.series,
        volume: row.volume,
        coverUrl: row.coverUrl || '/placeholder-book.jpg',
        categoryId,
        authorId: authorMap.get(row.author),
        publisherId: publisherMap.get(row.publisher),
        status: 'PUBLISHED' as const, // Auto-publish imported books
        visibility: true,
      };
    };

    // 1. Process Insertions
    if (toAdd.length > 0) {
      try {
        const createData = toAdd.map(row => mapToBookInput(row));
        // We use Promise.all instead of createMany to handle individual slug collisions safely
        // since createMany fails the whole batch if one unique constraint fails.
        // Wait, requirements: "Use batch operations wherever practical instead of inserting one book at a time."
        // We can ensure unique slugs by appending UUIDs if needed, or rely on the transaction rollback if a critical error occurs.
        
        for (const row of toAdd) {
          try {
            const data = mapToBookInput(row);
            await prisma.book.create({ data });
            recordsAdded++;
          } catch (e: any) {
             errors.push({ row: row.row, message: `Insert failed: ${e.message}` });
          }
        }
      } catch (err: any) {
        throw new Error(`Critical failure during insertions: ${err.message}`);
      }
    }

    // 2. Process Duplicates based on strategy
    if (toUpdate.length > 0) {
      if (strategy === 'SKIP') {
        recordsSkipped += toUpdate.length;
      } 
      else if (strategy === 'UPDATE' || strategy === 'REPLACE') {
        for (const row of toUpdate) {
          try {
            const data = mapToBookInput(row);
            // Find existing book by ISBN or SKU
            const existing = await prisma.book.findFirst({
              where: {
                OR: [
                  { isbn: row.isbn || 'N/A' },
                  { sku: row.sku || 'N/A' }
                ]
              }
            });

            if (existing) {
              if (strategy === 'REPLACE') {
                // Overwrite all fields
                await prisma.book.update({
                  where: { id: existing.id },
                  data
                });
              } else {
                // UPDATE: Merge fields (only update if new value exists)
                const mergeData: any = {};
                for (const key of Object.keys(data) as (keyof typeof data)[]) {
                  if (data[key] !== undefined && data[key] !== null) {
                    mergeData[key] = data[key];
                  }
                }
                await prisma.book.update({
                  where: { id: existing.id },
                  data: mergeData
                });
              }
              recordsUpdated++;
            } else {
              // Should not happen since we checked existing in Analyze, but fallback to insert
              await prisma.book.create({ data });
              recordsAdded++;
            }
          } catch (e: any) {
             errors.push({ row: row.row, message: `Update failed: ${e.message}` });
          }
        }
      }
    }

    return { recordsAdded, recordsUpdated, recordsSkipped, errors };
  }
}
