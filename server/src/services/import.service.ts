import * as xlsx from 'xlsx';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const ExcelRowSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  subtitle: z.string().optional(),
  author: z.string().min(1, 'Author is required'),
  publisher: z.string().min(1, 'Publisher is required'),
  isbn: z.string().optional(),
  edition: z.string().optional(),
  language: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  subcategory: z.string().optional(),
  price: z.coerce.number().min(0, 'Price must be >= 0'),
  mrp: z.coerce.number().min(0, 'MRP must be >= 0'),
  stock: z.coerce.number().min(0, 'Stock must be >= 0').default(0),
  sku: z.string().optional(),
  bookCode: z.string().optional(),
  description: z.string().optional(),
  coverUrl: z.string().optional(),
  pages: z.coerce.number().optional(),
  publicationDate: z.string().optional(),
  barcode: z.string().optional(),
  series: z.string().optional(),
  volume: z.string().optional(),
});

export type ExcelRow = z.infer<typeof ExcelRowSchema>;

export class ImportService {
  static async analyzeImport(buffer: Buffer) {
    const workbook = xlsx.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rawData = xlsx.utils.sheet_to_json(sheet) as any[];

    const result = {
      toAdd: [] as any[],
      toUpdate: [] as any[],
      newCategories: new Set<string>(),
      newAuthors: new Set<string>(),
      newPublishers: new Set<string>(),
      warnings: [] as any[],
      errors: [] as any[],
      totalProcessed: 0,
    };

    // Pre-fetch existing entities to map
    const categoriesRaw = await prisma.category.findMany({ select: { name: true } });
    const authorsRaw = await prisma.author.findMany({ select: { name: true } });
    const publishersRaw = await prisma.publisher.findMany({ select: { name: true } });
    const booksRaw = await prisma.book.findMany({ select: { isbn: true, sku: true } });

    const existingCats = new Set(categoriesRaw.map(c => c.name.toLowerCase()));
    const existingAuthors = new Set(Array.from(authorsRaw).map((a: any) => a.name.toLowerCase()));
    const existingPublishers = new Set(Array.from(publishersRaw).map((p: any) => p.name.toLowerCase()));

    const existingIsbns = new Set(booksRaw.filter((b: any) => b.isbn).map((b: any) => b.isbn as string));
    const existingSkus = new Set(booksRaw.filter((b: any) => b.sku).map((b: any) => b.sku as string));

    for (let i = 0; i < rawData.length; i++) {
      const row = rawData[i];
      const rowNum = i + 2; // +1 for 0-index, +1 for header
      result.totalProcessed++;

      // Remap typical Excel headers if needed (MVP basic mapping)
      const mappedRow: any = {
        title: row['Book Title'] || row.title,
        subtitle: row['Subtitle'] || row.subtitle,
        author: row['Author'] || row.author,
        publisher: row['Publisher'] || row.publisher,
        isbn: row['ISBN'] || row.isbn,
        edition: row['Edition'] || row.edition,
        language: row['Language'] || row.language,
        category: row['Category'] || row.category,
        subcategory: row['Subcategory'] || row.subcategory,
        price: row['Price'] ?? row.price,
        mrp: row['MRP'] ?? row.mrp,
        stock: row['Stock'] ?? row.stock,
        sku: row['SKU'] || row.sku,
        bookCode: row['Book Code'] || row.bookCode,
        description: row['Description'] || row.description,
        coverUrl: row['Cover Image'] || row.coverUrl,
        pages: row['Pages'] || row.pages,
        publicationDate: row['Publication Date'] || row.publicationDate,
        barcode: row['Barcode'] || row.barcode,
        series: row['Series'] || row.series,
        volume: row['Volume'] || row.volume,
      };

      const parsed = ExcelRowSchema.safeParse(mappedRow);
      if (!parsed.success) {
        parsed.error.errors.forEach(err => {
          result.errors.push({ row: rowNum, message: `${err.path.join('.')}: ${err.message}` });
        });
        continue;
      }

      const data = parsed.data;

      // Duplicate detection
      let isDuplicate = false;
      if (data.isbn && existingIsbns.has(data.isbn)) isDuplicate = true;
      if (data.sku && existingSkus.has(data.sku)) isDuplicate = true;

      if (isDuplicate) {
        result.toUpdate.push({ row: rowNum, ...data });
      } else {
        result.toAdd.push({ row: rowNum, ...data });
      }

      // Check missing categories
      if (data.category && !existingCats.has(data.category.toLowerCase())) {
        result.newCategories.add(data.category);
        existingCats.add(data.category.toLowerCase());
      }
      if (data.subcategory && !existingCats.has(data.subcategory.toLowerCase())) {
        result.newCategories.add(data.subcategory);
        existingCats.add(data.subcategory.toLowerCase());
      }

      // Check missing authors
      if (data.author && !existingAuthors.has(data.author.toLowerCase())) {
        result.newAuthors.add(data.author);
        existingAuthors.add(data.author.toLowerCase());
      }

      // Check missing publishers
      if (data.publisher && !existingPublishers.has(data.publisher.toLowerCase())) {
        result.newPublishers.add(data.publisher);
        existingPublishers.add(data.publisher.toLowerCase());
      }

      if (!data.coverUrl) {
        result.warnings.push({ row: rowNum, message: 'Missing cover image. Will use placeholder.' });
      }
    }

    return {
      toAdd: result.toAdd,
      toUpdate: result.toUpdate,
      newCategories: Array.from(result.newCategories),
      newAuthors: Array.from(result.newAuthors),
      newPublishers: Array.from(result.newPublishers),
      warnings: result.warnings,
      errors: result.errors,
      totalProcessed: result.totalProcessed,
    };
  }
}
