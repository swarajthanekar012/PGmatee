import { Response } from 'express';
import prisma from '../config/prisma';
import { sendError, sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/auth';

export const createAnnouncement = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return sendError(res, 'Unauthorized', 401);

    const owner = await prisma.owner.findUnique({
      where: { userId: req.user.userId },
    });

    if (!owner) return sendError(res, 'Owner profile not found', 404);

    const { pgId, title, message, targetType = 'ALL', targetRoomId } = req.body;

    if (!pgId || !title || !message) {
      return sendError(res, 'pgId, title, and message are required', 400);
    }

    const pg = await prisma.pG.findUnique({ where: { id: pgId } });
    if (!pg) return sendError(res, 'PG not found', 404);
    if (pg.ownerId !== owner.id) return sendError(res, 'Forbidden', 403);

    const announcement = await prisma.announcement.create({
      data: {
        ownerId: owner.id,
        pgId,
        title,
        message,
        targetType,
        targetRoomId: targetRoomId || null,
      },
    });

    // Find target students to send notifications
    let studentQuery: any = {
      status: 'APPROVED',
      bed: { room: { pgId } },
    };

    if (targetType === 'ROOM' && targetRoomId) {
      studentQuery.bed.roomId = targetRoomId;
    }

    const targetBookings = await prisma.booking.findMany({
      where: studentQuery,
      include: {
        student: true,
      },
    });

    const notifPromises = targetBookings.map((b) =>
      prisma.notification.create({
        data: {
          userId: b.student.userId,
          title: `📢 ${title}`,
          message,
          type: 'ANNOUNCEMENT',
        },
      })
    );

    await Promise.all(notifPromises);

    return sendSuccess(res, 'Announcement published successfully', announcement, 201);
  } catch (error: any) {
    console.error('createAnnouncement error:', error);
    return sendError(res, error.message || 'Failed to create announcement', 500);
  }
};

export const getAnnouncements = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return sendError(res, 'Unauthorized', 401);

    if (req.user.role === 'OWNER') {
      const owner = await prisma.owner.findUnique({
        where: { userId: req.user.userId },
      });
      if (!owner) return sendError(res, 'Owner not found', 404);

      const announcements = await prisma.announcement.findMany({
        where: { ownerId: owner.id },
        include: { pg: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
      });

      return sendSuccess(res, 'Announcements fetched', announcements);
    }

    if (req.user.role === 'STUDENT') {
      const student = await prisma.student.findUnique({
        where: { userId: req.user.userId },
        include: {
          bookings: {
            where: { status: 'APPROVED' },
            include: { bed: { include: { room: true } } },
          },
        },
      });

      if (!student || student.bookings.length === 0) {
        return sendSuccess(res, 'No active bookings, no announcements', []);
      }

      const activeBooking = student.bookings[0];
      const pgId = activeBooking.bed.room.pgId;
      const roomId = activeBooking.bed.roomId;

      const announcements = await prisma.announcement.findMany({
        where: {
          pgId,
          OR: [
            { targetType: 'ALL' },
            { targetType: 'PG' },
            { AND: [{ targetType: 'ROOM' }, { targetRoomId: roomId }] },
          ],
        },
        include: { pg: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
      });

      return sendSuccess(res, 'Announcements fetched', announcements);
    }

    const all = await prisma.announcement.findMany({
      include: { pg: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return sendSuccess(res, 'Announcements fetched', all);
  } catch (error: any) {
    console.error('getAnnouncements error:', error);
    return sendError(res, error.message || 'Failed to fetch announcements', 500);
  }
};

export const deleteAnnouncement = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return sendError(res, 'Unauthorized', 401);

    const { id } = req.params;
    const existing = await prisma.announcement.findUnique({
      where: { id },
      include: { owner: true },
    });

    if (!existing) return sendError(res, 'Announcement not found', 404);
    if (req.user.role !== 'ADMIN' && existing.owner.userId !== req.user.userId) {
      return sendError(res, 'Forbidden', 403);
    }

    await prisma.announcement.delete({ where: { id } });
    return sendSuccess(res, 'Announcement deleted');
  } catch (error: any) {
    console.error('deleteAnnouncement error:', error);
    return sendError(res, error.message || 'Failed to delete announcement', 500);
  }
};
