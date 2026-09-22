import { Response } from 'express';
import prisma from '../config/prisma';
import { sendError, sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/auth';

export const createComplaint = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return sendError(res, 'Unauthorized', 401);

    const student = await prisma.student.findUnique({
      where: { userId: req.user.userId },
      include: {
        bookings: {
          where: { status: 'APPROVED' },
          include: { bed: { include: { room: { include: { pg: true } } } } },
        },
      },
    });

    if (!student || student.bookings.length === 0) {
      return sendError(res, 'You must be an active resident in a PG to lodge a complaint', 400);
    }

    const { category, title, description } = req.body;
    if (!category || !title || !description) {
      return sendError(res, 'Category, title, and description are required', 400);
    }

    const activeBooking = student.bookings[0];
    const pgId = activeBooking.bed.room.pgId;
    const roomId = activeBooking.bed.roomId;

    const complaint = await prisma.complaint.create({
      data: {
        studentId: student.id,
        pgId,
        roomId,
        category,
        title,
        description,
        status: 'OPEN',
      },
      include: {
        pg: {
          include: {
            owner: true,
          },
        },
        room: true,
      },
    });

    // Notify PG Owner
    await prisma.notification.create({
      data: {
        userId: complaint.pg.owner.userId,
        title: `New Grievance Raised: ${category}`,
        message: `${req.user.email} lodged a complaint: "${title}" for Room ${complaint.room?.roomNumber || 'N/A'}.`,
        type: 'COMPLAINT',
      },
    });

    return sendSuccess(res, 'Complaint submitted successfully', complaint, 201);
  } catch (error: any) {
    console.error('createComplaint error:', error);
    return sendError(res, error.message || 'Failed to submit complaint', 500);
  }
};

export const getComplaints = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return sendError(res, 'Unauthorized', 401);

    if (req.user.role === 'STUDENT') {
      const student = await prisma.student.findUnique({
        where: { userId: req.user.userId },
      });
      if (!student) return sendError(res, 'Student not found', 404);

      const complaints = await prisma.complaint.findMany({
        where: { studentId: student.id },
        include: {
          pg: { select: { name: true } },
          room: { select: { roomNumber: true } },
        },
        orderBy: { createdAt: 'desc' },
      });

      return sendSuccess(res, 'Complaints fetched', complaints);
    }

    if (req.user.role === 'OWNER') {
      const owner = await prisma.owner.findUnique({
        where: { userId: req.user.userId },
      });
      if (!owner) return sendError(res, 'Owner not found', 404);

      const complaints = await prisma.complaint.findMany({
        where: {
          pg: { ownerId: owner.id },
        },
        include: {
          student: {
            include: {
              user: { select: { name: true, email: true, mobile: true } },
            },
          },
          pg: { select: { name: true } },
          room: { select: { roomNumber: true } },
        },
        orderBy: { createdAt: 'desc' },
      });

      return sendSuccess(res, 'Complaints fetched for owner', complaints);
    }

    if (req.user.role === 'ADMIN') {
      const all = await prisma.complaint.findMany({
        include: {
          student: { include: { user: { select: { name: true, email: true } } } },
          pg: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
      return sendSuccess(res, 'All complaints fetched', all);
    }

    return sendError(res, 'Invalid role', 403);
  } catch (error: any) {
    console.error('getComplaints error:', error);
    return sendError(res, error.message || 'Failed to fetch complaints', 500);
  }
};

export const updateComplaintStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return sendError(res, 'Unauthorized', 401);

    const { id } = req.params;
    const { status, resolutionNote } = req.body;

    if (!['OPEN', 'IN_PROGRESS', 'RESOLVED'].includes(status)) {
      return sendError(res, 'Invalid status. Must be OPEN, IN_PROGRESS, or RESOLVED', 400);
    }

    const complaint = await prisma.complaint.findUnique({
      where: { id },
      include: {
        pg: { include: { owner: true } },
        student: { include: { user: true } },
      },
    });

    if (!complaint) return sendError(res, 'Complaint not found', 404);

    if (req.user.role !== 'ADMIN' && complaint.pg.owner.userId !== req.user.userId) {
      return sendError(res, 'Forbidden', 403);
    }

    const updated = await prisma.complaint.update({
      where: { id },
      data: {
        status,
        resolutionNote: resolutionNote || undefined,
      },
    });

    // Notify Student
    await prisma.notification.create({
      data: {
        userId: complaint.student.userId,
        title: `Complaint Status Updated: ${status}`,
        message: `Your grievance regarding "${complaint.title}" has been moved to ${status}.${
          resolutionNote ? ` Note: ${resolutionNote}` : ''
        }`,
        type: 'COMPLAINT',
      },
    });

    return sendSuccess(res, 'Complaint status updated', updated);
  } catch (error: any) {
    console.error('updateComplaintStatus error:', error);
    return sendError(res, error.message || 'Failed to update complaint status', 500);
  }
};
