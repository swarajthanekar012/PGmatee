import { Router } from 'express';
import {
  getAllPGs,
  getPGById,
  getOwnerPGs,
  createPG,
  publicCreatePG,
  updatePG,
  deletePG,
} from '../controllers/pg.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/', getAllPGs);
router.get('/:id', getPGById);
router.post('/public-list', publicCreatePG);

// Owner / Admin routes
router.get('/owner/my-pgs', authenticate, authorize('OWNER', 'ADMIN'), getOwnerPGs);
router.post('/', authenticate, authorize('OWNER', 'ADMIN'), createPG);
router.put('/:id', authenticate, authorize('OWNER', 'ADMIN'), updatePG);
router.delete('/:id', authenticate, authorize('OWNER', 'ADMIN'), deletePG);

export default router;
