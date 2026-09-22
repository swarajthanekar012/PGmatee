import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting PGMate Database Seeding...');

  // Clean existing records in correct relation order
  await prisma.payment.deleteMany();
  await prisma.rent.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.complaint.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.bed.deleteMany();
  await prisma.room.deleteMany();
  await prisma.pG.deleteMany();
  await prisma.owner.deleteMany();
  await prisma.student.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 Cleaned existing tables.');

  // Common password hashes
  const salt = await bcrypt.genSalt(10);
  const adminPassword = await bcrypt.hash('admin123', salt);
  const ownerPassword = await bcrypt.hash('owner123', salt);
  const studentPassword = await bcrypt.hash('student123', salt);

  // 1. Create Admin
  const adminUser = await prisma.user.create({
    data: {
      name: 'Platform Administrator',
      email: 'admin@pgmate.com',
      mobile: '9900011223',
      passwordHash: adminPassword,
      role: 'ADMIN',
    },
  });

  // 2. Create Owner
  const ownerUser = await prisma.user.create({
    data: {
      name: 'Ramesh Sharma',
      email: 'owner@pgmate.com',
      mobile: '9876543210',
      passwordHash: ownerPassword,
      role: 'OWNER',
    },
  });

  const ownerProfile = await prisma.owner.create({
    data: {
      userId: ownerUser.id,
      verificationStatus: 'VERIFIED',
    },
  });

  // 3. Create Student (Swaraj)
  const studentUser = await prisma.user.create({
    data: {
      name: 'Swaraj Patil',
      email: 'student@pgmate.com',
      mobile: '9823456789',
      passwordHash: studentPassword,
      role: 'STUDENT',
    },
  });

  const studentProfile = await prisma.student.create({
    data: {
      userId: studentUser.id,
      college: 'Sanjivani College of Engineering',
      course: 'B.Tech Computer Science',
      year: '3rd Year',
      emergencyContact: 'Sunil Patil (Father) - 9822001122',
    },
  });

  // 4. Create Second Student (Rahul - for booking test queue)
  const rahulUser = await prisma.user.create({
    data: {
      name: 'Rahul Deshmukh',
      email: 'rahul@gmail.com',
      mobile: '9811223344',
      passwordHash: studentPassword,
      role: 'STUDENT',
    },
  });

  const rahulProfile = await prisma.student.create({
    data: {
      userId: rahulUser.id,
      college: 'Pune University (SPPU)',
      course: 'MCA',
      year: '2nd Year',
      emergencyContact: 'Anil Deshmukh - 9898989898',
    },
  });

  // 5. Create PGs
  // PG 1: Sunrise Boys PG in Kopargaon
  const pgSunrise = await prisma.pG.create({
    data: {
      ownerId: ownerProfile.id,
      name: 'Sunrise Boys PG',
      description:
        'A modern, fully-furnished PG for students and working professionals. Located within walking distance from engineering colleges and local transit. Offers hygienic 3-time daily meals, high-speed fiber internet, and 24/7 CCTV surveillance.',
      address: 'Station Road, Near Sanjivani Engineering College',
      city: 'Kopargaon',
      latitude: 19.8821,
      longitude: 74.4789,
      status: 'ACTIVE',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1000&q=80',
      ]),
      facilities: JSON.stringify([
        'Wi-Fi',
        'Food (3 Times)',
        'Laundry',
        'Parking',
        'CCTV Security',
        'Power Backup',
        'RO Water Filter',
        'Hot Water Geyser',
      ]),
      rules: JSON.stringify([
        'Strictly no smoking or alcohol inside the PG premises',
        'Main entry gate closes at 10:30 PM',
        'Day visitors permitted only in common reception area',
        'Maintain silence in study hours (11 PM - 6 AM)',
      ]),
      qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=upi://pay?pa=sunrise.pg@okhdfcbank%26pn=Sunrise%20Boys%20PG%26cu=INR',
      upiId: 'sunrise.pg@okhdfcbank',
      contactMobile: '+91 9876543210',
      licenseNumber: 'MAH/KPG/PG/2026/094',
      legalPermission: 'Municipal Corporation Commercial Lodging NOC & Local Police Approval',
      legalVerified: true,
    },
  });

  // PG 2: Greenview Luxury PG in Pune
  const pgGreenview = await prisma.pG.create({
    data: {
      ownerId: ownerProfile.id,
      name: 'Greenview Luxury Co-Living & PG',
      description:
        'Premium co-living space located in the heart of Viman Nagar. Air-conditioned bedrooms, attached designer washrooms, gym access, biometric access, and chef-curated buffet dinners.',
      address: 'Lane 4, Near Symbiosis Campus, Viman Nagar',
      city: 'Pune',
      latitude: 18.5679,
      longitude: 73.9143,
      status: 'ACTIVE',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1000&q=80',
      ]),
      facilities: JSON.stringify([
        'Wi-Fi (300 Mbps)',
        'AC',
        'Gourmet Food',
        'Gym & Fitness',
        'Daily Housekeeping',
        '24/7 Security & Biometrics',
        'Dedicated Study Desks',
      ]),
      rules: JSON.stringify([
        'Keycard access mandatory for floor entry',
        'Notify management 48 hours prior to overnight guests',
        'Keep electrical appliances turned off when leaving room',
      ]),
      qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=upi://pay?pa=greenview.pg@okhdfcbank%26pn=Greenview%20Luxury%20PG%26cu=INR',
      upiId: 'greenview.pg@okhdfcbank',
      contactMobile: '+91 9898776655',
      licenseNumber: 'MAH/PUN/PG/2026/412',
      legalPermission: 'PMC Commercial Lodging License & Fire Safety Certificate',
      legalVerified: true,
    },
  });

  // 6. Create Rooms and Beds for Sunrise PG
  const room101 = await prisma.room.create({
    data: {
      pgId: pgSunrise.id,
      roomNumber: '101',
      roomType: 'Double Sharing',
      rent: 5500,
    },
  });

  await prisma.bed.create({
    data: { roomId: room101.id, bedNumber: 'B1', status: 'OCCUPIED' },
  });
  await prisma.bed.create({
    data: { roomId: room101.id, bedNumber: 'B2', status: 'AVAILABLE' },
  });

  const room203 = await prisma.room.create({
    data: {
      pgId: pgSunrise.id,
      roomNumber: '203',
      roomType: 'Triple Sharing',
      rent: 6000,
    },
  });

  await prisma.bed.create({
    data: { roomId: room203.id, bedNumber: 'B1', status: 'OCCUPIED' },
  });
  const bed203_B2 = await prisma.bed.create({
    data: { roomId: room203.id, bedNumber: 'B2', status: 'OCCUPIED' },
  });
  const bed203_B3 = await prisma.bed.create({
    data: { roomId: room203.id, bedNumber: 'B3', status: 'AVAILABLE' },
  });

  const room305 = await prisma.room.create({
    data: {
      pgId: pgSunrise.id,
      roomNumber: '305',
      roomType: 'Single Room',
      rent: 8500,
    },
  });
  await prisma.bed.create({
    data: { roomId: room305.id, bedNumber: 'B1', status: 'AVAILABLE' },
  });

  // Rooms for Greenview PG
  const roomG101 = await prisma.room.create({
    data: {
      pgId: pgGreenview.id,
      roomNumber: '101',
      roomType: 'Double Sharing AC',
      rent: 9500,
    },
  });
  await prisma.bed.create({
    data: { roomId: roomG101.id, bedNumber: 'B1', status: 'OCCUPIED' },
  });
  await prisma.bed.create({
    data: { roomId: roomG101.id, bedNumber: 'B2', status: 'AVAILABLE' },
  });

  const roomG201 = await prisma.room.create({
    data: {
      pgId: pgGreenview.id,
      roomNumber: '201',
      roomType: 'Single Deluxe AC',
      rent: 14000,
    },
  });
  await prisma.bed.create({
    data: { roomId: roomG201.id, bedNumber: 'B1', status: 'AVAILABLE' },
  });

  // 7. Create Active Booking for Swaraj (Room 203, Bed B2)
  const swarajBooking = await prisma.booking.create({
    data: {
      studentId: studentProfile.id,
      bedId: bed203_B2.id,
      startDate: new Date('2026-08-01'),
      status: 'APPROVED',
    },
  });

  // Pending Booking for Rahul (Room 203, Bed B3)
  await prisma.booking.create({
    data: {
      studentId: rahulProfile.id,
      bedId: bed203_B3.id,
      startDate: new Date(),
      status: 'PENDING',
    },
  });

  // 8. Rents & Payments for Swaraj
  // August - Paid
  const rentAug = await prisma.rent.create({
    data: {
      bookingId: swarajBooking.id,
      studentId: studentProfile.id,
      month: 'August 2026',
      amount: 6000,
      dueDate: new Date('2026-08-05'),
      status: 'PAID',
    },
  });
  await prisma.payment.create({
    data: {
      rentId: rentAug.id,
      studentId: studentProfile.id,
      amount: 6000,
      transactionId: 'PAY88771122',
      paymentMethod: 'Razorpay - UPI (Google Pay)',
      status: 'SUCCESS',
      paidAt: new Date('2026-08-03T14:30:00Z'),
    },
  });

  // September - Paid
  const rentSep = await prisma.rent.create({
    data: {
      bookingId: swarajBooking.id,
      studentId: studentProfile.id,
      month: 'September 2026',
      amount: 6000,
      dueDate: new Date('2026-09-05'),
      status: 'PAID',
    },
  });
  await prisma.payment.create({
    data: {
      rentId: rentSep.id,
      studentId: studentProfile.id,
      amount: 6000,
      transactionId: 'PAY99883344',
      paymentMethod: 'Razorpay - Credit Card',
      status: 'SUCCESS',
      paidAt: new Date('2026-09-04T10:15:00Z'),
    },
  });

  // October - Pending (ready to pay in UI!)
  await prisma.rent.create({
    data: {
      bookingId: swarajBooking.id,
      studentId: studentProfile.id,
      month: 'October 2026',
      amount: 6000,
      dueDate: new Date('2026-10-05'),
      status: 'PENDING',
    },
  });

  // 9. Announcements
  await prisma.announcement.create({
    data: {
      ownerId: ownerProfile.id,
      pgId: pgSunrise.id,
      title: 'Water Maintenance Notice',
      message: 'Water pipeline maintenance is scheduled tomorrow between 10:00 AM and 2:00 PM. Please store sufficient water in advance.',
      targetType: 'ALL',
    },
  });

  await prisma.announcement.create({
    data: {
      ownerId: ownerProfile.id,
      pgId: pgSunrise.id,
      title: 'High-Speed Fiber Wi-Fi Upgraded',
      message: 'We have installed secondary 300 Mbps mesh Wi-Fi access points on the 2nd floor for seamless online lectures and coding.',
      targetType: 'ALL',
    },
  });

  // 10. Student Grievance / Complaint
  await prisma.complaint.create({
    data: {
      studentId: studentProfile.id,
      pgId: pgSunrise.id,
      roomId: room203.id,
      category: 'Electrical',
      title: 'Ceiling fan regulator loose',
      description: 'The fan in Room 203 works only at speed 5. The regulator knob is loose and needs replacement.',
      status: 'IN_PROGRESS',
      resolutionNote: 'Electrician scheduled to replace regulator tomorrow afternoon.',
    },
  });

  // 11. Notifications
  await prisma.notification.create({
    data: {
      userId: studentUser.id,
      title: 'Welcome to Sunrise Boys PG! 🏠',
      message: 'Your bed allocation for Room 203 (Bed B2) has been confirmed.',
      type: 'BOOKING',
      isRead: true,
    },
  });

  await prisma.notification.create({
    data: {
      userId: studentUser.id,
      title: 'Rent Invoice Generated 🔔',
      message: 'Your rent invoice for October 2026 (₹6,000) has been generated. Due date is 5th October 2026.',
      type: 'RENT',
      isRead: false,
    },
  });

  await prisma.notification.create({
    data: {
      userId: ownerUser.id,
      title: 'New Booking Request 📩',
      message: 'Rahul Deshmukh has requested Bed B3 in Room 203 at Sunrise Boys PG.',
      type: 'BOOKING',
      isRead: false,
    },
  });

  console.log('✅ Database seeded successfully!');
  console.log('----------------------------------------------------');
  console.log('🔑 TEST DEMO CREDENTIALS:');
  console.log('👑 Admin:   admin@pgmate.com   / admin123');
  console.log('🏢 Owner:   owner@pgmate.com   / owner123');
  console.log('🎓 Student: student@pgmate.com / student123');
  console.log('----------------------------------------------------');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
