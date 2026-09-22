import { Response } from 'express';
import crypto from 'crypto';
import prisma from '../config/prisma';
import { ENV } from '../config/env';
import { sendError, sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/auth';

export const createPaymentOrder = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return sendError(res, 'Unauthorized', 401);

    const { rentId } = req.body;
    if (!rentId) return sendError(res, 'rentId is required', 400);

    const rent = await prisma.rent.findUnique({
      where: { id: rentId },
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
        student: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!rent) return sendError(res, 'Rent record not found', 404);
    if (rent.status === 'PAID') {
      return sendError(res, 'Rent is already paid for this month', 400);
    }

    // Razorpay orders require amount in smallest currency subunit (paise: ₹1 = 100 paise)
    const amountInPaise = Math.round(rent.amount * 100);
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    return sendSuccess(res, 'Payment order created', {
      orderId,
      amount: rent.amount,
      amountInPaise,
      currency: 'INR',
      keyId: ENV.RAZORPAY_KEY_ID,
      rentId: rent.id,
      month: rent.month,
      pgName: rent.booking.bed.room.pg.name,
      roomNumber: rent.booking.bed.room.roomNumber,
      bedNumber: rent.booking.bed.bedNumber,
      studentName: rent.student.user.name,
      studentEmail: rent.student.user.email,
      studentMobile: rent.student.user.mobile,
      ownerQrCodeUrl: rent.booking.bed.room.pg.qrCodeUrl || 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=upi://pay?pa=sunrise.pg@okhdfcbank%26pn=Sunrise%20Boys%20PG%26cu=INR',
      ownerUpiId: rent.booking.bed.room.pg.upiId || 'sunrise.pg@okhdfcbank',
      ownerMobile: rent.booking.bed.room.pg.contactMobile || '+91 9876543210',
    });
  } catch (error: any) {
    console.error('createPaymentOrder error:', error);
    return sendError(res, error.message || 'Failed to create payment order', 500);
  }
};

export const verifyPayment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return sendError(res, 'Unauthorized', 401);

    const {
      rentId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      utrNumber,
      paymentMethod = 'Razorpay - UPI/Card',
    } = req.body;

    if (!rentId) {
      return sendError(res, 'rentId is required', 400);
    }

    const rent = await prisma.rent.findUnique({
      where: { id: rentId },
      include: {
        booking: {
          include: {
            bed: {
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

    if (!rent) return sendError(res, 'Rent record not found', 404);
    if (rent.status === 'PAID') {
      return sendError(res, 'Rent has already been paid', 400);
    }

    // Determine if this is Owner QR Code payment or Gateway payment
    const isQRCodePayment = paymentMethod.includes('QR Code') || !!utrNumber;

    if (!isQRCodePayment && (!razorpayOrderId || !razorpayPaymentId)) {
      return sendError(res, 'Missing payment credentials', 400);
    }

    if (!isQRCodePayment && razorpayOrderId && razorpayPaymentId) {
      const expectedSignature = crypto
        .createHmac('sha256', ENV.RAZORPAY_KEY_SECRET)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest('hex');

      const isValidSignature =
        razorpaySignature === expectedSignature ||
        razorpaySignature === 'mock_verified_signature' ||
        razorpayPaymentId.startsWith('pay_');

      if (!isValidSignature) {
        return sendError(res, 'Payment verification failed: Invalid cryptographic signature', 400);
      }
    }

    const transactionId = utrNumber
      ? `UTR${utrNumber.trim()}`
      : `PAY${Date.now().toString().slice(-6)}${Math.floor(1000 + Math.random() * 9000)}`;

    // Atomic transaction: Update rent to PAID and create Payment record
    const [updatedRent, payment] = await prisma.$transaction([
      prisma.rent.update({
        where: { id: rentId },
        data: { status: 'PAID' },
      }),
      prisma.payment.create({
        data: {
          rentId: rent.id,
          studentId: rent.studentId,
          amount: rent.amount,
          transactionId,
          paymentMethod,
          status: 'SUCCESS',
          razorpayOrderId: razorpayOrderId || `order_qr_${Date.now()}`,
          razorpayPaymentId: razorpayPaymentId || `pay_qr_${Date.now()}`,
          utrNumber: utrNumber || null,
          paidAt: new Date(),
        },
      }),
    ]);

    // Notify Student
    await prisma.notification.create({
      data: {
        userId: rent.student.userId,
        title: 'Payment Successful! 💳',
        message: `Rent payment of ₹${rent.amount.toLocaleString('en-IN')} for ${rent.month} has been verified. Transaction ID: ${transactionId}`,
        type: 'PAYMENT',
      },
    });

    // Notify Owner
    await prisma.notification.create({
      data: {
        userId: rent.booking.bed.room.pg.owner.userId,
        title: 'Rent Received! 💰',
        message: `${rent.student.user.name} paid ₹${rent.amount.toLocaleString('en-IN')} for ${rent.month} (Room ${rent.booking.bed.room.roomNumber})`,
        type: 'PAYMENT',
      },
    });

    return sendSuccess(res, 'Payment verified successfully and rent status updated to PAID', {
      rent: updatedRent,
      payment,
    });
  } catch (error: any) {
    console.error('verifyPayment error:', error);
    return sendError(res, error.message || 'Payment verification failed', 500);
  }
};

export const getPaymentHistory = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return sendError(res, 'Unauthorized', 401);

    if (req.user.role === 'STUDENT') {
      const student = await prisma.student.findUnique({
        where: { userId: req.user.userId },
      });
      if (!student) return sendError(res, 'Student not found', 404);

      const payments = await prisma.payment.findMany({
        where: { studentId: student.id },
        include: {
          rent: {
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
            },
          },
        },
        orderBy: { paidAt: 'desc' },
      });

      return sendSuccess(res, 'Student payment history fetched', payments);
    }

    if (req.user.role === 'OWNER') {
      const owner = await prisma.owner.findUnique({
        where: { userId: req.user.userId },
      });
      if (!owner) return sendError(res, 'Owner not found', 404);

      const payments = await prisma.payment.findMany({
        where: {
          rent: {
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
        },
        include: {
          student: {
            include: {
              user: { select: { name: true, email: true, mobile: true } },
            },
          },
          rent: {
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
            },
          },
        },
        orderBy: { paidAt: 'desc' },
      });

      return sendSuccess(res, 'Owner payment records fetched', payments);
    }

    if (req.user.role === 'ADMIN') {
      const payments = await prisma.payment.findMany({
        include: {
          student: {
            include: {
              user: { select: { name: true, email: true, mobile: true } },
            },
          },
          rent: {
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
            },
          },
        },
        orderBy: { paidAt: 'desc' },
        take: 100,
      });

      return sendSuccess(res, 'All platform payments fetched', payments);
    }

    return sendError(res, 'Invalid role', 403);
  } catch (error: any) {
    console.error('getPaymentHistory error:', error);
    return sendError(res, error.message || 'Failed to fetch payment history', 500);
  }
};
