"use client";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { GlassCard } from "@/components/ui/GlassCard";
import { ShieldBadge } from "@/components/ui/ShieldBadge";
import { useAuth } from "@/hooks/useAuth";
import { toast, ToastProvider } from "@/components/ui/Toast";
import { NeonButton } from "@/components/ui/NeonButton";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    LogOut, Edit3, User, Shield,
    Calendar, MapPin, Hash,
    Award, Activity, Settings, ExternalLink,
    CheckCircle2, Hexagon
} from "lucide-react";

const ROLE_GRADIENTS: Record<string, string> = {
    founder: "linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%)",
    investor: "linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)",
    student: "linear-gradient(135deg, #22d3ee 0%, #3b82f6 100%)",
    mentor: "linear-gradient(135deg, #34d399 0%, #059669 100%)",
};

const ROLE_COLORS: Record<string, string> = {
    founder: "#8b5cf6",
    investor: "#f59e0b",
    student: "#22d3ee",
    mentor: "#34d399",
};

import { useTheme } from "next-themes";
import * as React from "react";

export default function ProfilePage() {
    const { user, logout } = useAuth();
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);
    const router = useRouter();

    React.useEffect(() => { setMounted(true); }, []);

    const handleLogout = () => {
        logout();
        toast("info", "Signed Out", "See you soon!");
        setTimeout(() => router.push("/login"), 800);
    };

    if (!mounted) return null;

    if (!user) {
        return (
            <DashboardLayout>
                <div className="flex flex-col items-center justify-center h-[64vh]">
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                        <GlassCard className="text-center" style={{ padding: 48, maxWidth: 440 }}>
                            <div className="w-20 h-20 mx-auto bg-black/[0.03] dark:bg-white/[0.03] border border-black/5 dark:border-white/5 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
                                <User size={40} className="text-[var(--text-tertiary)]" />
                            </div>
                            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">Access Restricted</h2>
                            <p className="text-[var(--text-secondary)] mb-8 text-sm leading-relaxed">You must be signed in to view and manage your identity profile.</p>
                            <NeonButton className="w-full" onClick={() => router.push("/login")}>Proceed to Sign In</NeonButton>
                        </GlassCard>
                    </motion.div>
                </div>
            </DashboardLayout>
        );
    }

    const isLight = resolvedTheme === "light";
    const clr = ROLE_COLORS[user.role] ?? "#8b5cf6";
    const clrGrad = ROLE_GRADIENTS[user.role] ?? ROLE_GRADIENTS.founder;

    // How tall the avatar is — half of this overhangs the banner
    const AVATAR = 128; // px
    const OVERHANG = AVATAR / 2; // 64px pulled up into banner

    return (
        <DashboardLayout>
            <ToastProvider />

            {/* ── Page background ── */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
                <div className="absolute inset-0 bg-[var(--surface-0)]" />
                <div className="absolute inset-0 opacity-40" style={{
                    backgroundImage: `radial-gradient(circle at 2px 2px, ${isLight ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.06)"} 1px, transparent 0)`,
                    backgroundSize: "40px 40px",
                }} />
                <motion.div
                    animate={{ scale: [1, 1.05, 1], opacity: isLight ? [0.08, 0.12, 0.08] : [0.15, 0.25, 0.15] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                    style={{ position: "absolute", top: "-10%", right: "-5%", width: 700, height: 700, borderRadius: "50%", background: `radial-gradient(circle, ${clr}40 0%, transparent 70%)`, filter: "blur(90px)" }}
                />
                <motion.div
                    animate={{ scale: [1, 1.1, 1], opacity: isLight ? [0.05, 0.08, 0.05] : [0.1, 0.2, 0.1] }}
                    transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                    style={{ position: "absolute", bottom: "-20%", left: "-10%", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(34,211,238,0.15) 0%, transparent 70%)", filter: "blur(100px)" }}
                />
            </div>

            <div className="relative z-10 max-w-[900px] mx-auto pb-20 pt-8 px-4 sm:px-0 space-y-8">

                {/* ── Page header ── */}

                {/* ── Profile card ── */}
                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, type: "spring", bounce: 0.3 }}>
                    <div
                        className="rounded-[2rem] border border-[var(--border-subtle)] overflow-hidden"
                        style={{
                            backgroundColor: "var(--surface-1)",
                            boxShadow: isLight ? "0 20px 50px -12px rgba(0,0,0,0.1)" : "0 30px 60px -15px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.07)",
                        }}
                    >
                        {/* ── Banner — does NOT contain the avatar ── */}
                        <div className="relative h-36 sm:h-44 overflow-hidden" style={{ marginBottom: -OVERHANG }}>
                            <div className="absolute inset-0" style={{ background: clrGrad, opacity: isLight ? 0.65 : 0.85 }} />
                            <div className="absolute inset-0 opacity-[0.12]" style={{
                                backgroundImage: "repeating-linear-gradient(45deg,#000 0,#000 1px,transparent 0,transparent 50%)",
                                backgroundSize: "12px 12px",
                            }} />
                            {/* Bottom fade so the avatar area blends into card surface */}
                            <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[var(--surface-1)] to-transparent" />
                            <motion.div animate={{ rotate: 360 }} transition={{ duration: 180, repeat: Infinity, ease: "linear" }}
                                className="absolute -top-40 -right-40 w-[30rem] h-[30rem] border border-white/10 rounded-full opacity-25 pointer-events-none" />
                            <motion.div animate={{ rotate: -360 }} transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
                                className="absolute -top-20 -right-20 w-[20rem] h-[20rem] border border-white/10 rounded-full opacity-25 pointer-events-none" />
                        </div>

                        {/*
                            ── Profile row ──
                            Uses padding-top = OVERHANG so the content starts exactly
                            where the banner ends. The avatar sits at the top of this
                            section and visually overlaps the banner via z-index,
                            with no negative margins or nested absolutes.
                        */}
                        <div
                            className="relative z-10 px-6 sm:px-10 pb-8"
                            style={{ paddingTop: OVERHANG + 16 }}
                        >
                            {/* Row: avatar  |  name+meta  |  buttons */}
                            <div className="flex flex-col sm:flex-row sm:items-end gap-5 sm:gap-6">

                                {/* Avatar — pulled up by its own height to straddle the seam */}
                                <div
                                    className="relative shrink-0 self-center sm:self-auto"
                                    style={{ marginTop: -(AVATAR + 16) }}
                                >
                                    {/* Outer ring */}
                                    <div
                                        style={{
                                            width: AVATAR,
                                            height: AVATAR,
                                            borderRadius: "1.6rem",
                                            padding: "3px",
                                            background: "linear-gradient(135deg, rgba(255,255,255,0.4), rgba(255,255,255,0.06))",
                                            boxShadow: "0 12px 40px rgba(0,0,0,0.55)",
                                        }}
                                    >
                                        <div
                                            className="relative w-full h-full flex items-center justify-center overflow-hidden group"
                                            style={{ borderRadius: "calc(1.6rem - 3px)", background: clrGrad }}
                                        >
                                            <div className="absolute inset-0 bg-black/10 group-hover:opacity-0 transition-opacity duration-500" />
                                            <span className="relative z-10 font-black text-white select-none drop-shadow-lg" style={{ fontSize: 52 }}>
                                                {user.name[0]?.toUpperCase()}
                                            </span>
                                        </div>
                                    </div>
                                    {/* Online dot */}
                                    <div
                                        className="absolute -bottom-2 -right-2 w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center border-[3.5px] z-20"
                                        style={{ borderColor: "var(--surface-1)", boxShadow: "0 0 18px rgba(16,185,129,0.65)" }}
                                    >
                                        <CheckCircle2 size={17} className="text-white" />
                                    </div>
                                </div>

                                {/* Name + meta */}
                                <div className="flex-1 min-w-0 text-center sm:text-left pb-1">
                                    <div className="flex items-center justify-center sm:justify-start gap-3 mb-2.5 flex-wrap">
                                        <h2 className="text-2xl sm:text-[1.85rem] font-extrabold text-[var(--text-primary)] tracking-tight leading-none">
                                            {user.name}
                                        </h2>
                                        {user.vetting_badge && (
                                            <span className="shrink-0 drop-shadow-md">
                                                <ShieldBadge verified={user.vetting_badge} size={24} />
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                                        <span
                                            className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-[0.1em]"
                                            style={{
                                                background: isLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.1)",
                                                border: `1px solid ${isLight ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.15)"}`,
                                                color: isLight ? "var(--text-primary)" : "white",
                                            }}
                                        >
                                            {user.role}
                                        </span>
                                        <span className="flex items-center gap-1.5 text-sm font-medium text-[var(--text-secondary)] bg-black/5 dark:bg-black/30 px-3 py-1 rounded-full border border-[var(--border-subtle)]">
                                            <MapPin size={13} className="text-[var(--text-tertiary)] shrink-0" />
                                            Bengaluru, IN
                                        </span>
                                    </div>
                                </div>

                                {/* Buttons */}
                                <div className="flex items-center gap-3 shrink-0 justify-center sm:justify-end pb-1">
                                    <NeonButton variant="secondary" className="h-10 px-5 text-sm gap-2 whitespace-nowrap">
                                        <Edit3 size={15} /> Edit Profile
                                    </NeonButton>
                                    <NeonButton variant="danger" onClick={handleLogout} className="h-10 px-5 text-sm gap-2 whitespace-nowrap">
                                        <LogOut size={15} /> Logout
                                    </NeonButton>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* ── Info grid ── */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Core Identity */}
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2, duration: 0.5 }} className="h-full">
                        <div className="h-full rounded-[2rem] p-8 border border-[var(--border-subtle)] backdrop-blur-2xl relative overflow-hidden group hover:border-[var(--text-tertiary)] transition-all duration-500 shadow-xl"
                            style={{ backgroundColor: "var(--surface-1)" }}>
                            <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity duration-700 pointer-events-none select-none">
                                <Hexagon size={150} className="text-[var(--text-primary)]" strokeWidth={0.5} />
                            </div>
                            <div className="flex items-center gap-4 mb-8 relative z-10">
                                <div className="w-12 h-12 rounded-[1rem] bg-black/5 dark:bg-white/[0.03] border border-[var(--border-subtle)] flex items-center justify-center shadow-inner shrink-0">
                                    <User size={20} className="text-[var(--text-secondary)]" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-[0.2em] mb-1">Section</p>
                                    <h2 className="text-xl font-bold text-[var(--text-primary)] tracking-tight leading-none">Core Identity</h2>
                                </div>
                            </div>
                            <div className="space-y-3 relative z-10">
                                {[
                                    { label: "Full Legal Name", value: user.name, icon: User, mono: false },
                                    { label: "Unique ID", value: user.user_id, icon: Hash, mono: true },
                                    { label: "Member Since", value: "Feb 2024", icon: Calendar, mono: false },
                                ].map((item) => (
                                    <div key={item.label} className="flex items-center gap-3 p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.015] border border-[var(--border-subtle)] hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-all duration-300">
                                        <div className="w-9 h-9 rounded-full bg-black/5 dark:bg-black/20 flex items-center justify-center border border-[var(--border-subtle)] shrink-0">
                                            <item.icon size={14} className="text-[var(--text-tertiary)]" />
                                        </div>
                                        <span className="text-sm font-medium text-[var(--text-secondary)] w-[120px] shrink-0 truncate">
                                            {item.label}
                                        </span>
                                        <div className="flex-1 flex justify-end min-w-0">
                                            {item.mono ? (
                                                <span className="text-xs font-mono text-[var(--text-primary)] bg-black/5 dark:bg-black/50 px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] shadow-inner truncate max-w-full">
                                                    {item.value}
                                                </span>
                                            ) : (
                                                <span className="text-sm font-semibold text-[var(--text-primary)] truncate">{item.value}</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    {/* Trust & Vetting */}
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3, duration: 0.5 }} className="h-full">
                        <div className="h-full rounded-[2rem] p-8 border border-[var(--border-subtle)] backdrop-blur-2xl relative overflow-hidden group hover:border-[var(--text-tertiary)] transition-all duration-500 shadow-xl"
                            style={{ backgroundColor: "var(--surface-1)" }}>
                            <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity duration-700 pointer-events-none select-none">
                                <Shield size={150} className="text-[var(--text-primary)]" strokeWidth={0.5} />
                            </div>
                            <div className="flex items-center gap-4 mb-8 relative z-10">
                                <div className="w-12 h-12 rounded-[1rem] bg-black/5 dark:bg-white/[0.03] border border-[var(--border-subtle)] flex items-center justify-center shadow-inner shrink-0">
                                    <Award size={20} className="text-[var(--text-secondary)]" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-[0.2em] mb-1">Status</p>
                                    <h2 className="text-xl font-bold text-[var(--text-primary)] tracking-tight leading-none">Trust & Vetting</h2>
                                </div>
                            </div>
                            <div className="space-y-4 relative z-10">
                                <div className={`relative p-5 rounded-[1.25rem] flex items-center justify-between gap-4 overflow-hidden border transition-all duration-500 ${user.vetting_badge ? "bg-emerald-500/10 border-emerald-500/30 hover:border-emerald-500/50" : "bg-[var(--surface-2)] border-[var(--border-subtle)]"}`}>
                                    {user.vetting_badge && <div className="absolute right-0 top-0 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />}
                                    <div className="relative z-10 min-w-0">
                                        <div className="flex items-center gap-2.5 mb-1">
                                            {user.vetting_badge && <ShieldBadge verified={true} size={16} />}
                                            <p className={`text-base font-extrabold tracking-tight truncate ${user.vetting_badge ? "text-emerald-600 dark:text-emerald-400" : "text-[var(--text-secondary)]"}`}>
                                                {user.vetting_badge ? "MCA Verified" : "Unverified Status"}
                                            </p>
                                        </div>
                                        <p className="text-[13px] text-[var(--text-tertiary)] font-medium">
                                            {user.vetting_badge ? "Official Gold Badge Holder" : "Connect your MCA record to unlock"}
                                        </p>
                                    </div>
                                    <div className="relative z-10 shrink-0">
                                        <div className={`w-11 h-11 rounded-full flex items-center justify-center border ${user.vetting_badge ? "bg-emerald-500/10 border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.25)]" : "bg-black/5 dark:bg-white/[0.05] border-[var(--border-subtle)]"}`}>
                                            <Award size={20} className={user.vetting_badge ? "text-emerald-500 dark:text-emerald-400" : "text-[var(--text-tertiary)]"} />
                                        </div>
                                    </div>
                                </div>

                                <div className="p-5 rounded-[1.25rem] bg-black/[0.015] dark:bg-white/[0.015] border border-[var(--border-subtle)] space-y-3">
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-2 shrink-0">
                                            <Shield size={14} className="text-[var(--text-tertiary)]" />
                                            <span className="text-sm font-medium text-[var(--text-secondary)] whitespace-nowrap">Security Clearance</span>
                                        </div>
                                        <span className="text-sm font-bold text-[var(--text-primary)] whitespace-nowrap">
                                            Level 2 <span className="text-[var(--text-tertiary)] font-normal">(Foundational)</span>
                                        </span>
                                    </div>
                                    <div className="w-full h-2.5 bg-black/5 dark:bg-black/50 rounded-full overflow-hidden border border-[var(--border-subtle)] shadow-inner">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: user.vetting_badge ? "100%" : "40%" }}
                                            transition={{ duration: 1.2, ease: "easeOut", delay: 0.4 }}
                                            className="h-full rounded-full relative overflow-hidden"
                                            style={{ background: user.vetting_badge ? "linear-gradient(90deg,#059669,#34d399)" : clrGrad }}
                                        >
                                            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "linear-gradient(45deg,rgba(255,255,255,0.2) 25%,transparent 25%,transparent 50%,rgba(255,255,255,0.2) 50%,rgba(255,255,255,0.2) 75%,transparent 75%,transparent)", backgroundSize: "1.5rem 1.5rem" }} />
                                        </motion.div>
                                    </div>
                                </div>

                                {!user.vetting_badge && (
                                    <NeonButton className="w-full py-3 text-sm font-bold gap-2" variant="primary">
                                        Complete Verification <ExternalLink size={14} />
                                    </NeonButton>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* ── Footer ── */}
                <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 pt-8 border-t border-[var(--border-subtle)]">
                    {[
                        { label: "Privacy Policy", icon: Settings },
                        { label: "Notification Preferences", icon: Activity },
                        { label: "API Configuration", icon: Hash },
                    ].map((item) => (
                        <a key={item.label} href="#"
                            className="group flex items-center gap-2 text-[12px] font-semibold tracking-wide text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-all duration-300 uppercase"
                        >
                            <div className="w-7 h-7 rounded-lg bg-[var(--surface-2)] flex items-center justify-center group-hover:bg-[var(--surface-3)] transition-colors border border-[var(--border-subtle)]">
                                <item.icon size={13} className="group-hover:scale-110 transition-transform" />
                            </div>
                            {item.label}
                        </a>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    );
} 