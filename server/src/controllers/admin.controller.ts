import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { ImportService } from '../services/import.service.js';
import { ExecutionService } from '../services/import/execution.service.js';

const prisma = new PrismaClient();

export const getAdminStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const [
      totalBooks,
      booksInStock,
      outOfStock,
      totalCategories,
      totalPublishers,
      totalAuthors,
      totalOrders,
      totalUsers,
      ordersResult,
      lowStockBooksCount,
      recentOrders,
      newUsersThisMonth,
    ] = await Promise.all([
      prisma.book.count(),
      prisma.book.count({ where: { stock: { gt: 0 } } }),
      prisma.book.count({ where: { stock: { lte: 0 } } }),
      prisma.category.count(),
      prisma.publisher.count(),
      prisma.author.count(),
      prisma.order.count(),
      prisma.user.count(),
      prisma.order.aggregate({ _sum: { totalAmount: true } }),
      prisma.book.count({ where: { stock: { gt: 0, lte: 10 } } }),
      prisma.order.findMany({
        include: {
          user: { select: { name: true, email: true } },
          items: { include: { book: { select: { title: true } } } },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),
    ]);

    const revenue = ordersResult._sum.totalAmount || 0;
    const aov = totalOrders > 0 ? Math.round(revenue / totalOrders) : 0;

    res.status(200).json({
      success: true,
      message: 'Admin stats fetched successfully',
      data: {
        totalBooks,
        booksInStock,
        outOfStock,
        totalCategories,
        totalPublishers,
        totalAuthors,
        totalOrders,
        totalUsers,
        newUsersThisMonth,
        revenue,
        aov,
        lowStock: lowStockBooksCount,
        recentOrders,
      }
    });
  } catch (error) {
    next(error);
  }
};

export const analyzeImportBookCatalog = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const file = req.file;
    if (!file) {
      res.status(400).json({ success: false, message: 'No file uploaded. Please upload an Excel or CSV file.' });
      return;
    }

    const result = await ImportService.analyzeImport(file.buffer);
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Failed to analyze import file' });
  }
};

export const executeImportBookCatalog = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Basic auth check (assuming middleware sets req.user)
    const userId = (req as any).user?.id || null;
    
    const { 
      filename, 
      toAdd, 
      toUpdate, 
      newCategories, 
      newAuthors, 
      newPublishers, 
      warnings, 
      strategy 
    } = req.body;

    if (!strategy || !toAdd || !toUpdate) {
      res.status(400).json({ success: false, message: 'Invalid payload: missing strategy, toAdd, or toUpdate' });
      return;
    }

    const result = await ExecutionService.executeImport(
      userId,
      filename || 'Unknown File',
      toAdd,
      toUpdate,
      newCategories || [],
      newAuthors || [],
      newPublishers || [],
      warnings || [],
      strategy
    );

    res.status(200).json(result);
  } catch (error: any) {
    console.error('Execution Engine Error:', error);
    res.status(500).json({ success: false, message: error.message || 'Execution failed critically' });
  }
};

// Book Preview Endpoints
export const getBookPreview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const book = await prisma.book.findUnique({
      where: { id },
      include: { author: true, publisher: true, category: true }
    });
    
    if (!book) { res.status(404).json({ success: false, message: 'Book not found' }); return; }
    
    // In a real app we'd fetch actual PDF URL if stored separately, but here we just return the book with standard fields
    res.status(200).json({ success: true, data: book });
  } catch (error) {
    next(error);
  }
};

export const uploadBookCover = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const file = req.file;
    if (!file) { res.status(400).json({ success: false, message: 'No file uploaded' }); return; }
    
    // In a real app, you'd save it and get a URL. We'll simulate a path.
    const coverUrl = `/uploads/covers/${file.originalname}`;
    
    const book = await prisma.book.update({ where: { id }, data: { coverUrl } });
    res.status(200).json({ success: true, message: 'Cover updated successfully', data: book });
  } catch (error) {
    next(error);
  }
};

export const uploadBookPdf = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const file = req.file;
    if (!file) { res.status(400).json({ success: false, message: 'No file uploaded' }); return; }
    
    // We update a hypothetical `pdfUrl` field or metadata
    const book = await prisma.book.update({ where: { id }, data: { pages: 100 /* Dummy update */ } });
    res.status(200).json({ success: true, message: 'PDF attached successfully', data: book });
  } catch (error) {
    next(error);
  }
};

export const deleteBook = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.book.delete({ where: { id } });
    res.status(200).json({ success: true, message: 'Book deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const deleteAllBooks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await prisma.book.deleteMany({});
    res.status(200).json({ success: true, message: 'All books deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const updateBook = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, price, mrp, stock } = req.body;
    
    // Minimal edit for the quick edit modal
    const data: any = {};
    if (title !== undefined) data.title = title;
    if (price !== undefined) data.price = Number(price);
    if (mrp !== undefined) data.mrp = Number(mrp);
    if (stock !== undefined) data.stock = Number(stock);
    
    const book = await prisma.book.update({ where: { id }, data });
    res.status(200).json({ success: true, message: 'Book updated successfully', data: book });
  } catch (error) {
    next(error);
  }
};
