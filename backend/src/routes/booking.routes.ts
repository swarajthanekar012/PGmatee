import { Router } from 'express';
import {
  createBookingRequest,
  getStudentBookings,
  getOwnerBookings,
  approveBooking,
  rejectBooking,
} from '../controllers/booking.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, authorize('STUDENT', 'ADMIN'), createBookingRequest);
router.get('/student', authenticate, authorize('STUDENT', 'ADMIN'), getStudentBookings);
router.get('/owner', authenticate, authorize('OWNER', 'ADMIN'), getOwnerBookings);
router.put('/:id/approve', authenticate, authorize('OWNER', 'ADMIN'), approveBooking);
router.put('/:id/reject', authenticate, authorize('OWNER', 'ADMIN'), rejectBooking);

export default router;
