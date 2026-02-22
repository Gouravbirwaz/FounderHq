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
    founder: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
    investor: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
    student: "linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)",
    mentor: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
};

const ROLE_COLORS: Record<string, string> = {
    founder: "#6366f1",
    investor: "#f59e0b",
    student: "#0ea5e9",
    mentor: "#10b981",
};

import { useTheme } from "next-themes";
import * as React from "react";

// Formal button variant
function ActionButton({ children, onClick, variant = "primary", className = "" }: { children: React.ReactNode, onClick?: () => void, variant?: "primary" | "secondary" | "danger", className?: string }) {
    const base = "px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 border shadow-sm active:scale-[0.98]";
    const variants = {
        primary: "bg-[var(--text-primary)] text-[var(--surface-0)] border-[var(--text-primary)] hover:opacity-90",
        secondary: "bg-transparent text-[var(--text-primary)] border-[var(--border-subtle)] hover:bg-[var(--surface-2)]",
        danger: "bg-red-600/10 text-red-600 border-red-600/20 hover:bg-red-600 hover:text-white hover:border-red-600",
    };
    return (
        <button onClick={onClick} className={`${base} ${variants[variant]} ${className}`}>
            {children}
        </button>
    );
}

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
                        <GlassCard className="text-center" style={{ padding: 48, maxWidth: 440, borderRadius: 24 }}>
                            <div className="w-16 h-16 mx-auto bg-[var(--surface-2)] border border-[var(--border-subtle)] rounded-2xl flex items-center justify-center mb-6">
                                <User size={32} className="text-[var(--text-tertiary)]" />
                            </div>
                            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2 tracking-tight">Access Restricted</h2>
                            <p className="text-[var(--text-secondary)] mb-8 text-sm leading-relaxed">You must be signed in to view and manage your identity profile.</p>
                            <ActionButton className="w-full" onClick={() => router.push("/login")}>Proceed to Sign In</ActionButton>
                        </GlassCard>
                    </motion.div>
                </div>
            </DashboardLayout>
        );
    }

    const isLight = resolvedTheme === "light";
    const clr = ROLE_COLORS[user.role] ?? "#6366f1";
    const clrGrad = ROLE_GRADIENTS[user.role] ?? ROLE_GRADIENTS.founder;

    const AVATAR = 110;
    const OVERHANG = 40;

    return (
        <DashboardLayout>
            <ToastProvider />

            {/* Background elements */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden z-0 bg-[var(--surface-0)]">
                <div className="absolute inset-0 opacity-[0.03]" style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, ${isLight ? "black" : "white"} 1px, transparent 0)`,
                    backgroundSize: "32px 32px",
                }} />
            </div>

            <div className="relative z-10 max-w-[860px] mx-auto pb-20 pt-8 px-4 sm:px-0">

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: "circOut" }}>
                    <div
                        className="rounded-[1.5rem] border border-[var(--border-subtle)] overflow-hidden"
                        style={{
                            backgroundColor: "var(--surface-1)",
                            boxShadow: "0 10px 30px -10px rgba(0,0,0,0.1), 0 0 1px rgba(0,0,0,0.1)",
                        }}
                    >
                        {/* Banner */}
                        <div className="relative h-32 sm:h-40 overflow-hidden">
                            <div className="absolute inset-0" style={{
                                background: clrGrad,
                                opacity: isLight ? 0.8 : 0.9
                            }} />
                            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/20 to-transparent" />
                        </div>

                        {/* Profile Content */}
                        <div className="relative px-6 sm:px-10 pb-8">
                            <div className="flex flex-col sm:flex-row sm:items-end gap-6">

                                {/* Avatar */}
                                <div className="relative shrink-0 self-center sm:self-auto" style={{ marginTop: -OVERHANG }}>
                                    <div className="p-1.5 rounded-[1.25rem] bg-[var(--surface-1)] shadow-xl">
                                        <div
                                            className="w-[100px] h-[100px] flex items-center justify-center overflow-hidden"
                                            style={{ borderRadius: "calc(1.25rem - 6px)", background: clrGrad }}
                                        >
                                            <span className="font-extrabold text-white text-4xl select-none">
                                                {user.name[0]?.toUpperCase()}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-green-500 border-4 border-[var(--surface-1)] z-10" />
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0 text-center sm:text-left">
                                    <div className="flex items-center justify-center sm:justify-start gap-2.5 mb-1.5 flex-wrap">
                                        <h2 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
                                            {user.name}
                                        </h2>
                                        {user.vetting_badge && (
                                            <ShieldBadge verified={user.vetting_badge} size={20} />
                                        )}
                                    </div>
                                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4">
                                        <span className="text-xs font-bold uppercase tracking-widest text-[var(--text-tertiary)] bg-[var(--surface-2)] px-2.5 py-1 rounded-md border border-[var(--border-subtle)]">
                                            {user.role}
                                        </span>
                                        <span className="flex items-center gap-1.5 text-sm font-medium text-[var(--text-secondary)]">
                                            <MapPin size={14} className="opacity-60" />
                                            Bengaluru, IN
                                        </span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2.5 shrink-0 justify-center sm:justify-end">
                                    <ActionButton variant="secondary">
                                        <Edit3 size={15} /> Edit
                                    </ActionButton>
                                    <ActionButton variant="danger" onClick={handleLogout}>
                                        <LogOut size={15} /> Logout
                                    </ActionButton>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">

                    {/* Section: Identity */}
                    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
                        <div className="h-full rounded-[1.5rem] p-7 border border-[var(--border-subtle)] bg-[var(--surface-1)] shadow-md">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-[var(--surface-2)] border border-[var(--border-subtle)] flex items-center justify-center">
                                    <User size={18} className="text-[var(--text-secondary)]" />
                                </div>
                                <h3 className="font-bold text-[var(--text-primary)] uppercase tracking-wider text-xs opacity-70">Core Identity</h3>
                            </div>

                            <div className="space-y-1.5">
                                {[
                                    { label: "Full Name", value: user.name, icon: User },
                                    { label: "Account ID", value: user.user_id, icon: Hash, mono: true },
                                    { label: "Join Date", value: "Feb 2024", icon: Calendar },
                                ].map((item) => (
                                    <div key={item.label} className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-transparent hover:border-[var(--border-subtle)] hover:bg-[var(--surface-2)] transition-all duration-200 gap-2 sm:gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-[var(--surface-2)] group-hover:bg-[var(--surface-1)] border border-[var(--border-subtle)] flex items-center justify-center transition-colors">
                                                <item.icon size={13} className="text-[var(--text-tertiary)]" />
                                            </div>
                                            <span className="text-sm font-medium text-[var(--text-secondary)]">{item.label}</span>
                                        </div>
                                        <span className={`text-sm font-semibold text-[var(--text-primary)] truncate max-w-full sm:max-w-[240px] ${item.mono ? "font-mono text-[11px] opacity-70 bg-[var(--surface-2)] px-2 py-0.5 rounded border border-[var(--border-subtle)]" : ""}`}>
                                            {item.value}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    {/* Section: Trust */}
                    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
                        <div className="h-full rounded-[1.5rem] p-7 border border-[var(--border-subtle)] bg-[var(--surface-1)] shadow-md">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-[var(--surface-2)] border border-[var(--border-subtle)] flex items-center justify-center">
                                    <Award size={18} className="text-[var(--text-secondary)]" />
                                </div>
                                <h3 className="font-bold text-[var(--text-primary)] uppercase tracking-wider text-xs opacity-70">Security & Trust</h3>
                            </div>

                            <div className="space-y-6">
                                <div className={`p-5 rounded-xl border ${user.vetting_badge ? "bg-green-500/5 border-green-500/20" : "bg-[var(--surface-2)] border-[var(--border-subtle)]"}`}>
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2.5">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${user.vetting_badge ? "bg-green-500/10 border-green-500/20" : "bg-[var(--surface-1)] border-[var(--border-subtle)]"}`}>
                                                <Shield size={15} className={user.vetting_badge ? "text-green-500" : "text-[var(--text-tertiary)]"} />
                                            </div>
                                            <p className={`text-[13px] font-bold uppercase tracking-tight ${user.vetting_badge ? "text-green-600 dark:text-green-400" : "text-[var(--text-secondary)]"}`}>
                                                {user.vetting_badge ? "Verified Professional" : "Unverified Identity"}
                                            </p>
                                        </div>
                                        {user.vetting_badge && <CheckCircle2 size={16} className="text-green-500" />}
                                    </div>
                                    <p className="text-sm text-[var(--text-tertiary)] leading-relaxed">
                                        {user.vetting_badge ? "Your account has been officially verified through MCA records." : "Link your official business records to verify your identity."}
                                    </p>
                                </div>

                                <div className="space-y-4 px-1">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-[var(--text-tertiary)] opacity-40" />
                                            <span className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider">Security Clearance</span>
                                        </div>
                                        <span className="text-xs font-black text-[var(--text-primary)]">LEVEL 2</span>
                                    </div>
                                    <div className="h-2 w-full bg-[var(--surface-2)] rounded-full overflow-hidden border border-[var(--border-subtle)]">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: user.vetting_badge ? "100%" : "40%" }}
                                            transition={{ duration: 1, ease: "easeOut" }}
                                            className="h-full rounded-full"
                                            style={{ background: user.vetting_badge ? "#10b981" : clr }}
                                        />
                                    </div>
                                </div>

                                {!user.vetting_badge && (
                                    <ActionButton className="w-full py-2.5">
                                        Get Verified <ExternalLink size={14} />
                                    </ActionButton>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-8 mt-12 pt-8 border-t border-[var(--border-subtle)]">
                    {[
                        { label: "Privacy", icon: Settings },
                        { label: "Notifications", icon: Activity },
                        { label: "API Access", icon: Hash },
                    ].map((item) => (
                        <a key={item.label} href="#" className="flex items-center gap-2 text-xs font-bold text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors uppercase tracking-widest">
                            <item.icon size={12} />
                            {item.label}
                        </a>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    );
}
