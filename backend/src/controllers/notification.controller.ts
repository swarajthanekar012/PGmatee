import { Response } from 'express';
import prisma from '../config/prisma';
import { sendError, sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/auth';

export const getMyNotifications = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return sendError(res, 'Unauthorized', 401);

    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const unreadCount = await prisma.notification.count({
      where: { userId: req.user.userId, isRead: false },
    });

    return sendSuccess(res, 'Notifications fetched', {
      notifications,
      unreadCount,
    });
  } catch (error: any) {
    console.error('getMyNotifications error:', error);
    return sendError(res, error.message || 'Failed to fetch notifications', 500);
  }
};

export const markAsRead = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return sendError(res, 'Unauthorized', 401);

    const { id } = req.params;

    if (id === 'all') {
      await prisma.notification.updateMany({
        where: { userId: req.user.userId, isRead: false },
        data: { isRead: true },
      });
      return sendSuccess(res, 'All notifications marked as read');
    }

    const notification = await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });

    return sendSuccess(res, 'Notification marked as read', notification);
  } catch (error: any) {
    console.error('markAsRead error:', error);
    return sendError(res, error.message || 'Failed to mark notification as read', 500);
  }
};
