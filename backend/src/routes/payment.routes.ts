import { Router } from 'express';
import {
  createPaymentOrder,
  verifyPayment,
  getPaymentHistory,
} from '../controllers/payment.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/create-order', authenticate, createPaymentOrder);
router.post('/verify', authenticate, verifyPayment);
router.get('/history', authenticate, getPaymentHistory);

export default router;
