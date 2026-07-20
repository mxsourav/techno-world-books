import { Request, Response } from 'express';
import { login as loginService } from '../services/auth.service.js';
import { loginSchema } from '../validators/auth.validator.js';

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedData = loginSchema.parse(req.body);
    const result = await loginService(validatedData);

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: result.user,
        accessToken: result.accessToken,
      }
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({ error: 'Validation Error', details: error.errors });
    } else {
      res.status(401).json({ error: error.message || 'Authentication failed' });
    }
  }
};
