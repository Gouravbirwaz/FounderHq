"use client";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { GlassCard } from "@/components/ui/GlassCard";
import { NeonButton } from "@/components/ui/NeonButton";
import { motion } from "framer-motion";
import { Lock, ShieldCheck, DollarSign, FileText, ArrowRight, Landmark } from "lucide-react";

const VAULT_ITEMS = [
    { title: "Cap Table", desc: "Track equity distribution, vesting schedules, and dilution scenarios in real-time.", icon: FileText, accent: "#8b5cf6", locked: false },
    { title: "Investor Relations", desc: "Manage investor updates, data rooms, and communications in one secure vault.", icon: DollarSign, accent: "#22d3ee", locked: true },
    { title: "Compliance", desc: "Automated MCA filings, statutory compliance tracking, and regulatory alerts.", icon: ShieldCheck, accent: "#34d399", locked: true },
];

export default function FundingPage() {
    return (
        <DashboardLayout>
            <div className="max-w-5xl mx-auto space-y-8">

                {/* Header */}
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" style={{ boxShadow: "0 0 8px #34d399" }} />
                        <span className="text-[10px] font-medium uppercase tracking-widest text-emerald-400/70">Secure Module</span>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">Funding Vault</h1>
                    <p className="text-sm text-white/35 mt-2 max-w-xl font-normal">Enterprise-grade equity management, investor relations, and compliance tools.</p>
                </div>

                {/* Vault Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {VAULT_ITEMS.map((item, i) => (
                        <motion.div key={item.title} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                            <GlassCard style={{ padding: 0, overflow: "hidden" }}>
                                {/* Card header */}
                                <div style={{
                                    padding: "24px 24px 20px",
                                    background: item.locked ? "rgba(255,255,255,0.01)" : `${item.accent}08`,
                                    borderBottom: `1px solid ${item.locked ? "rgba(255,255,255,0.04)" : item.accent + "15"}`,
                                    position: "relative",
                                }}>
                                    {item.locked && (
                                        <div style={{ position: "absolute", top: 16, right: 16 }}>
                                            <Lock size={14} className="text-white/15" />
                                        </div>
                                    )}
                                    <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                                        style={{
                                            background: item.locked ? "rgba(255,255,255,0.04)" : `${item.accent}15`,
                                            border: `1px solid ${item.locked ? "rgba(255,255,255,0.06)" : item.accent + "25"}`,
                                            color: item.locked ? "rgba(255,255,255,0.15)" : item.accent,
                                        }}>
                                        <item.icon size={18} />
                                    </div>
                                    <h3 className={`text-base font-semibold ${item.locked ? "text-white/30" : "text-white"}`}>{item.title}</h3>
                                </div>

                                {/* Card body */}
                                <div style={{ padding: "16px 24px 24px" }}>
                                    <p className={`text-xs leading-relaxed mb-5 ${item.locked ? "text-white/20" : "text-white/40"}`}>{item.desc}</p>
                                    {item.locked ? (
                                        <NeonButton size="sm" variant="ghost" className="w-full" disabled>
                                            <Lock size={12} /> Encrypted
                                        </NeonButton>
                                    ) : (
                                        <NeonButton size="sm" className="w-full">
                                            <ArrowRight size={12} /> Access Vault
                                        </NeonButton>
                                    )}
                                </div>
                            </GlassCard>
                        </motion.div>
                    ))}
                </div>

                {/* Bottom CTA */}
                <GlassCard className="text-center" style={{ padding: "40px 24px" }}>
                    <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                        style={{ background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)" }}>
                        <Landmark size={24} className="text-violet-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">Establishing Secure Uplink</h3>
                    <p className="text-sm text-white/30 max-w-md mx-auto mb-5">Complete MCA verification to unlock full vault access, including investor data rooms and compliance tools.</p>
                    <NeonButton>Verify Identity</NeonButton>
                </GlassCard>
            </div>
        </DashboardLayout>
    );
}
