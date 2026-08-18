import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Phone, Mail, Lock, Shield, User, MapPin, Key, UserCheck, X, Eye, EyeOff } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useGoogleLogin } from '@react-oauth/google';

export default function Auth() {
  const API_BASE_URL = window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://teerthsetu.onrender.com';
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') || 'devotee';
  const [role, setRole] = useState(initialRole);
  const [isLogin, setIsLogin] = useState(true);
  const [loginMethod, setLoginMethod] = useState('email'); // 'email' or 'phone'
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [emailError, setEmailError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const [otpTimer, setOtpTimer] = useState(60);
  const [showVideo, setShowVideo] = useState(false);
  const [showVerifiedText, setShowVerifiedText] = useState(true);
  const [showAdminHint, setShowAdminHint] = useState(true);

  useEffect(() => {
    if (role === 'admin') {
      setShowAdminHint(true);
      const timer = setTimeout(() => setShowAdminHint(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [role]);

  const triggerSuccessAnimation = (userData, token, route, isOtp = false) => {
    setShowVideo(true);

    if (isOtp) {
      setShowVerifiedText(true);
      setTimeout(() => {
        setShowVerifiedText(false);
      }, 2000);
    } else {
      setShowVerifiedText(false);
    }

    setTimeout(() => {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      navigate(route);
    }, isOtp ? 4000 : 2000);
  };

  // Slideshow states
  const temples = [
    "/temple4.jpg",
    "/temple5.jpg",
    "/temple6.jpg",
    "/temple7.jpg"
  ];
  const adminTemples = [
    "/admin1.jpg",
    "/admin2.jpg",
    "/admin3.jpg",
    "/admin4.jpg"
  ];

  const [currentTempleIndex, setCurrentTempleIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTempleIndex((prev) => (prev + 1) % temples.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (emailError) {
      const timer = setTimeout(() => setEmailError(''), 4000);
      return () => clearTimeout(timer);
    }
  }, [emailError]);

  useEffect(() => {
    let interval = null;
    if (otpSent && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    } else if (otpTimer === 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [otpSent, otpTimer]);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    address: '',
    aadhaar: '',
    emergencyContact: ''
  });

  const navigate = useNavigate();

  const handleInputChange = (e) => {
    if (e.target.name === 'email') setEmailError('');
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const passwordRules = [
    { label: '8 to 20 characters', valid: formData.password.length >= 8 && formData.password.length <= 20 },
    { label: 'Uppercase letter', valid: /[A-Z]/.test(formData.password) },
    { label: 'Lowercase letter', valid: /[a-z]/.test(formData.password) },
    { label: 'Number (0-9)', valid: /[0-9]/.test(formData.password) },
    { label: 'Special character', valid: /[^A-Za-z0-9\s]/.test(formData.password) && formData.password.length > 0 },
    { label: 'No spaces', valid: !/\s/.test(formData.password) && formData.password.length > 0 }
  ];
  const isPasswordValid = passwordRules.every(rule => rule.valid);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setEmailError('');

    if (isLogin) {
      const identifier = loginMethod === 'email' ? formData.email : formData.phone;
      if (loginMethod === 'email') {
        if (role !== 'admin' && !identifier.endsWith('@gmail.com')) {
          setEmailError('Please enter a valid Gmail address ending with @gmail.com.');
          return;
        }
      }
      const payload = {
        email: identifier,
        password: formData.password,
        role: role
      };

      fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
        .then(async res => {
          const text = await res.text();
          try {
            return { status: res.status, data: JSON.parse(text) };
          } catch {
            throw new Error(`Status ${res.status} | Non-JSON response: ${text.substring(0, 100)}`);
          }
        })
        .then(({ status, data }) => {
          if (status === 200) {
            if (data.requiresOtp) {
              setOtpSent(true);
              setOtpTimer(60);
              setOtpValues(['', '', '', '', '', '']);
            } else {
              triggerSuccessAnimation(data.user, data.token, role === 'admin' ? '/admin' : '/devotee');
            }
          } else {
            setErrorMsg(data.message || 'Login failed');
          }
        })
        .catch(err => setErrorMsg('Error: ' + err.message));
    } else {
      if (!formData.email.endsWith('@gmail.com')) {
        setEmailError('Please enter a valid Gmail address ending with @gmail.com.');
        return;
      }

      if (!isPasswordValid) {
        setErrorMsg("Please ensure your password meets all requirements.");
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        setErrorMsg("Passwords do not match.");
        return;
      }

      const payload = {
        fullName: formData.name,
        email: formData.email,
        phoneNumber: formData.phone,
        password: formData.password,
        confirmPassword: formData.confirmPassword
      };

      fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
        .then(async res => {
          const text = await res.text();
          try {
            return { status: res.status, data: JSON.parse(text) };
          } catch {
            throw new Error(`Status ${res.status} | Non-JSON response: ${text.substring(0, 100)}`);
          }
        })
        .then(({ status, data }) => {
          if (status === 200) {
            alert("Registration successful! Please sign in.");
            setIsLogin(true);
            setFormData({ ...formData, password: '', confirmPassword: '' });
          } else {
            if (data.errors) {
              const firstError = Object.values(data.errors)[0][0];
              setErrorMsg(firstError);
            } else {
              setErrorMsg(data.message || 'Registration failed');
            }
          }
        })
        .catch(err => setErrorMsg('Error: ' + err.message));
    }
  };

  const handleRequestLoginOtp = () => {
    const identifier = loginMethod === 'email' ? formData.email : formData.phone;
    if (!identifier) {
      alert(`Please enter your ${loginMethod} first.`);
      return;
    }
    if (loginMethod === 'email' && role !== 'admin' && !identifier.endsWith('@gmail.com')) {
      setEmailError('Please enter a valid Gmail address ending with @gmail.com.');
      return;
    }
    const payload = loginMethod === 'email' ? { email: identifier } : { phone: identifier };

    // Optimistically show OTP screen immediately for zero latency
    setOtpSent(true);
    setOtpTimer(60);
    setOtpValues(['', '', '', '', '', '']);

    fetch(`${API_BASE_URL}/api/devotee/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(data => {
        if (!data.success) {
          setOtpSent(false);
          alert('Server Error: ' + (data.message || 'Failed to send OTP'));
        }
      })
      .catch(err => {
        setOtpSent(false);
        alert('Network error: ' + err.message);
      });
  };

  const handleVerifyOtp = () => {
    const otp = otpValues.join('');
    if (otp.length < 6) {
      alert("Please enter 6-digit OTP");
      return;
    }

    const payload = loginMethod === 'email' ? { email: formData.email, otp } : { phone: formData.phone, otp };

    fetch(`${API_BASE_URL}/api/devotee/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(res => res.json().then(data => ({ status: res.status, data })))
      .then(({ status, data }) => {
        if (status === 200) {
          triggerSuccessAnimation(data.user, data.token, '/devotee', true);
        } else {
          alert(data.message || "OTP Verification Failed");
        }
      })
      .catch(err => alert('Network error'));
  };

  const handleResendOtp = () => {
    const identifier = loginMethod === 'email' ? formData.email : formData.phone;
    const payload = loginMethod === 'email' ? { email: identifier } : { phone: identifier };
    fetch(`${API_BASE_URL}/api/devotee/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    setOtpTimer(60);
  };

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (codeResponse) => {
      try {
        // Fetch user info using the access token
        const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${codeResponse.access_token}` }
        });
        const userInfo = await userInfoRes.json();

        // Pass the token and the fetched user info to our backend
        const res = await fetch(`${API_BASE_URL}/api/auth/google-login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            idToken: codeResponse.access_token,
            role: role,
            email: userInfo.email,
            name: userInfo.name
          })
        });

        const text = await res.text();
        let data;
        try {
          data = JSON.parse(text);
        } catch {
          throw new Error(`Status ${res.status} | Non-JSON response: ${text.substring(0, 100)}`);
        }

        if (res.status === 200) {
          if (role === 'admin') {
            triggerSuccessAnimation({ ...data.user, role: 'admin' }, data.token, '/admin');
          } else {
            triggerSuccessAnimation(data.user, data.token, '/devotee');
          }
        } else {
          setErrorMsg(data.message || 'Google Login failed');
        }
      } catch (err) {
        setErrorMsg('Error: ' + err.message);
      }
    },
    onError: (error) => setErrorMsg('Google Login failed: ' + error.message)
  });

  const handleForgotSubmit = (e) => {
    e.preventDefault();
    if (!forgotEmail) return;

    const emailToSend = forgotEmail;

    // Optimistically show success message immediately for zero latency
    setForgotSuccess(true);

    fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: emailToSend })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          if (data.previewUrl) {
            console.log("Test Email sent! Preview at:", data.previewUrl);
            alert("TEST MODE: Email sent! Check your terminal console for the email preview link.");
          }
          setTimeout(() => {
            setShowForgot(false);
            setForgotSuccess(false);
            setForgotEmail('');
          }, 3000);
        } else {
          setForgotSuccess(false);
          alert(data.message || 'Failed to send reset link');
        }
      })
      .catch(err => {
        console.error(err);
        setForgotSuccess(false);
        alert('Network error');
      });
  };

  const { isDarkMode, toggleTheme } = useTheme();
  const finalLogo = isDarkMode ? "/logo_dark_mode.png" : "/logo_light_mode.png";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#1A1A2E] text-slate-900 dark:text-white flex items-center justify-center p-6 relative transition-colors duration-300 overflow-hidden">
      <AnimatePresence>
        {showVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className={`fixed inset-0 z-[100] flex items-center justify-center overflow-hidden pointer-events-none ${isDarkMode ? 'bg-black' : 'bg-slate-50'}`}
          >
            <video
              src={isDarkMode ? "/otp.mp4" : "/otp_light_mode.mp4"}
              autoPlay
              playsInline
              muted
              className={`absolute inset-0 w-full h-full object-cover scale-150 transform ${isDarkMode ? 'brightness-[0.3]' : 'brightness-[0.6] contrast-[1.1]'}`}
            />
            <AnimatePresence>
              {showVerifiedText && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.1 }}
                  transition={{ duration: 0.4, type: "spring" }}
                  className="relative z-10 flex flex-col items-center justify-center h-full w-full"
                >
                  <div className="flex flex-col items-center">
                    <div className="w-20 h-20 rounded-full bg-emerald-500 border-4 border-emerald-400 flex items-center justify-center mb-5 shadow-[0_0_30px_rgba(52,211,153,0.4)]">
                      <UserCheck className="h-10 w-10 text-emerald-950" />
                    </div>
                    <p className="text-emerald-400 font-serif text-4xl md:text-5xl tracking-[0.25em] font-black drop-shadow-xl uppercase">Verified</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Close/Back Button */}
      <Link
        to="/"
        state={{ skipSplash: true }}
        className="absolute top-6 left-6 p-2.5 rounded-full border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-black/40 backdrop-blur-md hover:bg-white/80 dark:hover:bg-white/10 transition-all z-50 text-slate-600 dark:text-slate-300 shadow-sm hover:scale-105"
        aria-label="Back to home"
      >
        <X className="h-5 w-5" />
      </Link>

      {/* Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        className="absolute top-6 right-6 p-2.5 rounded-full border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-black/40 backdrop-blur-md hover:bg-white/80 dark:hover:bg-white/10 transition-all z-50 text-indigo-600 dark:text-yellow-400 shadow-sm"
        aria-label="Toggle theme"
      >
        {isDarkMode ? (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.364 17.636l-.707.707M18.364 17.636l-.707-.707M6.364 6.364l-.707-.707M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        ) : (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        )}
      </button>

      {/* Decorative Background Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-saffron/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-gold/10 rounded-full blur-[130px] pointer-events-none" />

      {/* Auth Card Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl bg-white/50 dark:bg-black/40 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] flex flex-col md:flex-row relative z-10"
      >

        {/* Left Side - Brand & Info with Slideshow */}
        <div className="w-full md:w-5/12 relative flex flex-col border-b md:border-b-0 md:border-r border-slate-200 dark:border-white/5 overflow-hidden min-h-[300px] rounded-t-3xl md:rounded-tr-none md:rounded-l-3xl">
          <AnimatePresence>
            <motion.img
              key={`${role}-${currentTempleIndex}`}
              src={role === 'admin' ? adminTemples[currentTempleIndex] : temples[currentTempleIndex]}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className="absolute inset-0 w-full h-full object-cover"
              alt="Temple Background"
            />
          </AnimatePresence>
          {/* Overlay to ensure text/logo visibility against image */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />

          <div className="relative z-10 flex flex-col h-full items-center justify-center p-8 text-center">
            <div className="flex justify-center mb-8">
              <img
                src={finalLogo}
                alt="TeerthSetu Logo"
                className="h-28 md:h-36 w-auto object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] brightness-125"
                style={{ filter: 'brightness(1.2)' }}
              />
            </div>
            <p className="text-white font-medium text-sm drop-shadow-md">AI-Powered Smart Pilgrimage Management</p>
          </div>
        </div>

        {/* Right Side - Forms */}
        <div className="w-full md:w-7/12 p-8 flex flex-col justify-center relative bg-white/40 dark:bg-transparent rounded-b-3xl md:rounded-bl-none md:rounded-r-3xl">
          <div className="absolute inset-0 z-0 rounded-b-3xl md:rounded-bl-none md:rounded-r-3xl overflow-hidden pointer-events-none">
            <div
              className="absolute -inset-4 opacity-50 dark:opacity-50 blur-sm"
              style={{
                backgroundImage: role === 'devotee' ? "url('/scripture.jpg')" : "url('/elephant.jpg')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundBlendMode: isDarkMode ? 'multiply' : 'normal',
                backgroundColor: isDarkMode ? '#4a3f35' : 'transparent'
              }}
            />
          </div>

          <div className="relative z-10 w-full flex flex-col h-full">
            {otpSent ? (
              <motion.div
                key="otp-verification-view"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col h-full justify-center w-full max-w-md mx-auto my-auto py-12"
              >
                <div className="flex flex-col gap-6 mb-12">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white font-sans tracking-wide drop-shadow-md">Enter OTP</h3>
                  <div className="flex justify-between gap-3">
                    {otpValues.map((v, i) => (
                      <input
                        key={i}
                        id={`otp-${i}`}
                        type="text"
                        maxLength="1"
                        value={v}
                        className={`w-12 h-14 text-center bg-transparent border-b-2 text-2xl font-black text-black dark:text-white focus:outline-none transition-colors drop-shadow-sm ${v ? 'border-saffron' : 'border-slate-700 dark:border-slate-400'}`}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '');
                          const newOtp = [...otpValues];
                          newOtp[i] = val;
                          setOtpValues(newOtp);
                          if (val && i < 5) {
                            document.getElementById(`otp-${i + 1}`)?.focus();
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Backspace' && !otpValues[i] && i > 0) {
                            document.getElementById(`otp-${i - 1}`)?.focus();
                          }
                        }}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-8">
                  {otpTimer > 0 ? (
                    <p className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-wide font-sans drop-shadow-md">
                      Didn't receive the OTP? Retry in 00:{otpTimer.toString().padStart(2, '0')}
                    </p>
                  ) : (
                    <p className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-wide font-sans drop-shadow-md">
                      Didn't receive the OTP?{" "}
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        className="text-saffron hover:underline ml-1"
                      >
                        Resend Now
                      </button>
                    </p>
                  )}
                  <button
                    type="button"
                    className="w-full py-4 rounded-xl bg-saffron text-white font-bold text-xl tracking-widest hover:bg-[#e85a28] transition-colors shadow-lg shadow-saffron/30"
                    onClick={handleVerifyOtp}
                  >
                    ENTER OTP
                  </button>
                  <button
                    type="button"
                    className="text-sm font-bold text-slate-800 dark:text-slate-300 hover:text-black dark:hover:text-white mx-auto drop-shadow-md"
                    onClick={() => setOtpSent(false)}
                  >
                    Back to Login
                  </button>
                </div>
              </motion.div>
            ) : (
              <>
                {/* Form Title */}
                <h3 className="text-3xl font-serif font-black text-red-900 dark:text-white text-center mb-6">
                  {isLogin ? `${role === 'admin' ? 'Administrator' : 'Devotee'} Login` : 'Create Devotee Account'}
                </h3>

                {errorMsg && (
                  <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/50 rounded-xl text-sm text-center font-medium">
                    {errorMsg}
                  </div>
                )}

                {/* Login Method Toggle (only if login mode) */}
                {isLogin && (
                  <div className="flex justify-center gap-6 mb-6 text-sm">
                    <button
                      type="button"
                      className={`pb-1 border-b-2 font-serif font-bold text-base transition-colors ${loginMethod === 'email' ? (role === 'admin' ? 'border-black text-black dark:border-emerald-400 dark:text-emerald-400' : 'border-red-900 text-red-900 dark:border-saffron dark:text-saffron') : (role === 'admin' ? 'border-transparent text-black dark:text-white hover:text-black dark:hover:text-emerald-200' : 'border-transparent text-red-900 dark:text-white hover:text-red-800 dark:hover:text-slate-200')}`}
                      onClick={() => setLoginMethod('email')}
                    >
                      Email Login
                    </button>
                    <button
                      type="button"
                      className={`pb-1 border-b-2 font-serif font-bold text-base transition-colors ${loginMethod === 'phone' ? (role === 'admin' ? 'border-black text-black dark:border-emerald-400 dark:text-emerald-400' : 'border-red-900 text-red-900 dark:border-saffron dark:text-saffron') : (role === 'admin' ? 'border-transparent text-black dark:text-white hover:text-black dark:hover:text-emerald-200' : 'border-transparent text-red-900 dark:text-white hover:text-red-800 dark:hover:text-slate-200')}`}
                      onClick={() => setLoginMethod('phone')}
                    >
                      Phone Login
                    </button>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <AnimatePresence mode="wait">
                    {isLogin ? (
                      // --- LOGIN FORM ---
                      <motion.div
                        key="login-form"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="flex flex-col gap-4"
                      >
                        {loginMethod === 'email' ? (
                          <div className="relative z-50">
                            <Mail className="absolute z-10 left-4 top-3.5 h-5 w-5 text-slate-600 dark:text-slate-400" />
                            <input
                              type="email"
                              name="email"
                              placeholder="Email Address"
                              required
                              className={`w-full bg-white/80 dark:bg-white/30 backdrop-blur-md border ${emailError ? 'border-red-500' : 'border-slate-300 dark:border-white/30'} rounded-xl pl-12 pr-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-saffron focus:ring-1 focus:ring-saffron transition-all`}
                              value={formData.email}
                              onChange={handleInputChange}
                            />
                            {emailError && (
                              <motion.div
                                initial={{ opacity: 0, x: -10, y: "-50%" }}
                                animate={{ opacity: 1, x: 0, y: "-50%" }}
                                exit={{ opacity: 0, x: -10, y: "-50%" }}
                                className="absolute z-50 left-[100%] ml-3 top-1/2 bg-white border border-slate-300 shadow-xl rounded-none p-3 flex items-start w-56"
                              >
                                <div className="absolute -left-[6px] top-1/2 -mt-[6px] w-3 h-3 bg-white border-b border-l border-slate-300 rotate-45"></div>
                                <div className="bg-[#E55A00] text-white w-5 h-5 flex items-center justify-center rounded-none font-bold text-sm mr-3 shrink-0 mt-0.5">
                                  !
                                </div>
                                <span className="text-sm font-medium text-slate-700 leading-snug">{emailError}</span>
                              </motion.div>
                            )}
                            {role === 'admin' && showAdminHint && (
                              <p className="text-xs text-red-500 dark:text-red-400 mt-2 pl-1 font-medium transition-opacity duration-500 opacity-100">
                                Note: Must use an authorized management account
                              </p>
                            )}
                          </div>
                        ) : (
                          <div className="relative flex items-center">
                            <Phone className="absolute z-10 left-4 h-5 w-5 text-slate-600 dark:text-slate-400 pointer-events-none" />
                            <span className="absolute z-10 left-11 text-slate-700 dark:text-slate-300 font-medium border-r border-slate-300 dark:border-white/20 pr-2 pointer-events-none">+91</span>
                            <input
                              type="tel"
                              name="phone"
                              placeholder="10-digit number"
                              pattern="[0-9]{10}"
                              maxLength="10"
                              required
                              className="w-full bg-white/80 dark:bg-white/30 backdrop-blur-md border border-slate-300 dark:border-white/30 rounded-xl pl-[5.5rem] pr-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-saffron focus:ring-1 focus:ring-saffron transition-all"
                              value={formData.phone}
                              onChange={(e) => {
                                e.target.value = e.target.value.replace(/\D/g, '');
                                handleInputChange(e);
                              }}
                            />
                          </div>
                        )}

                        <div className="relative">
                          <Lock className="absolute z-10 left-4 top-3.5 h-5 w-5 text-slate-600 dark:text-slate-400" />
                          <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            placeholder="Password"
                            required={!otpSent}
                            className="w-full bg-white/80 dark:bg-white/30 backdrop-blur-md border border-slate-300 dark:border-white/30 rounded-xl pl-12 pr-12 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-saffron focus:ring-1 focus:ring-saffron transition-all"
                            value={formData.password}
                            onChange={handleInputChange}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-3.5 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
                          >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        </div>

                        {role !== 'admin' && (
                          <div className="flex justify-end mt-[-8px] mb-2">
                            <button
                              type="button"
                              onClick={handleRequestLoginOtp}
                              className={`text-sm font-bold hover:underline ${role === 'admin' ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-900 dark:text-red-400'}`}
                            >
                              Login with OTP instead
                            </button>
                          </div>
                        )}

                        <div className="text-right">
                          <button
                            type="button"
                            onClick={() => setShowForgot(true)}
                            className="text-sm font-serif text-black dark:text-white font-bold hover:underline transition-all"
                          >
                            Forgot Password?
                          </button>
                        </div>
                      </motion.div>
                    ) : (
                      // --- REGISTRATION FORM ---
                      <motion.div
                        key="register-form"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="flex flex-col gap-4"
                      >
                        <div className="relative">
                          <User className="absolute z-10 left-4 top-3.5 h-5 w-5 text-slate-600 dark:text-slate-400" />
                          <input
                            type="text"
                            name="name"
                            placeholder="Full Name"
                            required
                            className="w-full bg-white/80 dark:bg-white/30 backdrop-blur-md border border-slate-300 dark:border-white/30 rounded-xl pl-12 pr-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-saffron focus:ring-1 focus:ring-saffron transition-all"
                            value={formData.name}
                            onChange={handleInputChange}
                          />
                        </div>

                        <div className="relative flex items-center">
                          <Phone className="absolute z-10 left-4 h-5 w-5 text-slate-600 dark:text-slate-400 pointer-events-none" />
                          <span className="absolute z-10 left-11 text-slate-700 dark:text-slate-300 font-medium border-r border-slate-300 dark:border-white/20 pr-2 pointer-events-none">+91</span>
                          <input
                            type="tel"
                            name="phone"
                            placeholder="10-digit number"
                            pattern="[0-9]{10}"
                            maxLength="10"
                            required
                            className="w-full bg-white/80 dark:bg-white/30 backdrop-blur-md border border-slate-300 dark:border-white/30 rounded-xl pl-[5.5rem] pr-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-saffron focus:ring-1 focus:ring-saffron transition-all"
                            value={formData.phone}
                            onChange={(e) => {
                              e.target.value = e.target.value.replace(/\D/g, '');
                              handleInputChange(e);
                            }}
                          />
                        </div>

                        <div className="relative z-50">
                          <Mail className="absolute left-4 top-3.5 h-5 w-5 text-slate-600 dark:text-slate-400" />
                          <input
                            type="email"
                            name="email"
                            placeholder="Email Address"
                            required
                            className={`w-full bg-slate-100 dark:bg-black/40 border ${emailError ? 'border-red-500' : 'border-slate-200 dark:border-white/10'} rounded-xl pl-12 pr-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-saffron focus:ring-1 focus:ring-saffron transition-all`}
                            value={formData.email}
                            onChange={handleInputChange}
                          />
                          {emailError && (
                            <motion.div
                              initial={{ opacity: 0, x: -10, y: "-50%" }}
                              animate={{ opacity: 1, x: 0, y: "-50%" }}
                              exit={{ opacity: 0, x: -10, y: "-50%" }}
                              className="absolute z-50 left-[100%] ml-3 top-1/2 bg-white border border-slate-300 shadow-xl rounded-none p-3 flex items-start w-56"
                            >
                              <div className="absolute -left-[6px] top-1/2 -mt-[6px] w-3 h-3 bg-white border-b border-l border-slate-300 rotate-45"></div>
                              <div className="bg-[#E55A00] text-white w-5 h-5 flex items-center justify-center rounded-none font-bold text-sm mr-3 shrink-0 mt-0.5">
                                !
                              </div>
                              <span className="text-sm font-medium text-slate-700 leading-snug">{emailError}</span>
                            </motion.div>
                          )}
                        </div>

                        <div className="relative">
                          <Lock className="absolute left-4 top-3.5 h-5 w-5 text-slate-600 dark:text-slate-400" />
                          <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            placeholder="Password"
                            required
                            className="w-full bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl pl-12 pr-12 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-saffron focus:ring-1 focus:ring-saffron transition-all"
                            value={formData.password}
                            onChange={handleInputChange}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-3.5 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
                          >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        </div>

                        {formData.password && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="bg-white/80 dark:bg-black/40 backdrop-blur-md rounded-xl p-4 border border-slate-200 dark:border-white/10 text-xs shadow-sm overflow-hidden"
                          >
                            <p className="font-semibold text-slate-700 dark:text-slate-300 mb-2 font-serif">Password Requirements:</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {passwordRules.map((rule, idx) => (
                                <div key={idx} className={`flex items-center gap-1.5 font-medium transition-colors duration-300 ${rule.valid ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`}>
                                  <span className="text-base leading-none">{rule.valid ? '✓' : '○'}</span>
                                  <span>{rule.label}</span>
                                </div>
                              ))}
                              <div className={`flex items-center gap-1.5 font-medium transition-colors duration-300 ${formData.confirmPassword && formData.password === formData.confirmPassword ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`}>
                                <span className="text-base leading-none">{formData.confirmPassword && formData.password === formData.confirmPassword ? '✓' : '○'}</span>
                                <span>Passwords match</span>
                              </div>
                            </div>
                          </motion.div>
                        )}

                        <div className="relative">
                          <Lock className="absolute left-4 top-3.5 h-5 w-5 text-slate-600 dark:text-slate-400" />
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            name="confirmPassword"
                            placeholder="Confirm Password"
                            required
                            className="w-full bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl pl-12 pr-12 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-saffron focus:ring-1 focus:ring-saffron transition-all"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-4 top-3.5 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
                          >
                            {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        </div>


                      </motion.div>
                    )}
                  </AnimatePresence>

                  <button
                    type="submit"
                    className={`w-full py-3.5 rounded-xl font-bold text-lg mt-4 shadow-lg transition-all duration-300 hover:-translate-y-0.5 text-white ${role === 'admin' ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-950/30' : 'bg-saffron hover:bg-[#e85a28] shadow-saffron/30'}`}
                  >
                    {isLogin ? 'Secure Sign In' : 'Register Account'}
                  </button>
                </form>

                {/* OR Divider */}
                <div className="flex items-center my-6">
                  <div className="flex-1 border-t border-slate-400 dark:border-white/20"></div>
                  <span className="px-4 text-sm font-serif font-black text-red-900 dark:text-white uppercase tracking-wider">or</span>
                  <div className="flex-1 border-t border-slate-400 dark:border-white/20"></div>
                </div>

                {/* Google Sign In Button */}
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white/90 dark:bg-black/40 hover:bg-white dark:hover:bg-white/10 transition-all duration-300 shadow-sm font-serif font-bold text-red-900 dark:text-white"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Continue with Google
                </button>

                {role === 'devotee' && (
                  <p className="text-center font-serif text-red-900 dark:text-white font-bold mt-8 text-base">
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <span
                      className="text-black dark:text-saffron font-black cursor-pointer hover:underline"
                      onClick={() => setIsLogin(!isLogin)}
                    >
                      {isLogin ? 'Create Account' : 'Sign In'}
                    </span>
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </motion.div>

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {showForgot && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-md relative overflow-hidden bg-white dark:bg-[#1A1A2E] border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-2xl"
            >
              <div
                className="absolute inset-0 z-0 opacity-50 dark:opacity-60 blur-[2px] pointer-events-none"
                style={{
                  backgroundImage: role === 'admin' ? "url('/admin_fp.jpg')" : "url('/devotee_fp.jpg')",
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
              {/* Dark overlay for contrast */}
              <div className="absolute inset-0 z-0 bg-white/30 dark:bg-black/50 pointer-events-none" />

              <div className="relative z-10">
                <h4 className="text-xl font-bold mb-2 text-slate-900 dark:text-white drop-shadow-lg">Reset Password</h4>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200 mb-6 drop-shadow-md">Enter your registered email or phone to receive a password reset link.</p>

                {forgotSuccess ? (
                  <div className="bg-emerald-500/10 text-emerald-400 p-4 rounded-xl text-center font-medium mb-4">
                    Reset link sent successfully!
                  </div>
                ) : (
                  <form onSubmit={handleForgotSubmit} className="flex flex-col gap-4">
                    <input
                      type="text"
                      placeholder="Email or Phone Number"
                      required
                      className="w-full bg-white/80 dark:bg-white/30 backdrop-blur-md border-2 border-slate-600 dark:border-white/50 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-saffron focus:ring-1 focus:ring-saffron transition-all"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                    />
                    <div className="flex gap-4 mt-2">
                      <button
                        type="button"
                        onClick={() => setShowForgot(false)}
                        className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-100 dark:hover:bg-white/10 transition-all bg-white/50 dark:bg-black/40 backdrop-blur-sm"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className={`flex-1 py-2.5 rounded-xl font-bold transition-all backdrop-blur-sm ${role === 'admin' ? 'bg-emerald-600/90 hover:bg-emerald-500 text-white' : 'bg-saffron/90 text-slate-900 dark:text-white hover:bg-[#e85a28]'}`}
                      >
                        Send Link
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
