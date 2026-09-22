import { Router } from 'express';
import {
  getStudentRents,
  getOwnerRents,
  generateMonthlyRent,
} from '../controllers/rent.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/student', authenticate, authorize('STUDENT', 'ADMIN'), getStudentRents);
router.get('/owner', authenticate, authorize('OWNER', 'ADMIN'), getOwnerRents);
router.post('/generate', authenticate, authorize('OWNER', 'ADMIN'), generateMonthlyRent);

export default router;
