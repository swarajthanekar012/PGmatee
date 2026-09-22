import { Router } from 'express';
import {
  getRoomsByPG,
  createRoom,
  updateRoom,
  deleteRoom,
  createBed,
  updateBedStatus,
  deleteBed,
} from '../controllers/room-bed.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Room routes
router.get('/pg/:pgId', getRoomsByPG);
router.post('/rooms', authenticate, authorize('OWNER', 'ADMIN'), createRoom);
router.put('/rooms/:id', authenticate, authorize('OWNER', 'ADMIN'), updateRoom);
router.delete('/rooms/:id', authenticate, authorize('OWNER', 'ADMIN'), deleteRoom);

// Bed routes
router.post('/beds', authenticate, authorize('OWNER', 'ADMIN'), createBed);
router.put('/beds/:id', authenticate, authorize('OWNER', 'ADMIN'), updateBedStatus);
router.delete('/beds/:id', authenticate, authorize('OWNER', 'ADMIN'), deleteBed);

export default router;
