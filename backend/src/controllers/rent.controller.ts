import { Response } from 'express';
import prisma from '../config/prisma';
import { sendError, sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/auth';

export const getStudentRents = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return sendError(res, 'Unauthorized', 401);

    const student = await prisma.student.findUnique({
      where: { userId: req.user.userId },
    });

    if (!student) return sendError(res, 'Student profile not found', 404);

    const rents = await prisma.rent.findMany({
      where: { studentId: student.id },
      include: {
        booking: {
          include: {
            bed: {
              include: {
                room: {
                  include: {
                    pg: true,
                  },
                },
              },
            },
          },
        },
        payments: {
          orderBy: { paidAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return sendSuccess(res, 'Rents fetched successfully', rents);
  } catch (error: any) {
    console.error('getStudentRents error:', error);
    return sendError(res, error.message || 'Failed to fetch rents', 500);
  }
};

export const getOwnerRents = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return sendError(res, 'Unauthorized', 401);

    const owner = await prisma.owner.findUnique({
      where: { userId: req.user.userId },
    });

    if (!owner) return sendError(res, 'Owner profile not found', 404);

    const rents = await prisma.rent.findMany({
      where: {
        booking: {
          bed: {
            room: {
              pg: {
                ownerId: owner.id,
              },
            },
          },
        },
      },
      include: {
        student: {
          include: {
            user: {
              select: { name: true, email: true, mobile: true },
            },
          },
        },
        booking: {
          include: {
            bed: {
              include: {
                room: {
                  include: {
                    pg: true,
                  },
                },
              },
            },
          },
        },
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Summary stats
    let totalCollected = 0;
    let totalPending = 0;

    rents.forEach((r) => {
      if (r.status === 'PAID') totalCollected += r.amount;
      else totalPending += r.amount;
    });

    return sendSuccess(res, 'Owner rent records fetched successfully', {
      rents,
      stats: {
        totalCollected,
        totalPending,
        totalRecords: rents.length,
      },
    });
  } catch (error: any) {
    console.error('getOwnerRents error:', error);
    return sendError(res, error.message || 'Failed to fetch owner rents', 500);
  }
};

export const generateMonthlyRent = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return sendError(res, 'Unauthorized', 401);

    const owner = await prisma.owner.findUnique({
      where: { userId: req.user.userId },
    });

    if (!owner) return sendError(res, 'Owner profile not found', 404);

    const { month, dueDate } = req.body;
    if (!month) return sendError(res, 'Month string is required (e.g. October 2026)', 400);

    // Find all active approved bookings for this owner's PGs
    const activeBookings = await prisma.booking.findMany({
      where: {
        status: 'APPROVED',
        bed: {
          room: {
            pg: {
              ownerId: owner.id,
            },
          },
        },
      },
      include: {
        bed: { include: { room: true } },
        student: true,
      },
    });

    let generatedCount = 0;
    const rentDueDate = dueDate ? new Date(dueDate) : new Date(new Date().getFullYear(), new Date().getMonth() + 1, 5);

    for (const b of activeBookings) {
      const exists = await prisma.rent.findFirst({
        where: {
          bookingId: b.id,
          month,
        },
      });

      if (!exists) {
        await prisma.rent.create({
          data: {
            bookingId: b.id,
            studentId: b.studentId,
            month,
            amount: b.bed.room.rent,
            dueDate: rentDueDate,
            status: 'PENDING',
          },
        });

        // Notify student
        await prisma.notification.create({
          data: {
            userId: b.student.userId,
            title: `Rent Invoice: ${month}`,
            message: `New rent invoice of ₹${b.bed.room.rent.toLocaleString('en-IN')} for ${month} is due by ${rentDueDate.toLocaleDateString()}.`,
            type: 'RENT',
          },
        });

        generatedCount++;
      }
    }

    return sendSuccess(res, `Successfully generated ${generatedCount} rent invoices for ${month}`, {
      generatedCount,
    });
  } catch (error: any) {
    console.error('generateMonthlyRent error:', error);
    return sendError(res, error.message || 'Failed to generate rent', 500);
  }
};
