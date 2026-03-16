"use client";

import React, { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Leaf, ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useCustomerAuth } from "@/lib/customer-auth-context";

const PERKS = [
  "Access exclusive wellness products",
  "Track your orders & bookings",
  "Early access to new courses",
  "Personalised healing recommendations",
];

const STATS = [
  { v: "1000+", l: "Families" },
  { v: "9+ Yrs", l: "Experience" },
  { v: "100%", l: "Authentic" },
];

function inputCls(err?: string) {
  return (
    "w-full h-11 px-4 text-sm border rounded-xl bg-white/80 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400 focus:bg-white transition-all duration-200 placeholder:text-gray-400 " +
    (err ? "border-red-400 bg-red-50/50" : "border-gray-200")
  );
}

function Field({
  label, error, hint, children,
}: {
  label: string; error?: string; hint?: string; children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      {children}
      {hint && !error && <p className="text-xs text-gray-400">{hint}</p>}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

function LoginForm({ onSwitch, redirect }: { onSwitch: () => void; redirect: string }) {
  const router = useRouter();
  const { login } = useCustomerAuth();
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", rememberMe: false });

  function set(f: string, v: any) {
    setForm((p) => ({ ...p, [f]: v }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.email || !form.password) { toast.error("Please fill in all fields"); return; }
    setLoading(true);
    try {
      await login(form.email, form.password, form.rememberMe);
      setSuccess(true);
      toast.success("Welcome back!");
      setTimeout(() => router.push(redirect), 600);
    } catch (err: any) {
      toast.error(err.message || "Login failed");
      setLoading(false);
    }
  }

  return (
    <div style={{ transition: "opacity 0.5s, transform 0.5s", opacity: success ? 0 : 1, transform: success ? "scale(0.95) translateY(16px)" : "scale(1) translateY(0)" }}>
      <div className="space-y-1.5 mb-7">
        <h1 className="text-3xl text-[#1b244a] font-cormorant" style={{ fontWeight: 600 }}>
          Welcome back
        </h1>
        <p className="text-sm text-gray-500">Sign in to your account to continue</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Email address">
          <input
            type="email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            placeholder="you@example.com"
            required
            className={inputCls()}
          />
        </Field>

        <Field label="Password">
          <div className="relative">
            <input
              type={showPw ? "text" : "password"}
              value={form.password}
              onChange={(e) => set("password", e.target.value)}
              placeholder="••••••••"
              required
              className={inputCls() + " pr-11"}
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </Field>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={form.rememberMe}
              onChange={(e) => set("rememberMe", e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-400 cursor-pointer"
            />
            <span className="text-sm text-gray-600">Remember me 30 days</span>
          </label>
          <Link href="/forgot-password" className="text-xs text-emerald-600 hover:text-emerald-700 hover:underline">
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading || success}
          className="w-full h-11 flex items-center justify-center gap-2 font-semibold text-sm rounded-xl transition-all duration-300 disabled:cursor-not-allowed mt-2 text-white"
          style={{ background: success ? "#059669" : loading ? "#374151" : "linear-gradient(135deg, #1b244a 0%, #059669 100%)" }}
        >
          {loading ? (
            <><span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Signing in...</>
          ) : success ? (
            <><CheckCircle2 className="h-4 w-4" />Signed in!</>
          ) : (
            <>Sign In <ArrowRight className="h-4 w-4" /></>
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500">
          Don&apos;t have an account?{" "}
          <button onClick={onSwitch} className="font-semibold text-emerald-600 hover:text-emerald-700 hover:underline transition-colors">
            Create account
          </button>
        </p>
      </div>
    </div>
  );
}

function RegisterForm({ onSwitch }: { onSwitch: () => void }) {
  const router = useRouter();
  const { register } = useCustomerAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showCp, setShowCp] = useState(false);
  const [form, setForm] = useState({
    email: "", password: "", confirmPassword: "",
    first_name: "", last_name: "", phone: "", acceptTerms: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function set(f: string, v: any) {
    setForm((p) => ({ ...p, [f]: v }));
    if (errors[f]) setErrors((p) => ({ ...p, [f]: "" }));
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.first_name) e.first_name = "Required";
    if (!form.last_name) e.last_name = "Required";
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Valid email required";
    if (!form.phone || !/^[+]?[\d\s-]{10,}$/.test(form.phone)) e.phone = "Valid phone required";
    if (!form.password || form.password.length < 8) e.password = "Min 8 characters";
    if (form.password !== form.confirmPassword) e.confirmPassword = "Passwords don't match";
    if (!form.acceptTerms) e.acceptTerms = "You must accept the terms";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) { toast.error("Please fix the errors below"); return; }
    setLoading(true);
    try {
      await register({ email: form.email, password: form.password, first_name: form.first_name, last_name: form.last_name, phone: form.phone });
      setSuccess(true);
      toast.success("Welcome to Pratipal!");
      setTimeout(() => router.push("/"), 600);
    } catch (err: any) {
      toast.error(err.message || "Registration failed");
      setLoading(false);
    }
  }

  return (
    <div style={{ transition: "opacity 0.5s, transform 0.5s", opacity: success ? 0 : 1, transform: success ? "scale(0.95) translateY(16px)" : "scale(1) translateY(0)" }}>
      <div className="space-y-1.5 mb-6">
        <h1 className="text-3xl text-[#1b244a] font-cormorant" style={{ fontWeight: 600 }}>
          Create account
        </h1>
        <p className="text-sm text-gray-500">Join thousands of families on their healing journey</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div className="grid grid-cols-2 gap-3">
          <Field label="First name" error={errors.first_name}>
            <input value={form.first_name} onChange={(e) => set("first_name", e.target.value)} placeholder="Jane" className={inputCls(errors.first_name)} />
          </Field>
          <Field label="Last name" error={errors.last_name}>
            <input value={form.last_name} onChange={(e) => set("last_name", e.target.value)} placeholder="Doe" className={inputCls(errors.last_name)} />
          </Field>
        </div>

        <Field label="Email address" error={errors.email}>
          <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="you@example.com" className={inputCls(errors.email)} />
        </Field>

        <Field label="Phone number" error={errors.phone}>
          <input type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+91 98765 43210" className={inputCls(errors.phone)} />
        </Field>

        <Field label="Password" error={errors.password} hint="Min 8 characters">
          <div className="relative">
            <input type={showPw ? "text" : "password"} value={form.password} onChange={(e) => set("password", e.target.value)} placeholder="••••••••" className={inputCls(errors.password) + " pr-11"} />
            <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </Field>

        <Field label="Confirm password" error={errors.confirmPassword}>
          <div className="relative">
            <input type={showCp ? "text" : "password"} value={form.confirmPassword} onChange={(e) => set("confirmPassword", e.target.value)} placeholder="••••••••" className={inputCls(errors.confirmPassword) + " pr-11"} />
            <button type="button" onClick={() => setShowCp(!showCp)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
              {showCp ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </Field>

        <div className="space-y-1">
          <div className="flex items-start gap-2.5">
            <input type="checkbox" id="terms" checked={form.acceptTerms} onChange={(e) => set("acceptTerms", e.target.checked)} className="mt-0.5 w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-400 cursor-pointer" />
            <label htmlFor="terms" className="text-sm text-gray-600 cursor-pointer leading-snug">
              I agree to the{" "}
              <Link href="/terms" className="text-emerald-600 hover:underline font-medium">Terms</Link>
              {" "}and{" "}
              <Link href="/privacy" className="text-emerald-600 hover:underline font-medium">Privacy Policy</Link>
            </label>
          </div>
          {errors.acceptTerms && <p className="text-xs text-red-500 pl-6">{errors.acceptTerms}</p>}
        </div>

        <button
          type="submit"
          disabled={loading || success}
          className="w-full h-11 flex items-center justify-center gap-2 font-semibold text-sm rounded-xl transition-all duration-300 disabled:cursor-not-allowed mt-1 text-white"
          style={{ background: success ? "#059669" : loading ? "#374151" : "linear-gradient(135deg, #1b244a 0%, #059669 100%)" }}
        >
          {loading ? (
            <><span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Creating account...</>
          ) : success ? (
            <><CheckCircle2 className="h-4 w-4" />Account created!</>
          ) : (
            <>Create Account <ArrowRight className="h-4 w-4" /></>
          )}
        </button>
      </form>

      <div className="mt-5 text-center">
        <p className="text-sm text-gray-500">
          Already have an account?{" "}
          <button onClick={onSwitch} className="font-semibold text-emerald-600 hover:text-emerald-700 hover:underline transition-colors">
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}

function AuthPageContent() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";
  const [mode, setMode] = useState<"login" | "register">("login");
  const [visible, setVisible] = useState(true);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    const m = searchParams.get("mode");
    if (m === "register") setMode("register");
  }, [searchParams]);

  function switchMode(next: "login" | "register") {
    if (animating || mode === next) return;
    setAnimating(true);
    setVisible(false);
    setTimeout(() => {
      setMode(next);
      setVisible(true);
      setAnimating(false);
    }, 300);
  }

  const isLogin = mode === "login";

  return (
    <div className="min-h-screen flex overflow-hidden">
      {/* ── Left decorative panel ── */}
      <div
        className="hidden lg:flex lg:w-[45%] flex-col justify-between p-12 pt-[90px] relative overflow-hidden flex-shrink-0"
        style={{
          transition: "background 0.8s ease",
          background: isLogin
            ? "linear-gradient(145deg, #0f172a 0%, #1b244a 45%, #0d3d2e 100%)"
            : "linear-gradient(145deg, #0d3d2e 0%, #1b244a 45%, #0f172a 100%)",
        }}
      >
        {/* Animated blobs */}
        <div
          className="absolute rounded-full opacity-15 pointer-events-none"
          style={{
            width: 420, height: 420,
            top: isLogin ? -80 : -40,
            left: isLogin ? -80 : -120,
            background: "radial-gradient(circle, #6ee7b7, transparent)",
            transition: "all 1s ease",
          }}
        />
        <div
          className="absolute rounded-full opacity-10 pointer-events-none"
          style={{
            width: 500, height: 500,
            bottom: isLogin ? -120 : -80,
            right: isLogin ? -60 : -100,
            background: "radial-gradient(circle, #3b82f6, transparent)",
            transition: "all 1s ease",
          }}
        />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-emerald-400/20 border border-emerald-400/30 flex items-center justify-center">
            <Leaf className="h-4 w-4 text-emerald-300" />
          </div>
          <span className="text-white font-semibold tracking-wide">Pratipal</span>
        </div>

        {/* Content — fades on switch */}
        <div
          className="relative z-10 space-y-6"
          style={{
            transition: "opacity 0.4s, transform 0.4s",
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(20px)",
          }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full border border-white/20">
            <Sparkles className="h-3.5 w-3.5 text-emerald-300" />
            <span className="text-xs text-white/80 font-medium tracking-wide">
              {isLogin ? "Wellness & Healing" : "Join Our Community"}
            </span>
          </div>

          <h2
            className="text-4xl xl:text-5xl text-white leading-tight font-cormorant"
            style={{ fontWeight: 600 }}
          >
            {isLogin ? (
              <>Welcome<br /><span className="text-emerald-300">back</span></>
            ) : (
              <>Begin your<br /><span className="text-emerald-300">journey</span></>
            )}
          </h2>

          <p className="text-white/55 text-sm leading-relaxed max-w-xs">
            {isLogin
              ? "Sign in to access your wellness products, healing sessions, and transformative courses."
              : "Create your account and unlock a world of holistic healing, authentic products, and transformative experiences."}
          </p>

          {isLogin ? (
            <div className="grid grid-cols-3 gap-3 pt-1">
              {STATS.map(({ v, l }) => (
                <div key={l} className="bg-white/5 border border-white/10 rounded-xl p-3 text-center backdrop-blur-sm">
                  <p className="text-white font-bold text-sm">{v}</p>
                  <p className="text-white/40 text-[10px] uppercase tracking-wider mt-0.5">{l}</p>
                </div>
              ))}
            </div>
          ) : (
            <ul className="space-y-3">
              {PERKS.map((p) => (
                <li key={p} className="flex items-center gap-2.5 text-sm text-white/70">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                  {p}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Bottom switch prompt */}
        <div className="relative z-10 space-y-3">
          <p className="text-white/40 text-xs">
            {isLogin ? "New to Pratipal?" : "Already have an account?"}
          </p>
          <button
            onClick={() => switchMode(isLogin ? "register" : "login")}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white text-sm font-medium transition-all duration-200"
          >
            {isLogin ? "Create account" : "Sign in"} <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* ── Right panel — form ── */}
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50/30 overflow-y-auto">
        <div className="w-full max-w-md px-6 sm:px-10 py-10 pt-[130px] lg:pt-[100px]">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center">
              <Leaf className="h-3.5 w-3.5 text-emerald-600" />
            </div>
            <span className="font-semibold text-gray-800 text-sm">Pratipal</span>
          </div>

          {/* Mobile tab switcher */}
          <div className="lg:hidden flex rounded-xl bg-gray-100 p-1 mb-7">
            {(["login", "register"] as const).map((m) => (
              <button
                key={m}
                onClick={() => switchMode(m)}
                className="flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-200"
                style={{
                  background: mode === m ? "white" : "transparent",
                  color: mode === m ? "#1b244a" : "#6b7280",
                  boxShadow: mode === m ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                }}
              >
                {m === "login" ? "Sign In" : "Register"}
              </button>
            ))}
          </div>

          {/* Animated form container */}
          <div
            style={{
              transition: "opacity 0.3s ease, transform 0.3s ease",
              opacity: visible ? 1 : 0,
              transform: visible
                ? "translateX(0) scale(1)"
                : `translateX(${isLogin ? "24px" : "-24px"}) scale(0.97)`,
            }}
          >
            {mode === "login"
              ? <LoginForm onSwitch={() => switchMode("register")} redirect={redirect} />
              : <RegisterForm onSwitch={() => switchMode("login")} />
            }
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="h-8 w-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <AuthPageContent />
    </Suspense>
  );
}
