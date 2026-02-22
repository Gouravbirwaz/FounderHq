"use client";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { GlassCard } from "@/components/ui/GlassCard";
import { NeonButton } from "@/components/ui/NeonButton";
import { motion } from "framer-motion";
import { Lock, ShieldCheck, DollarSign, FileText, ArrowRight, Landmark } from "lucide-react";
import { useTheme } from "next-themes";
import * as React from "react";

const VAULT_ITEMS = [
    { title: "Cap Table", desc: "Track equity distribution, vesting schedules, and dilution scenarios in real-time.", icon: FileText, accent: "#8b5cf6", locked: false },
    { title: "Investor Relations", desc: "Manage investor updates, data rooms, and communications in one secure vault.", icon: DollarSign, accent: "#22d3ee", locked: true },
    { title: "Compliance", desc: "Automated MCA filings, statutory compliance tracking, and regulatory alerts.", icon: ShieldCheck, accent: "#34d399", locked: true },
];

export default function FundingPage() {
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;
    const isLight = resolvedTheme === "light";
    return (
        <DashboardLayout>
            <div className="max-w-5xl mx-auto space-y-8">

                {/* Header */}

                {/* Vault Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {VAULT_ITEMS.map((item, i) => (
                        <motion.div key={item.title} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                            <GlassCard style={{ padding: 0, overflow: "hidden" }}>
                                {/* Card header */}
                                <div style={{
                                    padding: "24px 24px 20px",
                                    background: item.locked ? (isLight ? "rgba(0,0,0,0.02)" : "rgba(255,255,255,0.01)") : `${item.accent}08`,
                                    borderBottom: `1px solid ${item.locked ? "var(--border-subtle)" : item.accent + "15"}`,
                                    position: "relative",
                                }}>
                                    {item.locked && (
                                        <div style={{ position: "absolute", top: 16, right: 16 }}>
                                            <Lock size={14} className="text-[var(--text-tertiary)] opacity-30" />
                                        </div>
                                    )}
                                    <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                                        style={{
                                            background: item.locked ? "var(--border-subtle)" : `${item.accent}15`,
                                            border: `1px solid ${item.locked ? "var(--border-default)" : item.accent + "25"}`,
                                            color: item.locked ? "var(--text-tertiary)" : item.accent,
                                        }}>
                                        <item.icon size={18} />
                                    </div>
                                    <h3 className={`text-base font-bold tracking-tight ${item.locked ? "text-[var(--text-secondary)] opacity-50" : "text-[var(--text-primary)]"}`}>{item.title}</h3>
                                </div>

                                {/* Card body */}
                                <div style={{ padding: "16px 24px 24px" }}>
                                    <p className={`text-xs leading-relaxed mb-6 font-medium ${item.locked ? "text-[var(--text-tertiary)]" : "text-[var(--text-secondary)]"}`}>{item.desc}</p>
                                    {item.locked ? (
                                        <NeonButton size="sm" variant="ghost" className="w-full" disabled>
                                            <Lock size={12} className="mr-2" /> Encrypted Vault
                                        </NeonButton>
                                    ) : (
                                        <NeonButton size="sm" className="w-full">
                                            <ArrowRight size={12} className="mr-2" /> Access Vault
                                        </NeonButton>
                                    )}
                                </div>
                            </GlassCard>
                        </motion.div>
                    ))}
                </div>

                {/* Bottom CTA */}
                <GlassCard className="text-center" style={{ padding: "48px 32px" }}>
                    <div className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center"
                        style={{
                            background: "rgba(var(--accent-violet-rgb, 139, 92, 246), 0.1)",
                            border: "1px solid rgba(var(--accent-violet-rgb, 139, 92, 246), 0.2)",
                            boxShadow: "0 8px 32px rgba(139, 92, 246, 0.1)",
                        }}>
                        <Landmark size={28} className="text-[var(--accent-violet)]" />
                    </div>
                    <h3 className="text-xl font-bold text-[var(--text-primary)] mb-3 tracking-tight">Establishing Secure Uplink</h3>
                    <p className="text-sm text-[var(--text-secondary)] max-w-md mx-auto mb-8 font-medium leading-relaxed">Complete MCA verification to unlock full vault access, including investor data rooms and compliance tools.</p>
                    <NeonButton size="lg">Verify Identity</NeonButton>
                </GlassCard>
            </div>
        </DashboardLayout>
    );
}
