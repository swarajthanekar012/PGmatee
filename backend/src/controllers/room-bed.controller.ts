import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { sendError, sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/auth';

export const getRoomsByPG = async (req: Request, res: Response) => {
  try {
    const { pgId } = req.params;
    const rooms = await prisma.room.findMany({
      where: { pgId },
      include: {
        beds: {
          include: {
            bookings: {
              where: { status: 'APPROVED' },
              include: {
                student: {
                  include: {
                    user: { select: { name: true, email: true, mobile: true } },
                  },
                },
              },
            },
          },
          orderBy: { bedNumber: 'asc' },
        },
      },
      orderBy: { roomNumber: 'asc' },
    });

    return sendSuccess(res, 'Rooms fetched successfully', rooms);
  } catch (error: any) {
    console.error('getRoomsByPG error:', error);
    return sendError(res, error.message || 'Failed to fetch rooms', 500);
  }
};

export const createRoom = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { pgId, roomNumber, roomType, rent, numberOfBeds } = req.body;

    if (!pgId || !roomNumber || !roomType || rent === undefined) {
      return sendError(res, 'pgId, roomNumber, roomType, and rent are required', 400);
    }

    // Verify ownership
    const pg = await prisma.pG.findUnique({
      where: { id: pgId },
      include: { owner: true },
    });

    if (!pg) return sendError(res, 'PG not found', 404);
    if (req.user?.role !== 'ADMIN' && pg.owner.userId !== req.user?.userId) {
      return sendError(res, 'Forbidden: You do not own this PG', 403);
    }

    const room = await prisma.room.create({
      data: {
        pgId,
        roomNumber: String(roomNumber),
        roomType,
        rent: Number(rent),
      },
    });

    // Auto-create beds if numberOfBeds is specified
    const bedCount = Number(numberOfBeds) || 0;
    if (bedCount > 0) {
      const bedsData = Array.from({ length: bedCount }, (_, i) => ({
        roomId: room.id,
        bedNumber: `B${i + 1}`,
        status: 'AVAILABLE',
      }));

      await prisma.bed.createMany({
        data: bedsData,
      });
    }

    const roomWithBeds = await prisma.room.findUnique({
      where: { id: room.id },
      include: { beds: true },
    });

    return sendSuccess(res, 'Room and beds created successfully', roomWithBeds, 201);
  } catch (error: any) {
    console.error('createRoom error:', error);
    return sendError(res, error.message || 'Failed to create room', 500);
  }
};

export const updateRoom = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { roomNumber, roomType, rent } = req.body;

    const existing = await prisma.room.findUnique({
      where: { id },
      include: { pg: { include: { owner: true } } },
    });

    if (!existing) return sendError(res, 'Room not found', 404);
    if (req.user?.role !== 'ADMIN' && existing.pg.owner.userId !== req.user?.userId) {
      return sendError(res, 'Forbidden: You do not own this room', 403);
    }

    const updated = await prisma.room.update({
      where: { id },
      data: {
        roomNumber: roomNumber ? String(roomNumber) : undefined,
        roomType: roomType || undefined,
        rent: rent !== undefined ? Number(rent) : undefined,
      },
    });

    return sendSuccess(res, 'Room updated successfully', updated);
  } catch (error: any) {
    console.error('updateRoom error:', error);
    return sendError(res, error.message || 'Failed to update room', 500);
  }
};

export const deleteRoom = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const existing = await prisma.room.findUnique({
      where: { id },
      include: { pg: { include: { owner: true } } },
    });

    if (!existing) return sendError(res, 'Room not found', 404);
    if (req.user?.role !== 'ADMIN' && existing.pg.owner.userId !== req.user?.userId) {
      return sendError(res, 'Forbidden: You do not own this room', 403);
    }

    await prisma.room.delete({ where: { id } });

    return sendSuccess(res, 'Room deleted successfully');
  } catch (error: any) {
    console.error('deleteRoom error:', error);
    return sendError(res, error.message || 'Failed to delete room', 500);
  }
};

export const createBed = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { roomId, bedNumber, status } = req.body;
    if (!roomId || !bedNumber) {
      return sendError(res, 'roomId and bedNumber are required', 400);
    }

    const bed = await prisma.bed.create({
      data: {
        roomId,
        bedNumber,
        status: status || 'AVAILABLE',
      },
    });

    return sendSuccess(res, 'Bed created successfully', bed, 201);
  } catch (error: any) {
    console.error('createBed error:', error);
    return sendError(res, error.message || 'Failed to create bed', 500);
  }
};

export const updateBedStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, bedNumber } = req.body;

    const bed = await prisma.bed.update({
      where: { id },
      data: {
        status: status || undefined,
        bedNumber: bedNumber || undefined,
      },
    });

    return sendSuccess(res, 'Bed updated successfully', bed);
  } catch (error: any) {
    console.error('updateBedStatus error:', error);
    return sendError(res, error.message || 'Failed to update bed', 500);
  }
};

export const deleteBed = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const bed = await prisma.bed.findUnique({
      where: { id },
      include: {
        bookings: { where: { status: 'APPROVED' } },
      },
    });

    if (!bed) return sendError(res, 'Bed not found', 404);

    if (bed.status === 'OCCUPIED' || bed.bookings.length > 0) {
      return sendError(
        res,
        'Cannot remove an occupied bed with an active resident. Please reallocate or vacate the student first.',
        400
      );
    }

    await prisma.bed.delete({ where: { id } });
    return sendSuccess(res, 'Bed removed successfully');
  } catch (error: any) {
    console.error('deleteBed error:', error);
    return sendError(res, error.message || 'Failed to delete bed', 500);
  }
};
