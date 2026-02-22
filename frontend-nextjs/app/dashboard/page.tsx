"use client";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { GlassCard } from "@/components/ui/GlassCard";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import { TrendingUp, Users, Zap, ArrowUpRight, Activity, Sparkles, Server, Hexagon, BarChart3, Globe } from "lucide-react";

export default function Dashboard() {
    const { user } = useAuth();

    const stats = [
        { label: "Active Nodes", value: "24/24", icon: Server, accent: "#8b5cf6", bg: "rgba(139,92,246,", glow: "violet", gradient: "from-violet-500/20 to-purple-500/5", spark: "text-violet-400" },
        { label: "Market Sentiment", value: "Bullish", icon: TrendingUp, accent: "#10b981", bg: "rgba(16,185,129,", glow: "emerald", gradient: "from-emerald-500/20 to-teal-500/5", spark: "text-emerald-400" },
        { label: "Network Growth", value: "+12.4%", icon: Globe, accent: "#0ea5e9", bg: "rgba(14,165,233,", glow: "cyan", gradient: "from-sky-500/20 to-cyan-500/5", spark: "text-sky-400" },
    ];

    return (
        <DashboardLayout>
            {/* Dynamic Background Effects */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
                <div className="absolute inset-0 bg-[#06070a]" />
                <div className="absolute inset-0 opacity-40" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, rgba(255,255,255,0.06) 1px, transparent 0)", backgroundSize: "40px 40px" }} />

                <motion.div
                    animate={{ scale: [1, 1.05, 1], opacity: [0.1, 0.15, 0.1] }}
                    transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                    style={{ position: "absolute", top: "-5%", right: "10%", width: 600, height: 600, borderRadius: "50%", background: `radial-gradient(circle, rgba(139,92,246,0.3) 0%, transparent 70%)`, filter: "blur(100px)" }}
                />
                <motion.div
                    animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.15, 0.1] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 3 }}
                    style={{ position: "absolute", bottom: "0%", left: "-10%", width: 700, height: 700, borderRadius: "50%", background: "radial-gradient(circle, rgba(14,165,233,0.2) 0%, transparent 70%)", filter: "blur(120px)" }}
                />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto pb-16 pt-4 px-4 sm:px-0 flex flex-col gap-12 sm:gap-24">
                {/* Hero Header */}
                <header className="space-y-6 relative">
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
                        <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-white/[0.03] border border-white/[0.08] backdrop-blur-md mb-2 shadow-sm">
                            <Sparkles size={14} className="text-violet-400 opacity-80" />
                            <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-white/50">Ecosystem Overview</span>
                        </div>
                    </motion.div>

                    <div className="space-y-6">
                        <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="text-6xl sm:text-8xl font-black text-white tracking-tighter leading-[1.05]">
                            Welcome back, <br className="sm:hidden" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 drop-shadow-[0_0_40px_rgba(139,92,246,0.3)]">
                                {user?.name}
                            </span>
                        </motion.h1>

                        <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="text-xl sm:text-2xl text-white/40 font-medium max-w-3xl leading-relaxed">
                            Your decentralized network is operating at optimal capacity. Review your live ecosystem signals below.
                        </motion.p>
                    </div>
                </header>

                {/* Premium Stat Cards Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10">
                    {stats.map((s, i) => (
                        <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + (i * 0.1), type: "spring", stiffness: 100 }}>
                            <div className="group relative h-full rounded-[3rem] p-9 bg-gradient-to-br from-white/[0.05] to-transparent border border-white/[0.08] backdrop-blur-3xl overflow-hidden hover:border-white/[0.18] transition-all duration-500 shadow-2xl hover:shadow-[0_30px_70px_-20px_rgba(0,0,0,0.7)]">
                                {/* Hover Glow Effect */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${s.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none`} />

                                {/* Hexagon Background Pattern */}
                                <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.12] transition-opacity duration-700 pointer-events-none transform translate-x-1/4 -translate-y-1/4">
                                    <Hexagon size={200} className="text-white" strokeWidth={0.5} />
                                </div>

                                <div className="relative z-10">
                                    <div className="flex items-start justify-between mb-10">
                                        <div className={`w-16 h-16 rounded-[1.5rem] bg-white/[0.03] border border-white/[0.08] flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] group-hover:scale-110 group-hover:border-${s.glow}-500/30 transition-all duration-500`} style={{ boxShadow: `0 0 40px ${s.bg}0.15)` }}>
                                            <s.icon size={32} className={`${s.spark} drop-shadow-md`} strokeWidth={1.8} />
                                        </div>
                                        <motion.div whileHover={{ scale: 1.15 }} className="w-12 h-12 rounded-full bg-white/[0.02] border border-white/5 flex items-center justify-center cursor-pointer hover:bg-white/[0.1] transition-colors">
                                            <ArrowUpRight size={20} className="text-white/30 group-hover:text-white/80" />
                                        </motion.div>
                                    </div>

                                    <div className="space-y-2">
                                        <p className="text-xs font-bold text-white/30 uppercase tracking-[0.3em] mb-1">{s.label}</p>
                                        <p className="text-5xl sm:text-6xl font-black text-white tracking-tighter drop-shadow-xl">{s.value}</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Activity & Trending Split */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-16">
                    {/* System Activity */}
                    <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5, duration: 0.7 }}>
                        <div className="h-full rounded-[3.5rem] p-10 sm:p-14 bg-[#0c0d12]/70 backdrop-blur-[40px] border border-white/[0.07] shadow-[0_40px_80px_-30px_rgba(0,0,0,0.8)] relative overflow-hidden group">
                            {/* Accent Top Border */}
                            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-violet-500/0 via-violet-500/40 to-violet-500/0 opacity-50" />

                            <div className="flex items-center justify-between mb-12 relative z-10">
                                <div className="flex items-center gap-6">
                                    <div className="w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shadow-[0_0_50px_rgba(139,92,246,0.2)] relative">
                                        <div className="absolute inset-0 rounded-2xl border border-violet-400/20 animate-pulse" />
                                        <Activity size={28} className="text-violet-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-3xl font-black text-white tracking-tight">System Activity</h3>
                                        <p className="text-sm font-bold text-white/30 tracking-[0.2em] mt-1.5 uppercase">Live Signals</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                                    <span className="relative flex h-2.5 w-2.5">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                                    </span>
                                    <span className="text-[11px] font-black uppercase tracking-widest text-emerald-400">Stable</span>
                                </div>
                            </div>

                            <div className="space-y-6 relative z-10">
                                {[
                                    { text: "Node sync completion across cluster", time: "2m ago", color: "#8b5cf6", icon: Server },
                                    { text: "Global market data index refreshed", time: "5m ago", color: "#0ea5e9", icon: BarChart3 },
                                    { text: "New semantic POC deployed automatically", time: "12m ago", color: "#10b981", icon: Zap },
                                ].map((item, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.7 + i * 0.15 }}
                                        className="group/item flex items-center justify-between p-6 rounded-[2rem] bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] hover:border-white/[0.1] transition-all duration-500 hover:translate-x-1"
                                    >
                                        <div className="flex items-center gap-5">
                                            <div className="w-12 h-12 rounded-full bg-black/40 flex items-center justify-center border border-white/5 shadow-inner group-hover/item:border-white/10 transition-all">
                                                <item.icon size={20} style={{ color: item.color }} className="opacity-60 group-hover/item:opacity-100 group-hover/item:scale-110 transition-all duration-500" />
                                            </div>
                                            <span className="text-base font-semibold text-white/70 group-hover/item:text-white transition-colors tracking-tight">{item.text}</span>
                                        </div>
                                        <span className="text-[12px] font-bold text-white/30 bg-black/40 px-4 py-2 rounded-xl border border-white/5 group-hover/item:text-white/50 transition-colors uppercase tracking-tight">{item.time}</span>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    {/* Trending POCs */}
                    <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5, duration: 0.7 }}>
                        <div className="h-full rounded-[3.5rem] p-10 sm:p-14 bg-[#0c0d12]/70 backdrop-blur-[40px] border border-white/[0.07] shadow-[0_40px_80px_-30px_rgba(0,0,0,0.8)] relative overflow-hidden group">
                            {/* Accent Top Border */}
                            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-sky-500/0 via-sky-500/40 to-sky-500/0 opacity-50" />

                            <div className="flex items-center justify-between mb-12 relative z-10">
                                <div className="flex items-center gap-6">
                                    <div className="w-16 h-16 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center shadow-[0_0_50px_rgba(14,165,233,0.2)] relative">
                                        <TrendingUp size={28} className="text-sky-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-3xl font-black text-white tracking-tight">Trending POCs</h3>
                                        <p className="text-sm font-bold text-white/30 tracking-[0.2em] mt-1.5 uppercase">Network Velocity</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6 relative z-10">
                                {[
                                    { name: "AI Legal Engine", description: "Automated compliance", growth: "+42%", color: "#8b5cf6", trend: [0.4, 0.6, 0.8, 0.5, 1.0] },
                                    { name: "Fintech Ledger", description: "High-throughput DB", growth: "+38%", color: "#0ea5e9", trend: [0.3, 0.5, 0.4, 0.7, 0.9] },
                                    { name: "SaaS Automation", description: "Workflow orchestrator", growth: "+27%", color: "#10b981", trend: [0.2, 0.4, 0.6, 0.5, 0.7] },
                                ].map((poc, i) => (
                                    <motion.div
                                        key={poc.name}
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.7 + i * 0.15 }}
                                        className="group/item flex items-center justify-between p-6 rounded-[2.5rem] bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.06] hover:border-white/[0.12] transition-all duration-500 cursor-pointer hover:translate-x-1"
                                    >
                                        <div className="flex items-center gap-5">
                                            <div className="w-2 h-12 rounded-full" style={{ background: poc.color, boxShadow: `0 0 15px ${poc.color}60` }} />
                                            <div>
                                                <h4 className="text-lg font-black text-white group-hover/item:text-violet-300 transition-colors tracking-tight">{poc.name}</h4>
                                                <p className="text-sm font-semibold text-white/40 mt-1 tracking-tight">{poc.description}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-8">
                                            {/* Advanced Mini bar chart */}
                                            <div className="hidden sm:flex items-end gap-1.5 h-8">
                                                {poc.trend.map((h, j) => (
                                                    <motion.div
                                                        key={j}
                                                        initial={{ height: 0 }}
                                                        animate={{ height: `${h * 100}%` }}
                                                        transition={{ duration: 1.2, delay: 0.9 + (j * 0.1) }}
                                                        className="w-[5px] rounded-full"
                                                        style={{ background: poc.color, opacity: 0.4 + h * 0.6 }}
                                                    />
                                                ))}
                                            </div>
                                            <div className="flex flex-col items-end min-w-[70px]">
                                                <span className="text-xl font-black tracking-tight" style={{ color: poc.color }}>{poc.growth}</span>
                                                <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest mt-1">Growth</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </DashboardLayout>
    );
}
