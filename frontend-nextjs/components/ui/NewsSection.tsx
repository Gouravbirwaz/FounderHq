"use client";
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, AlertCircle, Clock, Globe, ImageOff, ExternalLink } from "lucide-react";

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
    const [news, setNews] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [activeFilter, setActiveFilter] = useState("All");
    const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

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
                background: "rgba(255,255,255,0.02)",
                borderRadius: 16,
                border: "1px solid rgba(255,255,255,0.05)",
                overflow: "hidden",
            }}>
                {/* Header */}
                <div style={{
                    padding: "14px 16px",
                    borderBottom: "1px solid rgba(255,255,255,0.04)",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <Globe size={14} style={{ color: "rgba(255,255,255,0.3)" }} />
                        <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.6)" }}>Live Feed</span>
                        <span style={{
                            fontSize: 9, fontWeight: 600, padding: "2px 6px", borderRadius: 5,
                            background: "rgba(139,92,246,0.15)", color: "#c4b5fd",
                        }}>{filtered.length}</span>
                    </div>
                    <button
                        onClick={fetchNews}
                        disabled={loading}
                        style={{
                            background: "none", border: "none", cursor: "pointer",
                            color: "rgba(255,255,255,0.25)", padding: 4,
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
                                        display: "flex", alignItems: "flex-start", gap: 10,
                                        padding: "10px 16px",
                                        textDecoration: "none",
                                        borderBottom: "1px solid rgba(255,255,255,0.03)",
                                        transition: "background 0.15s",
                                    }}
                                    onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.03)"; }}
                                    onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = "transparent"; }}
                                >
                                    <div style={{
                                        width: 6, height: 6, borderRadius: 3, flexShrink: 0, marginTop: 5,
                                        background: sourceColor,
                                        boxShadow: `0 0 6px ${sourceColor}50`,
                                    }} />
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{
                                            fontSize: 12, fontWeight: 500, lineHeight: 1.4,
                                            color: "rgba(255,255,255,0.6)",
                                            display: "-webkit-box",
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: "vertical",
                                            overflow: "hidden",
                                            margin: 0,
                                        }}>
                                            {item.title}
                                        </p>
                                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                                            <span style={{ fontSize: 9, fontWeight: 600, color: sourceColor, opacity: 0.7 }}>{item.source}</span>
                                            <span style={{ fontSize: 9, color: "rgba(255,255,255,0.15)" }}>·</span>
                                            <span style={{ fontSize: 9, color: "rgba(255,255,255,0.2)" }}>{timeAgo(item.pubDate)}</span>
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
                                    padding: "6px 12px",
                                    borderRadius: 10,
                                    fontSize: 12,
                                    fontWeight: active ? 600 : 500,
                                    background: active ? "rgba(139,92,246,0.15)" : "rgba(255,255,255,0.03)",
                                    border: `1px solid ${active ? "rgba(139,92,246,0.3)" : "rgba(255,255,255,0.06)"}`,
                                    color: active ? "#c4b5fd" : "rgba(255,255,255,0.4)",
                                }}
                            >
                                {f.label}
                                {count > 0 && (
                                    <span style={{
                                        fontSize: 10, fontWeight: 600,
                                        padding: "1px 6px", borderRadius: 6,
                                        background: active ? "rgba(139,92,246,0.25)" : "rgba(255,255,255,0.05)",
                                        color: active ? "#c4b5fd" : "rgba(255,255,255,0.22)",
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
                    className="p-2 rounded-lg border border-white/6 text-white/25 hover:text-white/60 hover:bg-white/[0.04] transition-all disabled:opacity-50 flex-shrink-0 cursor-pointer"
                >
                    <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <AnimatePresence mode="popLayout">
                    {loading && news.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 gap-3 text-white/20">
                            <RefreshCw className="animate-spin" size={24} />
                            <p className="text-sm font-medium">Syncing feed...</p>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center h-64 gap-3 text-rose-400/60 text-center">
                            <AlertCircle size={28} />
                            <p className="text-sm font-medium">Connection issue</p>
                            <button onClick={fetchNews} className="text-xs text-white/40 hover:text-white border border-white/10 px-4 py-2 rounded-lg mt-2 cursor-pointer">Retry</button>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-48 gap-2 text-white/15">
                            <Globe size={24} />
                            <p className="text-sm font-medium">No articles match this filter</p>
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
                                            background: "rgba(12,13,20,0.7)",
                                            border: "1px solid rgba(255,255,255,0.06)",
                                        }}
                                        onMouseEnter={e => {
                                            (e.currentTarget as HTMLAnchorElement).style.borderColor = `${sourceColor}40`;
                                            (e.currentTarget as HTMLAnchorElement).style.boxShadow = `0 8px 24px rgba(0,0,0,0.3), 0 0 0 1px ${sourceColor}15`;
                                        }}
                                        onMouseLeave={e => {
                                            (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,255,255,0.06)";
                                            (e.currentTarget as HTMLAnchorElement).style.boxShadow = "none";
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
                                                position: "absolute", top: 10, right: 10,
                                                opacity: 0, transition: "opacity 0.2s",
                                            }} className="group-hover:opacity-100">
                                                <div style={{
                                                    width: 28, height: 28, borderRadius: 8,
                                                    background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)",
                                                    display: "flex", alignItems: "center", justifyContent: "center",
                                                }}>
                                                    <ExternalLink size={12} color="#fff" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Card body */}
                                        <div style={{ padding: "14px 16px 16px" }}>
                                            <h4 style={{
                                                fontSize: 13, fontWeight: 600, lineHeight: 1.5,
                                                color: "rgba(255,255,255,0.75)",
                                                display: "-webkit-box",
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: "vertical",
                                                overflow: "hidden",
                                                transition: "color 0.2s",
                                            }} className="group-hover:text-white">
                                                {item.title}
                                            </h4>

                                            <div style={{
                                                display: "flex", alignItems: "center", justifyContent: "space-between",
                                                marginTop: 10, gap: 8,
                                            }}>
                                                <div className="flex items-center gap-1.5" style={{ color: "rgba(255,255,255,0.2)" }}>
                                                    <Clock size={10} />
                                                    <span style={{ fontSize: 10, fontWeight: 500 }}>{timeAgo(item.pubDate)}</span>
                                                </div>
                                                {item.category !== "Other" && (
                                                    <span style={{
                                                        fontSize: 9, fontWeight: 600,
                                                        padding: "2px 7px", borderRadius: 5,
                                                        background: "rgba(255,255,255,0.04)",
                                                        color: "rgba(255,255,255,0.3)",
                                                        border: "1px solid rgba(255,255,255,0.05)",
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
