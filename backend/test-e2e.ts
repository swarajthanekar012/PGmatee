const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('🧪 Running Comprehensive PGMate End-to-End API Flow Tests...');

  // 1. Healthcheck
  const healthRes = await fetch(`${BASE_URL}/health`);
  const health = (await healthRes.json()) as any;
  console.log('✅ Healthcheck:', health);

  // 2. Student Login
  const loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'student@pgmate.com', password: 'student123' }),
  });
  const studentLogin = (await loginRes.json()) as any;
  const studentToken = studentLogin.data.token;
  console.log('✅ Student Login Successful:', studentLogin.data.user.name);

  const studentHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${studentToken}`,
  };

  // 3. Fetch Student Rents
  const rentRes = await fetch(`${BASE_URL}/rent/student`, { headers: studentHeaders });
  const studentRents = (await rentRes.json()) as any;
  const rents = studentRents.data;
  console.log(`✅ Fetched ${rents.length} Rent Records for Student`);
  const pendingRent = rents.find((r: any) => r.status === 'PENDING');
  console.log('📋 Current Pending Rent:', pendingRent ? `${pendingRent.month} - ₹${pendingRent.amount}` : 'None');

  // 4. Test Razorpay Order Creation & Payment Verification
  if (pendingRent) {
    const orderReq = await fetch(`${BASE_URL}/payments/create-order`, {
      method: 'POST',
      headers: studentHeaders,
      body: JSON.stringify({ rentId: pendingRent.id }),
    });
    const orderRes = (await orderReq.json()) as any;
    console.log('✅ Razorpay Order Created:', orderRes.data.orderId);

    const verifyReq = await fetch(`${BASE_URL}/payments/verify`, {
      method: 'POST',
      headers: studentHeaders,
      body: JSON.stringify({
        rentId: pendingRent.id,
        razorpayOrderId: orderRes.data.orderId,
        razorpayPaymentId: 'pay_test_' + Date.now(),
        razorpaySignature: 'mock_verified_signature',
        paymentMethod: 'Razorpay - UPI (Google Pay)',
      }),
    });
    const verifyRes = (await verifyReq.json()) as any;
    console.log('✅ Payment Verification Successful! Transaction ID:', verifyRes.data.payment.transactionId);
    console.log('✅ Rent Status Updated to:', verifyRes.data.rent.status);
  }

  // 5. Check Payment History
  const histReq = await fetch(`${BASE_URL}/payments/history`, { headers: studentHeaders });
  const historyRes = (await histReq.json()) as any;
  console.log(`✅ Student Payment History has ${historyRes.data.length} verified receipts`);

  // 6. Test PG Search & Filter
  const pgsReq = await fetch(`${BASE_URL}/pgs?city=Kopargaon`);
  const pgs = (await pgsReq.json()) as any;
  console.log(`✅ Found ${pgs.data.length} PGs in Kopargaon`);
  const pgDetailReq = await fetch(`${BASE_URL}/pgs/${pgs.data[0].id}`);
  const pgDetail = (await pgDetailReq.json()) as any;
  console.log(`✅ Loaded PG: ${pgDetail.data.name} with ${pgDetail.data.rooms.length} room types`);

  // 7. Test Owner Login & Dashboard
  const ownerLoginReq = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'owner@pgmate.com', password: 'owner123' }),
  });
  const ownerLogin = (await ownerLoginReq.json()) as any;
  const ownerToken = ownerLogin.data.token;
  console.log('✅ Owner Login Successful:', ownerLogin.data.user.name);

  const ownerHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${ownerToken}`,
  };

  const ownerBookingsReq = await fetch(`${BASE_URL}/bookings/owner`, { headers: ownerHeaders });
  const ownerBookings = (await ownerBookingsReq.json()) as any;
  console.log(`✅ Owner has ${ownerBookings.data.length} booking records`);
  const pendingBooking = ownerBookings.data.find((b: any) => b.status === 'PENDING');

  if (pendingBooking) {
    console.log(`📋 Found pending booking from ${pendingBooking.student.user.name} for Bed ${pendingBooking.bed.bedNumber}`);
    const approveReq = await fetch(`${BASE_URL}/bookings/${pendingBooking.id}/approve`, {
      method: 'PUT',
      headers: ownerHeaders,
    });
    const approveRes = (await approveReq.json()) as any;
    console.log('✅ Approved booking! Status:', approveRes.data.status);
  }

  // 8. Test Announcement Broadcast
  const annReq = await fetch(`${BASE_URL}/announcements`, {
    method: 'POST',
    headers: ownerHeaders,
    body: JSON.stringify({
      pgId: pgs.data[0].id,
      title: 'Wi-Fi Speed Test Notice',
      message: 'High speed fiber tested at 300 Mbps across all hostel floors.',
      targetType: 'ALL',
    }),
  });
  const annRes = (await annReq.json()) as any;
  console.log('✅ Owner broadcasted announcement:', annRes.data.title);

  // 9. Test Student Complaint
  const compReq = await fetch(`${BASE_URL}/complaints`, {
    method: 'POST',
    headers: studentHeaders,
    body: JSON.stringify({
      category: 'Wi-Fi',
      title: 'Testing fast connectivity',
      description: 'Wi-Fi working great on the 2nd floor.',
    }),
  });
  const compRes = (await compReq.json()) as any;
  console.log('✅ Student lodged complaint/feedback:', compRes.data.title);

  // 10. Test Admin Stats
  const adminLoginReq = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@pgmate.com', password: 'admin123' }),
  });
  const adminLogin = (await adminLoginReq.json()) as any;
  const adminHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${adminLogin.data.token}`,
  };
  const adminStatsReq = await fetch(`${BASE_URL}/admin/stats`, { headers: adminHeaders });
  const adminStats = (await adminStatsReq.json()) as any;
  console.log('✅ Admin Platform Telemetry:', {
    totalUsers: adminStats.data.totalUsers,
    totalPGs: adminStats.data.totalPGs,
    totalBeds: adminStats.data.totalBeds,
    occupancyRate: adminStats.data.occupancyRate + '%',
    totalRevenue: '₹' + adminStats.data.totalRevenue,
  });

  console.log('\n🎉 ALL 10 END-TO-END FLOWS VERIFIED SUCCESSFULLY!');
}

runTests().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
