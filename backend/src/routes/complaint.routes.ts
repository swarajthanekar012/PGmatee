import { Router } from 'express';
import {
  createComplaint,
  getComplaints,
  updateComplaintStatus,
} from '../controllers/complaint.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, authorize('STUDENT', 'ADMIN'), createComplaint);
router.get('/', authenticate, getComplaints);
router.put('/:id/status', authenticate, authorize('OWNER', 'ADMIN'), updateComplaintStatus);

export default router;
