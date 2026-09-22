import { Router } from 'express';
import {
  createAnnouncement,
  getAnnouncements,
  deleteAnnouncement,
} from '../controllers/announcement.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, authorize('OWNER', 'ADMIN'), createAnnouncement);
router.get('/', authenticate, getAnnouncements);
router.delete('/:id', authenticate, authorize('OWNER', 'ADMIN'), deleteAnnouncement);

export default router;
