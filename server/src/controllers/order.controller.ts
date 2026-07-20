import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function generateOrderNumber(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0,10).replace(/-/g,'');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `TW-${dateStr}-${rand}`;
}

export const createOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { items, addressId, paymentMethod } = req.body;
    const userId = (req as any).user?.id;
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ success: false, message: 'Items are required' });
      return;
    }

    const order = await prisma.$transaction(async (tx) => {
      // Fetch books and calculate totals
      const bookIds = items.map((i: any) => i.bookId);
      const books = await tx.book.findMany({ where: { id: { in: bookIds } } });
      
      let subtotal = 0;
      const orderItems: any[] = [];
      
      for (const item of items) {
        const book = books.find(b => b.id === item.bookId);
        if (!book) throw new Error(`Book ${item.bookId} not found`);
        if (book.stock < item.quantity) throw new Error(`Insufficient stock for "${book.title}"`);
        
        subtotal += book.price * item.quantity;
        orderItems.push({ bookId: item.bookId, quantity: item.quantity, priceAtPurchase: book.price });
        
        // Decrement stock
        await tx.book.update({ where: { id: item.bookId }, data: { stock: { decrement: item.quantity } } });
      }

      const shippingCharge = subtotal >= 499 ? 0 : 49;
      const totalAmount = subtotal + shippingCharge;

      const created = await tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          userId: userId || 'guest',
          addressId: addressId || null,
          status: 'PENDING',
          paymentStatus: paymentMethod === 'COD' ? 'PENDING' : 'PAID',
          paymentMethod: paymentMethod || 'COD',
          subtotal,
          shippingCharge,
          totalAmount,
          items: { create: orderItems },
        },
        include: { items: { include: { book: true } } },
      });

      return created;
    });

    res.status(201).json({ success: true, message: 'Order placed successfully', data: order });
  } catch (error: any) {
    if (error.message?.includes('not found') || error.message?.includes('Insufficient')) {
      res.status(400).json({ success: false, message: error.message });
      return;
    }
    next(error);
  }
};

export const getUserOrders = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user?.id || req.query.userId as string;
    const orders = await prisma.order.findMany({
      where: userId ? { userId } : {},
      include: {
        items: { include: { book: { select: { id: true, title: true, slug: true, coverUrl: true, author: { select: { name: true } } } } } },
        address: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
};

export const getAllOrders = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: { include: { book: { select: { id: true, title: true, coverUrl: true } } } },
        address: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const validStatuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'];
    if (!validStatuses.includes(status)) {
      res.status(400).json({ success: false, message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
      return;
    }

    const order = await prisma.order.update({
      where: { id },
      data: { status },
      include: { items: { include: { book: true } }, user: true },
    });
    
    res.status(200).json({ success: true, message: `Order status updated to ${status}`, data: order });
  } catch (error) {
    next(error);
  }
};
