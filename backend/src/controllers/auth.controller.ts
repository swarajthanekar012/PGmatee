import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../config/prisma';
import { signToken } from '../utils/jwt';
import { sendError, sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/auth';

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, mobile, password, role, studentData } = req.body;

    if (!name || !email || !mobile || !password) {
      return sendError(res, 'Name, email, mobile, and password are required', 400);
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existingUser) {
      return sendError(res, 'User with this email already exists', 409);
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const assignedRole = role === 'OWNER' ? 'OWNER' : role === 'ADMIN' ? 'ADMIN' : 'STUDENT';

    const user = await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        mobile,
        passwordHash,
        role: assignedRole,
      },
    });

    if (assignedRole === 'STUDENT') {
      await prisma.student.create({
        data: {
          userId: user.id,
          college: studentData?.college || null,
          course: studentData?.course || null,
          year: studentData?.year || null,
          emergencyContact: studentData?.emergencyContact || null,
        },
      });
    } else if (assignedRole === 'OWNER') {
      await prisma.owner.create({
        data: {
          userId: user.id,
          verificationStatus: 'VERIFIED',
        },
      });
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return sendSuccess(
      res,
      'Registration successful',
      {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          mobile: user.mobile,
          role: user.role,
        },
      },
      201
    );
  } catch (error: any) {
    console.error('Registration error:', error);
    return sendError(res, error.message || 'Registration failed', 500);
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, 'Email and password are required', 400);
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: {
        student: true,
        owner: true,
      },
    });

    if (!user) {
      return sendError(res, 'Invalid email or password', 401);
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return sendError(res, 'Invalid email or password', 401);
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return sendSuccess(res, 'Login successful', {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        student: user.student,
        owner: user.owner,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return sendError(res, error.message || 'Login failed', 500);
  }
};

export const getMe = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return sendError(res, 'Unauthorized', 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        name: true,
        email: true,
        mobile: true,
        role: true,
        createdAt: true,
        student: {
          include: {
            bookings: {
              where: { status: 'APPROVED' },
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
        owner: {
          include: {
            pgs: true,
          },
        },
      },
    });

    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    return sendSuccess(res, 'Profile fetched successfully', user);
  } catch (error: any) {
    console.error('GetMe error:', error);
    return sendError(res, error.message || 'Failed to fetch user', 500);
  }
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return sendError(res, 'Unauthorized', 401);
    }

    const { name, mobile, studentData } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: req.user.userId },
      data: {
        name: name || undefined,
        mobile: mobile || undefined,
      },
    });

    if (req.user.role === 'STUDENT' && studentData) {
      await prisma.student.update({
        where: { userId: req.user.userId },
        data: {
          college: studentData.college || undefined,
          course: studentData.course || undefined,
          year: studentData.year || undefined,
          emergencyContact: studentData.emergencyContact || undefined,
        },
      });
    }

    return sendSuccess(res, 'Profile updated successfully', updatedUser);
  } catch (error: any) {
    console.error('UpdateProfile error:', error);
    return sendError(res, error.message || 'Failed to update profile', 500);
  }
};
