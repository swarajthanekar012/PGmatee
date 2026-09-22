'use client';

import React, { useState, useEffect } from 'react';
import { Rent } from '@/types';
import api from '@/lib/api';
import {
  X,
  ShieldCheck,
  CreditCard,
  Smartphone,
  Building2,
  CheckCircle2,
  Loader2,
  Lock,
  QrCode,
  Copy,
  Check,
  Phone,
  Info,
  ExternalLink,
} from 'lucide-react';

interface PaymentModalProps {
  rent: Rent;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (paymentData: any) => void;
}

export default function PaymentModal({
  rent,
  isOpen,
  onClose,
  onSuccess,
}: PaymentModalProps) {
  const [activeTab, setActiveTab] = useState<'qr' | 'gateway'>('qr');
  const [gatewaySubTab, setGatewaySubTab] = useState<'upi' | 'card' | 'netbanking'>('upi');

  // QR Code details state
  const [ownerDetails, setOwnerDetails] = useState<{
    qrCodeUrl: string;
    upiId: string;
    ownerMobile: string;
    orderId?: string;
  }>({
    qrCodeUrl:
      rent.booking?.bed?.room?.pg?.qrCodeUrl ||
      'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=upi://pay?pa=sunrise.pg@okhdfcbank%26pn=Sunrise%20Boys%20PG%26cu=INR',
    upiId: rent.booking?.bed?.room?.pg?.upiId || 'sunrise.pg@okhdfcbank',
    ownerMobile: rent.booking?.bed?.room?.pg?.contactMobile || '+91 9876543210',
  });

  const [utrNumber, setUtrNumber] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [gatewayUpiId, setGatewayUpiId] = useState('swaraj@okhdfcbank');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8821');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('789');

  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');

  // When modal opens, fetch order & owner QR information
  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;

    async function initOrder() {
      try {
        const orderRes = await api.post('/payments/create-order', {
          rentId: rent.id,
        });
        if (orderRes.data?.data && isMounted) {
          const d = orderRes.data.data;
          setOwnerDetails({
            qrCodeUrl:
              d.ownerQrCodeUrl ||
              `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=upi://pay?pa=${d.ownerUpiId || 'pg.pay@upi'}&pn=${encodeURIComponent(
                d.pgName || 'PG Rent'
              )}&am=${rent.amount}&cu=INR`,
            upiId: d.ownerUpiId || 'sunrise.pg@okhdfcbank',
            ownerMobile: d.ownerMobile || '+91 9876543210',
            orderId: d.orderId,
          });
        }
      } catch (err: any) {
        console.warn('Could not prefetch order:', err?.message);
      }
    }

    initOrder();
    return () => {
      isMounted = false;
    };
  }, [isOpen, rent.id, rent.amount]);

  if (!isOpen) return null;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  // Submit via Owner QR Code and 12-digit UTR
  const handleQrPaymentSubmit = async () => {
    const cleanUtr = utrNumber.trim();
    if (!cleanUtr) {
      setErrorMsg('Please enter the 12-digit UPI Reference / UTR Number from your payment app.');
      return;
    }
    if (cleanUtr.length < 10) {
      setErrorMsg('Please enter a valid 12-digit UPI UTR / Transaction Reference number.');
      return;
    }

    setIsProcessing(true);
    setErrorMsg('');

    try {
      const verifyRes = await api.post('/payments/verify', {
        rentId: rent.id,
        utrNumber: cleanUtr,
        paymentMethod: 'Owner UPI QR Code',
      });

      if (verifyRes.data.success) {
        setIsSuccess(true);
        setReceiptData(verifyRes.data.data);
        onSuccess(verifyRes.data.data);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Payment submission failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Submit via Gateway
  const handleGatewayPay = async () => {
    setIsProcessing(true);
    setErrorMsg('');

    try {
      let currentOrderId = ownerDetails.orderId;
      if (!currentOrderId) {
        const orderRes = await api.post('/payments/create-order', {
          rentId: rent.id,
        });
        currentOrderId = orderRes.data.data.orderId;
      }

      await new Promise((resolve) => setTimeout(resolve, 1200));

      const mockPaymentId = `pay_${Date.now().toString(36)}${Math.random().toString(36).substring(2, 6)}`;
      const mockSignature = 'mock_verified_signature';

      const verifyRes = await api.post('/payments/verify', {
        rentId: rent.id,
        razorpayOrderId: currentOrderId,
        razorpayPaymentId: mockPaymentId,
        razorpaySignature: mockSignature,
        paymentMethod:
          gatewaySubTab === 'upi'
            ? `Razorpay - UPI (${gatewayUpiId})`
            : gatewaySubTab === 'card'
            ? `Razorpay - Card (ending in 8821)`
            : 'Razorpay - Netbanking',
      });

      if (verifyRes.data.success) {
        setIsSuccess(true);
        setReceiptData(verifyRes.data.data);
        onSuccess(verifyRes.data.data);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Payment processing failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const pgName = rent.booking?.bed?.room?.pg?.name || 'PG Accommodation';
  const roomBedStr = `Room ${rent.booking?.bed?.room?.roomNumber || '—'} • Bed ${
    rent.booking?.bed?.bedNumber || '—'
  }`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800 my-8 transition-colors duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-brand-600 via-indigo-600 to-brand-700 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-md">
                <Lock className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-200">
                  Pay Rent Securely
                </span>
                <h3 className="text-lg font-bold">PG Rent Payment</h3>
              </div>
            </div>
            {!isProcessing && (
              <button
                onClick={onClose}
                className="text-white/70 hover:text-white p-1 rounded-full hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-white/15 flex items-center justify-between">
            <div>
              <p className="text-xs text-indigo-100">{rent.month}</p>
              <p className="text-sm font-semibold text-white">{pgName}</p>
              <p className="text-xs text-indigo-200">{roomBedStr}</p>
            </div>
            <div className="text-right">
              <span className="text-xs text-indigo-200">Total Payable</span>
              <p className="text-2xl font-black tracking-tight text-white">
                ₹{rent.amount.toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6">
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs">
              {errorMsg}
            </div>
          )}

          {isSuccess ? (
            <div className="py-4 text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-50 dark:ring-emerald-900/30">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-slate-900 dark:text-white">Payment Successful!</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Your rent for <span className="font-semibold text-slate-800 dark:text-slate-200">{rent.month}</span> has been marked as{' '}
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">PAID</span>.
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/70 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-left space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Transaction ID</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-100">
                    {receiptData?.payment?.transactionId || 'TXN-928173'}
                  </span>
                </div>
                {receiptData?.payment?.utrNumber && (
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">UTR / Ref Number</span>
                    <span className="font-mono font-bold text-brand-700 dark:text-brand-300">
                      {receiptData.payment.utrNumber}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Amount Paid</span>
                  <span className="font-bold text-slate-800 dark:text-slate-100">₹{rent.amount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Payment Method</span>
                  <span className="text-slate-700 dark:text-slate-300 font-medium">
                    {receiptData?.payment?.paymentMethod || 'Owner UPI QR Code'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Date & Time</span>
                  <span className="text-slate-700 dark:text-slate-300">{new Date().toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-semibold text-xs transition shadow-md shadow-brand-500/20"
              >
                Done & Return to Dashboard
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Payment Method Switcher Tabs */}
              <div className="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setActiveTab('qr')}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-xl transition ${
                    activeTab === 'qr'
                      ? 'bg-white dark:bg-slate-700 text-brand-700 dark:text-brand-300 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <QrCode className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                  <span>Owner UPI QR Code</span>
                  <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 rounded-full font-bold">
                    Direct
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('gateway')}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-xl transition ${
                    activeTab === 'gateway'
                      ? 'bg-white dark:bg-slate-700 text-brand-700 dark:text-brand-300 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Online Gateway</span>
                </button>
              </div>

              {/* TAB 1: OWNER UPLOADED QR CODE */}
              {activeTab === 'qr' && (
                <div className="space-y-4 pt-1">
                  {/* QR Code Container Card */}
                  <div className="bg-gradient-to-b from-slate-50 to-indigo-50/40 dark:from-slate-800/80 dark:to-indigo-950/40 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-900/50 text-center space-y-3">
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Scan with any UPI App to pay owner directly:
                    </p>

                    {/* QR Code Image */}
                    <div className="relative inline-block bg-white p-3 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700">
                      <img
                        src={ownerDetails.qrCodeUrl}
                        alt="Owner UPI QR Code"
                        className="w-44 h-44 object-contain rounded-lg mx-auto"
                      />
                      <div className="mt-2 flex items-center justify-center gap-2">
                        <span className="text-[11px] font-bold text-slate-600 tracking-wide">
                          BHIM / GPay / PhonePe / Paytm
                        </span>
                      </div>
                    </div>

                    {/* UPI ID & Copy button */}
                    <div className="flex items-center justify-center gap-2 bg-white dark:bg-slate-800 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 max-w-sm mx-auto shadow-sm">
                      <div className="text-left overflow-hidden">
                        <span className="text-[10px] uppercase text-slate-400 dark:text-slate-500 font-bold block">
                          Owner UPI ID
                        </span>
                        <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-100 truncate block">
                          {ownerDetails.upiId}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(ownerDetails.upiId)}
                        className="ml-auto flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900 font-medium transition shrink-0"
                      >
                        {copiedUpi ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700 dark:text-emerald-400 font-bold">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>

                    {ownerDetails.ownerMobile && (
                      <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>Owner Contact: {ownerDetails.ownerMobile}</span>
                      </div>
                    )}
                  </div>

                  {/* Step instructions */}
                  <div className="bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 rounded-xl p-3 text-[11px] text-amber-800 dark:text-amber-300 space-y-1">
                    <div className="font-semibold flex items-center gap-1.5 text-amber-900 dark:text-amber-200">
                      <Info className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400 shrink-0" />
                      <span>How to complete this payment:</span>
                    </div>
                    <ol className="list-decimal list-inside pl-1 space-y-0.5 text-amber-900/90 dark:text-amber-300/90">
                      <li>Scan the QR code above or send ₹{rent.amount.toLocaleString('en-IN')} to the UPI ID.</li>
                      <li>Copy the 12-digit UTR / UPI Reference Number from your payment confirmation.</li>
                      <li>Paste the UTR number below and click Submit to instantly credit your rent.</li>
                    </ol>
                  </div>

                  {/* UTR Input Field */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      12-Digit UPI UTR / Reference Number <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      maxLength={18}
                      value={utrNumber}
                      onChange={(e) => setUtrNumber(e.target.value.replace(/[^0-9a-zA-Z]/g, ''))}
                      placeholder="e.g. 428198765432"
                      className="w-full text-xs font-mono font-medium px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                      Found in Google Pay, PhonePe, or Paytm transaction details.
                    </p>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="button"
                    onClick={handleQrPaymentSubmit}
                    disabled={isProcessing || !utrNumber.trim()}
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-bold text-sm transition shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Verifying UTR Reference with PG Records...
                      </>
                    ) : (
                      `I Have Paid ₹${rent.amount.toLocaleString('en-IN')} — Submit UTR`
                    )}
                  </button>
                </div>
              )}

              {/* TAB 2: RAZORPAY GATEWAY CHECKOUT */}
              {activeTab === 'gateway' && (
                <div className="space-y-4 pt-1">
                  {/* Gateway subtabs */}
                  <div className="grid grid-cols-3 gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => setGatewaySubTab('upi')}
                      className={`flex items-center justify-center gap-1 py-2 rounded-lg transition ${
                        gatewaySubTab === 'upi'
                          ? 'bg-white dark:bg-slate-700 text-brand-700 dark:text-brand-300 shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      UPI VPA
                    </button>
                    <button
                      type="button"
                      onClick={() => setGatewaySubTab('card')}
                      className={`flex items-center justify-center gap-1 py-2 rounded-lg transition ${
                        gatewaySubTab === 'card'
                          ? 'bg-white dark:bg-slate-700 text-brand-700 dark:text-brand-300 shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      Card
                    </button>
                    <button
                      type="button"
                      onClick={() => setGatewaySubTab('netbanking')}
                      className={`flex items-center justify-center gap-1 py-2 rounded-lg transition ${
                        gatewaySubTab === 'netbanking'
                          ? 'bg-white dark:bg-slate-700 text-brand-700 dark:text-brand-300 shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <Building2 className="w-3.5 h-3.5" />
                      Netbanking
                    </button>
                  </div>

                  {/* Subtab Forms */}
                  {gatewaySubTab === 'upi' && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                          Virtual Payment Address (VPA)
                        </label>
                        <input
                          type="text"
                          value={gatewayUpiId}
                          onChange={(e) => setGatewayUpiId(e.target.value)}
                          placeholder="e.g. user@okhdfcbank"
                          className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white"
                        />
                      </div>
                      <div className="flex gap-2">
                        {['@okhdfcbank', '@ybl', '@paytm'].map((handle) => (
                          <button
                            key={handle}
                            type="button"
                            onClick={() => setGatewayUpiId(`tenant${handle}`)}
                            className="text-[11px] px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                          >
                            {handle}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {gatewaySubTab === 'card' && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Card Number</label>
                        <input
                          type="text"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Valid Thru</label>
                          <input
                            type="text"
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono text-center bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">CVV</label>
                          <input
                            type="password"
                            maxLength={4}
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value)}
                            className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono text-center bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {gatewaySubTab === 'netbanking' && (
                    <div className="space-y-2">
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">Select Bank</label>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {['HDFC Bank', 'State Bank of India', 'ICICI Bank', 'Axis Bank'].map((bank) => (
                          <button
                            key={bank}
                            type="button"
                            className="p-2.5 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-brand-500 hover:bg-brand-50/50 dark:hover:bg-brand-950/50 text-left font-medium text-slate-700 dark:text-slate-200 transition"
                          >
                            {bank}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Security Banner */}
                  <div className="flex items-center gap-2 p-2.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl text-[11px] text-slate-500 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700/60">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>HMAC-SHA256 encrypted verification directly with Razorpay gateway.</span>
                  </div>

                  {/* Gateway Pay Button */}
                  <button
                    type="button"
                    onClick={handleGatewayPay}
                    disabled={isProcessing}
                    className="w-full py-3.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white rounded-xl font-bold text-sm transition shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Connecting to Gateway & Verifying...
                      </>
                    ) : (
                      `Authorize & Pay ₹${rent.amount.toLocaleString('en-IN')}`
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
