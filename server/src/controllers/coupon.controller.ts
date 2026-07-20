import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const coupons = await prisma.coupon.findMany({
      include: {
        category: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({ success: true, data: coupons });
  } catch (error) {
    next(error);
  }
};

export const create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { 
      code, type, value, minOrderAmount, maxDiscount, 
      usageLimit, usageLimitPerUser, isFirstOrderOnly, 
      categoryId, validFrom, validUntil 
    } = req.body;

    const uppercaseCode = code.toUpperCase();

    const existing = await prisma.coupon.findUnique({ where: { code: uppercaseCode } });
    if (existing) {
      res.status(400).json({ success: false, message: 'Coupon code already exists' });
      return;
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: uppercaseCode,
        type,
        value: Number(value),
        minOrderAmount: minOrderAmount ? Number(minOrderAmount) : null,
        maxDiscount: maxDiscount ? Number(maxDiscount) : null,
        usageLimit: usageLimit ? Number(usageLimit) : null,
        usageLimitPerUser: usageLimitPerUser ? Number(usageLimitPerUser) : 1,
        isFirstOrderOnly: Boolean(isFirstOrderOnly),
        categoryId: categoryId || null,
        validFrom: new Date(validFrom),
        validUntil: new Date(validUntil)
      }
    });

    res.status(201).json({ success: true, message: 'Coupon created', data: coupon });
  } catch (error) {
    next(error);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { 
      code, type, value, minOrderAmount, maxDiscount, 
      usageLimit, usageLimitPerUser, isFirstOrderOnly, 
      categoryId, validFrom, validUntil 
    } = req.body;

    const data: any = {};
    if (type !== undefined) data.type = type;
    if (value !== undefined) data.value = Number(value);
    if (minOrderAmount !== undefined) data.minOrderAmount = minOrderAmount ? Number(minOrderAmount) : null;
    if (maxDiscount !== undefined) data.maxDiscount = maxDiscount ? Number(maxDiscount) : null;
    if (usageLimit !== undefined) data.usageLimit = usageLimit ? Number(usageLimit) : null;
    if (usageLimitPerUser !== undefined) data.usageLimitPerUser = Number(usageLimitPerUser);
    if (isFirstOrderOnly !== undefined) data.isFirstOrderOnly = Boolean(isFirstOrderOnly);
    if (categoryId !== undefined) data.categoryId = categoryId || null;
    if (validFrom) data.validFrom = new Date(validFrom);
    if (validUntil) data.validUntil = new Date(validUntil);

    if (code) {
      const uppercaseCode = code.toUpperCase();
      const existing = await prisma.coupon.findUnique({ where: { code: uppercaseCode } });
      if (existing && existing.id !== id) {
        res.status(400).json({ success: false, message: 'Coupon code already exists' });
        return;
      }
      data.code = uppercaseCode;
    }

    const coupon = await prisma.coupon.update({ where: { id }, data });
    res.status(200).json({ success: true, message: 'Coupon updated', data: coupon });
  } catch (error) {
    next(error);
  }
};

export const remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.coupon.delete({ where: { id } });
    res.status(200).json({ success: true, message: 'Coupon deleted' });
  } catch (error) {
    next(error);
  }
};

export const toggleActive = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const existing = await prisma.coupon.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ success: false, message: 'Coupon not found' });
      return;
    }

    const coupon = await prisma.coupon.update({
      where: { id },
      data: { isActive: !existing.isActive }
    });

    res.status(200).json({ success: true, message: `Coupon ${coupon.isActive ? 'activated' : 'deactivated'}`, data: coupon });
  } catch (error) {
    next(error);
  }
};

export const validate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { code, cartTotal, userId, cartItems } = req.body;

    if (!code || typeof cartTotal !== 'number') {
      res.status(400).json({ success: false, data: { valid: false, message: 'Code and cartTotal are required' } });
      return;
    }

    const uppercaseCode = code.toUpperCase();
    const coupon = await prisma.coupon.findUnique({ where: { code: uppercaseCode } });

    if (!coupon || !coupon.isActive) {
      res.status(200).json({ success: true, data: { valid: false, message: 'Invalid or inactive coupon code' } });
      return;
    }

    const now = new Date();
    if (now < coupon.validFrom || now > coupon.validUntil) {
      res.status(200).json({ success: true, data: { valid: false, message: 'Coupon has expired or is not yet active' } });
      return;
    }

    if (coupon.minOrderAmount && cartTotal < coupon.minOrderAmount) {
      res.status(200).json({ success: true, data: { valid: false, message: `Minimum order of ₹${coupon.minOrderAmount} required` } });
      return;
    }

    // Global usage limit
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      res.status(200).json({ success: true, data: { valid: false, message: 'This coupon has reached its total usage limit' } });
      return;
    }

    // Per-user checks
    if (userId) {
      const usageCount = await prisma.couponUsage.count({
        where: { couponId: coupon.id, userId }
      });

      if (usageCount >= coupon.usageLimitPerUser) {
        res.status(200).json({ success: true, data: { valid: false, message: 'You have already used this coupon the maximum number of times' } });
        return;
      }

      if (coupon.isFirstOrderOnly) {
        const completedOrders = await prisma.order.count({
          where: { userId, status: { not: 'CANCELLED' } }
        });
        if (completedOrders > 0) {
          res.status(200).json({ success: true, data: { valid: false, message: 'This coupon is only valid for your first order' } });
          return;
        }
      }
    } else if (coupon.isFirstOrderOnly) {
      res.status(200).json({ success: true, data: { valid: false, message: 'Please log in to use this coupon' } });
      return;
    }

    // Category check
    if (coupon.categoryId) {
      if (!cartItems || cartItems.length === 0) {
        res.status(200).json({ success: true, data: { valid: false, message: 'Cart items required for category-specific coupon' } });
        return;
      }
      const hasCategoryItem = cartItems.some((item: any) => item.categoryId === coupon.categoryId);
      if (!hasCategoryItem) {
        res.status(200).json({ success: true, data: { valid: false, message: 'This coupon is not valid for the items in your cart' } });
        return;
      }
    }

    // Calculate discount
    let discount = 0;
    if (coupon.type === 'PERCENTAGE') {
      discount = Math.round((cartTotal * coupon.value) / 100);
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    } else {
      discount = coupon.value;
      if (discount > cartTotal) discount = cartTotal;
    }

    res.status(200).json({
      success: true,
      data: {
        valid: true,
        discount,
        couponId: coupon.id,
        message: `${uppercaseCode} applied! You save ₹${discount}`
      }
    });
  } catch (error) {
    next(error);
  }
};
