"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Eye, EyeOff, ArrowRight, ShieldCheck } from "lucide-react";
import { useAuth } from "@/lib/supabase/auth-context";
import LogoMark from "@/app/assets/logo.png";

export default function AdminLoginPage() {
  const router = useRouter();
  const { login, user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && user) {
      router.replace("/admin");
    }
  }, [user, authLoading, router]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (authLoading || user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="h-8 w-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await login(email, password);
    if (result.error) { setError(result.error); setLoading(false); return; }
    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex">
      {/* Left decorative panel */}
      <div
        className="hidden lg:flex lg:w-5/12 flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0f172a 0%, #1b244a 50%, #0d3d2e 100%)" }}
      >
        <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #6ee7b7, transparent)" }} />
        <div className="absolute -bottom-28 -right-12 w-[420px] h-[420px] rounded-full opacity-10" style={{ background: "radial-gradient(circle, #34d399, transparent)" }} />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="relative w-9 h-9">
            <Image src={LogoMark} alt="Pratipal" fill sizes="36px" className="object-contain" />
          </div>
          <span className="text-white font-semibold tracking-wide">Pratipal</span>
        </div>

        <div className="relative z-10 space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full border border-white/20">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-300" />
            <span className="text-xs text-white/80 font-medium">Secure Admin Access</span>
          </div>
          <h2 className="text-4xl text-white leading-tight font-cormorant" style={{ fontWeight: 600 }}>
            Manage your<br /><span className="text-emerald-300">store with ease</span>
          </h2>
          <p className="text-white/50 text-sm leading-relaxed max-w-xs">
            Access your dashboard to manage products, orders, courses, and customer data.
          </p>
          <div className="grid grid-cols-2 gap-3 pt-2">
            {[{ v: "Products", l: "Manage" }, { v: "Orders", l: "Track" }, { v: "Courses", l: "Publish" }, { v: "Analytics", l: "Review" }].map(({ v, l }) => (
              <div key={v} className="bg-white/5 border border-white/10 rounded-xl p-3">
                <p className="text-white font-semibold text-sm">{v}</p>
                <p className="text-white/40 text-[10px] uppercase tracking-wider">{l}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-white/25 text-xs">© {new Date().getFullYear()} Pratipal Admin Panel</p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 pt-[110px] lg:pt-10 bg-gray-50 overflow-y-auto">
        <div className="w-full max-w-sm space-y-8">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5">
            <div className="relative w-8 h-8">
              <Image src={LogoMark} alt="Pratipal" fill sizes="32px" className="object-contain" />
            </div>
            <span className="font-semibold text-gray-800">Pratipal</span>
          </div>

          <div className="space-y-1.5">
            <h1 className="text-3xl text-[#1b244a] font-cormorant" style={{ fontWeight: 600 }}>
              Admin sign in
            </h1>
            <p className="text-sm text-gray-500">Enter your credentials to access the dashboard</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                <ShieldCheck className="h-4 w-4 flex-shrink-0 mt-0.5 text-red-500" />
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700" htmlFor="email">Email address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@pratipal.in"
                required
                autoFocus
                className="w-full h-11 px-4 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400/40 focus:border-emerald-400 transition placeholder:text-gray-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700" htmlFor="password">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full h-11 px-4 pr-11 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400/40 focus:border-emerald-400 transition placeholder:text-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 flex items-center justify-center gap-2 font-semibold text-sm rounded-xl transition-all duration-300 disabled:cursor-not-allowed text-white"
              style={{ background: loading ? "#374151" : "linear-gradient(135deg, #1b244a 0%, #059669 100%)" }}
            >
              {loading ? (
                <><span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Signing in...</>
              ) : (
                <>Sign In <ArrowRight className="h-4 w-4" /></>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 flex items-center justify-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5" />
            Protected by industry-standard encryption
          </p>
        </div>
      </div>
    </div>
  );
}
