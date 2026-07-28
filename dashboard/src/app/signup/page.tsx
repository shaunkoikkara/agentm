"use client";

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Bot, Loader2, Mail, Lock, Building2, ShieldCheck, ArrowLeft } from 'lucide-react';

export default function SignupPage() {
  const [step, setStep] = useState<'signup' | 'otp'>('signup');
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const { login } = useAuth();
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await api.signup({ email, password, business_name: businessName });
      setStep('otp');
      setResendCooldown(60);
      setSuccess('Verification code sent to your email!');
    } catch (err: any) {
      setError(err.message || 'Failed to sign up');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste — distribute digits across inputs
      const digits = value.replace(/\D/g, '').slice(0, 6).split('');
      const newOtp = [...otp];
      digits.forEach((d, i) => {
        if (index + i < 6) newOtp[index + i] = d;
      });
      setOtp(newOtp);
      const nextIndex = Math.min(index + digits.length, 5);
      otpRefs.current[nextIndex]?.focus();
      return;
    }

    if (!/^\d*$/.test(value)) return; // only digits

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  // Auto-submit when all 6 digits entered
  useEffect(() => {
    const code = otp.join('');
    if (code.length === 6 && step === 'otp') {
      handleVerify(code);
    }
  }, [otp]);

  const handleVerify = async (code?: string) => {
    const otpCode = code || otp.join('');
    if (otpCode.length !== 6) {
      setError('Please enter the 6-digit code');
      return;
    }

    setError('');
    setSuccess('');
    setIsSubmitting(true);

    try {
      const data = await api.verifyOtp({ email, code: otpCode });
      login(data.token, data.tenant);
    } catch (err: any) {
      setError(err.message || 'Invalid verification code');
      setOtp(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setError('');
    setSuccess('');

    try {
      await api.resendOtp({ email });
      setResendCooldown(60);
      setSuccess('New verification code sent!');
      setOtp(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
    } catch (err: any) {
      setError(err.message || 'Failed to resend code');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full filter blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full filter blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="glass-card bg-white/90 backdrop-blur-xl rounded-2xl p-8 border border-slate-200/80 shadow-xl">
          
          {step === 'signup' ? (
            <>
              <div className="flex flex-col items-center mb-8">
                <img src="/brand-logo.png" alt="BusDesk Logo" className="w-14 h-14 object-contain mb-3" />
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Create Account</h1>
                <p className="text-slate-500 text-sm mt-1">Get started with your AI Receptionist</p>
              </div>

              {error && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl mb-6 text-sm text-center font-medium">
                  {error}
                </div>
              )}

              <form onSubmit={handleSignup} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">Business Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Building2 className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 transition-all"
                      placeholder="Acme Corp"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">Email Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Mail className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 transition-all"
                      placeholder="you@company.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 transition-all"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold py-2.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-md shadow-indigo-500/20 disabled:opacity-50 mt-6 text-sm"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign Up'}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-slate-500 text-sm">
                  Already have an account?{' '}
                  <Link href="/login" className="text-indigo-600 hover:text-indigo-700 font-semibold transition-colors">
                    Sign in
                  </Link>
                </p>
              </div>
            </>
          ) : (
            <>
              {/* OTP Verification Screen */}
              <div className="flex flex-col items-center mb-8">
                <div className="w-14 h-14 bg-gradient-to-tr from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mb-4 shadow-md shadow-emerald-500/20">
                  <ShieldCheck className="w-7 h-7 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Verify Your Email</h1>
                <p className="text-slate-500 mt-1 text-center text-sm">
                  We sent a 6-digit code to<br />
                  <span className="text-slate-900 font-semibold">{email}</span>
                </p>
              </div>

              {error && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl mb-6 text-sm text-center font-medium">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl mb-6 text-sm text-center font-medium">
                  {success}
                </div>
              )}

              {/* 6-digit OTP Input */}
              <div className="flex justify-center gap-2.5 mb-6">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { otpRefs.current[index] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className="w-11 h-13 bg-slate-50 border-2 border-slate-200 rounded-xl text-center text-slate-900 text-xl font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white transition-all shadow-xs"
                    autoFocus={index === 0}
                  />
                ))}
              </div>

              {isSubmitting && (
                <div className="flex justify-center mb-4">
                  <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                </div>
              )}

              {/* Resend code */}
              <div className="text-center mb-6">
                <p className="text-slate-500 text-sm font-medium">
                  Didn't receive the code?{' '}
                  {resendCooldown > 0 ? (
                    <span className="text-slate-400 font-normal">Resend in {resendCooldown}s</span>
                  ) : (
                    <button
                      onClick={handleResend}
                      className="text-indigo-600 hover:text-indigo-700 font-semibold transition-colors"
                    >
                      Resend Code
                    </button>
                  )}
                </p>
              </div>

              {/* Back button */}
              <button
                onClick={() => { setStep('signup'); setError(''); setSuccess(''); setOtp(['', '', '', '', '', '']); }}
                className="w-full flex items-center justify-center gap-2 text-slate-500 hover:text-slate-800 transition-colors text-sm font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to signup
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
