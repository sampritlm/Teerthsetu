import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, CreditCard, Lock, Smartphone, Building2, Wallet, 
  CheckCircle, AlertCircle, ArrowLeft, X, Sparkles, RefreshCw, Copy, Check
} from 'lucide-react';
import TicketQR from './TicketQR';

export default function PaymentGatewayModal({ 
  isOpen, 
  onClose, 
  amount = 0, 
  orderDetails = {}, 
  onSuccess 
}) {
  const [payMethod, setPayMethod] = useState('upi'); // upi, card, netbanking, wallet
  const [phase, setPhase] = useState('selection'); // selection, otp_challenge, processing, success
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [upiId, setUpiId] = useState('');
  
  // Card state
  const [cardForm, setCardForm] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  });

  // NetBanking state
  const [selectedBank, setSelectedBank] = useState('HDFC');

  // OTP challenge state
  const [bankOtp, setBankOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [processingText, setProcessingText] = useState('Connecting to Bank Gateway...');

  // Reset modal state when opened/closed
  useEffect(() => {
    if (isOpen) {
      setPhase('selection');
      setBankOtp('');
      setOtpError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const displayAmount = Number(amount) || 0;
  const isFree = displayAmount === 0;

  // Format Card Number
  const handleCardNumberChange = (e) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 16) val = val.slice(0, 16);
    val = val.match(/.{1,4}/g)?.join(' ') || val;
    setCardForm({ ...cardForm, number: val });
  };

  // Format Expiry MM/YY
  const handleExpiryChange = (e) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 4) val = val.slice(0, 4);
    if (val.length >= 2) val = `${val.slice(0, 2)}/${val.slice(2)}`;
    setCardForm({ ...cardForm, expiry: val });
  };

  // Detect card brand
  const getCardBrand = () => {
    const raw = cardForm.number.replace(/\s/g, '');
    if (raw.startsWith('4')) return 'Visa';
    if (/^5[1-5]/.test(raw) || /^2[2-7]/.test(raw)) return 'Mastercard';
    if (/^60|^65|^81|^82/.test(raw)) return 'RuPay';
    if (/^3[47]/.test(raw)) return 'Amex';
    return 'Card';
  };

  // Trigger payment authorization
  const handleInitiatePayment = (e) => {
    if (e) e.preventDefault();

    if (isFree) {
      // Free ticket pass -> skip payment OTP
      handleFinalizePayment('FREE_ENTRY_PASS');
      return;
    }

    // Launch 3D Secure OTP Challenge
    setPhase('processing');
    setProcessingText('Encrypting Session & Requesting Bank Authorization...');
    
    setTimeout(() => {
      setPhase('otp_challenge');
    }, 1200);
  };

  // Submit 3D-Secure Bank OTP
  const handleVerifyBankOtp = (e) => {
    if (e) e.preventDefault();
    
    if (bankOtp.length !== 6 && bankOtp !== '123456') {
      setOtpError('Please enter a valid 6-digit OTP (Try: 123456)');
      return;
    }

    setPhase('processing');
    setProcessingText('Verifying Payment Signature with Reserve Bank Clearing...');

    setTimeout(() => {
      handleFinalizePayment(`TXN-${Date.now().toString().slice(-8)}`);
    }, 1500);
  };

  const handleFinalizePayment = (txnId) => {
    const paymentResult = {
      success: true,
      transactionId: txnId,
      amount: displayAmount,
      payMethod: payMethod.toUpperCase(),
      paidAt: new Date().toISOString(),
      gateway: 'TeerthSetu Gateway (Sandbox Live)'
    };
    
    setPhase('success');
    setTimeout(() => {
      if (onSuccess) onSuccess(paymentResult);
    }, 800);
  };

  // Copy Merchant UPI ID
  const handleCopyUpi = () => {
    navigator.clipboard.writeText('teerthsetu.temple@upi');
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl relative"
        >
          {/* Header Bar */}
          <div className="bg-gradient-to-r from-saffron to-amber-600 p-5 text-white flex items-center justify-between relative">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
                <ShieldCheck className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg leading-tight">TeerthSetu Payment Gateway</h3>
                <p className="text-[11px] text-white/80 flex items-center gap-1">
                  <Lock className="h-3 w-3" /> 256-Bit SSL Encrypted Checkout
                </p>
              </div>
            </div>
            <button 
              onClick={onClose}
              type="button"
              className="p-1.5 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="h-5 w-5 text-white" />
            </button>
          </div>

          {/* Amount Order Summary Badge */}
          <div className="bg-slate-50 dark:bg-slate-950/60 p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-500 block uppercase text-[9px] font-bold tracking-wider">Service</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {orderDetails.specialDarshan || orderDetails.title || 'Darshan Pass'} ({orderDetails.visitors || 1} Guests)
              </span>
            </div>
            <div className="text-right">
              <span className="text-slate-500 block uppercase text-[9px] font-bold tracking-wider">Total Payable</span>
              <span className="font-extrabold text-base text-saffron">
                {isFree ? 'FREE (₹0)' : `₹ ${displayAmount}`}
              </span>
            </div>
          </div>

          {/* PHASE 1: METHOD SELECTION */}
          {phase === 'selection' && (
            <div className="p-6 space-y-6">
              {/* Payment Methods Nav Tabs */}
              <div className="grid grid-cols-4 gap-2 bg-slate-100 dark:bg-slate-950 p-1.5 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setPayMethod('upi')}
                  className={`py-2 px-1 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                    payMethod === 'upi'
                      ? 'bg-white dark:bg-slate-800 text-saffron shadow-md'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Smartphone className="h-4 w-4" /> UPI / QR
                </button>
                <button
                  type="button"
                  onClick={() => setPayMethod('card')}
                  className={`py-2 px-1 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                    payMethod === 'card'
                      ? 'bg-white dark:bg-slate-800 text-saffron shadow-md'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <CreditCard className="h-4 w-4" /> Cards
                </button>
                <button
                  type="button"
                  onClick={() => setPayMethod('netbanking')}
                  className={`py-2 px-1 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                    payMethod === 'netbanking'
                      ? 'bg-white dark:bg-slate-800 text-saffron shadow-md'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Building2 className="h-4 w-4" /> NetBank
                </button>
                <button
                  type="button"
                  onClick={() => setPayMethod('wallet')}
                  className={`py-2 px-1 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                    payMethod === 'wallet'
                      ? 'bg-white dark:bg-slate-800 text-saffron shadow-md'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Wallet className="h-4 w-4" /> Wallets
                </button>
              </div>

              {/* METHOD TAB 1: UPI & QR CODE */}
              {payMethod === 'upi' && (
                <div className="space-y-4 text-center">
                  <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                    <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider block">
                      Scan UPI QR Code with GPay / PhonePe / Paytm
                    </span>
                    
                    {/* Live Scannable Dynamic UPI QR Code */}
                    <TicketQR 
                      ticketData={{
                        bookingId: `UPI-${displayAmount}`,
                        templeName: 'TeerthSetu UPI Payment',
                        date: new Date().toISOString().split('T')[0],
                        timeSlot: `₹ ${displayAmount}`,
                        visitors: 1,
                        specialDarshan: 'UPI Instant Pay'
                      }}
                      size={140}
                      showDetails={false}
                      showActions={false}
                      className="mx-auto"
                    />

                    <div className="flex items-center justify-center gap-2 pt-1 text-xs">
                      <span className="font-mono text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 font-semibold">
                        teerthsetu.temple@upi
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyUpi}
                        className="p-2 bg-saffron/10 hover:bg-saffron/20 text-saffron rounded-lg font-bold text-xs flex items-center gap-1 transition-colors"
                      >
                        {copiedUpi ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="text-left">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Or enter your Virtual Payment Address (VPA)
                    </label>
                    <input
                      type="text"
                      className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:border-saffron transition-colors"
                      placeholder="e.g. devotee@gpay / 9876543210@paytm"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* METHOD TAB 2: CREDIT / DEBIT CARD */}
              {payMethod === 'card' && (
                <form onSubmit={handleInitiatePayment} className="space-y-3 text-left">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Card Number
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-16 py-2.5 text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:border-saffron"
                        placeholder="4532 0000 0000 0000"
                        value={cardForm.number}
                        onChange={handleCardNumberChange}
                      />
                      <CreditCard className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <span className="absolute right-3 top-2.5 text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold px-2 py-0.5 rounded">
                        {getCardBrand()}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={5}
                        className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs font-mono text-center text-slate-900 dark:text-white focus:outline-none focus:border-saffron"
                        placeholder="MM/YY"
                        value={cardForm.expiry}
                        onChange={handleExpiryChange}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        CVV / CVC
                      </label>
                      <input
                        type="password"
                        required
                        maxLength={4}
                        className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs font-mono text-center text-slate-900 dark:text-white focus:outline-none focus:border-saffron"
                        placeholder="•••"
                        value={cardForm.cvv}
                        onChange={(e) => setCardForm({ ...cardForm, cvv: e.target.value.replace(/\D/g, '') })}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-saffron"
                      placeholder="Name as printed on card"
                      value={cardForm.name}
                      onChange={(e) => setCardForm({ ...cardForm, name: e.target.value })}
                    />
                  </div>
                </form>
              )}

              {/* METHOD TAB 3: NETBANKING */}
              {payMethod === 'netbanking' && (
                <div className="space-y-3 text-left">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Select Popular Bank
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {['HDFC', 'SBI', 'ICICI', 'AXIS', 'KOTAK', 'PNB'].map(bank => (
                      <button
                        key={bank}
                        type="button"
                        onClick={() => setSelectedBank(bank)}
                        className={`p-3 border rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                          selectedBank === bank
                            ? 'border-saffron bg-saffron/10 text-saffron'
                            : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <Building2 className="h-4 w-4 shrink-0" /> {bank} Bank
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* METHOD TAB 4: WALLETS */}
              {payMethod === 'wallet' && (
                <div className="space-y-3 text-left">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Select Digital Wallet
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Paytm Wallet', 'Mobikwik', 'Amazon Pay', 'Freecharge'].map(w => (
                      <button
                        key={w}
                        type="button"
                        onClick={() => setSelectedBank(w)}
                        className={`p-3 border rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                          selectedBank === w
                            ? 'border-saffron bg-saffron/10 text-saffron'
                            : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <Wallet className="h-4 w-4 shrink-0" /> {w}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Main Submit Action */}
              <button
                type="button"
                onClick={handleInitiatePayment}
                className="w-full py-3.5 bg-saffron hover:bg-[#e85a28] text-white font-extrabold rounded-2xl text-sm shadow-lg shadow-saffron/30 transition-all flex items-center justify-center gap-2"
              >
                <Lock className="h-4 w-4" /> {isFree ? 'Issue Free Pass' : `Pay ₹ ${displayAmount} & Confirm Pass`}
              </button>

              <div className="text-center text-[10px] text-slate-500 flex items-center justify-center gap-2">
                <span>✓ NPCI & RBI Sandbox Approved</span>
                <span>•</span>
                <span>Instant Ticket Dispatch</span>
              </div>
            </div>
          )}

          {/* PHASE 2: 3D SECURE BANK OTP CHALLENGE */}
          {phase === 'otp_challenge' && (
            <form onSubmit={handleVerifyBankOtp} className="p-6 space-y-5 text-center">
              <div className="w-14 h-14 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mx-auto border border-amber-500/20">
                <Lock className="h-7 w-7" />
              </div>

              <div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white">3D-Secure Bank Authorization</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Enter the 6-digit OTP sent by your issuing bank to complete payment of <strong className="text-saffron">₹ {displayAmount}</strong>.
                </p>
              </div>

              <div className="max-w-xs mx-auto space-y-3">
                <input
                  type="text"
                  maxLength={6}
                  required
                  autoFocus
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl py-3 text-center text-xl font-bold tracking-[0.5em] text-slate-900 dark:text-white focus:outline-none focus:border-saffron"
                  placeholder="••••••"
                  value={bankOtp}
                  onChange={(e) => {
                    setBankOtp(e.target.value.replace(/\D/g, ''));
                    setOtpError('');
                  }}
                />

                {otpError && (
                  <p className="text-[11px] text-red-500 font-semibold flex items-center justify-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5" /> {otpError}
                  </p>
                )}

                {/* Quick Auto-Fill Test OTP Helper */}
                <button
                  type="button"
                  onClick={() => {
                    setBankOtp('123456');
                    setOtpError('');
                  }}
                  className="text-[11px] text-saffron hover:underline font-semibold flex items-center justify-center gap-1 mx-auto"
                >
                  <Sparkles className="h-3 w-3" /> Auto-fill Sandbox Test OTP (123456)
                </button>

                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-all shadow-md mt-2"
                >
                  Authorize Payment
                </button>
              </div>

              <button
                type="button"
                onClick={() => setPhase('selection')}
                className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center justify-center gap-1 mx-auto"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Change Payment Method
              </button>
            </form>
          )}

          {/* PHASE 3: PROCESSING SPINNER */}
          {phase === 'processing' && (
            <div className="p-10 text-center space-y-4 min-h-[300px] flex flex-col items-center justify-center">
              <div className="w-12 h-12 border-4 border-saffron border-t-transparent rounded-full animate-spin mx-auto" />
              <div>
                <h4 className="text-md font-bold text-slate-900 dark:text-white">Processing Transaction</h4>
                <p className="text-xs text-slate-500 mt-1 animate-pulse">{processingText}</p>
              </div>
            </div>
          )}

          {/* PHASE 4: SUCCESS CONFIRMATION */}
          {phase === 'success' && (
            <div className="p-8 text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20">
                <CheckCircle className="h-9 w-9" />
              </div>
              <h4 className="text-xl font-extrabold text-emerald-500">Payment Approved!</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Transaction ID: <strong className="font-mono text-slate-900 dark:text-white">TXN-{Date.now().toString().slice(-8)}</strong>
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
