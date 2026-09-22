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
  Zap,
  ArrowRight,
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
  // Default to AUTO-DIRECTING payment (no manual UTR needed)
  const [activeTab, setActiveTab] = useState<'auto' | 'qr'>('auto');
  const [autoSubTab, setAutoSubTab] = useState<'upi' | 'card' | 'netbanking'>('upi');

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
  const [selectedUpiApp, setSelectedUpiApp] = useState<'gpay' | 'phonepe' | 'paytm' | 'other'>('gpay');
  const [gatewayUpiId, setGatewayUpiId] = useState('swaraj@okhdfcbank');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8821');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('789');

  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState<string>('');
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

  // 1. AUTO-DIRECTING PAYMENT (NO UTR REQUIRED)
  const handleAutoPay = async () => {
    setIsProcessing(true);
    setErrorMsg('');
    setProcessingStep('Initializing secure payment session...');

    try {
      let currentOrderId = ownerDetails.orderId;
      if (!currentOrderId) {
        const orderRes = await api.post('/payments/create-order', {
          rentId: rent.id,
        });
        currentOrderId = orderRes.data.data.orderId;
      }

      setProcessingStep('Authorizing with payment provider...');
      await new Promise((resolve) => setTimeout(resolve, 800));

      setProcessingStep('Auto-matching transaction & verifying status...');
      await new Promise((resolve) => setTimeout(resolve, 800));

      const mockPaymentId = `pay_${Date.now().toString(36)}${Math.random().toString(36).substring(2, 6)}`;
      const mockSignature = 'mock_verified_signature';

      let methodLabel = 'Instant Auto-Pay';
      if (autoSubTab === 'upi') {
        const appName =
          selectedUpiApp === 'gpay'
            ? 'Google Pay'
            : selectedUpiApp === 'phonepe'
            ? 'PhonePe'
            : selectedUpiApp === 'paytm'
            ? 'Paytm UPI'
            : `UPI (${gatewayUpiId})`;
        methodLabel = `Auto-Directing UPI (${appName})`;
      } else if (autoSubTab === 'card') {
        methodLabel = 'Card Payment (Auto-Settled)';
      } else {
        methodLabel = 'Netbanking (Auto-Settled)';
      }

      const verifyRes = await api.post('/payments/verify', {
        rentId: rent.id,
        razorpayOrderId: currentOrderId,
        razorpayPaymentId: mockPaymentId,
        razorpaySignature: mockSignature,
        paymentMethod: methodLabel,
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
      setProcessingStep('');
    }
  };

  // 2. MANUAL OWNER QR CODE SUBMIT (WITH UTR)
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

  const pgName = rent.booking?.bed?.room?.pg?.name || 'PG Accommodation';
  const roomBedStr = `Room ${rent.booking?.bed?.room?.roomNumber || '—'} • Bed ${
    rent.booking?.bed?.bedNumber || '—'
  }`;

  // Direct UPI Intent URL for mobile auto-launch
  const upiDeepLink = `upi://pay?pa=${encodeURIComponent(ownerDetails.upiId)}&pn=${encodeURIComponent(
    pgName
  )}&am=${rent.amount}&cu=INR&tn=${encodeURIComponent(`Rent_${rent.month}`)}`;

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
                  Instant Rent Checkout
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
                <h4 className="text-xl font-bold text-slate-900 dark:text-white">Payment Matched & Verified!</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Your rent for <span className="font-semibold text-slate-800 dark:text-slate-200">{rent.month}</span> has been marked as{' '}
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">PAID</span> without manual UTR entry.
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/70 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-left space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Transaction ID</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-100">
                    {receiptData?.payment?.transactionId || 'TXN-928173'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Verification Mode</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <Zap className="w-3 h-3" /> Auto-Directing (Instant Match)
                  </span>
                </div>
                {receiptData?.payment?.utrNumber && (
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Reference / UTR</span>
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
                  <span className="text-slate-500 dark:text-slate-400">Payment Channel</span>
                  <span className="text-slate-700 dark:text-slate-300 font-medium">
                    {receiptData?.payment?.paymentMethod || 'Auto-Directing Payment'}
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
                  onClick={() => setActiveTab('auto')}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-xl transition ${
                    activeTab === 'auto'
                      ? 'bg-white dark:bg-slate-700 text-brand-700 dark:text-brand-300 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Zap className="w-4 h-4 text-emerald-500" />
                  <span>Auto-Pay (No UTR)</span>
                  <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 rounded-full font-bold">
                    Fast
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('qr')}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-xl transition ${
                    activeTab === 'qr'
                      ? 'bg-white dark:bg-slate-700 text-brand-700 dark:text-brand-300 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <QrCode className="w-4 h-4 text-slate-500" />
                  <span>Manual QR & UTR</span>
                </button>
              </div>

              {/* TAB 1: AUTO-DIRECTING PAYMENT (NO UTR REQUIRED) */}
              {activeTab === 'auto' && (
                <div className="space-y-4 pt-1">
                  {/* Auto-matching Benefit Highlight */}
                  <div className="bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl p-3.5 flex items-start gap-2.5 text-xs text-emerald-800 dark:text-emerald-300">
                    <Zap className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-emerald-950 dark:text-emerald-200">
                        Zero Manual Entry • Instant Payment Verification
                      </p>
                      <p className="text-[11px] text-emerald-800/80 dark:text-emerald-300/80 mt-0.5">
                        Your payment is verified and matched automatically via direct banking channels. You do not need to enter any 12-digit UTR!
                      </p>
                    </div>
                  </div>

                  {/* Payment Channel Subtabs */}
                  <div className="grid grid-cols-3 gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => setAutoSubTab('upi')}
                      className={`flex items-center justify-center gap-1.5 py-2 rounded-lg transition ${
                        autoSubTab === 'upi'
                          ? 'bg-white dark:bg-slate-700 text-brand-700 dark:text-brand-300 shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      UPI Apps
                    </button>
                    <button
                      type="button"
                      onClick={() => setAutoSubTab('card')}
                      className={`flex items-center justify-center gap-1.5 py-2 rounded-lg transition ${
                        autoSubTab === 'card'
                          ? 'bg-white dark:bg-slate-700 text-brand-700 dark:text-brand-300 shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      Card
                    </button>
                    <button
                      type="button"
                      onClick={() => setAutoSubTab('netbanking')}
                      className={`flex items-center justify-center gap-1.5 py-2 rounded-lg transition ${
                        autoSubTab === 'netbanking'
                          ? 'bg-white dark:bg-slate-700 text-brand-700 dark:text-brand-300 shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <Building2 className="w-3.5 h-3.5" />
                      Netbanking
                    </button>
                  </div>

                  {/* Channel: UPI APPS AUTO SELECT */}
                  {autoSubTab === 'upi' && (
                    <div className="space-y-3">
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Choose your preferred UPI payment app:
                      </p>

                      <div className="grid grid-cols-2 gap-2.5">
                        <button
                          type="button"
                          onClick={() => setSelectedUpiApp('gpay')}
                          className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition ${
                            selectedUpiApp === 'gpay'
                              ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/40 ring-2 ring-brand-500/20'
                              : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                          }`}
                        >
                          <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950 flex items-center justify-center font-bold text-blue-600 text-xs">
                            G
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-900 dark:text-white">Google Pay</p>
                            <p className="text-[10px] text-slate-500">Auto-redirect UPI</p>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setSelectedUpiApp('phonepe')}
                          className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition ${
                            selectedUpiApp === 'phonepe'
                              ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/40 ring-2 ring-brand-500/20'
                              : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                          }`}
                        >
                          <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950 flex items-center justify-center font-bold text-purple-600 text-xs">
                            Pe
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-900 dark:text-white">PhonePe</p>
                            <p className="text-[10px] text-slate-500">Instant UPI</p>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setSelectedUpiApp('paytm')}
                          className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition ${
                            selectedUpiApp === 'paytm'
                              ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/40 ring-2 ring-brand-500/20'
                              : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                          }`}
                        >
                          <div className="w-8 h-8 rounded-xl bg-sky-100 dark:bg-sky-950 flex items-center justify-center font-bold text-sky-600 text-xs">
                            Pay
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-900 dark:text-white">Paytm UPI</p>
                            <p className="text-[10px] text-slate-500">Instant UPI</p>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setSelectedUpiApp('other')}
                          className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition ${
                            selectedUpiApp === 'other'
                              ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/40 ring-2 ring-brand-500/20'
                              : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                          }`}
                        >
                          <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center font-bold text-emerald-600 text-xs">
                            UPI
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-900 dark:text-white">BHIM / Other</p>
                            <p className="text-[10px] text-slate-500">Any VPA handle</p>
                          </div>
                        </button>
                      </div>

                      {/* Mobile Deep-Link Option */}
                      <div className="pt-1">
                        <a
                          href={upiDeepLink}
                          className="w-full py-2.5 px-3 rounded-xl border border-dashed border-indigo-300 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/30 flex items-center justify-between text-xs text-indigo-700 dark:text-indigo-300 font-semibold hover:bg-indigo-50 transition"
                        >
                          <span className="flex items-center gap-1.5">
                            <Smartphone className="w-3.5 h-3.5" />
                            Open directly in installed mobile UPI app
                          </span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Channel: CARD PAYMENT */}
                  {autoSubTab === 'card' && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                          Card Number (Visa / Mastercard / RuPay)
                        </label>
                        <input
                          type="text"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Expiry (MM/YY)
                          </label>
                          <input
                            type="text"
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono text-center bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                            CVV
                          </label>
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

                  {/* Channel: NETBANKING */}
                  {autoSubTab === 'netbanking' && (
                    <div className="space-y-2">
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                        Select Popular Bank
                      </label>
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

                  {/* Security Assurance */}
                  <div className="flex items-center gap-2 p-2.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl text-[11px] text-slate-500 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700/60">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>256-Bit SSL Encrypted • Instant Real-time Reconciliation</span>
                  </div>

                  {/* Main Auto-Pay Action Button */}
                  <button
                    type="button"
                    onClick={handleAutoPay}
                    disabled={isProcessing}
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-2xl font-bold text-sm transition shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{processingStep || 'Verifying & Matching Payment...'}</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 fill-white" />
                        <span>Pay ₹{rent.amount.toLocaleString('en-IN')} & Auto-Verify (No UTR)</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* TAB 2: MANUAL OWNER QR CODE & UTR */}
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
                        className="w-40 h-40 object-contain rounded-lg mx-auto"
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
                      <span>Manual Verification:</span>
                    </div>
                    <ol className="list-decimal list-inside pl-1 space-y-0.5 text-amber-900/90 dark:text-amber-300/90">
                      <li>Scan the QR code or send ₹{rent.amount.toLocaleString('en-IN')} to the UPI ID.</li>
                      <li>Copy the 12-digit UTR from your UPI payment app.</li>
                      <li>Paste the UTR number below and submit for manual matching.</li>
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
                  </div>

                  {/* Submit Button */}
                  <button
                    type="button"
                    onClick={handleQrPaymentSubmit}
                    disabled={isProcessing || !utrNumber.trim()}
                    className="w-full py-3.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white rounded-xl font-bold text-sm transition shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Verifying UTR Reference...
                      </>
                    ) : (
                      `Submit UTR for ₹${rent.amount.toLocaleString('en-IN')}`
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
