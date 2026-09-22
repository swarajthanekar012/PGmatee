import { Response } from 'express';
import prisma from '../config/prisma';
import { sendError, sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/auth';

export const getAdminStats = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const totalUsers = await prisma.user.count();
    const studentCount = await prisma.user.count({ where: { role: 'STUDENT' } });
    const ownerCount = await prisma.user.count({ where: { role: 'OWNER' } });
    const totalPGs = await prisma.pG.count();
    const totalRooms = await prisma.room.count();
    const totalBeds = await prisma.bed.count();
    const occupiedBeds = await prisma.bed.count({ where: { status: 'OCCUPIED' } });
    const availableBeds = await prisma.bed.count({ where: { status: 'AVAILABLE' } });
    const totalBookings = await prisma.booking.count();
    const pendingBookings = await prisma.booking.count({ where: { status: 'PENDING' } });

    const payments = await prisma.payment.findMany({
      where: { status: 'SUCCESS' },
      select: { amount: true },
    });
    const totalRevenue = payments.reduce((acc, curr) => acc + curr.amount, 0);

    const pendingRents = await prisma.rent.findMany({
      where: { status: { in: ['PENDING', 'OVERDUE'] } },
      select: { amount: true },
    });
    const totalPendingRent = pendingRents.reduce((acc, curr) => acc + curr.amount, 0);

    return sendSuccess(res, 'Admin platform statistics fetched', {
      totalUsers,
      studentCount,
      ownerCount,
      totalPGs,
      totalRooms,
      totalBeds,
      occupiedBeds,
      availableBeds,
      totalBookings,
      pendingBookings,
      totalRevenue,
      totalPendingRent,
      occupancyRate: totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0,
    });
  } catch (error: any) {
    console.error('getAdminStats error:', error);
    return sendError(res, error.message || 'Failed to fetch platform stats', 500);
  }
};

export const getAllUsers = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        mobile: true,
        role: true,
        createdAt: true,
        student: true,
        owner: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return sendSuccess(res, 'Users fetched', users);
  } catch (error: any) {
    console.error('getAllUsers error:', error);
    return sendError(res, error.message || 'Failed to fetch users', 500);
  }
};

export const updateOwnerVerification = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { ownerId } = req.params;
    const { verificationStatus } = req.body;

    if (!['PENDING', 'VERIFIED', 'REJECTED'].includes(verificationStatus)) {
      return sendError(res, 'Invalid verification status', 400);
    }

    const updated = await prisma.owner.update({
      where: { id: ownerId },
      data: { verificationStatus },
    });

    return sendSuccess(res, 'Owner verification status updated', updated);
  } catch (error: any) {
    console.error('updateOwnerVerification error:', error);
    return sendError(res, error.message || 'Failed to update verification status', 500);
  }
};
