import { Router } from 'express';
import {
  getAdminStats,
  getAllUsers,
  updateOwnerVerification,
} from '../controllers/admin.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/stats', authenticate, authorize('ADMIN'), getAdminStats);
router.get('/users', authenticate, authorize('ADMIN'), getAllUsers);
router.put('/owners/:ownerId/verification', authenticate, authorize('ADMIN'), updateOwnerVerification);

export default router;
