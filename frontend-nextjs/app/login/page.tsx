"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Zap, Mail, Lock, Shield, Check, Star, Users, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/Toast";
import { useTheme } from "next-themes";
import * as React from "react";
import { apiFetch } from "@/lib/api";
import Link from "next/link";

export default function LoginPage() {
    const { login } = useAuth();
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    React.useEffect(() => { setMounted(true); }, []);
    if (!mounted) return null;

    const isLight = resolvedTheme === "light";

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = await apiFetch("/auth/login", {
                method: "POST",
                body: JSON.stringify({ email, password })
            });

            login(data.access_token, {
                user_id: data.user_id,
                name: data.name,
                role: data.role,
                vetting_badge: data.vetting_badge
            });

            toast("success", "Authentication Successful", `Welcome back, ${data.name}.`);
            router.push("/market");
        } catch (err: any) {
            toast("error", "Login Failed", err.message || "Invalid credentials.");
        } finally {
            setLoading(false);
        }
    };

    const features = [
        { icon: Shield, label: "MCA Verified Identity", sub: "Bank-grade vetting for high-trust interactions" },
        { icon: Users, label: "Founder-Only Network", sub: "Collaborate with the top 1% peer group" },
        { icon: Star, label: "Elite Mentorship", sub: "Direct access to Series B+ scaling playbooks" },
    ];

    return (
        <div
            className="min-h-screen w-full flex items-center justify-center"
            style={{ background: "var(--surface-0)" }}
        >
            {/* ── Atmospheric BG ── */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage: `radial-gradient(${isLight ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.035)"} 1px, transparent 1px)`,
                        backgroundSize: "28px 28px",
                    }}
                />
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full"
                    style={{ background: "radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 70%)", filter: "blur(80px)" }} />
                <div className="absolute bottom-[-20%] right-[-10%] w-[55%] h-[55%] rounded-full"
                    style={{ background: "radial-gradient(circle, rgba(34,211,238,0.14) 0%, transparent 70%)", filter: "blur(80px)" }} />
                <div className="absolute top-[40%] right-[15%] w-[30%] h-[30%] rounded-full"
                    style={{ background: "radial-gradient(circle, rgba(168,85,247,0.1) 0%, transparent 70%)", filter: "blur(60px)" }} />
            </div>

            {/* ── Page grid ── */}
            <div className="relative z-10 w-full max-w-[1080px] mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

                {/* ══ LEFT PANEL ══ */}
                <motion.div
                    className="hidden lg:flex flex-col gap-10"
                    initial={{ opacity: 0, x: -24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.55, ease: "easeOut" }}
                >
                    {/* Logo */}
                    <div className="flex items-center gap-3">
                        <div
                            className="w-11 h-11 rounded-[0.875rem] flex items-center justify-center shrink-0"
                            style={{
                                background: "linear-gradient(135deg, #7c3aed, #22d3ee)",
                                boxShadow: "0 0 28px rgba(124,58,237,0.5)",
                            }}
                        >
                            <Zap size={22} className="text-white" />
                        </div>
                        <span className="text-xl font-black text-[var(--text-primary)] tracking-tight">FounderHQ</span>
                    </div>

                    {/* Headline */}
                    <div>
                        <h2
                            className="font-black tracking-[-0.03em] text-[var(--text-primary)] mb-4"
                            style={{ fontSize: "clamp(2.8rem, 4.5vw, 4rem)", lineHeight: 1.06 }}
                        >
                            The Forge of<br />
                            <span className="text-grad-main">Indian Innovation.</span>
                        </h2>
                        <p className="text-[1.05rem] text-[var(--text-secondary)] font-medium leading-relaxed max-w-[380px]">
                            Access deep market intelligence, connect with elite mentors, and scale your vision from POC to IPO.
                        </p>
                    </div>

                    {/* Feature cards */}
                    <div className="flex flex-col gap-3">
                        {features.map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -16 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 + i * 0.1 }}
                                className="flex items-center gap-4 p-4 rounded-2xl border border-[var(--border-subtle)] backdrop-blur-sm transition-all duration-300 hover:border-violet-500/30"
                                style={{ background: isLight ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.03)" }}
                            >
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                                    style={{ background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.2)" }}>
                                    <item.icon size={17} className="text-violet-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-[var(--text-primary)] leading-tight">{item.label}</p>
                                    <p className="text-xs text-[var(--text-tertiary)] font-medium mt-0.5">{item.sub}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-0 pt-2 pb-2">
                        {[
                            { value: "10k+", label: "Founders" },
                            { value: "₹500Cr+", label: "Funding Pool" },
                            { value: "94%", label: "Satisfaction" },
                        ].map((stat, i) => (
                            <React.Fragment key={stat.label}>
                                {i > 0 && <div className="w-px h-9 bg-[var(--border-subtle)] mx-8" />}
                                <div>
                                    <p className="text-2xl font-black text-[var(--text-primary)] tracking-tight">{stat.value}</p>
                                    <p className="text-[10px] uppercase font-bold text-[var(--text-tertiary)] tracking-[0.18em] mt-0.5">{stat.label}</p>
                                </div>
                            </React.Fragment>
                        ))}
                    </div>
                </motion.div>

                {/* ══ RIGHT PANEL: Card ══ */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut", delay: 0.08 }}
                    className="w-full"
                >
                    {/* Mobile-only logo */}
                    <div className="flex lg:hidden items-center justify-center gap-3 mb-8">
                        <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
                            style={{ background: "linear-gradient(135deg,#7c3aed,#22d3ee)" }}>
                            <Zap size={20} className="text-white" />
                        </div>
                        <span className="text-xl font-black text-[var(--text-primary)]">FounderHQ</span>
                    </div>

                    {/* The card */}
                    <div
                        className="w-full rounded-[1.75rem] overflow-hidden"
                        style={{
                            background: isLight ? "rgba(255,255,255,0.9)" : "rgba(14,11,26,0.82)",
                            border: `1px solid ${isLight ? "rgba(0,0,0,0.07)" : "rgba(255,255,255,0.07)"}`,
                            boxShadow: isLight
                                ? "0 24px 60px -12px rgba(0,0,0,0.14)"
                                : "0 32px 72px -16px rgba(0,0,0,0.75), inset 0 1px 0 rgba(255,255,255,0.07)",
                            backdropFilter: "blur(24px)",
                        }}
                    >
                        {/* Rainbow top bar */}
                        <div className="h-[3px]" style={{ background: "linear-gradient(90deg, #7c3aed 0%, #a855f7 40%, #22d3ee 100%)" }} />

                        <div className="px-8 pt-9 pb-10 sm:px-12 sm:pt-11 sm:pb-12">

                            {/* Header */}
                            <div className="mb-9">
                                <h3 className="text-3xl font-black tracking-tight text-[var(--text-primary)] mb-2">
                                    Welcome Back
                                </h3>
                                <p className="text-[12px] font-bold uppercase tracking-[0.2em] text-[var(--text-tertiary)] opacity-80">
                                    Continue to your workspace
                                </p>
                            </div>

                            <form onSubmit={handleLogin} className="flex flex-col gap-6">

                                {/* ── Email ── */}
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[11px] font-bold uppercase tracking-[0.15em] text-[var(--text-tertiary)]">
                                        Email Address
                                    </label>
                                    <div className="relative flex items-center">
                                        <Mail
                                            size={15}
                                            className="absolute left-4 text-[var(--text-tertiary)] pointer-events-none shrink-0"
                                            style={{ top: "50%", transform: "translateY(-50%)" }}
                                        />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full rounded-xl text-sm font-medium text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] transition-all duration-200 focus:outline-none"
                                            style={{
                                                padding: "12px 16px 12px 42px",
                                                background: isLight ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.05)",
                                                border: `1px solid ${isLight ? "rgba(0,0,0,0.09)" : "rgba(255,255,255,0.09)"}`,
                                            }}
                                            onFocus={e => e.currentTarget.style.border = "1px solid rgba(124,58,237,0.5)"}
                                            onBlur={e => e.currentTarget.style.border = `1px solid ${isLight ? "rgba(0,0,0,0.09)" : "rgba(255,255,255,0.09)"}`}
                                            placeholder="gourav@founderhq.io"
                                        />
                                    </div>
                                </div>

                                {/* ── Password ── */}
                                <div className="flex flex-col gap-1.5">
                                    {/* Label row — label left, forgot right, same baseline */}
                                    <div className="flex items-center justify-between">
                                        <label className="text-[11px] font-bold uppercase tracking-[0.15em] text-[var(--text-tertiary)]">
                                            Password
                                        </label>
                                        <button
                                            type="button"
                                            className="text-[11px] font-bold uppercase tracking-[0.1em] text-violet-500 hover:text-violet-400 transition-colors"
                                        >
                                            Forgot Password?
                                        </button>
                                    </div>
                                    <div className="relative flex items-center">
                                        <Lock
                                            size={15}
                                            className="absolute left-4 text-[var(--text-tertiary)] pointer-events-none shrink-0"
                                            style={{ top: "50%", transform: "translateY(-50%)" }}
                                        />
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full rounded-xl text-sm font-medium text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] transition-all duration-200 focus:outline-none"
                                            style={{
                                                padding: "12px 16px 12px 42px",
                                                background: isLight ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.05)",
                                                border: `1px solid ${isLight ? "rgba(0,0,0,0.09)" : "rgba(255,255,255,0.09)"}`,
                                                letterSpacing: "0.15em",
                                            }}
                                            onFocus={e => e.currentTarget.style.border = "1px solid rgba(124,58,237,0.5)"}
                                            onBlur={e => e.currentTarget.style.border = `1px solid ${isLight ? "rgba(0,0,0,0.09)" : "rgba(255,255,255,0.09)"}`}
                                            placeholder="••••••••••••"
                                        />
                                    </div>
                                </div>

                                {/* ── Remember me ── */}
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-5 h-5 rounded-md flex items-center justify-center shrink-0"
                                        style={{
                                            background: "linear-gradient(135deg,#7c3aed,#a855f7)",
                                            boxShadow: "0 0 12px rgba(124,58,237,0.4)",
                                        }}
                                    >
                                        <Check size={11} className="text-white" strokeWidth={3.5} />
                                    </div>
                                    <span className="text-sm font-medium text-[var(--text-secondary)]">Keep me signed in</span>
                                </div>

                                {/* ── Submit ── */}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="relative w-full rounded-xl font-black text-sm uppercase tracking-[0.2em] text-white overflow-hidden transition-all duration-200 disabled:opacity-60 active:scale-[0.99]"
                                    style={{
                                        padding: "15px 24px",
                                        background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)",
                                        boxShadow: loading ? "none" : "0 8px 28px rgba(124,58,237,0.4), 0 2px 8px rgba(0,0,0,0.2)",
                                    }}
                                    onMouseEnter={e => !loading && (e.currentTarget.style.boxShadow = "0 12px 36px rgba(124,58,237,0.55), 0 2px 8px rgba(0,0,0,0.2)")}
                                    onMouseLeave={e => !loading && (e.currentTarget.style.boxShadow = "0 8px 28px rgba(124,58,237,0.4), 0 2px 8px rgba(0,0,0,0.2)")}
                                >
                                    <span className="relative z-10 flex items-center justify-center gap-2.5">
                                        {loading ? (
                                            <>
                                                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                                </svg>
                                                Authenticating...
                                            </>
                                        ) : (
                                            <>Sign In <ArrowRight size={15} /></>
                                        )}
                                    </span>
                                    {/* Shimmer sweep */}
                                    <div className="absolute inset-0 -translate-x-full hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
                                </button>
                            </form>

                            {/* Footer */}
                            <div className="mt-10 pt-8 border-t border-[var(--border-subtle)] text-center">
                                <p className="text-sm text-[var(--text-tertiary)] font-medium">
                                    Don't have an account? <Link href="/register" className="text-violet-500 font-bold hover:text-violet-400 transition-colors ml-1">Sign Up</Link>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Trust line */}
                    <div className="mt-4 flex items-center justify-center gap-2">
                        <Shield size={12} className="text-emerald-500 shrink-0" />
                        <span className="text-xs font-semibold text-[var(--text-tertiary)]">
                            256-bit encrypted · SOC2 compliant · MCA verified
                        </span>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}