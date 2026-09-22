import { Response } from 'express';
import prisma from '../config/prisma';
import { sendError, sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/auth';

export const createBookingRequest = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return sendError(res, 'Unauthorized', 401);

    const student = await prisma.student.findUnique({
      where: { userId: req.user.userId },
    });

    if (!student) {
      return sendError(res, 'Only students can request a bed booking', 403);
    }

    const { bedId, startDate } = req.body;
    if (!bedId) {
      return sendError(res, 'bedId is required', 400);
    }

    // Check if bed is available
    const bed = await prisma.bed.findUnique({
      where: { id: bedId },
      include: {
        room: {
          include: {
            pg: {
              include: {
                owner: true,
              },
            },
          },
        },
      },
    });

    if (!bed) return sendError(res, 'Bed not found', 404);
    if (bed.status !== 'AVAILABLE') {
      return sendError(res, 'This bed is currently not available for booking', 400);
    }

    // Check if student already has a pending or active approved booking for this bed or any active booking
    const activeBooking = await prisma.booking.findFirst({
      where: {
        studentId: student.id,
        status: { in: ['PENDING', 'APPROVED'] },
      },
    });

    if (activeBooking && activeBooking.status === 'APPROVED') {
      return sendError(res, 'You already have an active PG accommodation booking', 400);
    }

    const booking = await prisma.booking.create({
      data: {
        studentId: student.id,
        bedId,
        startDate: startDate ? new Date(startDate) : new Date(),
        status: 'PENDING',
      },
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
    });

    // Notify the Owner
    await prisma.notification.create({
      data: {
        userId: bed.room.pg.owner.userId,
        title: 'New Booking Request',
        message: `Student requested Bed ${bed.bedNumber} in Room ${bed.room.roomNumber} (${bed.room.pg.name})`,
        type: 'BOOKING',
      },
    });

    return sendSuccess(res, 'Booking request submitted successfully. Awaiting owner approval.', booking, 201);
  } catch (error: any) {
    console.error('createBookingRequest error:', error);
    return sendError(res, error.message || 'Failed to submit booking request', 500);
  }
};

export const getStudentBookings = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return sendError(res, 'Unauthorized', 401);

    const student = await prisma.student.findUnique({
      where: { userId: req.user.userId },
    });

    if (!student) return sendError(res, 'Student profile not found', 404);

    const bookings = await prisma.booking.findMany({
      where: { studentId: student.id },
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
        rents: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return sendSuccess(res, 'Bookings fetched successfully', bookings);
  } catch (error: any) {
    console.error('getStudentBookings error:', error);
    return sendError(res, error.message || 'Failed to fetch bookings', 500);
  }
};

export const getOwnerBookings = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return sendError(res, 'Unauthorized', 401);

    let whereClause: any = {};

    if (req.user.role === 'ADMIN') {
      whereClause = {};
    } else {
      const owner = await prisma.owner.findUnique({
        where: { userId: req.user.userId },
      });

      if (!owner) return sendError(res, 'Owner profile not found', 404);

      whereClause = {
        bed: {
          room: {
            pg: {
              ownerId: owner.id,
            },
          },
        },
      };
    }

    const bookings = await prisma.booking.findMany({
      where: whereClause,
      include: {
        student: {
          include: {
            user: {
              select: { name: true, email: true, mobile: true },
            },
          },
        },
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
      orderBy: { createdAt: 'desc' },
    });

    return sendSuccess(res, 'Owner bookings fetched successfully', bookings);
  } catch (error: any) {
    console.error('getOwnerBookings error:', error);
    return sendError(res, error.message || 'Failed to fetch owner bookings', 500);
  }
};

export const approveBooking = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return sendError(res, 'Unauthorized', 401);

    const { id } = req.params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        bed: {
          include: {
            room: {
              include: {
                pg: { include: { owner: true } },
              },
            },
          },
        },
        student: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!booking) return sendError(res, 'Booking not found', 404);

    if (req.user.role !== 'ADMIN' && booking.bed.room.pg.owner.userId !== req.user.userId) {
      return sendError(res, 'Forbidden: You do not own this PG', 403);
    }

    if (booking.status === 'APPROVED') {
      return sendError(res, 'Booking is already approved', 400);
    }

    // 1. Update Booking status to APPROVED
    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: { status: 'APPROVED' },
    });

    // 2. Mark Bed as OCCUPIED
    await prisma.bed.update({
      where: { id: booking.bedId },
      data: { status: 'OCCUPIED' },
    });

    // 3. Generate initial Rent record for current/upcoming month
    const currentDate = new Date();
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const currentMonthStr = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    const dueDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 5); // 5th of current/next month

    // Only create rent if not already created for this month
    const existingRent = await prisma.rent.findFirst({
      where: {
        bookingId: booking.id,
        month: currentMonthStr,
      },
    });

    if (!existingRent) {
      await prisma.rent.create({
        data: {
          bookingId: booking.id,
          studentId: booking.studentId,
          month: currentMonthStr,
          amount: booking.bed.room.rent,
          dueDate,
          status: 'PENDING',
        },
      });
    }

    // 4. Notify Student
    await prisma.notification.create({
      data: {
        userId: booking.student.userId,
        title: 'Booking Approved! 🎉',
        message: `Your booking for Room ${booking.bed.room.roomNumber}, Bed ${booking.bed.bedNumber} at ${booking.bed.room.pg.name} has been approved! Monthly rent is ₹${booking.bed.room.rent.toLocaleString('en-IN')}.`,
        type: 'BOOKING',
      },
    });

    return sendSuccess(res, 'Booking approved, bed marked occupied, and rent generated', updatedBooking);
  } catch (error: any) {
    console.error('approveBooking error:', error);
    return sendError(res, error.message || 'Failed to approve booking', 500);
  }
};

export const rejectBooking = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return sendError(res, 'Unauthorized', 401);

    const { id } = req.params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        bed: {
          include: {
            room: {
              include: {
                pg: { include: { owner: true } },
              },
            },
          },
        },
        student: true,
      },
    });

    if (!booking) return sendError(res, 'Booking not found', 404);

    if (req.user.role !== 'ADMIN' && booking.bed.room.pg.owner.userId !== req.user.userId) {
      return sendError(res, 'Forbidden: You do not own this PG', 403);
    }

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: { status: 'REJECTED' },
    });

    // Notify Student
    await prisma.notification.create({
      data: {
        userId: booking.student.userId,
        title: 'Booking Request Declined',
        message: `Your booking request for Bed ${booking.bed.bedNumber} at ${booking.bed.room.pg.name} was not approved.`,
        type: 'BOOKING',
      },
    });

    return sendSuccess(res, 'Booking request rejected', updatedBooking);
  } catch (error: any) {
    console.error('rejectBooking error:', error);
    return sendError(res, error.message || 'Failed to reject booking', 500);
  }
};
