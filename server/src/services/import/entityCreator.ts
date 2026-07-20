import { PrismaClient, Prisma } from '@prisma/client';
import { Normalizer } from './normalizer.js';

export class EntityCreator {
  /**
   * Automatically creates Authors, Publishers, and Categories if they do not exist.
   * Returns a map of names to their database IDs so the Writer can assign foreign keys.
   */
  static async createMissingEntities(
    prisma: Prisma.TransactionClient,
    authorsToCreate: Set<string>,
    publishersToCreate: Set<string>,
    categoriesToCreate: Set<string>
  ) {
    const authorMap = new Map<string, string>();
    const publisherMap = new Map<string, string>();
    const categoryMap = new Map<string, string>();

    // Create Authors
    for (const authorRaw of authorsToCreate) {
      const name = Normalizer.normalizeName(authorRaw);
      const slug = Normalizer.generateSlug(name);
      
      let author = await prisma.author.findFirst({ where: { slug } });
      if (!author) {
        author = await prisma.author.create({
          data: { name, slug, bio: '' }
        });
      }
      authorMap.set(authorRaw, author.id);
    }

    // Create Publishers
    for (const publisherRaw of publishersToCreate) {
      const name = Normalizer.normalizeName(publisherRaw);
      const slug = Normalizer.generateSlug(name);
      
      let publisher = await prisma.publisher.findFirst({ where: { slug } });
      if (!publisher) {
        publisher = await prisma.publisher.create({
          data: { name, slug }
        });
      }
      publisherMap.set(publisherRaw, publisher.id);
    }

    // Create Categories
    for (const categoryRaw of categoriesToCreate) {
      const levels = Normalizer.normalizeCategoryHierarchy(categoryRaw);
      
      let currentParentId: string | null = null;
      let finalCategoryId: string | null = null;

      for (const levelName of levels) {
        const slug = Normalizer.generateSlug(levelName);
        
        let cat = await prisma.category.findFirst({
          where: { slug }
        });
        
        if (!cat) {
          cat = await prisma.category.create({
            data: { 
              name: levelName, 
              slug,
              parentId: currentParentId
            }
          });
        }
        
        currentParentId = cat.id;
        finalCategoryId = cat.id;
      }
      
      if (finalCategoryId) {
        categoryMap.set(categoryRaw, finalCategoryId);
      }
    }

    return { authorMap, publisherMap, categoryMap };
  }
}
