import { Router } from 'express';
import { createOrder, getUserOrders, getAllOrders, updateOrderStatus } from '../../controllers/order.controller.js';

const router = Router();

router.post('/', createOrder);
router.get('/', getUserOrders);
router.get('/admin/all', getAllOrders);
router.patch('/admin/:id/status', updateOrderStatus);

export default router;
