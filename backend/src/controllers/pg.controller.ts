import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../config/prisma';
import { sendError, sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/auth';
import { signToken } from '../utils/jwt';

export const getAllPGs = async (req: Request, res: Response) => {
  try {
    const { city, search, minRent, maxRent, roomType, facility } = req.query;

    const whereClause: any = {
      status: 'ACTIVE',
    };

    if (city && typeof city === 'string' && city.trim() !== '') {
      whereClause.city = { contains: city.trim() };
    }

    if (search && typeof search === 'string' && search.trim() !== '') {
      whereClause.OR = [
        { name: { contains: search.trim() } },
        { address: { contains: search.trim() } },
        { city: { contains: search.trim() } },
      ];
    }

    const pgs = await prisma.pG.findMany({
      where: whereClause,
      include: {
        owner: {
          include: {
            user: {
              select: { name: true, email: true, mobile: true },
            },
          },
        },
        rooms: {
          include: {
            beds: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Compute aggregate metrics (starting rent, total beds, available beds)
    const formattedPGs = pgs.map((pg) => {
      let minRoomRent = Infinity;
      let totalBeds = 0;
      let availableBeds = 0;

      pg.rooms.forEach((r) => {
        if (r.rent < minRoomRent) minRoomRent = r.rent;
        totalBeds += r.beds.length;
        availableBeds += r.beds.filter((b) => b.status === 'AVAILABLE').length;
      });

      if (minRoomRent === Infinity) minRoomRent = 0;

      let parsedImages = [];
      let parsedFacilities = [];
      let parsedRules = [];
      try {
        parsedImages = JSON.parse(pg.images || '[]');
      } catch (_) {}
      try {
        parsedFacilities = JSON.parse(pg.facilities || '[]');
      } catch (_) {}
      try {
        parsedRules = JSON.parse(pg.rules || '[]');
      } catch (_) {}

      return {
        ...pg,
        images: parsedImages,
        facilities: parsedFacilities,
        rules: parsedRules,
        minRent: minRoomRent,
        totalBeds,
        availableBeds,
      };
    });

    // Optional post-filters (minRent, maxRent, roomType, facility)
    let filtered = formattedPGs;
    if (minRent) {
      filtered = filtered.filter((pg) => pg.minRent >= Number(minRent));
    }
    if (maxRent) {
      filtered = filtered.filter((pg) => pg.minRent <= Number(maxRent));
    }
    if (facility && typeof facility === 'string') {
      filtered = filtered.filter((pg) =>
        pg.facilities.some((f: string) => f.toLowerCase().includes(facility.toLowerCase()))
      );
    }
    if (roomType && typeof roomType === 'string') {
      filtered = filtered.filter((pg) =>
        pg.rooms.some((r) => r.roomType.toLowerCase().includes(roomType.toLowerCase()))
      );
    }

    return sendSuccess(res, 'PGs fetched successfully', filtered);
  } catch (error: any) {
    console.error('getAllPGs error:', error);
    return sendError(res, error.message || 'Failed to fetch PGs', 500);
  }
};

export const getPGById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const pg = await prisma.pG.findUnique({
      where: { id },
      include: {
        owner: {
          include: {
            user: {
              select: { name: true, email: true, mobile: true },
            },
          },
        },
        rooms: {
          include: {
            beds: {
              orderBy: { bedNumber: 'asc' },
            },
          },
        },
      },
    });

    if (!pg) {
      return sendError(res, 'PG not found', 404);
    }

    let parsedImages = [];
    let parsedFacilities = [];
    let parsedRules = [];
    try {
      parsedImages = JSON.parse(pg.images || '[]');
    } catch (_) {}
    try {
      parsedFacilities = JSON.parse(pg.facilities || '[]');
    } catch (_) {}
    try {
      parsedRules = JSON.parse(pg.rules || '[]');
    } catch (_) {}

    let totalBeds = 0;
    let availableBeds = 0;
    let minRent = Infinity;

    pg.rooms.forEach((room) => {
      if (room.rent < minRent) minRent = room.rent;
      totalBeds += room.beds.length;
      availableBeds += room.beds.filter((b) => b.status === 'AVAILABLE').length;
    });

    return sendSuccess(res, 'PG details fetched successfully', {
      ...pg,
      images: parsedImages,
      facilities: parsedFacilities,
      rules: parsedRules,
      minRent: minRent === Infinity ? 0 : minRent,
      totalBeds,
      availableBeds,
    });
  } catch (error: any) {
    console.error('getPGById error:', error);
    return sendError(res, error.message || 'Failed to fetch PG details', 500);
  }
};

export const getOwnerPGs = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return sendError(res, 'Unauthorized', 401);

    const owner = await prisma.owner.findUnique({
      where: { userId: req.user.userId },
    });

    if (!owner) {
      return sendError(res, 'Owner profile not found', 404);
    }

    const pgs = await prisma.pG.findMany({
      where: { ownerId: owner.id },
      include: {
        rooms: {
          include: {
            beds: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = pgs.map((pg) => {
      let totalBeds = 0;
      let availableBeds = 0;
      let occupiedBeds = 0;
      let totalPotentialRent = 0;

      pg.rooms.forEach((r) => {
        totalBeds += r.beds.length;
        const availableInRoom = r.beds.filter((b) => b.status === 'AVAILABLE').length;
        const occupiedInRoom = r.beds.filter((b) => b.status === 'OCCUPIED').length;
        availableBeds += availableInRoom;
        occupiedBeds += occupiedInRoom;
        totalPotentialRent += occupiedInRoom * r.rent;
      });

      return {
        ...pg,
        images: JSON.parse(pg.images || '[]'),
        facilities: JSON.parse(pg.facilities || '[]'),
        rules: JSON.parse(pg.rules || '[]'),
        totalBeds,
        availableBeds,
        occupiedBeds,
        monthlyCollection: totalPotentialRent,
      };
    });

    return sendSuccess(res, 'Owner PGs fetched successfully', formatted);
  } catch (error: any) {
    console.error('getOwnerPGs error:', error);
    return sendError(res, error.message || 'Failed to fetch owner PGs', 500);
  }
};

export const createPG = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return sendError(res, 'Unauthorized', 401);

    const owner = await prisma.owner.findUnique({
      where: { userId: req.user.userId },
    });

    if (!owner) {
      return sendError(res, 'Only registered owners can create a PG', 403);
    }

    const {
      name,
      description,
      address,
      city,
      latitude,
      longitude,
      images,
      facilities,
      rules,
      qrCodeUrl,
      upiId,
      contactMobile,
      licenseNumber,
      legalPermission,
      rooms,
    } = req.body;

    if (!name || !address || !city) {
      return sendError(res, 'Name, address, and city are required', 400);
    }

    const newPG = await prisma.$transaction(async (tx) => {
      const pg = await tx.pG.create({
        data: {
          ownerId: owner.id,
          name,
          description: description || '',
          address,
          city,
          latitude: latitude ? Number(latitude) : null,
          longitude: longitude ? Number(longitude) : null,
          status: 'ACTIVE',
          images: JSON.stringify(images || []),
          facilities: JSON.stringify(facilities || []),
          rules: JSON.stringify(rules || []),
          qrCodeUrl: qrCodeUrl || null,
          upiId: upiId || null,
          contactMobile: contactMobile || null,
          licenseNumber: licenseNumber || null,
          legalPermission: legalPermission || null,
          legalVerified: true,
        },
      });

      if (Array.isArray(rooms) && rooms.length > 0) {
        for (const r of rooms) {
          const room = await tx.room.create({
            data: {
              pgId: pg.id,
              roomNumber: String(r.roomNumber),
              roomType: r.roomType || 'Triple Sharing',
              rent: Number(r.rent) || 6000,
            },
          });

          const bedCount = Number(r.numberOfBeds) || 0;
          if (bedCount > 0) {
            const bedsData = Array.from({ length: bedCount }, (_, i) => ({
              roomId: room.id,
              bedNumber: `B${i + 1}`,
              status: 'AVAILABLE',
            }));
            await tx.bed.createMany({ data: bedsData });
          }
        }
      }

      return pg;
    });

    const fullPG = await prisma.pG.findUnique({
      where: { id: newPG.id },
      include: { rooms: { include: { beds: true } } },
    });

    return sendSuccess(res, 'PG property created successfully', fullPG, 201);
  } catch (error: any) {
    console.error('createPG error:', error);
    return sendError(res, error.message || 'Failed to create PG', 500);
  }
};

export const publicCreatePG = async (req: Request, res: Response) => {
  try {
    const {
      // Owner account details
      ownerName,
      ownerEmail,
      ownerMobile,
      ownerPassword,
      // PG details
      name,
      description,
      address,
      city,
      latitude,
      longitude,
      images,
      facilities,
      rules,
      qrCodeUrl,
      upiId,
      contactMobile,
      licenseNumber,
      legalPermission,
      rooms,
    } = req.body;

    if (!ownerName || !ownerEmail || !ownerMobile || !ownerPassword) {
      return sendError(res, 'Owner name, email, mobile, and password are required', 400);
    }

    if (!name || !address || !city) {
      return sendError(res, 'PG name, address, and city are required', 400);
    }

    const normalizedEmail = ownerEmail.toLowerCase().trim();

    // Check if user already exists
    let user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: { owner: true },
    });

    if (user && !user.owner && user.role !== 'OWNER') {
      return sendError(res, 'An account with this email exists as a student. Please use another email or login.', 400);
    }

    let ownerId = user?.owner?.id;

    if (!user) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(ownerPassword, salt);

      user = await prisma.user.create({
        data: {
          name: ownerName,
          email: normalizedEmail,
          mobile: ownerMobile,
          passwordHash,
          role: 'OWNER',
          owner: {
            create: {
              verificationStatus: 'VERIFIED',
            },
          },
        },
        include: { owner: true },
      });
      ownerId = user.owner!.id;
    } else if (!ownerId) {
      const newOwner = await prisma.owner.create({
        data: {
          userId: user.id,
          verificationStatus: 'VERIFIED',
        },
      });
      ownerId = newOwner.id;
    }

    const newPG = await prisma.$transaction(async (tx) => {
      const pg = await tx.pG.create({
        data: {
          ownerId: ownerId!,
          name,
          description: description || '',
          address,
          city,
          latitude: latitude ? Number(latitude) : null,
          longitude: longitude ? Number(longitude) : null,
          status: 'ACTIVE',
          images: JSON.stringify(images || []),
          facilities: JSON.stringify(facilities || []),
          rules: JSON.stringify(rules || []),
          qrCodeUrl: qrCodeUrl || null,
          upiId: upiId || null,
          contactMobile: contactMobile || ownerMobile,
          licenseNumber: licenseNumber || null,
          legalPermission: legalPermission || null,
          legalVerified: true,
        },
      });

      if (Array.isArray(rooms) && rooms.length > 0) {
        for (const r of rooms) {
          const room = await tx.room.create({
            data: {
              pgId: pg.id,
              roomNumber: String(r.roomNumber),
              roomType: r.roomType || 'Triple Sharing',
              rent: Number(r.rent) || 6000,
            },
          });

          const bedCount = Number(r.numberOfBeds) || 0;
          if (bedCount > 0) {
            const bedsData = Array.from({ length: bedCount }, (_, i) => ({
              roomId: room.id,
              bedNumber: `B${i + 1}`,
              status: 'AVAILABLE',
            }));
            await tx.bed.createMany({ data: bedsData });
          }
        }
      }

      return pg;
    });

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: 'OWNER',
    });

    const fullPG = await prisma.pG.findUnique({
      where: { id: newPG.id },
      include: { rooms: { include: { beds: true } } },
    });

    return sendSuccess(
      res,
      'Owner registered and PG listed successfully!',
      {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          mobile: user.mobile,
          role: 'OWNER',
        },
        pg: fullPG,
      },
      201
    );
  } catch (error: any) {
    console.error('publicCreatePG error:', error);
    return sendError(res, error.message || 'Failed to list PG', 500);
  }
};

export const updatePG = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return sendError(res, 'Unauthorized', 401);

    const { id } = req.params;
    const existing = await prisma.pG.findUnique({
      where: { id },
      include: { owner: true },
    });

    if (!existing) {
      return sendError(res, 'PG not found', 404);
    }

    if (req.user.role !== 'ADMIN' && existing.owner.userId !== req.user.userId) {
      return sendError(res, 'Forbidden: You do not own this property', 403);
    }

    const { name, description, address, city, latitude, longitude, images, facilities, rules, status } = req.body;

    const updated = await prisma.pG.update({
      where: { id },
      data: {
        name: name || undefined,
        description: description !== undefined ? description : undefined,
        address: address || undefined,
        city: city || undefined,
        latitude: latitude ? Number(latitude) : undefined,
        longitude: longitude ? Number(longitude) : undefined,
        status: status || undefined,
        images: images ? JSON.stringify(images) : undefined,
        facilities: facilities ? JSON.stringify(facilities) : undefined,
        rules: rules ? JSON.stringify(rules) : undefined,
      },
    });

    return sendSuccess(res, 'PG property updated successfully', updated);
  } catch (error: any) {
    console.error('updatePG error:', error);
    return sendError(res, error.message || 'Failed to update PG', 500);
  }
};

export const deletePG = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return sendError(res, 'Unauthorized', 401);

    const { id } = req.params;
    const existing = await prisma.pG.findUnique({
      where: { id },
      include: { owner: true },
    });

    if (!existing) {
      return sendError(res, 'PG not found', 404);
    }

    if (req.user.role !== 'ADMIN' && existing.owner.userId !== req.user.userId) {
      return sendError(res, 'Forbidden: You do not own this property', 403);
    }

    await prisma.pG.delete({ where: { id } });

    return sendSuccess(res, 'PG deleted successfully');
  } catch (error: any) {
    console.error('deletePG error:', error);
    return sendError(res, error.message || 'Failed to delete PG', 500);
  }
};
