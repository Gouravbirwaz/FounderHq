"use client";
import { motion } from "framer-motion";
import {
    TrendingUp, Server, Globe, Activity, Zap, BarChart3, ArrowUpRight,
    Briefcase
} from "lucide-react";
import * as React from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

interface ActivityItem {
    id?: string;
    text: string;
    time: string;
    icon: any;
    color: string;
}

interface POCItem {
    id: string;
    title: string;
    stage: string;
    author_name: string;
    upvotes: number;
}

const Spark = ({ trend = [0.1, 0.4, 0.2, 0.8, 0.5], color = "#a78bfa" }: { trend?: number[], color?: string }) => (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 20 }}>
        {trend.map((h, i) => (
            <motion.div key={i}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ duration: 0.5, delay: 0.8 + i * 0.07, ease: "easeOut" }}
                style={{ width: 3, height: `${h * 100}%`, background: color, borderRadius: 2, transformOrigin: "bottom", opacity: 0.4 + h * 0.6 }}
            />
        ))}
    </div>
);

const FadeUp = ({ children, delay = 0, style = {} }: { children: React.ReactNode, delay?: number, style?: React.CSSProperties }) => (
    <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
        style={style}
    >
        {children}
    </motion.div>
);

export default function Dashboard() {
    const { user } = useAuth();
    const router = useRouter();
    const [mounted, setMounted] = React.useState(false);
    const [pocs, setPocs] = React.useState<POCItem[]>([]);
    const [activity, setActivity] = React.useState<ActivityItem[]>([]);
    const [stats] = React.useState([
        { label: "Active Nodes", value: "24/24", sub: "All systems nominal", icon: Server, color: "#a78bfa" },
        { label: "Market Sentiment", value: "Bullish", sub: "Confidence index 94.2", icon: TrendingUp, color: "#34d399" },
        { label: "Network Growth", value: "+12.4%", sub: "vs last 30 days", icon: Globe, color: "#38bdf8" },
    ]);

    const fetchData = async () => {
        try {
            const pocData = await apiFetch("/pocs/");
            setPocs(pocData.slice(0, 3));

            const jobData = await apiFetch("/jobs/");
            const recentJobs = jobData.slice(0, 3).map((j: any) => ({
                id: j.id,
                text: `${j.title} at ${j.company}`,
                time: "Recently",
                icon: Briefcase,
                color: "#a78bfa"
            }));

            setActivity(recentJobs.length > 0 ? recentJobs : [
                { text: "Node sync completion across cluster", time: "2m ago", icon: Server, color: "#a78bfa" },
                { text: "Global market data index refreshed", time: "5m ago", icon: BarChart3, color: "#38bdf8" },
                { text: "New semantic POC deployed automatically", time: "12m ago", icon: Zap, color: "#34d399" },
            ]);
        } catch (err) {
            console.error("Dashboard fetch failed:", err);
        }
    };

    React.useEffect(() => {
        setMounted(true);
        fetchData();
    }, []);

    if (!mounted) return null;

    return (
        <DashboardLayout>
            <style>{`
                .hero-name {
                    background: linear-gradient(120deg, #a78bfa 0%, #ec4899 45%, #38bdf8 100%);
                    -webkit-background-clip: text; background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
                .hero-sub { margin-top: 12px; font-size: 15px; font-weight: 400; color: var(--text-2); line-height: 1.65; max-width: 440px; }
                .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
                @media(max-width: 720px) { .stats-grid { grid-template-columns: 1fr; } }
                .stat-card { background: var(--surface); border: 1px solid var(--border); border-radius: 18px; padding: 24px 22px 20px; display: flex; flex-direction: column; gap: 18px; position: relative; overflow: hidden; transition: border-color 0.3s, transform 0.3s, box-shadow 0.3s; }
                .stat-card:hover { border-color: var(--border-h); transform: translateY(-2px); box-shadow: 0 16px 40px rgba(0,0,0,0.35); }
                .stat-icon { width: 40px; height: 40px; border-radius: 11px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; background: var(--surface2); border: 1px solid var(--border); }
                .stat-arrow { width: 30px; height: 30px; border-radius: 8px; background: var(--sidebar); border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; }
                .stat-label { font-size: 10px; font-weight: 700; letter-spacing: 0.13em; text-transform: uppercase; color: var(--text-3); margin-bottom: 4px; }
                .stat-value { font-family: 'Syne', sans-serif; font-size: clamp(26px, 3.5vw, 34px); font-weight: 800; letter-spacing: -0.025em; color: var(--text-1); line-height: 1; }
                .stat-sub { font-size: 11.5px; color: var(--text-3); margin-top: 4px; }
                .panels-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-top: 40px; }
                @media(max-width: 820px) { .panels-grid { grid-template-columns: 1fr; } }
                .panel { background: var(--surface); border: 1px solid var(--border); border-radius: 18px; padding: 24px; position: relative; overflow: hidden; transition: border-color 0.3s; }
                .panel:hover { border-color: var(--border-h); }
                .panel-hd { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
                .panel-hd-left { display: flex; align-items: center; gap: 12px; }
                .panel-icon { width: 38px; height: 38px; border-radius: 11px; display: flex; align-items: center; justify-content: center; border: 1px solid var(--border); }
                .panel-title { font-family: 'Syne', sans-serif; font-size: 17px; font-weight: 700; letter-spacing: -0.015em; color: var(--text-1); }
                .panel-sub { font-size: 10px; font-weight: 700; letter-spacing: 0.13em; text-transform: uppercase; color: var(--text-3); margin-top: 2px; }
                .row { display: flex; align-items: center; gap: 12px; padding: 12px 14px; border-radius: 11px; background: var(--surface2); border: 1px solid var(--border); transition: all 0.2s; cursor: default; }
                .row + .row { margin-top: 8px; }
                .row-icon { width: 34px; height: 34px; border-radius: 9px; flex-shrink: 0; background: var(--sidebar); border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; }
                .row-text { font-size: 13px; font-weight: 500; color: var(--text-2); flex: 1; line-height: 1.4; }
                .row-time { font-size: 10px; font-weight: 600; color: var(--text-3); letter-spacing: 0.06em; white-space: nowrap; padding: 3px 8px; border-radius: 6px; background: var(--sidebar); border: 1px solid var(--border); }
                .poc-row { display: flex; align-items: center; gap: 12px; padding: 12px 14px; border-radius: 11px; background: var(--surface2); border: 1px solid var(--border); transition: all 0.2s; cursor: pointer; }
                .poc-row + .poc-row { margin-top: 8px; }
                .poc-bar { width: 3px; height: 34px; border-radius: 2px; flex-shrink: 0; }
                .poc-name { font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 700; color: var(--text-1); }
                .poc-desc { font-size: 11.5px; color: var(--text-3); margin-top: 2px; }
                .poc-right { display: flex; align-items: center; gap: 10px; margin-left: auto; }
                .poc-growth { font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 800; }
                .badge { display: inline-flex; align-items: center; gap: 7px; padding: 4px 14px; border-radius: 100px; border: 1px solid var(--border); background: var(--surface2); font-size: 10px; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; color: var(--text-3); margin-bottom: 18px; }
                .badge-dot { width: 5px; height: 5px; border-radius: 50%; background: #34d399; box-shadow: 0 0 6px #34d39980; }
            `}</style>


            <div className="stats-grid">
                {stats.map((s, i) => (
                    <FadeUp key={s.label} delay={0.12 + i * 0.08}>
                        <div className="stat-card">
                            <div className="stat-top">
                                <div className="stat-icon"><s.icon size={18} style={{ color: s.color }} strokeWidth={1.8} /></div>
                                <div className="stat-arrow"><ArrowUpRight size={13} style={{ color: "var(--text-3)" }} /></div>
                            </div>
                            <div>
                                <div className="stat-label">{s.label}</div>
                                <div className="stat-value">{s.value}</div>
                                <div className="stat-sub">{s.sub}</div>
                            </div>
                        </div>
                    </FadeUp>
                ))}
            </div>

            <div className="panels-grid">
                <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.38, duration: 0.55 }}>
                    <div className="panel">
                        <div className="panel-hd">
                            <div className="panel-hd-left">
                                <div className="panel-icon" style={{ background: "rgba(167,139,250,0.08)", borderColor: "rgba(167,139,250,0.2)" }}>
                                    <Activity size={18} style={{ color: "#a78bfa" }} strokeWidth={1.8} />
                                </div>
                                <div><div className="panel-title">System Activity</div><div className="panel-sub">Live Signals</div></div>
                            </div>
                        </div>
                        {activity.map((item, i) => (
                            <motion.div key={i} className="row" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.48 + i * 0.09 }}>
                                <div className="row-icon"><item.icon size={14} style={{ color: item.color }} strokeWidth={1.8} /></div>
                                <span className="row-text">{item.text}</span>
                                <span className="row-time">{item.time}</span>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.44, duration: 0.55 }}>
                    <div className="panel">
                        <div className="panel-hd">
                            <div className="panel-hd-left">
                                <div className="panel-icon" style={{ background: "rgba(56,189,248,0.08)", borderColor: "rgba(56,189,248,0.2)" }}>
                                    <TrendingUp size={18} style={{ color: "#38bdf8" }} strokeWidth={1.8} />
                                </div>
                                <div><div className="panel-title">Trending POCs</div><div className="panel-sub">Network Velocity</div></div>
                            </div>
                        </div>
                        {pocs.length > 0 ? pocs.map((poc, i) => (
                            <motion.div key={poc.id} className="poc-row" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.52 + i * 0.09 }} onClick={() => router.push(`/ideation`)}>
                                <div className="poc-bar" style={{ background: "#a78bfa", boxShadow: `0 0 8px #a78bfa55` }} />
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div className="poc-name">{poc.title}</div>
                                    <div className="poc-desc">{poc.stage} · {poc.author_name}</div>
                                </div>
                                <div className="poc-right"><Spark /><div className="poc-growth" style={{ color: "#a78bfa" }}>{poc.upvotes}</div></div>
                            </motion.div>
                        )) : (
                            <div className="py-10 text-center opacity-30 text-xs font-bold uppercase tracking-widest">No live POCs detected</div>
                        )}
                    </div>
                </motion.div>
            </div>
        </DashboardLayout>
    );
}