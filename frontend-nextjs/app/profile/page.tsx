"use client";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { GlassCard } from "@/components/ui/GlassCard";
import { ShieldBadge } from "@/components/ui/ShieldBadge";
import { useAuth } from "@/hooks/useAuth";
import { toast, ToastProvider } from "@/components/ui/Toast";
import { NeonButton } from "@/components/ui/NeonButton";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
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

export default function ProfilePage() {
    const { user, logout } = useAuth();
    const router = useRouter();

    const handleLogout = () => {
        logout();
        toast("info", "Signed Out", "See you soon!");
        setTimeout(() => router.push("/login"), 800);
    };

    if (!user) {
        return (
            <DashboardLayout>
                <div className="flex flex-col items-center justify-center h-[64vh]">
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                        <GlassCard className="text-center" style={{ padding: 48, maxWidth: 440 }}>
                            <div className="w-20 h-20 mx-auto bg-white/[0.03] border border-white/5 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
                                <User size={40} className="text-white/20" />
                            </div>
                            <h2 className="text-xl font-bold text-white mb-2">Access Restricted</h2>
                            <p className="text-white/40 mb-8 text-sm leading-relaxed">You must be signed in to view and manage your identity profile.</p>
                            <NeonButton className="w-full" onClick={() => router.push("/login")}>Proceed to Sign In</NeonButton>
                        </GlassCard>
                    </motion.div>
                </div>
            </DashboardLayout>
        );
    }

    const clr = ROLE_COLORS[user.role] ?? "#8b5cf6";
    const clrGrad = ROLE_GRADIENTS[user.role] ?? ROLE_GRADIENTS.founder;

    return (
        <DashboardLayout>
            <ToastProvider />

            {/* Redesigned Background Effects */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
                <div className="absolute inset-0 bg-[#06070a]" />
                <div className="absolute inset-0 opacity-40" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, rgba(255,255,255,0.06) 1px, transparent 0)", backgroundSize: "40px 40px" }} />

                <motion.div
                    animate={{ scale: [1, 1.05, 1], opacity: [0.15, 0.25, 0.15] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                    style={{ position: "absolute", top: "-10%", right: "-5%", width: 700, height: 700, borderRadius: "50%", background: `radial-gradient(circle, ${clr}40 0%, transparent 70%)`, filter: "blur(90px)" }}
                />
                <motion.div
                    animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.2, 0.1] }}
                    transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                    style={{ position: "absolute", bottom: "-20%", left: "-10%", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(34,211,238,0.15) 0%, transparent 70%)", filter: "blur(100px)" }}
                />
            </div>

            <div className="relative z-10 max-w-[900px] mx-auto space-y-10 pb-20 pt-8 px-5 sm:px-0">

                {/* Header */}
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex flex-col sm:flex-row sm:items-end justify-between gap-5">
                    <div>
                        <div className="flex items-center gap-3 mb-3">
                            <span className="flex h-2 w-2 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: clr }}></span>
                                <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: clr }}></span>
                            </span>
                            <span className="text-[11px] font-bold uppercase tracking-[0.25em]" style={{ color: clr }}>Administrative</span>
                        </div>
                        <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-white via-white/90 to-white/40 tracking-tight">
                            Identity Profile
                        </h1>
                    </div>
                    <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-md shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                        <Activity size={14} className="text-emerald-400" />
                        <span className="text-sm font-semibold text-emerald-400">System Online</span>
                    </div>
                </motion.div>

                {/* Main Profile Card - Redesigned */}
                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, type: "spring", bounce: 0.35 }}>
                    <div className="relative rounded-[2rem] overflow-hidden backdrop-blur-2xl border border-white/10 shadow-2xl" style={{ backgroundColor: "rgba(12, 13, 20, 0.8)", boxShadow: `0 30px 60px -15px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.1)` }}>
                        {/* Premium Abstract Banner */}
                        <div className="h-40 sm:h-48 relative overflow-hidden">
                            <div className="absolute inset-0" style={{ background: clrGrad, opacity: 0.8 }} />
                            <div className="absolute inset-0 bg-gradient-to-t from-[rgba(12,13,20,0.8)] to-transparent" />
                            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "repeating-linear-gradient(45deg, #000 0, #000 1px, transparent 0, transparent 50%)", backgroundSize: "12px 12px" }} />

                            {/* Decorative geometric shapes */}
                            <motion.div animate={{ rotate: 360 }} transition={{ duration: 180, repeat: Infinity, ease: "linear" }} className="absolute -top-40 -right-40 w-[30rem] h-[30rem] border border-white/10 rounded-full opacity-30" />
                            <motion.div animate={{ rotate: -360 }} transition={{ duration: 120, repeat: Infinity, ease: "linear" }} className="absolute -top-20 -right-20 w-[20rem] h-[20rem] border border-white/10 rounded-full opacity-30" />
                        </div>

                        <div className="px-6 pb-12 sm:px-10 sm:pb-16 pt-0 relative z-10 w-full flex flex-col sm:flex-row gap-6 sm:gap-8 items-center sm:items-start -mt-16 sm:-mt-24">
                            {/* Avatar Structure */}
                            <div className="relative group shrink-0">
                                <div className="absolute inset-0 rounded-[2rem] blur-2xl transition-all duration-700 group-hover:blur-3xl opacity-50 bg-white" style={{ background: clrGrad }} />
                                <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-[2rem] p-1.5 bg-gradient-to-b from-white/30 to-white/5 shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
                                    <div className="w-full h-full rounded-[1.6rem] overflow-hidden relative flex items-center justify-center text-6xl sm:text-7xl font-black text-white" style={{ background: clrGrad }}>
                                        <div className="absolute inset-0 bg-black/10 transition-opacity duration-500 group-hover:opacity-0" />
                                        <span className="relative z-10 drop-shadow-md">{user.name[0]?.toUpperCase()}</span>
                                    </div>
                                </div>
                                <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center border-[4px] border-[#0c0d14] shadow-[0_0_20px_rgba(16,185,129,0.5)] z-20">
                                    <CheckCircle2 size={20} className="text-white" />
                                </div>
                            </div>

                            <div className="flex-1 text-center sm:text-left min-w-0 sm:pt-6">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-3">
                                    <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight truncate filter drop-shadow-lg">{user.name}</h2>
                                    {user.vetting_badge && (
                                        <div className="hidden sm:flex self-center drop-shadow-md">
                                            <ShieldBadge verified={user.vetting_badge} size={30} />
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 sm:gap-4">
                                    <span className="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-[0.1em] shadow-inner" style={{ background: `rgba(255,255,255,0.1)`, border: `1px solid rgba(255,255,255,0.15)`, color: "white", textShadow: "0 1px 3px rgba(0,0,0,0.6)" }}>
                                        {user.role}
                                    </span>
                                    <span className="text-sm font-medium text-white/50 flex items-center gap-2 bg-black/30 px-3 py-1.5 rounded-full border border-white/5 shadow-inner">
                                        <MapPin size={14} className="text-white/40" /> Bengaluru, IN
                                    </span>
                                </div>
                            </div>

                            <div className="flex gap-4 w-full sm:w-auto justify-center sm:justify-end mt-4 sm:mt-0 sm:pt-6">
                                <NeonButton variant="secondary" className="flex-1 sm:flex-none h-11 px-6 text-sm">
                                    <Edit3 size={16} /> Edit Profile
                                </NeonButton>
                                <NeonButton variant="danger" onClick={handleLogout} className="flex-1 sm:flex-none h-11 px-6 text-sm">
                                    <LogOut size={16} /> Logout
                                </NeonButton>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Info Grid - Redesigned Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mt-12">
                    {/* Identity Block */}
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2, duration: 0.5 }}>
                        <div className="h-full rounded-[2rem] p-8 sm:p-10 bg-gradient-to-br from-white/[0.04] to-transparent border border-white/[0.08] backdrop-blur-2xl relative overflow-hidden group hover:border-white/[0.15] transition-all duration-500 shadow-xl">
                            <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-700 pointer-events-none">
                                <Hexagon size={160} className="text-white" strokeWidth={0.5} />
                            </div>

                            <div className="flex items-center gap-5 mb-10 relative z-10">
                                <div className="w-14 h-14 rounded-[1.25rem] bg-white/[0.03] border border-white/10 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform duration-500">
                                    <User size={24} className="text-white/60" />
                                </div>
                                <div>
                                    <h3 className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-1.5">Section</h3>
                                    <h2 className="text-2xl font-bold text-white tracking-tight">Core Identity</h2>
                                </div>
                            </div>

                            <div className="space-y-4 relative z-10">
                                {[
                                    { label: "Full Legal Name", value: user.name, icon: User },
                                    { label: "Unique Identifier", value: user.user_id, icon: Hash, mono: true },
                                    { label: "Member Since", value: "Feb 2024", icon: Calendar },
                                ].map((item) => (
                                    <div key={item.label} className="group/item flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-white/[0.015] border border-white/[0.03] hover:bg-white/[0.04] hover:border-white/[0.08] transition-all duration-300">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-black/20 flex items-center justify-center border border-white/5">
                                                <item.icon size={16} className="text-white/40 group-hover/item:text-white/80 transition-colors" />
                                            </div>
                                            <span className="text-[15px] font-medium text-white/50 group-hover/item:text-white/90 transition-colors">{item.label}</span>
                                        </div>
                                        {item.mono ? (
                                            <span className="text-sm font-mono text-white/70 bg-black/50 px-3.5 py-1.5 rounded-lg border border-white/10 shadow-inner">{item.value}</span>
                                        ) : (
                                            <span className="text-base font-semibold text-white drop-shadow-md">{item.value}</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    {/* Vetting Block */}
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3, duration: 0.5 }}>
                        <div className="h-full rounded-[2rem] p-8 sm:p-10 bg-gradient-to-br from-white/[0.04] to-transparent border border-white/[0.08] backdrop-blur-2xl relative overflow-hidden group hover:border-white/[0.15] transition-all duration-500 shadow-xl">
                            <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-700 pointer-events-none">
                                <Shield size={160} className="text-white" strokeWidth={0.5} />
                            </div>

                            <div className="flex items-center gap-5 mb-10 relative z-10">
                                <div className="w-14 h-14 rounded-[1.25rem] bg-white/[0.03] border border-white/10 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform duration-500">
                                    <Award size={24} className="text-white/60" />
                                </div>
                                <div>
                                    <h3 className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-1.5">Status</h3>
                                    <h2 className="text-2xl font-bold text-white tracking-tight">Trust & Vetting</h2>
                                </div>
                            </div>

                            <div className="space-y-6 relative z-10">
                                <div className={`relative p-6 sm:p-7 rounded-[1.5rem] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 overflow-hidden border transition-all duration-500 ${user.vetting_badge ? "bg-emerald-500/10 border-emerald-500/30 hover:border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.05)]" : "bg-white/[0.02] border-white/10"}`}>
                                    {user.vetting_badge && (
                                        <div className="absolute right-0 top-0 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
                                    )}
                                    <div className="relative z-10 flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-1.5">
                                            {user.vetting_badge && <ShieldBadge verified={true} size={20} />}
                                            <p className={`text-xl font-extrabold tracking-tight truncate ${user.vetting_badge ? "text-emerald-400" : "text-white/60"}`}>
                                                {user.vetting_badge ? "MCA Verified" : "Unverified Status"}
                                            </p>
                                        </div>
                                        <p className="text-[15px] text-white/40 font-medium truncate">
                                            {user.vetting_badge ? "Official Gold Badge Holder" : "Connect your MCA record to unlock"}
                                        </p>
                                    </div>
                                    <div className="relative z-10 shrink-0">
                                        {user.vetting_badge ? (
                                            <div className="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.25)]">
                                                <Award size={28} className="text-emerald-400" />
                                            </div>
                                        ) : (
                                            <div className="w-14 h-14 rounded-full bg-white/[0.05] flex items-center justify-center border border-white/10">
                                                <Award size={28} className="text-white/30" />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-4 p-6 sm:p-7 rounded-[1.5rem] bg-white/[0.015] border border-white/[0.03]">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2.5">
                                            <Shield size={16} className="text-white/40" />
                                            <span className="text-[15px] font-medium text-white/50">Security Clearance</span>
                                        </div>
                                        <span className="text-base font-bold text-white">Level 2 <span className="text-white/40 font-medium ml-1">(Foundational)</span></span>
                                    </div>
                                    <div className="w-full h-3 bg-black/50 rounded-full overflow-hidden border border-white/5 relative shadow-inner">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: user.vetting_badge ? "100%" : "40%" }}
                                            transition={{ duration: 1.2, ease: "easeOut", delay: 0.4 }}
                                            className="h-full rounded-full relative overflow-hidden"
                                            style={{
                                                background: user.vetting_badge ? "linear-gradient(90deg, #059669, #34d399)" : clrGrad,
                                            }}
                                        >
                                            <div className="absolute inset-0 opacity-40" style={{ backgroundImage: "linear-gradient(45deg, rgba(255,255,255,0.2) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.2) 75%, transparent 75%, transparent)", backgroundSize: "1.5rem 1.5rem" }} />
                                        </motion.div>
                                    </div>
                                </div>

                                {!user.vetting_badge && (
                                    <NeonButton className="w-full py-4.5 text-base font-bold shadow-lg mt-2" variant="primary">
                                        Complete Verification <ExternalLink size={18} className="ml-1" />
                                    </NeonButton>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Modern Footer Links */}
                <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-16 pt-10 mt-10 border-t border-white/[0.05]">
                    {[
                        { label: "Privacy Policy", icon: Settings },
                        { label: "Notification Preferences", icon: Activity },
                        { label: "API Configuration", icon: Hash },
                    ].map(item => (
                        <a key={item.label} href="#" className="group flex items-center gap-2.5 text-[13px] font-semibold tracking-wide text-white/30 hover:text-white/80 transition-all duration-300 uppercase">
                            <div className="w-8 h-8 rounded-[0.6rem] bg-white/[0.02] flex items-center justify-center group-hover:bg-white/[0.08] transition-colors border border-white/[0.02] shadow-sm">
                                <item.icon size={14} className="group-hover:scale-110 transition-transform" />
                            </div>
                            {item.label}
                        </a>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    );
}
