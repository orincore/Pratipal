"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Leaf, ArrowRight, CheckCircle2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

function inputCls(err?: string) {
  return (
    "w-full h-11 px-4 text-sm border rounded-xl bg-white/80 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400 focus:bg-white transition-all duration-200 placeholder:text-gray-400 " +
    (err ? "border-red-400 bg-red-50/50" : "border-gray-200")
  );
}

type Step = "email" | "otp" | "password" | "done";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");

  // Email step
  const [email, setEmail] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // OTP step
  const [otp, setOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState("");

  // Password step
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showCp, setShowCp] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState("");

  // Cooldown timer
  React.useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  async function sendOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Enter a valid email address");
      return;
    }
    setEmailLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("OTP sent — check your inbox");
      setStep("otp");
      setCooldown(60);
    } catch (err: any) {
      toast.error(err.message || "Failed to send OTP");
    } finally {
      setEmailLoading(false);
    }
  }

  async function resendOtp() {
    if (cooldown > 0) return;
    setEmailLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("New OTP sent");
      setCooldown(60);
      setOtp("");
      setOtpError("");
    } catch (err: any) {
      toast.error(err.message || "Failed to resend OTP");
    } finally {
      setEmailLoading(false);
    }
  }

  async function verifyOtp(e: React.FormEvent) {
    e.preventDefault();
    if (otp.length !== 6) { setOtpError("Enter the 6-digit code"); return; }
    setOtpLoading(true);
    setOtpError("");
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Email verified");
      setStep("password");
    } catch (err: any) {
      setOtpError(err.message || "Verification failed");
    } finally {
      setOtpLoading(false);
    }
  }

  async function resetPassword(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) { setPwError("Password must be at least 8 characters"); return; }
    if (password !== confirmPassword) { setPwError("Passwords don't match"); return; }
    setPwLoading(true);
    setPwError("");
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setStep("done");
    } catch (err: any) {
      setPwError(err.message || "Failed to reset password");
    } finally {
      setPwLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex overflow-hidden">
      {/* Left decorative panel */}
      <div
        className="hidden lg:flex lg:w-[45%] flex-col justify-between p-12 pt-[90px] relative overflow-hidden flex-shrink-0"
        style={{ background: "linear-gradient(145deg, #0f172a 0%, #1b244a 45%, #0d3d2e 100%)" }}
      >
        <div className="absolute rounded-full opacity-15 pointer-events-none" style={{ width: 420, height: 420, top: -80, left: -80, background: "radial-gradient(circle, #6ee7b7, transparent)" }} />
        <div className="absolute rounded-full opacity-10 pointer-events-none" style={{ width: 500, height: 500, bottom: -120, right: -60, background: "radial-gradient(circle, #3b82f6, transparent)" }} />

        <div className="relative z-10 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-emerald-400/20 border border-emerald-400/30 flex items-center justify-center">
            <Leaf className="h-4 w-4 text-emerald-300" />
          </div>
          <span className="text-white font-semibold tracking-wide">Pratipal</span>
        </div>

        <div className="relative z-10 space-y-6">
          <h2 className="text-4xl xl:text-5xl text-white leading-tight font-cormorant" style={{ fontWeight: 600 }}>
            Reset your<br /><span className="text-emerald-300">password</span>
          </h2>
          <p className="text-white/55 text-sm leading-relaxed max-w-xs">
            We'll send a one-time code to your email so you can securely set a new password.
          </p>
          <div className="space-y-3 pt-2">
            {["Enter your email address", "Verify with the OTP we send", "Set your new password"].map((s, i) => (
              <div key={s} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-400/20 border border-emerald-400/30 flex items-center justify-center flex-shrink-0">
                  <span className="text-emerald-300 text-xs font-bold">{i + 1}</span>
                </div>
                <span className="text-white/60 text-sm">{s}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <Link href="/login" className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white text-sm font-medium transition-all duration-200">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to sign in
          </Link>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50/30 overflow-y-auto">
        <div className="w-full max-w-md px-6 sm:px-10 py-10 pt-[130px] lg:pt-[100px]">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center">
              <Leaf className="h-3.5 w-3.5 text-emerald-600" />
            </div>
            <span className="font-semibold text-gray-800 text-sm">Pratipal</span>
          </div>

          {/* Step: email */}
          {step === "email" && (
            <div>
              <div className="space-y-1.5 mb-7">
                <h1 className="text-3xl text-[#1b244a] font-cormorant" style={{ fontWeight: 600 }}>Forgot password?</h1>
                <p className="text-sm text-gray-500">Enter your email and we'll send you a reset code.</p>
              </div>
              <form onSubmit={sendOtp} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Email address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className={inputCls()}
                  />
                </div>
                <button
                  type="submit"
                  disabled={emailLoading}
                  className="w-full h-11 flex items-center justify-center gap-2 font-semibold text-sm rounded-xl text-white transition-all duration-300 disabled:cursor-not-allowed mt-2"
                  style={{ background: emailLoading ? "#374151" : "linear-gradient(135deg, #1b244a 0%, #059669 100%)" }}
                >
                  {emailLoading ? (
                    <><span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Sending...</>
                  ) : (
                    <>Send OTP <ArrowRight className="h-4 w-4" /></>
                  )}
                </button>
              </form>
              <div className="mt-6 text-center">
                <Link href="/login" className="text-sm text-emerald-600 hover:text-emerald-700 hover:underline">
                  Back to sign in
                </Link>
              </div>
            </div>
          )}

          {/* Step: OTP */}
          {step === "otp" && (
            <div>
              <div className="space-y-1.5 mb-7">
                <h1 className="text-3xl text-[#1b244a] font-cormorant" style={{ fontWeight: 600 }}>Check your email</h1>
                <p className="text-sm text-gray-500">
                  We sent a 6-digit code to <span className="font-medium text-gray-700">{email}</span>
                </p>
              </div>
              <form onSubmit={verifyOtp} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Verification code</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => { setOtp(e.target.value.replace(/\D/g, "")); setOtpError(""); }}
                    placeholder="000000"
                    className={inputCls(otpError) + " tracking-widest text-center font-mono text-xl"}
                  />
                  {otpError && <p className="text-xs text-red-500">{otpError}</p>}
                </div>
                <button
                  type="submit"
                  disabled={otpLoading || otp.length !== 6}
                  className="w-full h-11 flex items-center justify-center gap-2 font-semibold text-sm rounded-xl text-white transition-all duration-300 disabled:cursor-not-allowed mt-2"
                  style={{ background: otpLoading ? "#374151" : "linear-gradient(135deg, #1b244a 0%, #059669 100%)" }}
                >
                  {otpLoading ? (
                    <><span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Verifying...</>
                  ) : (
                    <>Verify Code <ArrowRight className="h-4 w-4" /></>
                  )}
                </button>
              </form>
              <div className="mt-5 text-center space-y-2">
                <p className="text-sm text-gray-500">
                  Didn't receive it?{" "}
                  <button
                    onClick={resendOtp}
                    disabled={cooldown > 0 || emailLoading}
                    className="text-emerald-600 hover:text-emerald-700 hover:underline disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend OTP"}
                  </button>
                </p>
                <button onClick={() => { setStep("email"); setOtp(""); setOtpError(""); }} className="text-xs text-gray-400 hover:text-gray-600 hover:underline">
                  Use a different email
                </button>
              </div>
            </div>
          )}

          {/* Step: new password */}
          {step === "password" && (
            <div>
              <div className="space-y-1.5 mb-7">
                <h1 className="text-3xl text-[#1b244a] font-cormorant" style={{ fontWeight: 600 }}>New password</h1>
                <p className="text-sm text-gray-500">Choose a strong password for your account.</p>
              </div>
              <form onSubmit={resetPassword} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">New password</label>
                  <div className="relative">
                    <input
                      type={showPw ? "text" : "password"}
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setPwError(""); }}
                      placeholder="••••••••"
                      required
                      className={inputCls(pwError) + " pr-11"}
                    />
                    <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                      {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-400">Min 8 characters</p>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Confirm password</label>
                  <div className="relative">
                    <input
                      type={showCp ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => { setConfirmPassword(e.target.value); setPwError(""); }}
                      placeholder="••••••••"
                      required
                      className={inputCls(pwError) + " pr-11"}
                    />
                    <button type="button" onClick={() => setShowCp(!showCp)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                      {showCp ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                {pwError && <p className="text-xs text-red-500">{pwError}</p>}
                <button
                  type="submit"
                  disabled={pwLoading}
                  className="w-full h-11 flex items-center justify-center gap-2 font-semibold text-sm rounded-xl text-white transition-all duration-300 disabled:cursor-not-allowed mt-2"
                  style={{ background: pwLoading ? "#374151" : "linear-gradient(135deg, #1b244a 0%, #059669 100%)" }}
                >
                  {pwLoading ? (
                    <><span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Resetting...</>
                  ) : (
                    <>Reset Password <ArrowRight className="h-4 w-4" /></>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Step: done */}
          {step === "done" && (
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
                  <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                </div>
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl text-[#1b244a] font-cormorant" style={{ fontWeight: 600 }}>Password reset!</h1>
                <p className="text-sm text-gray-500">Your password has been updated. You can now sign in with your new password.</p>
              </div>
              <button
                onClick={() => router.push("/login")}
                className="w-full h-11 flex items-center justify-center gap-2 font-semibold text-sm rounded-xl text-white transition-all duration-300"
                style={{ background: "linear-gradient(135deg, #1b244a 0%, #059669 100%)" }}
              >
                Go to Sign In <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
