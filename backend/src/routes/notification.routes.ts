import { Router } from 'express';
import {
  getMyNotifications,
  markAsRead,
} from '../controllers/notification.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getMyNotifications);
router.put('/:id/read', authenticate, markAsRead);

export default router;
