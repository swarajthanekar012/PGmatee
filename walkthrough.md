# 🏠 PGMate – Smart PG Management System Walkthrough

PGMate is an end-to-end full-stack web platform connecting PG owners and students on a unified, modern interface with real-time bed management, online rent payments, and administrative oversight.

Both services are live and running locally:
- **Frontend App**: [http://localhost:3000](http://localhost:3000)
- **Backend REST API**: [http://localhost:5000](http://localhost:5000) (Healthcheck: [http://localhost:5000/api/health](http://localhost:5000/api/health))

---

## 🔑 Quick 1-Click Demo Credentials

You can test each role directly from the login page using the pre-built 1-click test buttons or manual credentials:

| Role | Email | Password | Primary Capabilities to Test |
| :--- | :--- | :--- | :--- |
| **🎓 Student** | `student@pgmate.com` | `student123` | Assigned to Room 203 (Bed B2) at *Sunrise Boys PG*. Pay rent via Razorpay, view transaction history, print receipts, lodge complaints, and view notices. |
| **🏢 PG Owner** | `owner@pgmate.com` | `owner123` | Manages *Sunrise Boys PG* (Kopargaon) & *Greenview Luxury PG* (Pune). Review applicant booking requests, toggle bed occupancy states, track rent dues, and broadcast announcements. |
| **👑 Admin** | `admin@pgmate.com` | `admin123` | Platform-wide stats, user directory, audit logs, and owner verification toggles. |

---

## 🚀 Key Features Implemented

### 1. 🎓 Student Experience
- **Public & Filtered PG Search (`/pgs`)**:
  - Live filtering by city (Kopargaon, Pune), max budget slider, room type (Single, Double Sharing, Triple Sharing), and facility tags (Wi-Fi, Food, Laundry, AC, CCTV, Parking).
- **PG Detail & Interactive Bed Matrix (`/pgs/[id]`)**:
  - Photo gallery, included facilities, house rules, and room breakdown with live vacant/occupied bed slots.
  - "Request Bed" modal to submit an instant booking application.
- **Student Dashboard (`/student/dashboard`)**:
  - Highlights current PG, assigned Room and Bed, monthly fee due date, pending rent alert, and quick "Pay Rent" action.
- **Razorpay Checkout & Digital Receipts (`/student/rent` & `/student/payments`)**:
  - Interactive payment modal with UPI (GPay, PhonePe, Paytm), Card, and Netbanking simulators.
  - Cryptographic HMAC-SHA256 signature verification on the backend.
  - Printable and downloadable official rent receipts with unique transaction reference numbers (`PAY...`).
- **Grievance Redressal (`/student/complaints`)**:
  - Lodge maintenance tickets (Electrical, Plumbing, Wi-Fi, Food) and track real-time resolution status and owner notes.
- **Notice Board (`/student/announcements`)**:
  - Bulletins published by the property owner with time and target audience.

---

### 2. 🏢 PG Owner Experience
- **Telemetry Dashboard (`/owner/dashboard`)**:
  - KPI cards: Total Beds, Occupied Beds, Available Beds, Pending Rent, and Projected Monthly Collection.
  - Real-time occupancy percentage gauge.
  - Booking approval queue with 1-click **[Approve & Allocate]** and **[Reject]** actions.
- **Interactive Room & Bed Matrix (`/owner/rooms-beds`)**:
  - Add new rooms with custom sharing configurations and rent per bed.
  - Add beds to existing rooms on the fly.
  - 1-click bed status toggler (`AVAILABLE` ⟷ `OCCUPIED` ⟷ `MAINTENANCE`).
- **Rent Collections Ledger (`/owner/rent`)**:
  - Comprehensive breakdown of all resident fees with payment methods and reference IDs.
  - Batch "Generate Invoices" button to trigger the next billing cycle across all active residents.
- **Notice Broadcaster (`/owner/announcements`)**:
  - Broadcast notices to all residents or specific PG properties.
  - Choose targeting: All Residents, Specific PG, or Specific Room.
- **Grievance Triage (`/owner/complaints`)**:
  - Update complaint statuses (`OPEN` ➔ `IN_PROGRESS` ➔ `RESOLVED`) and record notes for tenants.

---

### 3. 👑 Platform Administration
- **Master Console (`/admin/dashboard`)**:
  - Platform-wide statistics: total users, active students vs owners, total properties, rooms, beds, occupancy rate, and processed transaction volume.
  - Complete user directory with role inspection and owner verification status toggles (`VERIFIED`, `PENDING`, `REJECTED`).

---

## 🧪 Verification & Automated Test Results

An automated end-to-end test suite (`backend/test-e2e.ts`) was executed against the running servers, successfully validating all 10 core system flows:

```
🧪 Running Comprehensive PGMate End-to-End API Flow Tests...
✅ Healthcheck: { status: 'ok', timestamp: '2026-09-21T17:56:23.409Z' }
✅ Student Login Successful: Swaraj Patil
✅ Fetched 3 Rent Records for Student
📋 Current Pending Rent: October 2026 - ₹6000
✅ Razorpay Order Created: order_1790013383898_ai1ah9a
✅ Payment Verification Successful! Transaction ID: PAY3839192664
✅ Rent Status Updated to: PAID
✅ Student Payment History has 3 verified receipts
✅ Found 1 PGs in Kopargaon
✅ Loaded PG: Sunrise Boys PG with 3 room types
✅ Owner Login Successful: Ramesh Sharma
✅ Owner has 2 booking records
📋 Found pending booking from Rahul Deshmukh for Bed B3
✅ Approved booking! Status: APPROVED
✅ Owner broadcasted announcement: Wi-Fi Speed Test Notice
✅ Student lodged complaint/feedback: Testing fast connectivity
✅ Admin Platform Telemetry: {
  totalUsers: 4,
  totalPGs: 2,
  totalBeds: 9,
  occupancyRate: '56%',
  totalRevenue: '₹18000'
}

🎉 ALL 10 END-TO-END FLOWS VERIFIED SUCCESSFULLY!
```

Furthermore, the Next.js production build (`npm run build`) succeeded with zero errors across all 21 client and server routes.
