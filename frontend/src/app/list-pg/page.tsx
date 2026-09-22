'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import {
  Building2,
  ShieldCheck,
  QrCode,
  BedDouble,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Plus,
  Trash2,
  Sparkles,
  AlertCircle,
  Phone,
  FileCheck,
  Check,
  Copy,
  Image as ImageIcon,
  Loader2,
  MapPin,
  Mail,
  User as UserIcon,
  KeyRound,
  DollarSign,
  HelpCircle,
} from 'lucide-react';

interface RoomDraft {
  roomNumber: string;
  roomType: string;
  rent: number;
  numberOfBeds: number;
}

const AVAILABLE_FACILITIES = [
  'High-Speed WiFi (100 Mbps)',
  'Air Conditioning (AC)',
  '3-Time Hygienic Meals (North & South)',
  'Power Backup / Inverter',
  '24x7 CCTV Security',
  'Automated Washing Machines',
  'Daily Room Housekeeping',
  'RO Purified Cold/Hot Water',
  'Geyser / Hot Water 24x7',
  'Attached Washrooms',
  'Spacious Wooden Wardrobes',
  'Dedicated Study Desk & Chair',
];

const AVAILABLE_RULES = [
  'Government ID Proof & Student/Company ID Mandatory',
  'Gate closes at 10:30 PM (Biometric access)',
  'Strictly No Smoking / No Alcohol inside premises',
  'Day visitors allowed until 8:00 PM in common lounge',
  'Maintain quiet hours after 11:00 PM',
  'Rent to be cleared by the 5th of every month',
];

const SAMPLE_PG_PHOTOS = [
  'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1000&q=80',
];

export default function ListPGPage() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [success, setSuccess] = useState(false);

  // Step 1: Owner Profile
  const [ownerName, setOwnerName] = useState(user?.name || '');
  const [ownerEmail, setOwnerEmail] = useState(user?.email || '');
  const [ownerMobile, setOwnerMobile] = useState(user?.mobile || '');
  const [ownerPassword, setOwnerPassword] = useState('');

  // Step 2: PG Basic Info
  const [pgName, setPgName] = useState('');
  const [city, setCity] = useState('Bangalore');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [contactMobile, setContactMobile] = useState('');
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>(SAMPLE_PG_PHOTOS.slice(0, 2));
  const [customPhotoUrl, setCustomPhotoUrl] = useState('');
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([
    'High-Speed WiFi (100 Mbps)',
    '3-Time Hygienic Meals (North & South)',
    'Power Backup / Inverter',
    '24x7 CCTV Security',
    'RO Purified Cold/Hot Water',
  ]);
  const [selectedRules, setSelectedRules] = useState<string[]>([
    'Government ID Proof & Student/Company ID Mandatory',
    'Gate closes at 10:30 PM (Biometric access)',
    'Strictly No Smoking / No Alcohol inside premises',
  ]);

  // Step 3: Legal Permissions & Licenses
  const [legalPermission, setLegalPermission] = useState('Municipal Corporation Housing & Trade License');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [legalCertified, setLegalCertified] = useState(true);

  // Step 4: Rooms & Beds
  const [rooms, setRooms] = useState<RoomDraft[]>([
    { roomNumber: '101', roomType: 'Double Sharing', rent: 8500, numberOfBeds: 2 },
    { roomNumber: '102', roomType: 'Triple Sharing', rent: 6500, numberOfBeds: 3 },
  ]);

  // Step 5: UPI Payment QR Code
  const [upiId, setUpiId] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [autoGenQr, setAutoGenQr] = useState(true);

  // Pre-fill owner details if user is already logged in
  useEffect(() => {
    if (user) {
      setOwnerName(user.name);
      setOwnerEmail(user.email);
      setOwnerMobile(user.mobile || '');
      if (!contactMobile && user.mobile) setContactMobile(user.mobile);
    }
  }, [user]);

  // Auto-generate QR code URL when UPI ID or PG Name changes
  useEffect(() => {
    if (autoGenQr) {
      if (upiId.trim()) {
        const cleanUpi = upiId.trim();
        const cleanName = pgName.trim() || 'PG Accommodation';
        const generated = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=upi://pay?pa=${encodeURIComponent(
          cleanUpi
        )}%26pn=${encodeURIComponent(cleanName)}%26cu=INR`;
        setQrCodeUrl(generated);
      } else {
        setQrCodeUrl('');
      }
    }
  }, [upiId, pgName, autoGenQr]);

  // Room management helpers
  const handleAddRoom = () => {
    const nextRoomNum = String(101 + rooms.length);
    setRooms([
      ...rooms,
      {
        roomNumber: nextRoomNum,
        roomType: 'Triple Sharing',
        rent: 6500,
        numberOfBeds: 3,
      },
    ]);
  };

  const handleUpdateRoom = (index: number, field: keyof RoomDraft, value: any) => {
    setRooms((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleRemoveRoom = (index: number) => {
    if (rooms.length === 1) {
      alert('Your PG must have at least one room.');
      return;
    }
    setRooms((prev) => prev.filter((_, i) => i !== index));
  };

  // Facility toggle
  const toggleFacility = (facility: string) => {
    setSelectedFacilities((prev) =>
      prev.includes(facility) ? prev.filter((f) => f !== facility) : [...prev, facility]
    );
  };

  // Rule toggle
  const toggleRule = (rule: string) => {
    setSelectedRules((prev) =>
      prev.includes(rule) ? prev.filter((r) => r !== rule) : [...prev, rule]
    );
  };

  // Add custom photo URL
  const handleAddPhoto = () => {
    if (!customPhotoUrl.trim()) return;
    setSelectedPhotos([...selectedPhotos, customPhotoUrl.trim()]);
    setCustomPhotoUrl('');
  };

  // Validation before advancing steps
  const handleNextStep = () => {
    setErrorMsg('');
    if (step === 1) {
      if (!user) {
        if (!ownerName.trim() || !ownerEmail.trim() || !ownerMobile.trim() || !ownerPassword) {
          setErrorMsg('Please complete all owner registration fields.');
          return;
        }
        if (ownerPassword.length < 6) {
          setErrorMsg('Password must be at least 6 characters long.');
          return;
        }
      }
    } else if (step === 2) {
      if (!pgName.trim() || !address.trim() || !city.trim()) {
        setErrorMsg('Please enter PG Name, City, and complete Street Address.');
        return;
      }
      if (selectedPhotos.length === 0) {
        setErrorMsg('Please attach at least one photo of the PG property.');
        return;
      }
    } else if (step === 3) {
      if (!licenseNumber.trim()) {
        setErrorMsg('Please provide your Trade License, Municipal Registration, or Police NOC number.');
        return;
      }
      if (!legalCertified) {
        setErrorMsg('Please certify that your PG property complies with local municipal and tenant regulations.');
        return;
      }
    } else if (step === 4) {
      if (rooms.length === 0) {
        setErrorMsg('Please configure at least one room with beds.');
        return;
      }
      const invalidRoom = rooms.find((r) => !r.roomNumber || r.rent <= 0 || r.numberOfBeds <= 0);
      if (invalidRoom) {
        setErrorMsg('Please ensure all rooms have valid room numbers, rent amounts, and at least 1 bed.');
        return;
      }
    }
    setStep(step + 1);
  };

  // Final submission
  const handleSubmitAll = async () => {
    setErrorMsg('');
    if (!upiId.trim()) {
      setErrorMsg('Please enter your UPI ID so students can scan and pay rent directly.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        // Owner Registration (for guest visitors)
        ownerName: ownerName.trim(),
        ownerEmail: ownerEmail.trim(),
        ownerMobile: ownerMobile.trim(),
        ownerPassword: ownerPassword || 'OwnerPass@123',
        // PG Details
        name: pgName.trim(),
        description: description.trim() || `${pgName} offers comfortable, secure student living in ${city}.`,
        address: address.trim(),
        city: city.trim(),
        contactMobile: contactMobile.trim() || ownerMobile.trim(),
        images: selectedPhotos,
        facilities: selectedFacilities,
        rules: selectedRules,
        // Legal & Compliance
        legalPermission,
        licenseNumber: licenseNumber.trim(),
        // Rooms & Beds
        rooms: rooms.map((r) => ({
          roomNumber: r.roomNumber.trim(),
          roomType: r.roomType,
          rent: Number(r.rent),
          numberOfBeds: Number(r.numberOfBeds),
        })),
        // Payment QR details
        upiId: upiId.trim(),
        qrCodeUrl:
          qrCodeUrl.trim() ||
          `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=upi://pay?pa=${encodeURIComponent(
            upiId.trim()
          )}%26pn=${encodeURIComponent(pgName.trim())}%26cu=INR`,
      };

      // Call public list endpoint
      const res = await api.post('/pgs/public-list', payload);

      if (res.data.success) {
        const { token: newToken, user: newUser } = res.data.data;
        if (newToken) {
          localStorage.setItem('pgmate_token', newToken);
          await refreshUser();
        }
        setSuccess(true);
      } else {
        setErrorMsg(res.data.message || 'Failed to list PG. Please check details and retry.');
      }
    } catch (err: any) {
      console.error('List PG failed:', err);
      setErrorMsg(
        err.response?.data?.message || err.message || 'An error occurred while creating your PG listing.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalBedsCount = rooms.reduce((acc, r) => acc + (Number(r.numberOfBeds) || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Page Banner Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold mb-3 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-brand-600" />
            Join PGMate Partner Network
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            List Your PG Accommodation
          </h1>
          <p className="mt-2 text-sm text-slate-600 max-w-xl mx-auto">
            Anyone can register as a verified owner. Setup rooms, configure beds, attach legal municipal
            permissions, and upload your UPI QR code to receive rent directly.
          </p>
        </div>

        {/* Stepper Wizard Bar */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-8">
          <div className="grid grid-cols-5 gap-2 text-center text-xs font-semibold">
            {[
              { num: 1, label: 'Owner Profile', icon: UserIcon },
              { num: 2, label: 'PG & Photos', icon: Building2 },
              { num: 3, label: 'Legal & NOC', icon: FileCheck },
              { num: 4, label: 'Rooms & Beds', icon: BedDouble },
              { num: 5, label: 'UPI QR Code', icon: QrCode },
            ].map((s) => {
              const IconComp = s.icon;
              const isCompleted = step > s.num;
              const isCurrent = step === s.num;
              return (
                <div
                  key={s.num}
                  className={`flex flex-col items-center gap-1.5 p-2 rounded-xl transition ${
                    isCurrent
                      ? 'bg-brand-50 text-brand-700 font-bold border border-brand-200'
                      : isCompleted
                      ? 'text-emerald-600'
                      : 'text-slate-400'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition ${
                      isCurrent
                        ? 'bg-brand-600 text-white shadow-sm'
                        : isCompleted
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {isCompleted ? <Check className="w-4 h-4" /> : <IconComp className="w-4 h-4" />}
                  </div>
                  <span className="hidden sm:inline text-[11px] truncate max-w-full">
                    {s.num}. {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span className="font-medium">{errorMsg}</span>
          </div>
        )}

        {/* SUCCESS CONFIRMATION MODAL / SCREEN */}
        {success ? (
          <div className="bg-white p-8 sm:p-12 rounded-3xl shadow-xl border border-slate-200 text-center space-y-6 animate-in zoom-in-95 duration-200">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-50">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                🎉 Your PG Has Been Listed Successfully!
              </h2>
              <p className="text-sm text-slate-600 mt-2 max-w-lg mx-auto">
                <strong className="text-slate-900">{pgName}</strong> with {rooms.length} rooms and{' '}
                {totalBedsCount} beds is now live on PGMate. Students can now discover your rooms, book beds,
                and scan your uploaded UPI QR code to pay monthly rent.
              </p>
            </div>

            <div className="max-w-md mx-auto bg-slate-50 p-4 rounded-2xl border border-slate-200 text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Owner Account:</span>
                <span className="font-semibold text-slate-800">{ownerName} ({ownerEmail})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Legal Permit:</span>
                <span className="font-semibold text-slate-800">{licenseNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">UPI Payment ID:</span>
                <span className="font-mono font-bold text-brand-700">{upiId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Initial Capacity:</span>
                <span className="font-bold text-slate-800">{rooms.length} Rooms • {totalBedsCount} Beds</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <Link
                href="/owner/dashboard"
                className="w-full sm:w-auto px-6 py-3.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-brand-500/20 transition flex items-center justify-center gap-2"
              >
                Go to Owner Dashboard <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/pgs"
                className="w-full sm:w-auto px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition"
              >
                View Public Listing
              </Link>
            </div>
          </div>
        ) : (
          /* MULTI-STEP WIZARD FORM */
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
            {/* STEP 1: OWNER REGISTRATION */}
            {step === 1 && (
              <div className="p-6 sm:p-8 space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Step 1: Owner Profile & Credentials</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Enter your owner account details to manage property rooms, beds, rent collections, and complaints.
                  </p>
                </div>

                {user ? (
                  <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-indigo-900">
                        Signed in as {user.name} ({user.role})
                      </span>
                      <p className="text-xs text-indigo-700 mt-0.5">{user.email} • {user.mobile}</p>
                    </div>
                    <span className="text-xs bg-indigo-200 text-indigo-800 font-bold px-2.5 py-1 rounded-lg">
                      Active Account
                    </span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Full Name <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <UserIcon className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                        <input
                          type="text"
                          required
                          value={ownerName}
                          onChange={(e) => setOwnerName(e.target.value)}
                          placeholder="e.g. Ramesh Chandra Sharma"
                          className="w-full text-xs pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Email Address <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                        <input
                          type="email"
                          required
                          value={ownerEmail}
                          onChange={(e) => setOwnerEmail(e.target.value)}
                          placeholder="e.g. owner@sunrise.com"
                          className="w-full text-xs pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Mobile Number <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                        <input
                          type="tel"
                          required
                          value={ownerMobile}
                          onChange={(e) => {
                            setOwnerMobile(e.target.value);
                            if (!contactMobile) setContactMobile(e.target.value);
                          }}
                          placeholder="e.g. +91 9876543210"
                          className="w-full text-xs pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Choose Password <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <KeyRound className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                        <input
                          type="password"
                          required
                          value={ownerPassword}
                          onChange={(e) => setOwnerPassword(e.target.value)}
                          placeholder="Min 6 characters"
                          className="w-full text-xs pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 2: PG BASIC INFO & PHOTOS */}
            {step === 2 && (
              <div className="p-6 sm:p-8 space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Step 2: PG Property Details & Photographs</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Provide name, location, contact, amenities, and room photographs for prospective students.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      PG Property Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={pgName}
                      onChange={(e) => setPgName(e.target.value)}
                      placeholder="e.g. Greenview Executive PG for Men"
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      City <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                    >
                      <option value="Bangalore">Bangalore</option>
                      <option value="Pune">Pune</option>
                      <option value="Hyderabad">Hyderabad</option>
                      <option value="Delhi NCR">Delhi NCR</option>
                      <option value="Mumbai">Mumbai</option>
                      <option value="Chennai">Chennai</option>
                      <option value="Kolkata">Kolkata</option>
                      <option value="Ahmedabad">Ahmedabad</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Complete Address / Landmark <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="e.g. #42, 5th Cross, Near Christ University, Koramangala 4th Block"
                        className="w-full text-xs pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      PG Frontdesk / Helpdesk Mobile Number <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                      <input
                        type="tel"
                        value={contactMobile}
                        onChange={(e) => setContactMobile(e.target.value)}
                        placeholder="e.g. +91 9876543210 (For student inquiries)"
                        className="w-full text-xs pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Short Description
                    </label>
                    <textarea
                      rows={2}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Highlight nearest metro, food quality, power backup, or nearby tech parks/colleges..."
                      className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </div>

                {/* Photographs Section */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-brand-600" />
                      Property & Room Photographs ({selectedPhotos.length} selected)
                    </label>
                    <span className="text-[11px] text-slate-500">Pick from samples or add URL</span>
                  </div>

                  {/* Photo Thumbnails */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {SAMPLE_PG_PHOTOS.map((url, idx) => {
                      const isPicked = selectedPhotos.includes(url);
                      return (
                        <div
                          key={idx}
                          onClick={() => {
                            if (isPicked) {
                              if (selectedPhotos.length > 1) {
                                setSelectedPhotos(selectedPhotos.filter((p) => p !== url));
                              }
                            } else {
                              setSelectedPhotos([...selectedPhotos, url]);
                            }
                          }}
                          className={`relative h-28 rounded-xl overflow-hidden border-2 cursor-pointer transition group ${
                            isPicked
                              ? 'border-brand-600 ring-2 ring-brand-500/20 shadow-sm'
                              : 'border-slate-200 opacity-60 hover:opacity-100'
                          }`}
                        >
                          <img src={url} alt={`Sample ${idx + 1}`} className="w-full h-full object-cover" />
                          <div
                            className={`absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                              isPicked ? 'bg-brand-600 text-white' : 'bg-black/40 text-white'
                            }`}
                          >
                            {isPicked ? <Check className="w-3.5 h-3.5" /> : '+'}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Add Custom Photo URL */}
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={customPhotoUrl}
                      onChange={(e) => setCustomPhotoUrl(e.target.value)}
                      placeholder="Paste image URL (e.g. https://...)"
                      className="flex-1 text-xs px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddPhoto}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition"
                    >
                      Add Image
                    </button>
                  </div>
                </div>

                {/* Facilities Chips */}
                <div className="space-y-2 pt-2">
                  <label className="text-xs font-bold text-slate-800">Amenities & Facilities Included</label>
                  <div className="flex flex-wrap gap-2">
                    {AVAILABLE_FACILITIES.map((facility) => {
                      const active = selectedFacilities.includes(facility);
                      return (
                        <button
                          type="button"
                          key={facility}
                          onClick={() => toggleFacility(facility)}
                          className={`text-xs px-3 py-1.5 rounded-xl border font-medium transition ${
                            active
                              ? 'bg-brand-50 border-brand-300 text-brand-700 shadow-xs'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {active && '✓ '}
                          {facility}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Rules Chips */}
                <div className="space-y-2 pt-2">
                  <label className="text-xs font-bold text-slate-800">PG House Rules</label>
                  <div className="flex flex-wrap gap-2">
                    {AVAILABLE_RULES.map((rule) => {
                      const active = selectedRules.includes(rule);
                      return (
                        <button
                          type="button"
                          key={rule}
                          onClick={() => toggleRule(rule)}
                          className={`text-xs px-3 py-1.5 rounded-xl border font-medium transition ${
                            active
                              ? 'bg-amber-50 border-amber-300 text-amber-800 shadow-xs'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {active && '✓ '}
                          {rule}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: LEGAL PERMISSIONS & COMPLIANCE */}
            {step === 3 && (
              <div className="p-6 sm:p-8 space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Step 3: Legal Permissions & Compliance</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Every PG on PGMate is legally verified against local municipal authority and police jurisdiction standards.
                  </p>
                </div>

                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Type of Regulatory Approval / Permission Held <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={legalPermission}
                      onChange={(e) => setLegalPermission(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                    >
                      <option value="Municipal Corporation Housing & Trade License">
                        Municipal Corporation Commercial / Housing Trade License
                      </option>
                      <option value="Local Police Station Tenant Verification NOC">
                        Local Police Station Tenant Verification NOC & Clearance
                      </option>
                      <option value="State Fire Safety & Rescue Clearance Certificate">
                        State Fire Safety & Emergency Rescue Clearance Certificate
                      </option>
                      <option value="FSSAI Food Safety & Hygiene License (for Mess/Canteen)">
                        FSSAI Food Safety & Kitchen Hygiene License
                      </option>
                      <option value="Registered Society / Resident Welfare Association NOC">
                        Registered Housing Society / RWA Permission Certificate
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Permit / Registration / License Number <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <FileCheck className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={licenseNumber}
                        onChange={(e) => setLicenseNumber(e.target.value)}
                        placeholder="e.g. BBMP/COMM/PG/2024/9918 or POLICE-NOC-BLR-4821"
                        className="w-full text-xs font-mono font-medium pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      This registration number is displayed with a "Verified Legal Permit" badge on your public page.
                    </p>
                  </div>

                  <div className="flex items-start gap-3 pt-2">
                    <input
                      type="checkbox"
                      id="legalCert"
                      checked={legalCertified}
                      onChange={(e) => setLegalCertified(e.target.checked)}
                      className="w-4 h-4 mt-0.5 rounded text-brand-600 focus:ring-brand-500 border-slate-300"
                    />
                    <label htmlFor="legalCert" className="text-xs text-slate-700 leading-relaxed cursor-pointer">
                      <strong>Owner Declaration:</strong> I hereby declare that this establishment operates in
                      accordance with local municipal corporation bylaws, fire safety guidelines, and tenant
                      police verification laws.
                    </label>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span className="text-xs text-emerald-800">
                    Verified properties receive <strong>3.8x more student inquiries</strong> and instant trust
                    from outstation parents.
                  </span>
                </div>
              </div>
            )}

            {/* STEP 4: ROOMS & BEDS SETUP */}
            {step === 4 && (
              <div className="p-6 sm:p-8 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Step 4: Configure Rooms & Beds</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Add rooms with room numbers, sharing types, rent amount, and number of beds.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddRoom}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-brand-50 text-brand-700 hover:bg-brand-100 rounded-xl text-xs font-bold transition border border-brand-200 shrink-0"
                  >
                    <Plus className="w-4 h-4" /> Add Room
                  </button>
                </div>

                {/* Rooms List Cards */}
                <div className="space-y-3">
                  {rooms.map((room, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition space-y-3"
                    >
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-brand-100 text-brand-700 font-bold text-xs flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <span className="text-xs font-bold text-slate-800">
                            Room {room.roomNumber || '—'}
                          </span>
                        </div>
                        {rooms.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveRoom(idx)}
                            className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-white transition"
                            title="Remove room"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Room Number
                          </label>
                          <input
                            type="text"
                            value={room.roomNumber}
                            onChange={(e) => handleUpdateRoom(idx, 'roomNumber', e.target.value)}
                            placeholder="e.g. 101"
                            className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 bg-white font-semibold"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Room Sharing Type
                          </label>
                          <select
                            value={room.roomType}
                            onChange={(e) => handleUpdateRoom(idx, 'roomType', e.target.value)}
                            className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 bg-white"
                          >
                            <option value="Single Room">Single Room</option>
                            <option value="Double Sharing">Double Sharing</option>
                            <option value="Triple Sharing">Triple Sharing</option>
                            <option value="Four Sharing">Four Sharing</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Rent per Bed (₹ / mo)
                          </label>
                          <input
                            type="number"
                            step="500"
                            value={room.rent}
                            onChange={(e) => handleUpdateRoom(idx, 'rent', Number(e.target.value))}
                            className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 bg-white font-bold"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Number of Beds
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="8"
                            value={room.numberOfBeds}
                            onChange={(e) =>
                              handleUpdateRoom(idx, 'numberOfBeds', Math.max(1, Number(e.target.value)))
                            }
                            className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 bg-white font-bold text-brand-700"
                          />
                        </div>
                      </div>

                      {/* Bed Tag Preview */}
                      <div className="flex items-center gap-1.5 pt-1">
                        <span className="text-[10px] uppercase font-bold text-slate-400 mr-1">Beds:</span>
                        {Array.from({ length: Number(room.numberOfBeds) || 0 }).map((_, bIdx) => (
                          <span
                            key={bIdx}
                            className="text-[10px] font-bold bg-white border border-slate-200 text-slate-700 px-2 py-0.5 rounded-md"
                          >
                            B{bIdx + 1}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Total Beds summary card */}
                <div className="p-3 bg-brand-50/70 border border-brand-200/80 rounded-2xl flex items-center justify-between text-xs text-brand-900">
                  <span className="font-semibold">
                    Total Property Capacity: {rooms.length} Rooms • {totalBedsCount} Beds Available
                  </span>
                  <button
                    type="button"
                    onClick={handleAddRoom}
                    className="text-xs font-bold text-brand-700 hover:underline"
                  >
                    + Add More Rooms
                  </button>
                </div>
              </div>
            )}

            {/* STEP 5: UPI QR CODE & DIRECT BANKING */}
            {step === 5 && (
              <div className="p-6 sm:p-8 space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Step 5: UPI Payment QR Code Setup</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Enter your UPI ID to automatically generate and display your scannable QR code to tenants for direct rent deposits.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Your UPI ID / VPA <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        placeholder="e.g. greenviewpg@okhdfcbank or 9876543210@upi"
                        className="w-full text-xs font-mono font-medium px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                      <p className="text-[11px] text-slate-500 mt-1">
                        Supported: Google Pay, PhonePe, Paytm, BHIM, Amazon Pay.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-slate-700">QR Code Source</label>
                        <button
                          type="button"
                          onClick={() => setAutoGenQr(!autoGenQr)}
                          className="text-[11px] text-brand-600 hover:underline font-semibold"
                        >
                          {autoGenQr ? 'Switch to custom Image URL' : 'Switch to Auto-generate'}
                        </button>
                      </div>

                      {!autoGenQr && (
                        <input
                          type="url"
                          value={qrCodeUrl}
                          onChange={(e) => setQrCodeUrl(e.target.value)}
                          placeholder="Paste direct image URL of your printed shop/standee QR code"
                          className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                        />
                      )}
                    </div>

                    <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-[11px] text-amber-800 space-y-1">
                      <span className="font-bold flex items-center gap-1.5 text-amber-900">
                        <ShieldCheck className="w-4 h-4 text-amber-600" />
                        How Rent Collection Works:
                      </span>
                      <p>
                        1. When students open "Pay Rent", they see your official QR code and UPI ID.
                      </p>
                      <p>
                        2. The student scans and pays directly to your bank account with zero gateway fee.
                      </p>
                      <p>
                        3. The student submits the 12-digit UTR reference, which updates in your activity feed!
                      </p>
                    </div>
                  </div>

                  {/* QR Code Live Preview Card */}
                  <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 text-center space-y-3">
                    <span className="text-xs font-bold text-slate-700 block">
                      Tenant Scan & Pay Preview
                    </span>

                    <div className="inline-block bg-white p-4 rounded-2xl shadow-md border border-slate-200">
                      {qrCodeUrl ? (
                        <img
                          src={qrCodeUrl}
                          alt="Live Generated UPI QR Code"
                          className="w-48 h-48 object-contain rounded-lg mx-auto"
                        />
                      ) : (
                        <div className="w-48 h-48 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-lg text-slate-400">
                          <QrCode className="w-10 h-10 mb-2 opacity-50" />
                          <span className="text-xs font-medium">Type UPI ID to preview QR</span>
                        </div>
                      )}
                      <div className="mt-2 text-xs font-mono font-bold text-slate-800 truncate max-w-[200px] mx-auto">
                        {upiId || 'your-vpa@upi'}
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-500 font-medium">
                      Direct Credit to {pgName || 'Your PG'} Account
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Footer */}
            <div className="p-6 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-white transition flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
              ) : (
                <div />
              )}

              {step < 5 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition flex items-center gap-2 shadow-sm shadow-brand-500/20"
                >
                  Continue to Next Step <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmitAll}
                  disabled={isSubmitting}
                  className="px-7 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-emerald-600/20"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Publishing PG & Creating Rooms...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Publish PG & Go to Dashboard
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
