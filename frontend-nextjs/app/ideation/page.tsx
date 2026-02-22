"use client";
import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { GlassCard } from "@/components/ui/GlassCard";
import { NeonButton } from "@/components/ui/NeonButton";
import { motion, AnimatePresence } from "framer-motion";
import {
    Lightbulb, ArrowUp, Briefcase, Users,
    MapPin, ChevronRight, Sparkles, Rocket, BookOpen
} from "lucide-react";
import { toast, ToastProvider } from "@/components/ui/Toast";

/* ── Data ──────────────────────────────────────── */
const POCS = [
    { title: "AI Legal Engine", desc: "LLM-powered contract analysis for Indian MSMEs. Automating legal compliance in Tier-2 cities.", tags: ["LegalTech", "AI", "B2B"], upvotes: 142, seeking: "CTO + $200K Pre-seed", accent: "#8b5cf6" },
    { title: "GreenCredit Protocol", desc: "Blockchain carbon credit marketplace for Indian startups. Verified ESG reporting made simple.", tags: ["CleanTech", "Web3", "ESG"], upvotes: 98, seeking: "Frontend Dev + Partnerships", accent: "#34d399" },
    { title: "FinStack", desc: "Embedded finance toolkit for SaaS platforms. Real-time payment routing and reconciliation.", tags: ["FinTech", "API", "Payments"], upvotes: 223, seeking: "Lead Engineer + $500K Seed", accent: "#22d3ee" },
];

const JOBS = [
    { title: "Lead ML Engineer", company: "NeuralStack", location: "Bengaluru", equity: "0.5-1.0%", level: "Senior", color: "#8b5cf6" },
    { title: "Full-stack Developer", company: "Kisan.ai", location: "Remote", equity: "0.3-0.8%", level: "Mid", color: "#22d3ee" },
    { title: "Product Designer", company: "PayTrail", location: "Mumbai", equity: "0.2-0.5%", level: "Senior", color: "#34d399" },
];

const MENTORS = [
    { name: "Priya Sharma", domain: "FinTech · Ex-Razorpay", slots: 3, color: "#f59e0b" },
    { name: "Arjun Mehta", domain: "AI/ML · IIT Delhi", slots: 1, color: "#8b5cf6" },
    { name: "Neha Joshi", domain: "Growth · 3x Founder", slots: 5, color: "#22d3ee" },
];

const TABS = [
    { key: "discovery", label: "Discovery", icon: Rocket },
    { key: "equity", label: "Equity Board", icon: Briefcase },
    { key: "mentors", label: "Mentor Huddles", icon: BookOpen },
] as const;
type TabKey = typeof TABS[number]["key"];

export default function IdeationPage() {
    const [tab, setTab] = useState<TabKey>("discovery");

    return (
        <DashboardLayout>
            <ToastProvider />
            <div style={{ maxWidth: 1100, margin: "0 auto" }}>

                {/* Header */}
                <div style={{ marginBottom: 28 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                        <Sparkles size={14} style={{ color: "#fbbf24", opacity: 0.6 }} />
                        <span style={{ fontSize: 10, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(251,191,36,0.7)" }}>Innovation</span>
                    </div>
                    <h1 style={{ fontSize: 30, fontWeight: 700, letterSpacing: "-0.02em", color: "#fff", margin: 0 }}>Ideation Hub</h1>
                    <p style={{ fontSize: 14, color: "rgba(255,255,255,0.35)", marginTop: 8, maxWidth: 500, lineHeight: 1.5 }}>Browse proof-of-concepts, explore equity opportunities, and book mentor sessions.</p>
                </div>

                {/* Tab bar */}
                <div style={{
                    display: "inline-flex", alignItems: "center", gap: 4,
                    padding: 4, borderRadius: 14,
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    marginBottom: 28,
                }}>
                    {TABS.map(t => {
                        const active = tab === t.key;
                        return (
                            <button
                                key={t.key}
                                onClick={() => setTab(t.key)}
                                style={{
                                    display: "flex", alignItems: "center", gap: 7,
                                    padding: "8px 16px", borderRadius: 10,
                                    fontSize: 13, fontWeight: active ? 600 : 500,
                                    background: active ? "rgba(139,92,246,0.15)" : "transparent",
                                    border: active ? "1px solid rgba(139,92,246,0.25)" : "1px solid transparent",
                                    color: active ? "#fff" : "rgba(255,255,255,0.4)",
                                    cursor: "pointer",
                                    transition: "all 0.2s ease",
                                }}
                            >
                                <t.icon size={14} strokeWidth={1.8} />
                                {t.label}
                            </button>
                        );
                    })}
                </div>

                {/* Tab content */}
                <AnimatePresence mode="wait">
                    {/* ═══ Discovery ═══ */}
                    {tab === "discovery" && (
                        <motion.div key="discovery" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                            {POCS.map((poc, i) => (
                                <motion.div
                                    key={poc.title}
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.08 }}
                                    style={{
                                        display: "flex", gap: 20,
                                        padding: 24, borderRadius: 18,
                                        background: "linear-gradient(160deg, rgba(255,255,255,0.04) 0%, rgba(12,13,20,0.7) 100%)",
                                        border: "1px solid rgba(255,255,255,0.06)",
                                        transition: "border-color 0.3s, box-shadow 0.3s",
                                    }}
                                    onMouseEnter={e => {
                                        (e.currentTarget as HTMLDivElement).style.borderColor = `${poc.accent}35`;
                                        (e.currentTarget as HTMLDivElement).style.boxShadow = `0 8px 32px rgba(0,0,0,0.3), 0 0 0 1px ${poc.accent}15`;
                                    }}
                                    onMouseLeave={e => {
                                        (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.06)";
                                        (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
                                    }}
                                >
                                    {/* Icon */}
                                    <div style={{
                                        width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        background: `${poc.accent}15`,
                                        border: `1px solid ${poc.accent}25`,
                                    }}>
                                        <Lightbulb size={20} color={poc.accent} strokeWidth={1.8} />
                                    </div>

                                    {/* Content */}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <h3 style={{ fontSize: 16, fontWeight: 600, color: "#fff", margin: 0 }}>{poc.title}</h3>
                                        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 6, lineHeight: 1.5 }}>{poc.desc}</p>

                                        {/* Tags */}
                                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 12 }}>
                                            {poc.tags.map(t => (
                                                <span key={t} style={{
                                                    padding: "3px 10px", borderRadius: 8,
                                                    fontSize: 11, fontWeight: 500,
                                                    background: "rgba(255,255,255,0.04)",
                                                    border: "1px solid rgba(255,255,255,0.06)",
                                                    color: "rgba(255,255,255,0.4)",
                                                }}>
                                                    {t}
                                                </span>
                                            ))}
                                        </div>

                                        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", marginTop: 10 }}>
                                            <span style={{ fontWeight: 500, color: "rgba(255,255,255,0.4)" }}>Seeking: </span>{poc.seeking}
                                        </p>
                                    </div>

                                    {/* Vote */}
                                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, flexShrink: 0 }}>
                                        <motion.button
                                            whileHover={{ scale: 1.08 }}
                                            whileTap={{ scale: 0.92 }}
                                            onClick={() => toast("success", "Upvoted", `You voted for ${poc.title}`)}
                                            style={{
                                                width: 56, padding: "10px 0",
                                                display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                                                borderRadius: 14,
                                                background: "rgba(255,255,255,0.03)",
                                                border: "1px solid rgba(255,255,255,0.06)",
                                                cursor: "pointer", transition: "all 0.2s",
                                                color: "rgba(255,255,255,0.4)",
                                            }}
                                            onMouseEnter={e => {
                                                (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(139,92,246,0.4)";
                                                (e.currentTarget as HTMLButtonElement).style.background = "rgba(139,92,246,0.1)";
                                            }}
                                            onMouseLeave={e => {
                                                (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.06)";
                                                (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.03)";
                                            }}
                                        >
                                            <ArrowUp size={16} />
                                            <span style={{ fontSize: 13, fontWeight: 600 }}>{poc.upvotes}</span>
                                        </motion.button>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}

                    {/* ═══ Equity Board ═══ */}
                    {tab === "equity" && (
                        <motion.div key="equity" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                            {JOBS.map((job, i) => (
                                <motion.div
                                    key={job.title}
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.08 }}
                                    style={{
                                        display: "flex", alignItems: "center", gap: 16,
                                        padding: "16px 20px", borderRadius: 16,
                                        background: "linear-gradient(160deg, rgba(255,255,255,0.04) 0%, rgba(12,13,20,0.7) 100%)",
                                        border: "1px solid rgba(255,255,255,0.06)",
                                        transition: "border-color 0.3s",
                                    }}
                                    onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = `${job.color}30`; }}
                                    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.06)"; }}
                                >
                                    {/* Icon */}
                                    <div style={{
                                        width: 42, height: 42, borderRadius: 12, flexShrink: 0,
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        background: `${job.color}12`,
                                        border: `1px solid ${job.color}22`,
                                    }}>
                                        <Briefcase size={16} color={job.color} strokeWidth={1.8} />
                                    </div>

                                    {/* Info */}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <h3 style={{ fontSize: 14, fontWeight: 600, color: "#fff", margin: 0 }}>{job.title}</h3>
                                        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 3 }}>{job.company}</p>
                                    </div>

                                    {/* Meta */}
                                    <div style={{ display: "flex", alignItems: "center", gap: 16, flexShrink: 0 }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 5, color: "rgba(255,255,255,0.3)", fontSize: 12 }}>
                                            <MapPin size={12} />
                                            <span>{job.location}</span>
                                        </div>
                                        <span style={{
                                            padding: "4px 10px", borderRadius: 8,
                                            fontSize: 11, fontWeight: 600,
                                            background: "rgba(255,255,255,0.04)",
                                            border: "1px solid rgba(255,255,255,0.06)",
                                            color: "rgba(255,255,255,0.45)",
                                        }}>
                                            {job.equity} Equity
                                        </span>
                                        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.2)" }}>{job.level}</span>
                                    </div>

                                    {/* Action */}
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        style={{
                                            width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            background: "rgba(255,255,255,0.04)",
                                            border: "1px solid rgba(255,255,255,0.08)",
                                            color: "rgba(255,255,255,0.4)",
                                            cursor: "pointer",
                                        }}
                                    >
                                        <ChevronRight size={16} />
                                    </motion.button>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}

                    {/* ═══ Mentors ═══ */}
                    {tab === "mentors" && (
                        <motion.div key="mentors" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}
                        >
                            {MENTORS.map((m, i) => (
                                <motion.div
                                    key={m.name}
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.08 }}
                                    style={{
                                        display: "flex", flexDirection: "column", alignItems: "center",
                                        textAlign: "center", gap: 16, padding: 28, borderRadius: 18,
                                        background: "linear-gradient(160deg, rgba(255,255,255,0.04) 0%, rgba(12,13,20,0.7) 100%)",
                                        border: "1px solid rgba(255,255,255,0.06)",
                                        transition: "border-color 0.3s",
                                    }}
                                    onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = `${m.color}30`; }}
                                    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.06)"; }}
                                >
                                    {/* Avatar */}
                                    <div style={{
                                        width: 60, height: 60, borderRadius: 18,
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        fontSize: 22, fontWeight: 700, color: "#fff",
                                        background: `linear-gradient(135deg, ${m.color}, ${m.color}88)`,
                                        boxShadow: `0 8px 24px ${m.color}25`,
                                    }}>
                                        {m.name[0]}
                                    </div>

                                    {/* Info */}
                                    <div>
                                        <h3 style={{ fontSize: 15, fontWeight: 600, color: "#fff", margin: 0 }}>{m.name}</h3>
                                        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 4 }}>{m.domain}</p>
                                    </div>

                                    {/* Slots */}
                                    <div style={{ display: "flex", alignItems: "center", gap: 6, color: "rgba(255,255,255,0.25)", fontSize: 11 }}>
                                        <Users size={12} />
                                        <span>{m.slots} slots this week</span>
                                    </div>

                                    {/* CTA */}
                                    <NeonButton size="sm" className="w-full">Book Huddle</NeonButton>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </DashboardLayout>
    );
}
