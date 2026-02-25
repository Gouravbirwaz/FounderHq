"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Zap, Mail, Lock, Shield, Star, Users, User, Check, ArrowRight, Phone } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/Toast";
import { useTheme } from "next-themes";
import Link from "next/link";
import * as React from "react";
import { apiFetch } from "@/lib/api";

export default function RegisterPage() {
    const { login } = useAuth();
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);
    const [role, setRole] = useState("founder");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [password, setPassword] = useState("");
    const [agreed, setAgreed] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    React.useEffect(() => { setMounted(true); }, []);
    if (!mounted) return null;

    const isLight = resolvedTheme === "light";

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!agreed) {
            toast("error", "Action Required", "Please agree to the terms and conditions.");
            return;
        }
        setLoading(true);
        try {
            const data = await apiFetch("/auth/register", {
                method: "POST",
                body: JSON.stringify({ name, email, phone_number: phoneNumber, password, role })
            });

            login(data.access_token, {
                user_id: data.user_id,
                name: data.name,
                role: data.role,
                vetting_badge: data.vetting_badge
            });

            toast("success", "Account Created", `Welcome to FounderHQ, ${data.name}!`);
            router.push("/market");
        } catch (err: any) {
            toast("error", "Registration Failed", err.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    const features = [
        { icon: Shield, label: "MCA Verified Identity", sub: "Bank-grade vetting for high-trust interactions" },
        { icon: Users, label: "Founder-Only Network", sub: "Collaborate with the top 1% peer group" },
        { icon: Star, label: "Elite Mentorship", sub: "Direct access to Series B+ scaling playbooks" },
    ];

    const inputStyle = (isLight: boolean): React.CSSProperties => ({
        padding: "12px 16px 12px 42px",
        background: isLight ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.05)",
        border: `1px solid ${isLight ? "rgba(0,0,0,0.09)" : "rgba(255,255,255,0.09)"}`,
        width: "100%",
        borderRadius: "0.75rem",
        fontSize: "0.875rem",
        fontWeight: 500,
        color: "var(--text-primary)",
        outline: "none",
        transition: "border 0.2s",
    });

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
        e.currentTarget.style.border = "1px solid rgba(124,58,237,0.5)";
    };
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>, isLight: boolean) => {
        e.currentTarget.style.border = `1px solid ${isLight ? "rgba(0,0,0,0.09)" : "rgba(255,255,255,0.09)"}`;
    };

    return (
        <div
            className="min-h-screen w-full flex items-center justify-center"
            style={{ background: "var(--surface-0)" }}
        >
            {/* ── Background ── */}
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

            {/* ── Layout ── */}
            <div className="relative z-10 w-full max-w-[1080px] mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

                {/* ══ LEFT: Branding ══ */}
                <motion.div
                    className="hidden lg:flex flex-col gap-10"
                    initial={{ opacity: 0, x: -24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.55, ease: "easeOut" }}
                >
                    {/* Logo */}
                    <Link href="/login" className="flex items-center gap-3 w-fit hover:opacity-80 transition-opacity">
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
                    </Link>

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
                                <div
                                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                                    style={{ background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.2)" }}
                                >
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
                    <div className="flex items-center gap-0 pt-2">
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

                {/* ══ RIGHT: Register card ══ */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut", delay: 0.08 }}
                    className="w-full"
                >
                    {/* Mobile logo */}
                    <div className="flex lg:hidden items-center justify-center gap-3 mb-8">
                        <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
                            style={{ background: "linear-gradient(135deg,#7c3aed,#22d3ee)" }}>
                            <Zap size={20} className="text-white" />
                        </div>
                        <span className="text-xl font-black text-[var(--text-primary)]">FounderHQ</span>
                    </div>

                    {/* Card */}
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
                        {/* Accent bar */}
                        <div className="h-[3px]" style={{ background: "linear-gradient(90deg, #7c3aed 0%, #a855f7 40%, #22d3ee 100%)" }} />

                        <div className="px-8 pt-9 pb-10 sm:px-12 sm:pt-11 sm:pb-12">

                            {/* Header */}
                            <div className="mb-9">
                                <h3 className="text-3xl font-black tracking-tight text-[var(--text-primary)] mb-2">
                                    Establish Identity
                                </h3>
                                <p className="text-[12px] font-bold uppercase tracking-[0.2em] text-[var(--text-tertiary)] opacity-80">
                                    Join the FounderHQ collective
                                </p>
                            </div>

                            <form onSubmit={handleRegister} className="flex flex-col gap-6">

                                {/* Role Selection */}
                                <div className="flex flex-col gap-3.5 mb-2">
                                    <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--text-tertiary)] ml-1">
                                        Select Your Identity
                                    </label>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                                        {["founder", "student", "mentor", "investor"].map((r) => (
                                            <button
                                                key={r}
                                                type="button"
                                                onClick={() => setRole(r)}
                                                className={`px-3 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 border ${role === r
                                                    ? "bg-violet-600 border-violet-500 text-white shadow-[0_0_20px_rgba(124,58,237,0.45)] scale-[1.02]"
                                                    : "bg-[var(--surface-2)] border-[var(--border-subtle)] text-[var(--text-tertiary)] hover:border-[var(--text-secondary)] hover:bg-[var(--surface-3)]"
                                                    }`}
                                            >
                                                {r}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Full Name */}
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[11px] font-bold uppercase tracking-[0.15em] text-[var(--text-tertiary)]">
                                        Full Name
                                    </label>
                                    <div className="relative flex items-center">
                                        <User
                                            size={15}
                                            className="absolute left-4 text-[var(--text-tertiary)] pointer-events-none shrink-0"
                                            style={{ top: "50%", transform: "translateY(-50%)" }}
                                        />
                                        <input
                                            type="text"
                                            required
                                            value={name}
                                            onChange={e => setName(e.target.value)}
                                            style={inputStyle(isLight)}
                                            onFocus={handleFocus}
                                            onBlur={e => handleBlur(e, isLight)}
                                            placeholder="Gourav Kumar"
                                        />
                                    </div>
                                </div>

                                {/* Email */}
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
                                            required
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            style={inputStyle(isLight)}
                                            onFocus={handleFocus}
                                            onBlur={e => handleBlur(e, isLight)}
                                            placeholder="gourav@founderhq.io"
                                        />
                                    </div>
                                </div>

                                {/* Phone Number */}
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[11px] font-bold uppercase tracking-[0.15em] text-[var(--text-tertiary)]">
                                        Phone Number
                                    </label>
                                    <div className="relative flex items-center">
                                        <Phone
                                            size={15}
                                            className="absolute left-4 text-[var(--text-tertiary)] pointer-events-none shrink-0"
                                            style={{ top: "50%", transform: "translateY(-50%)" }}
                                        />
                                        <input
                                            type="tel"
                                            required
                                            value={phoneNumber}
                                            onChange={e => setPhoneNumber(e.target.value)}
                                            style={inputStyle(isLight)}
                                            onFocus={handleFocus}
                                            onBlur={e => handleBlur(e, isLight)}
                                            placeholder="+91 98765 43210"
                                        />
                                    </div>
                                </div>

                                {/* Password */}
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[11px] font-bold uppercase tracking-[0.15em] text-[var(--text-tertiary)]">
                                        Password
                                    </label>
                                    <div className="relative flex items-center">
                                        <Lock
                                            size={15}
                                            className="absolute left-4 text-[var(--text-tertiary)] pointer-events-none shrink-0"
                                            style={{ top: "50%", transform: "translateY(-50%)" }}
                                        />
                                        <input
                                            type="password"
                                            required
                                            value={password}
                                            onChange={e => setPassword(e.target.value)}
                                            style={{ ...inputStyle(isLight), letterSpacing: "0.15em" }}
                                            onFocus={handleFocus}
                                            onBlur={e => handleBlur(e, isLight)}
                                            placeholder="••••••••••••"
                                        />
                                    </div>
                                </div>

                                {/* Terms checkbox */}
                                <button
                                    type="button"
                                    onClick={() => setAgreed(!agreed)}
                                    className="flex items-center gap-3 w-fit"
                                >
                                    <div
                                        className="w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-all duration-200"
                                        style={{
                                            background: agreed ? "linear-gradient(135deg,#7c3aed,#a855f7)" : "transparent",
                                            border: agreed ? "none" : `1.5px solid ${isLight ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.2)"}`,
                                            boxShadow: agreed ? "0 0 12px rgba(124,58,237,0.4)" : "none",
                                        }}
                                    >
                                        {agreed && <Check size={11} className="text-white" strokeWidth={3.5} />}
                                    </div>
                                    <span className="text-sm font-medium text-[var(--text-secondary)] text-left">
                                        I agree to the{" "}
                                        <span className="text-violet-500 font-bold">Terms of Service</span>
                                    </span>
                                </button>

                                {/* Submit */}
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
                                                Creating Account...
                                            </>
                                        ) : (
                                            <>Register Identity <ArrowRight size={15} /></>
                                        )}
                                    </span>
                                    <div className="absolute inset-0 -translate-x-full hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
                                </button>
                            </form>

                            {/* Footer */}
                            <div
                                className="mt-7 pt-6 border-t flex items-center justify-center gap-1.5 text-sm"
                                style={{ borderColor: isLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.06)" }}
                            >
                                <span className="text-[var(--text-tertiary)] font-medium">Already registered?</span>
                                <Link href="/login" className="font-bold text-violet-500 hover:text-violet-400 transition-colors ml-0.5">
                                    Sign In
                                </Link>
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