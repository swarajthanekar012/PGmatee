export type UserRole = 'STUDENT' | 'OWNER' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  mobile: string;
  role: UserRole;
  createdAt?: string;
  student?: StudentProfile;
  owner?: OwnerProfile;
}

export interface StudentProfile {
  id: string;
  userId: string;
  college?: string;
  course?: string;
  year?: string;
  emergencyContact?: string;
  bookings?: Booking[];
}

export interface OwnerProfile {
  id: string;
  userId: string;
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
  pgs?: PG[];
}

export interface Bed {
  id: string;
  roomId: string;
  bedNumber: string;
  status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE';
  room?: Room;
  bookings?: Booking[];
}

export interface Room {
  id: string;
  pgId: string;
  roomNumber: string;
  roomType: string;
  rent: number;
  beds: Bed[];
  pg?: PG;
}

export interface PG {
  id: string;
  ownerId: string;
  name: string;
  description?: string;
  address: string;
  city: string;
  latitude?: number;
  longitude?: number;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
  images: string[];
  facilities: string[];
  rules: string[];
  rooms: Room[];
  qrCodeUrl?: string;
  upiId?: string;
  contactMobile?: string;
  licenseNumber?: string;
  legalPermission?: string;
  legalVerified?: boolean;
  minRent?: number;
  totalBeds?: number;
  availableBeds?: number;
  owner?: {
    user: {
      name: string;
      email: string;
      mobile: string;
    };
  };
}

export interface Booking {
  id: string;
  studentId: string;
  bedId: string;
  startDate: string;
  endDate?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  createdAt: string;
  bed: Bed;
  student?: {
    user: {
      name: string;
      email: string;
      mobile: string;
    };
    college?: string;
    course?: string;
    emergencyContact?: string;
  };
}

export interface Rent {
  id: string;
  bookingId: string;
  studentId: string;
  month: string;
  amount: number;
  dueDate: string;
  status: 'PENDING' | 'PAID' | 'OVERDUE';
  createdAt: string;
  booking: Booking;
  payments?: Payment[];
  student?: {
    user: {
      name: string;
      email: string;
      mobile: string;
    };
    college?: string;
    course?: string;
    emergencyContact?: string;
  };
}

export interface Payment {
  id: string;
  rentId: string;
  studentId: string;
  amount: number;
  transactionId: string;
  paymentMethod: string;
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  utrNumber?: string;
  paidAt: string;
  rent?: Rent;
}

export interface Announcement {
  id: string;
  ownerId: string;
  pgId: string;
  title: string;
  message: string;
  targetType: 'ALL' | 'PG' | 'ROOM';
  targetRoomId?: string;
  createdAt: string;
  pg?: {
    name: string;
  };
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export interface Complaint {
  id: string;
  studentId: string;
  pgId: string;
  roomId?: string;
  category: string;
  title: string;
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  resolutionNote?: string;
  createdAt: string;
  updatedAt: string;
  pg?: {
    name: string;
  };
  room?: {
    roomNumber: string;
  };
  student?: {
    user: {
      name: string;
      email: string;
      mobile: string;
    };
  };
}
