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
import { useTheme } from "next-themes";
import * as React from "react";

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
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);
    const [tab, setTab] = useState<TabKey>("discovery");

    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;
    const isLight = resolvedTheme === "light";

    return (
        <DashboardLayout>
            <ToastProvider />
            <div style={{ maxWidth: 1100, margin: "0 auto" }}>

                {/* Header */}

                {/* Tab bar */}
                <div style={{
                    display: "inline-flex", alignItems: "center", gap: 4,
                    padding: 5, borderRadius: 16,
                    background: "var(--surface-1)",
                    border: "1px solid var(--border-subtle)",
                    marginBottom: 32,
                    boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
                }}>
                    {TABS.map(t => {
                        const active = tab === t.key;
                        return (
                            <button
                                key={t.key}
                                onClick={() => setTab(t.key)}
                                style={{
                                    display: "flex", alignItems: "center", gap: 8,
                                    padding: "9px 18px", borderRadius: 12,
                                    fontSize: 13, fontWeight: active ? 700 : 500,
                                    background: active ? "rgba(var(--accent-violet-rgb, 139, 92, 246), 0.12)" : "transparent",
                                    border: active ? "1px solid rgba(var(--accent-violet-rgb, 139, 92, 246), 0.25)" : "1px solid transparent",
                                    color: active ? "var(--text-primary)" : "var(--text-tertiary)",
                                    cursor: "pointer",
                                    transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
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
                                        padding: 24, borderRadius: 24,
                                        background: "var(--card-bg)",
                                        border: "1px solid var(--border-subtle)",
                                        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                                    }}
                                    onMouseEnter={e => {
                                        (e.currentTarget as HTMLDivElement).style.borderColor = `${poc.accent}50`;
                                        (e.currentTarget as HTMLDivElement).style.boxShadow = `0 12px 40px rgba(0,0,0,${isLight ? "0.08" : "0.4"}), 0 0 0 1px ${poc.accent}20`;
                                        (e.currentTarget as HTMLDivElement).style.background = isLight ? `rgba(var(--accent-violet-rgb), 0.02)` : "var(--card-bg)";
                                    }}
                                    onMouseLeave={e => {
                                        (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border-subtle)";
                                        (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
                                        (e.currentTarget as HTMLDivElement).style.background = "var(--card-bg)";
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
                                        <h3 style={{ fontSize: 17, fontWeight: 700, color: "var(--text-primary)", margin: 0, letterSpacing: "-0.01em" }}>{poc.title}</h3>
                                        <p style={{ fontSize: 14, color: "var(--text-secondary)", marginTop: 8, lineHeight: 1.6, fontWeight: 500 }}>{poc.desc}</p>

                                        {/* Tags */}
                                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 14 }}>
                                            {poc.tags.map(t => (
                                                <span key={t} style={{
                                                    padding: "4px 12px", borderRadius: 10,
                                                    fontSize: 11, fontWeight: 600,
                                                    background: "var(--surface-1)",
                                                    border: "1px solid var(--border-subtle)",
                                                    color: "var(--text-tertiary)",
                                                    letterSpacing: "0.02em",
                                                }}>
                                                    {t}
                                                </span>
                                            ))}
                                        </div>

                                        <p style={{ fontSize: 13, color: "var(--text-tertiary)", marginTop: 14, fontWeight: 500 }}>
                                            <span style={{ fontWeight: 700, color: "var(--text-secondary)" }}>Seeking: </span>{poc.seeking}
                                        </p>
                                    </div>

                                    {/* Vote */}
                                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, flexShrink: 0 }}>
                                        <motion.button
                                            whileHover={{ scale: 1.08 }}
                                            whileTap={{ scale: 0.92 }}
                                            onClick={() => toast("success", "Upvoted", `You voted for ${poc.title}`)}
                                            style={{
                                                width: 60, padding: "12px 0",
                                                display: "flex", flexDirection: "column", alignItems: "center", gap: 5,
                                                borderRadius: 16,
                                                background: "var(--surface-1)",
                                                border: "1px solid var(--border-subtle)",
                                                cursor: "pointer", transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                                color: "var(--text-tertiary)",
                                            }}
                                            onMouseEnter={e => {
                                                (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--accent-violet)";
                                                (e.currentTarget as HTMLButtonElement).style.background = "rgba(var(--accent-violet-rgb, 139, 92, 246), 0.1)";
                                                (e.currentTarget as HTMLButtonElement).style.color = "var(--accent-violet)";
                                            }}
                                            onMouseLeave={e => {
                                                (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border-subtle)";
                                                (e.currentTarget as HTMLButtonElement).style.background = "var(--surface-1)";
                                                (e.currentTarget as HTMLButtonElement).style.color = "var(--text-tertiary)";
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
                                        padding: "16px 20px", borderRadius: 20,
                                        background: "var(--card-bg)",
                                        border: "1px solid var(--border-subtle)",
                                        transition: "border-color 0.3s",
                                    }}
                                    onMouseEnter={e => {
                                        (e.currentTarget as HTMLDivElement).style.borderColor = `${job.color}50`;
                                        (e.currentTarget as HTMLDivElement).style.background = isLight ? `rgba(var(--accent-violet-rgb), 0.02)` : "var(--card-bg)";
                                        (e.currentTarget as HTMLDivElement).style.boxShadow = `0 8px 32px rgba(0,0,0,${isLight ? "0.05" : "0.3"})`;
                                    }}
                                    onMouseLeave={e => {
                                        (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border-subtle)";
                                        (e.currentTarget as HTMLDivElement).style.background = "var(--card-bg)";
                                        (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
                                    }}
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
                                        <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", margin: 0, letterSpacing: "-0.01em" }}>{job.title}</h3>
                                        <p style={{ fontSize: 13, color: "var(--text-tertiary)", marginTop: 4, fontWeight: 500 }}>{job.company}</p>
                                    </div>

                                    {/* Meta */}
                                    <div style={{ display: "flex", alignItems: "center", gap: 16, flexShrink: 0 }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 5, color: "var(--text-tertiary)", fontSize: 12, fontWeight: 500 }}>
                                            <MapPin size={12} />
                                            <span>{job.location}</span>
                                        </div>
                                        <span style={{
                                            padding: "5px 12px", borderRadius: 10,
                                            fontSize: 11, fontWeight: 700,
                                            background: "var(--surface-1)",
                                            border: "1px solid var(--border-subtle)",
                                            color: "var(--text-secondary)",
                                        }}>
                                            {job.equity} Equity
                                        </span>
                                        <span style={{ fontSize: 11, color: "var(--text-tertiary)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{job.level}</span>
                                    </div>

                                    {/* Action */}
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        style={{
                                            width: 38, height: 38, borderRadius: 12, flexShrink: 0,
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            background: "var(--surface-1)",
                                            border: "1px solid var(--border-subtle)",
                                            color: "var(--text-tertiary)",
                                            cursor: "pointer",
                                            transition: "all 0.2s ease",
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
                                        textAlign: "center", gap: 16, padding: 32, borderRadius: 24,
                                        background: "var(--card-bg)",
                                        border: "1px solid var(--border-subtle)",
                                        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                                    }}
                                    onMouseEnter={e => {
                                        (e.currentTarget as HTMLDivElement).style.borderColor = `${m.color}60`;
                                        (e.currentTarget as HTMLDivElement).style.boxShadow = `0 12px 40px rgba(0,0,0,${isLight ? "0.06" : "0.4"}), 0 0 0 1px ${m.color}15`;
                                        (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)";
                                    }}
                                    onMouseLeave={e => {
                                        (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border-subtle)";
                                        (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
                                        (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
                                    }}
                                >
                                    {/* Avatar */}
                                    <div style={{
                                        width: 60, height: 60, borderRadius: 18,
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        fontSize: 24, fontWeight: 800, color: "#fff",
                                        background: `linear-gradient(135deg, ${m.color}, ${m.color}88)`,
                                        boxShadow: `0 8px 24px ${m.color}30`,
                                        textShadow: "0 2px 4px rgba(0,0,0,0.2)",
                                    }}>
                                        {m.name[0]}
                                    </div>

                                    {/* Info */}
                                    <div>
                                        <h3 style={{ fontSize: 17, fontWeight: 700, color: "var(--text-primary)", margin: 0, letterSpacing: "-0.01em" }}>{m.name}</h3>
                                        <p style={{ fontSize: 13, color: "var(--text-tertiary)", marginTop: 6, fontWeight: 500 }}>{m.domain}</p>
                                    </div>

                                    {/* Slots */}
                                    <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-tertiary)", fontSize: 12, fontWeight: 600 }}>
                                        <Users size={14} style={{ opacity: 0.6 }} />
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
