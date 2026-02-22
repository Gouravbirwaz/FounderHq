"use client";
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, AlertCircle, Clock, Globe, ImageOff, ExternalLink } from "lucide-react";
import { useTheme } from "next-themes";
import * as React from "react";

interface Article {
    title: string;
    link: string;
    pubDate: string;
    source: string;
    thumbnail: string;
    category: string;
}

const SOURCES = [
    { name: "Inc42", url: "https://inc42.com/feed/" },
    { name: "YourStory", url: "https://yourstory.com/feed" },
    { name: "TechCrunch", url: "https://techcrunch.com/category/startups/feed/" },
    { name: "CNBC", url: "https://www.cnbc.com/id/10000664/device/rss/rss.html" },
];

const SOURCE_COLORS: Record<string, string> = {
    Inc42: "#f59e0b",
    YourStory: "#22d3ee",
    TechCrunch: "#34d399",
    CNBC: "#fb7185",
};

const KEYWORDS = ["startup", "funding", "india", "acquisition", "ipo", "tech", "venture", "market", "finance", "economy", "ai", "fintech", "saas"];

const FILTERS = [
    { label: "All", keywords: [] as string[] },
    { label: "Tech", keywords: ["tech", "ai", "saas", "software", "cloud", "machine learning", "google", "meta", "apple"] },
    { label: "Funding", keywords: ["funding", "raise", "seed", "series", "venture", "investment", "investor", "valuation", "unicorn"] },
    { label: "Market", keywords: ["market", "stock", "ipo", "nifty", "sensex", "trading", "economy", "gdp", "rbi"] },
    { label: "FinTech", keywords: ["fintech", "payment", "banking", "upi", "lending", "credit", "insurance", "neobank"] },
    { label: "AI", keywords: ["ai", "artificial intelligence", "machine learning", "llm", "gpt", "deeptech", "neural"] },
];

function extractImage(item: any): string {
    // 1. Direct thumbnail field
    if (item.thumbnail && typeof item.thumbnail === "string" && item.thumbnail.startsWith("http")) {
        return item.thumbnail;
    }

    // 2. Enclosure (with type check)
    if (item.enclosure?.link && item.enclosure.type?.startsWith("image")) {
        return item.enclosure.link;
    }

    // 3. Enclosure (without type check — some feeds omit type)
    if (item.enclosure?.link && typeof item.enclosure.link === "string" && item.enclosure.link.startsWith("http")) {
        const url = item.enclosure.link.toLowerCase();
        if (url.match(/\.(jpg|jpeg|png|webp|gif|avif)/)) return item.enclosure.link;
    }

    // 4. Search through ALL HTML fields for <img> tags
    const htmlFields = [item.content, item.description, item["content:encoded"]].filter(Boolean);
    for (const html of htmlFields) {
        // Try src attribute
        const srcMatch = html.match(/<img[^>]+src=["']([^"']+)["']/i);
        if (srcMatch?.[1]?.startsWith("http")) return srcMatch[1];

        // Try data-src (lazy loading)
        const dataSrcMatch = html.match(/<img[^>]+data-src=["']([^"']+)["']/i);
        if (dataSrcMatch?.[1]?.startsWith("http")) return dataSrcMatch[1];

        // Try srcset (first URL)
        const srcsetMatch = html.match(/<img[^>]+srcset=["']([^\s"']+)/i);
        if (srcsetMatch?.[1]?.startsWith("http")) return srcsetMatch[1];

        // Try <figure> or <picture> source
        const sourceMatch = html.match(/<source[^>]+srcset=["']([^\s"']+)/i);
        if (sourceMatch?.[1]?.startsWith("http")) return sourceMatch[1];

        // Try any URL that looks like an image
        const urlMatch = html.match(/(https?:\/\/[^\s"'<>]+\.(?:jpg|jpeg|png|webp|gif|avif))/i);
        if (urlMatch?.[1]) return urlMatch[1];
    }

    return "";
}

export function NewsSection({ compact = false }: { compact?: boolean }) {
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);
    const [news, setNews] = useState<Article[]>([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [activeFilter, setActiveFilter] = useState("All");
    const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

    React.useEffect(() => {
        setMounted(true);
    }, []);


    const fetchNews = async () => {
        setLoading(true);
        setError(false);
        try {
            const allNews: Article[] = [];
            for (const source of SOURCES) {
                try {
                    const res = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${source.url}`);
                    const data = await res.json();
                    if (data.items) {
                        data.items.slice(0, 12).forEach((item: any) => {
                            const match = KEYWORDS.some(k =>
                                item.title.toLowerCase().includes(k) ||
                                item.description?.toLowerCase().includes(k)
                            );
                            if (match) {
                                const text = `${item.title} ${item.description ?? ""}`.toLowerCase();
                                let category = "Other";
                                for (const f of FILTERS.slice(1)) {
                                    if (f.keywords.some(k => text.includes(k))) { category = f.label; break; }
                                }
                                allNews.push({
                                    title: item.title,
                                    link: item.link,
                                    pubDate: item.pubDate,
                                    source: source.name,
                                    thumbnail: extractImage(item),
                                    category,
                                });
                            }
                        });
                    }
                } catch (e) {
                    console.error(`Failed to fetch ${source.name}:`, e);
                }
            }
            const sorted = allNews.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
            setNews(sorted.slice(0, 20));
        } catch {
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchNews(); }, []);

    const filtered = useMemo(() => {
        if (activeFilter === "All") return news;
        return news.filter(n => {
            const text = n.title.toLowerCase();
            const filterDef = FILTERS.find(f => f.label === activeFilter);
            return filterDef?.keywords.some(k => text.includes(k));
        });
    }, [news, activeFilter]);

    const filterCounts = useMemo(() => {
        const counts: Record<string, number> = { All: news.length };
        for (const f of FILTERS.slice(1)) {
            counts[f.label] = news.filter(n => f.keywords.some(k => n.title.toLowerCase().includes(k))).length;
        }
        return counts;
    }, [news]);

    if (!mounted) return null;
    const isLight = resolvedTheme === "light";

    const timeAgo = (dateStr: string) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        return `${Math.floor(hrs / 24)}d ago`;
    };

    /* ── Compact list view (for sidebar) ── */
    if (compact) {
        return (
            <div style={{
                display: "flex", flexDirection: "column", height: "100%",
                background: "var(--surface-1)",
                borderRadius: 20,
                border: "1px solid var(--border-subtle)",
                overflow: "hidden",
                boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
            }}>
                {/* Header */}
                <div style={{
                    padding: "16px 20px",
                    borderBottom: "1px solid var(--border-subtle)",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    background: "var(--surface-2)",
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <Globe size={14} style={{ color: "var(--text-tertiary)" }} />
                        <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-secondary)", letterSpacing: "-0.01em" }}>Live Feed</span>
                        <span style={{
                            fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 6,
                            background: "rgba(var(--accent-violet-rgb, 139, 92, 246), 0.12)", color: "var(--accent-violet)",
                        }}>{filtered.length}</span>
                    </div>
                    <button
                        onClick={fetchNews}
                        disabled={loading}
                        style={{
                            background: "var(--border-subtle)", border: "1px solid var(--border-subtle)", cursor: "pointer",
                            color: "var(--text-secondary)", padding: 6, borderRadius: 8, transition: "all 0.2s ease",
                        }}
                    >
                        <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
                    </button>
                </div>

                {/* List */}
                <div style={{ flex: 1, overflowY: "auto", padding: "4px 0" }} className="custom-scrollbar">
                    {loading && news.length === 0 ? (
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 120, color: "rgba(255,255,255,0.2)" }}>
                            <RefreshCw className="animate-spin" size={16} />
                        </div>
                    ) : filtered.length === 0 ? (
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 120, color: "rgba(255,255,255,0.15)", fontSize: 12 }}>
                            No articles
                        </div>
                    ) : (
                        filtered.slice(0, 15).map((item, i) => {
                            const sourceColor = SOURCE_COLORS[item.source] || "#8b5cf6";
                            return (
                                <a
                                    key={item.link + i}
                                    href={item.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                        display: "flex", alignItems: "flex-start", gap: 12,
                                        padding: "14px 20px",
                                        textDecoration: "none",
                                        borderBottom: "1px solid var(--border-subtle)",
                                        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                                    }}
                                    onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = "var(--surface-2)"; }}
                                    onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = "transparent"; }}
                                >
                                    <div style={{
                                        width: 8, height: 8, borderRadius: 4, flexShrink: 0, marginTop: 6,
                                        background: sourceColor,
                                        boxShadow: `0 0 8px ${sourceColor}60`,
                                    }} />
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{
                                            fontSize: 13, fontWeight: 600, lineHeight: 1.5,
                                            color: "var(--text-primary)",
                                            display: "-webkit-box",
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: "vertical",
                                            overflow: "hidden",
                                            margin: 0,
                                            letterSpacing: "-0.01em",
                                        }}>
                                            {item.title}
                                        </p>
                                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
                                            <span style={{ fontSize: 10, fontWeight: 700, color: sourceColor, textTransform: "uppercase", letterSpacing: "0.05em" }}>{item.source}</span>
                                            <span style={{ fontSize: 10, color: "var(--text-tertiary)" }}>·</span>
                                            <span style={{ fontSize: 10, color: "var(--text-tertiary)", fontWeight: 500 }}>{timeAgo(item.pubDate)}</span>
                                        </div>
                                    </div>
                                </a>
                            );
                        })
                    )}
                </div>
            </div>
        );
    }

    /* ── Full card grid view ── */
    return (
        <div className="flex flex-col h-full">
            {/* Filter bar */}
            <div className="flex items-center justify-between gap-4 mb-5 flex-shrink-0 flex-wrap">
                <div className="flex items-center gap-1.5 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
                    {FILTERS.map(f => {
                        const active = activeFilter === f.label;
                        const count = filterCounts[f.label] ?? 0;
                        return (
                            <button
                                key={f.label}
                                onClick={() => setActiveFilter(f.label)}
                                className="flex items-center gap-1.5 flex-shrink-0 transition-all duration-200 cursor-pointer"
                                style={{
                                    padding: "8px 16px",
                                    borderRadius: 12,
                                    fontSize: 12,
                                    fontWeight: active ? 700 : 500,
                                    background: active ? "rgba(var(--accent-violet-rgb, 139, 92, 246), 0.12)" : "var(--surface-1)",
                                    border: `1px solid ${active ? "rgba(var(--accent-violet-rgb, 139, 92, 246), 0.3)" : "var(--border-subtle)"}`,
                                    color: active ? "var(--text-primary)" : "var(--text-tertiary)",
                                }}
                            >
                                {f.label}
                                {count > 0 && (
                                    <span style={{
                                        fontSize: 10, fontWeight: 700,
                                        padding: "1px 6px", borderRadius: 6,
                                        background: active ? "rgba(var(--accent-violet-rgb, 139, 92, 246), 0.2)" : "var(--surface-2)",
                                        color: active ? "var(--accent-violet)" : "var(--text-tertiary)",
                                        border: active ? "1px solid rgba(var(--accent-violet-rgb), 0.2)" : "1px solid var(--border-subtle)",
                                    }}>
                                        {count}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
                <button
                    onClick={fetchNews}
                    disabled={loading}
                    className="p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-1)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-2)] transition-all disabled:opacity-50 flex-shrink-0 cursor-pointer shadow-sm"
                >
                    <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <AnimatePresence mode="popLayout">
                    {loading && news.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 gap-4 text-[var(--text-tertiary)]">
                            <RefreshCw className="animate-spin" size={28} />
                            <p className="text-sm font-bold uppercase tracking-widest opacity-60">Syncing Intelligence Feed...</p>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center h-64 gap-4 text-center">
                            <AlertCircle size={32} className="text-rose-500/60" />
                            <p className="text-sm font-bold text-[var(--text-secondary)]">Connection Disrupted</p>
                            <button onClick={fetchNews} className="text-xs text-[var(--text-tertiary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)] px-6 py-2.5 rounded-xl mt-2 cursor-pointer font-bold uppercase tracking-wider transition-colors shadow-sm bg-[var(--surface-1)]">Retry Connection</button>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 gap-3 text-[var(--text-tertiary)] opacity-40">
                            <Globe size={32} />
                            <p className="text-sm font-bold">No signals detected for this sector</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {filtered.map((item, i) => {
                                const sourceColor = SOURCE_COLORS[item.source] || "#8b5cf6";
                                const hasImage = item.thumbnail && !failedImages.has(item.thumbnail);
                                return (
                                    <motion.a
                                        key={item.link + i}
                                        href={item.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        initial={{ opacity: 0, y: 12 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.04, duration: 0.35 }}
                                        className="group block rounded-2xl overflow-hidden transition-all duration-300"
                                        style={{
                                            background: "var(--card-bg)",
                                            border: "1px solid var(--border-subtle)",
                                        }}
                                        onMouseEnter={e => {
                                            (e.currentTarget as HTMLAnchorElement).style.borderColor = `${sourceColor}60`;
                                            (e.currentTarget as HTMLAnchorElement).style.boxShadow = `0 12px 32px rgba(0,0,0,${isLight ? "0.06" : "0.4"}), 0 0 0 1px ${sourceColor}20`;
                                            if (isLight) (e.currentTarget as HTMLAnchorElement).style.background = `rgba(var(--accent-rose-rgb), 0.02)`;
                                        }}
                                        onMouseLeave={e => {
                                            (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--border-subtle)";
                                            (e.currentTarget as HTMLAnchorElement).style.boxShadow = "none";
                                            (e.currentTarget as HTMLAnchorElement).style.background = "var(--card-bg)";
                                        }}
                                    >
                                        {/* Image area */}
                                        <div style={{
                                            height: 140,
                                            background: hasImage ? "transparent" : `linear-gradient(135deg, ${sourceColor}12 0%, rgba(12,13,20,0.9) 100%)`,
                                            position: "relative",
                                            overflow: "hidden",
                                        }}>
                                            {hasImage ? (
                                                <img
                                                    src={item.thumbnail}
                                                    alt=""
                                                    style={{
                                                        width: "100%", height: "100%", objectFit: "cover",
                                                        transition: "transform 0.4s ease",
                                                    }}
                                                    className="group-hover:scale-105"
                                                    onError={() => setFailedImages(prev => new Set(prev).add(item.thumbnail))}
                                                />
                                            ) : (
                                                <div className="flex items-center justify-center h-full">
                                                    <ImageOff size={28} style={{ color: `${sourceColor}30` }} />
                                                </div>
                                            )}
                                            {/* Gradient overlay */}
                                            <div style={{
                                                position: "absolute", bottom: 0, left: 0, right: 0, height: 50,
                                                background: "linear-gradient(to top, rgba(12,13,20,0.95), transparent)",
                                                pointerEvents: "none",
                                            }} />
                                            {/* Source badge */}
                                            <span style={{
                                                position: "absolute", top: 10, left: 10,
                                                padding: "3px 8px", borderRadius: 6,
                                                fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em",
                                                background: `${sourceColor}25`,
                                                color: sourceColor,
                                                border: `1px solid ${sourceColor}30`,
                                                backdropFilter: "blur(8px)",
                                            }}>
                                                {item.source}
                                            </span>
                                            {/* External link icon */}
                                            <div style={{
                                                position: "absolute", top: 12, right: 12,
                                                opacity: 0, transition: "all 0.25s ease",
                                            }} className="group-hover:opacity-100 group-hover:translate-x-0 translate-x-1">
                                                <div style={{
                                                    width: 30, height: 30, borderRadius: 10,
                                                    background: "rgba(0,0,0,0.4)", backdropFilter: "blur(12px)",
                                                    display: "flex", alignItems: "center", justifyContent: "center",
                                                    border: "1px solid rgba(255,255,255,0.1)",
                                                }}>
                                                    <ExternalLink size={12} color="#fff" strokeWidth={2.5} />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Card body */}
                                        <div style={{ padding: "16px 18px 20px" }}>
                                            <h4 style={{
                                                fontSize: 14, fontWeight: 700, lineHeight: 1.5,
                                                color: "var(--text-primary)",
                                                display: "-webkit-box",
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: "vertical",
                                                overflow: "hidden",
                                                transition: "color 0.2s",
                                                letterSpacing: "-0.01em",
                                                margin: 0,
                                            }}>
                                                {item.title}
                                            </h4>

                                            <div style={{
                                                display: "flex", alignItems: "center", justifyContent: "space-between",
                                                marginTop: 14, gap: 8,
                                            }}>
                                                <div className="flex items-center gap-1.5" style={{ color: "var(--text-tertiary)" }}>
                                                    <Clock size={11} strokeWidth={2.2} />
                                                    <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase" }}>{timeAgo(item.pubDate)}</span>
                                                </div>
                                                {item.category !== "Other" && (
                                                    <span style={{
                                                        fontSize: 9, fontWeight: 800,
                                                        padding: "2px 8px", borderRadius: 6,
                                                        background: "var(--surface-2)",
                                                        color: "var(--text-tertiary)",
                                                        border: "1px solid var(--border-subtle)",
                                                        textTransform: "uppercase",
                                                        letterSpacing: "0.05em",
                                                    }}>
                                                        {item.category}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </motion.a>
                                );
                            })}
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
