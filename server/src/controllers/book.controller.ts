import { Request, Response, NextFunction } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

// Map Prisma Book to Frontend Book shape
const mapBookToFrontendShape = (book: any) => ({
  ...book,
  author: book.author?.name || 'Unknown Author',
  publisher: book.publisher?.name || 'Unknown Publisher',
  category: book.category?.slug || 'uncategorized',
  bestseller: book.isBestseller,
  featured: book.isFeatured,
  trending: book.isTrending,
  newRelease: book.isNewArrival,
  rating: 4.5, // Default for now
  ratingsCount: Math.floor(Math.random() * 500) + 10,
  tags: book.tags ? JSON.parse(book.tags) : [],
  // Map cover url or default
  coverUrl: book.coverUrl,
});

export const getBooks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const {
      search,
      category,
      sort,
      author,
      publisher,
      featured,
      newArrival,
      bestSeller,
      ids,
    } = req.query;

    const where: Prisma.BookWhereInput = {
      status: 'PUBLISHED',
    };

    if (ids && typeof ids === 'string') {
      const idArray = ids.split(',');
      where.id = { in: idArray };
    }

    if (search) {
      where.OR = [
        { title: { contains: search as string } },
        { isbn: { contains: search as string } },
      ];
    }
    if (category) {
      where.category = { slug: category as string };
    }
    if (author) {
      where.author = { slug: author as string };
    }
    if (publisher) {
      where.publisher = { slug: publisher as string };
    }
    if (featured === 'true') where.isFeatured = true;
    if (newArrival === 'true') where.isNewArrival = true;
    if (bestSeller === 'true') where.isBestseller = true;

    let orderBy: Prisma.BookOrderByWithRelationInput = { createdAt: 'desc' };
    if (sort === 'price_asc') orderBy = { price: 'asc' };
    else if (sort === 'price_desc') orderBy = { price: 'desc' };
    else if (sort === 'title_asc') orderBy = { title: 'asc' };
    else if (sort === 'title_desc') orderBy = { title: 'desc' };

    const [books, total] = await Promise.all([
      prisma.book.findMany({
        where,
        include: {
          author: true,
          publisher: true,
          category: true,
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.book.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      message: 'Books fetched successfully',
      data: books.map(mapBookToFrontendShape),
      meta: {
        page,
        limit,
        total,
        totalPages,
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getBookBySlug = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params;
    const book = await prisma.book.findUnique({
      where: { slug, status: 'PUBLISHED' },
      include: {
        author: true,
        publisher: true,
        category: true,
      },
    });

    if (!book) {
      res.status(404).json({
        success: false,
        message: 'Book not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Book fetched successfully',
      data: mapBookToFrontendShape(book),
    });
  } catch (error) {
    next(error);
  }
};
