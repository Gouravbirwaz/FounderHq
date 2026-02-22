"use client";
import { useState, useEffect, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { GlassCard } from "@/components/ui/GlassCard";
import { NeonButton } from "@/components/ui/NeonButton";
import {
    Activity, TrendingUp, TrendingDown, AlertCircle, Plus, Bell,
    Wifi, WifiOff, ArrowUpRight, ArrowDownRight, BarChart3,
    Layers, Cpu, Building2, Flame, ShoppingCart, Pill, Search, X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useFCSSocket, SECTORS, type PriceData } from "@/hooks/useFCSSocket";
import { toast } from "@/components/ui/Toast";

/* ─── Sector icon map ─── */
const SECTOR_ICONS: Record<string, React.ReactNode> = {
    Tech: <Cpu size={14} />,
    Finance: <Building2 size={14} />,
    Energy: <Flame size={14} />,
    Consumer: <ShoppingCart size={14} />,
    Pharma: <Pill size={14} />,
};

/* ─── Mini sparkline SVG ─── */
function Sparkline({ data, color, width = 80, height = 32 }: { data: number[]; color: string; width?: number; height?: number }) {
    if (data.length < 2) {
        return <div style={{ width, height, opacity: 0.1, display: "flex", alignItems: "center", justifyContent: "center" }}><BarChart3 size={16} style={{ color }} /></div>;
    }
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const points = data.map((v, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - ((v - min) / range) * (height - 4) - 2;
        return `${x},${y}`;
    }).join(" ");

    const areaPoints = `0,${height} ${points} ${width},${height}`;

    return (
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: "visible" }}>
            <defs>
                <linearGradient id={`sg-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.3" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                </linearGradient>
            </defs>
            <polygon points={areaPoints} fill={`url(#sg-${color.replace("#", "")})`} />
            <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            {/* Last point dot */}
            {data.length > 0 && (() => {
                const lastX = width;
                const lastY = height - ((data[data.length - 1] - min) / range) * (height - 4) - 2;
                return <circle cx={lastX} cy={lastY} r="2.5" fill={color} style={{ filter: `drop-shadow(0 0 4px ${color})` }} />;
            })()}
        </svg>
    );
}

/* ─── Price flash animation ─── */
function FlashPrice({ price, direction, currency = "₹" }: { price: number; direction: "up" | "down" | "flat"; currency?: string }) {
    const [flash, setFlash] = useState(false);
    useEffect(() => {
        setFlash(true);
        const t = setTimeout(() => setFlash(false), 600);
        return () => clearTimeout(t);
    }, [price]);

    return (
        <span
            className="font-mono font-bold transition-colors duration-300"
            style={{
                color: flash
                    ? direction === "up" ? "#34d399" : direction === "down" ? "#fb7185" : "#fff"
                    : "rgba(255,255,255,0.9)",
                textShadow: flash
                    ? direction === "up" ? "0 0 12px rgba(52,211,153,0.4)" : direction === "down" ? "0 0 12px rgba(251,113,133,0.4)" : "none"
                    : "none",
            }}
        >
            {currency}{price.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
    );
}

/* ─── Main page ─── */
/* ─── All symbols flat list for search ─── */
const ALL_SYMBOLS = SECTORS.flatMap(s => s.symbols.map(sym => ({ ...sym, sector: s.label, sectorColor: s.color })));

export default function MarketPage() {
    const [activeSector, setActiveSector] = useState("Tech");
    const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
    const [alertThreshold, setAlertThreshold] = useState("");
    const [alertDir, setAlertDir] = useState("above");
    const [searchQuery, setSearchQuery] = useState("");
    const [searchFocused, setSearchFocused] = useState(false);

    const { prices, connected, status, sectorSymbols } = useFCSSocket(activeSector);
    const sectorDef = SECTORS.find(s => s.label === activeSector)!;

    // Search across ALL sectors
    const isSearching = searchQuery.trim().length > 0;
    const searchResults = useMemo(() => {
        if (!isSearching) return [];
        const q = searchQuery.toLowerCase().trim();
        return ALL_SYMBOLS.filter(s =>
            s.displayName.toLowerCase().includes(q) ||
            s.symbol.toLowerCase().includes(q) ||
            s.exchange.toLowerCase().includes(q) ||
            s.sector.toLowerCase().includes(q)
        );
    }, [searchQuery, isSearching]);

    // Symbols to display: search results or current sector
    const displaySymbols = isSearching ? searchResults : sectorSymbols;

    const selectedPrice = selectedSymbol ? prices[selectedSymbol] : null;
    // Look across all sectors for the selected symbol def
    const selectedDef = useMemo(() => {
        for (const sec of SECTORS) {
            const found = sec.symbols.find(s => s.symbol === selectedSymbol);
            if (found) return found;
        }
        return undefined;
    }, [selectedSymbol]);

    const formatPct = (v: number) => `${v > 0 ? "+" : ""}${v.toFixed(2)}%`;

    const createAlert = () => {
        if (!alertThreshold || !selectedSymbol) return;
        const name = selectedDef?.displayName ?? selectedSymbol;
        toast("success", "Alert Set", `You'll be notified when ${name} goes ${alertDir} ₹${alertThreshold}`);
        setAlertThreshold("");
    };

    // When user clicks a search result, switch to that sector
    const handleSelectStock = (symbol: string) => {
        setSelectedSymbol(symbol);
        // Find which sector this stock belongs to and switch to it
        const match = ALL_SYMBOLS.find(s => s.symbol === symbol);
        if (match && match.sector !== activeSector) {
            setActiveSector(match.sector);
        }
        setSearchQuery("");
    };

    // Auto-select first symbol when sector changes
    useEffect(() => {
        if (!isSearching && sectorSymbols.length > 0) {
            setSelectedSymbol(sectorSymbols[0].symbol);
        }
    }, [activeSector, sectorSymbols, isSearching]);

    // Count stocks with data
    const activeCount = sectorSymbols.filter(s => prices[s.symbol]).length;

    return (
        <DashboardLayout>
            <div className="max-w-[1400px] mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-1.5 h-1.5 rounded-full" style={{ background: sectorDef.color, boxShadow: `0 0 8px ${sectorDef.color}` }} />
                            <span className="text-[10px] font-medium uppercase tracking-widest" style={{ color: `${sectorDef.color}99` }}>Live Terminal</span>
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-white">Market Terminal</h1>
                        <p className="text-sm text-white/35 mt-1.5 max-w-xl font-normal">Real-time stock prices powered by FCS WebSocket — sector intelligence dashboard.</p>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                        {/* Search input */}
                        <div className="relative" style={{ minWidth: 220 }}>
                            <Search size={14} style={{
                                position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
                                color: searchFocused ? sectorDef.color : "rgba(255,255,255,0.2)",
                                transition: "color 0.2s",
                            }} />
                            <input
                                type="text"
                                placeholder="Search stocks across sectors..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                onFocus={() => setSearchFocused(true)}
                                onBlur={() => setSearchFocused(false)}
                                className="w-full font-mono transition-all duration-200"
                                style={{
                                    padding: "9px 34px 9px 34px",
                                    borderRadius: 12,
                                    fontSize: 12,
                                    background: searchFocused ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.03)",
                                    border: `1px solid ${searchFocused ? `${sectorDef.color}40` : "rgba(255,255,255,0.06)"}`,
                                    color: "#fff",
                                    outline: "none",
                                    boxShadow: searchFocused ? `0 0 16px ${sectorDef.color}10` : "none",
                                }}
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery("")}
                                    className="cursor-pointer"
                                    style={{
                                        position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
                                        background: "none", border: "none", padding: 2,
                                        color: "rgba(255,255,255,0.3)",
                                    }}
                                >
                                    <X size={13} />
                                </button>
                            )}
                        </div>

                        {/* Connection status */}
                        <div className="flex items-center gap-2 px-3 py-2 rounded-xl border" style={{
                            background: connected ? "rgba(52,211,153,0.06)" : "rgba(251,113,133,0.06)",
                            borderColor: connected ? "rgba(52,211,153,0.15)" : "rgba(251,113,133,0.15)",
                        }}>
                            {connected ? <Wifi size={13} className="text-emerald-400" /> : <WifiOff size={13} className="text-rose-400" />}
                            <span className="text-[10px] font-semibold uppercase tracking-wider" style={{
                                color: connected ? "#34d399" : "#fb7185"
                            }}>
                                {status === "connecting" ? "Connecting" : connected ? "Live" : "Offline"}
                            </span>
                            {connected && (
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" style={{ boxShadow: "0 0 6px #34d399" }} />
                            )}
                        </div>
                        {activeCount > 0 && (
                            <span className="text-[10px] text-white/25 font-medium">{activeCount}/{sectorSymbols.length} feeds</span>
                        )}
                    </div>
                </div>

                {/* Sector Tabs + Search indicator */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
                    {isSearching && (
                        <div className="flex items-center gap-2 flex-shrink-0 px-4 py-2.5 rounded-xl" style={{
                            background: "rgba(139,92,246,0.12)",
                            border: "1px solid rgba(139,92,246,0.25)",
                        }}>
                            <Search size={12} style={{ color: "#c4b5fd" }} />
                            <span style={{ fontSize: 12, fontWeight: 600, color: "#c4b5fd" }}>
                                {searchResults.length} result{searchResults.length !== 1 ? "s" : ""}
                            </span>
                            <span style={{ fontSize: 10, color: "rgba(196,181,253,0.5)" }}>for &ldquo;{searchQuery}&rdquo;</span>
                        </div>
                    )}
                    {SECTORS.map(sector => {
                        const active = activeSector === sector.label;
                        return (
                            <button
                                key={sector.label}
                                onClick={() => { setActiveSector(sector.label); setSearchQuery(""); }}
                                className="flex items-center gap-2 flex-shrink-0 transition-all duration-200 cursor-pointer"
                                style={{
                                    padding: "10px 18px",
                                    borderRadius: 14,
                                    fontSize: 13,
                                    fontWeight: active ? 600 : 500,
                                    background: active && !isSearching ? `${sector.color}18` : "rgba(255,255,255,0.03)",
                                    border: `1px solid ${active && !isSearching ? `${sector.color}40` : "rgba(255,255,255,0.06)"}`,
                                    color: active && !isSearching ? sector.color : "rgba(255,255,255,0.4)",
                                    boxShadow: active && !isSearching ? `0 0 20px ${sector.color}10` : "none",
                                    opacity: isSearching ? 0.5 : 1,
                                }}
                            >
                                {SECTOR_ICONS[sector.label]}
                                <span>{sector.label}</span>
                                {active && !isSearching && prices && (
                                    <span style={{
                                        fontSize: 9, fontWeight: 700,
                                        padding: "2px 6px", borderRadius: 6,
                                        background: `${sector.color}25`,
                                        color: sector.color,
                                    }}>
                                        {sector.symbols.length}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    {/* Main area — Stock Grid */}
                    <div className="lg:col-span-2 space-y-5">
                        {/* Stock cards grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <AnimatePresence mode="popLayout">
                                {isSearching && displaySymbols.length === 0 && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="col-span-2 flex flex-col items-center justify-center py-16 text-center"
                                    >
                                        <Search size={32} style={{ color: "rgba(255,255,255,0.08)", marginBottom: 12 }} />
                                        <p className="text-sm text-white/25 font-medium">No stocks found for &ldquo;{searchQuery}&rdquo;</p>
                                        <p className="text-xs text-white/15 mt-1">Try searching by name, symbol, or sector</p>
                                    </motion.div>
                                )}
                                {displaySymbols.map((sym, i) => {
                                    const symSector = ALL_SYMBOLS.find(s => s.symbol === sym.symbol);
                                    const cardColor = isSearching && symSector ? symSector.sectorColor : sectorDef.color;
                                    const pd = prices[sym.symbol];
                                    const isSelected = selectedSymbol === sym.symbol;
                                    const dir = pd?.direction ?? "flat";
                                    const dirColor = dir === "up" ? "#34d399" : dir === "down" ? "#fb7185" : "rgba(255,255,255,0.3)";

                                    return (
                                        <motion.div
                                            key={sym.symbol}
                                            initial={{ opacity: 0, y: 16 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ delay: i * 0.06, duration: 0.3 }}
                                        >
                                            <button
                                                onClick={() => handleSelectStock(sym.symbol)}
                                                className="w-full text-left transition-all duration-200 cursor-pointer"
                                                style={{
                                                    padding: "20px",
                                                    borderRadius: 18,
                                                    background: isSelected
                                                        ? `linear-gradient(135deg, ${cardColor}10, rgba(12,13,20,0.8))`
                                                        : "rgba(255,255,255,0.02)",
                                                    border: `1px solid ${isSelected ? `${cardColor}35` : "rgba(255,255,255,0.05)"}`,
                                                    boxShadow: isSelected ? `0 4px 24px ${cardColor}10, inset 0 1px 0 ${cardColor}10` : "none",
                                                }}
                                            >
                                                <div className="flex items-start justify-between mb-3">
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <h3 className="text-sm font-semibold text-white">{sym.displayName}</h3>
                                                            <span style={{
                                                                fontSize: 8, fontWeight: 700, padding: "2px 5px", borderRadius: 4,
                                                                background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.25)",
                                                                letterSpacing: "0.05em",
                                                            }}>
                                                                {sym.exchange}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 mt-0.5">
                                                            <p className="text-[10px] text-white/20 font-mono">{sym.symbol}</p>
                                                            {isSearching && symSector && (
                                                                <span style={{
                                                                    fontSize: 8, fontWeight: 700, padding: "1px 5px", borderRadius: 4,
                                                                    background: `${symSector.sectorColor}18`,
                                                                    color: symSector.sectorColor,
                                                                    border: `1px solid ${symSector.sectorColor}25`,
                                                                }}>
                                                                    {symSector.sector}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {pd && (
                                                        <div className="flex items-center gap-1 px-2 py-1 rounded-lg" style={{
                                                            background: `${dirColor}15`,
                                                            border: `1px solid ${dirColor}20`,
                                                        }}>
                                                            {dir === "up" ? <ArrowUpRight size={10} style={{ color: dirColor }} /> : <ArrowDownRight size={10} style={{ color: dirColor }} />}
                                                            <span style={{ fontSize: 10, fontWeight: 600, color: dirColor }}>
                                                                {formatPct(pd.changePct)}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex items-end justify-between">
                                                    <div>
                                                        {pd ? (
                                                            <div className="text-xl">
                                                                <FlashPrice price={pd.price} direction={pd.direction} />
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-20 h-5 rounded bg-white/5 animate-pulse" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <Sparkline data={pd?.history ?? []} color={dirColor} width={70} height={28} />
                                                </div>
                                            </button>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>

                        {/* Expanded detail panel for selected stock */}
                        <AnimatePresence>
                            {selectedPrice && selectedDef && (
                                <motion.div
                                    key={selectedSymbol}
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <GlassCard className="p-0 overflow-hidden">
                                        {/* Header */}
                                        <div style={{
                                            padding: "20px 24px",
                                            borderBottom: "1px solid rgba(255,255,255,0.04)",
                                            display: "flex", alignItems: "center", justifyContent: "space-between",
                                        }}>
                                            <div className="flex items-center gap-4">
                                                <div className="p-2.5 rounded-xl border flex items-center justify-center" style={{
                                                    background: `${sectorDef.color}12`,
                                                    borderColor: `${sectorDef.color}20`,
                                                    color: sectorDef.color,
                                                }}>
                                                    <Activity size={18} strokeWidth={1.8} />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-sm font-semibold text-white">{selectedDef.displayName}</p>
                                                        <span className="text-[10px] text-white/20 font-mono">{selectedDef.symbol}</span>
                                                        <span className={cn(
                                                            "w-1.5 h-1.5 rounded-full",
                                                            connected ? "bg-emerald-400 animate-pulse" : "bg-rose-400"
                                                        )} style={{ boxShadow: connected ? "0 0 6px #34d399" : "0 0 6px #fb7185" }} />
                                                    </div>
                                                    <div className="flex items-baseline gap-3 mt-1">
                                                        <span className="text-2xl">
                                                            <FlashPrice price={selectedPrice.price} direction={selectedPrice.direction} />
                                                        </span>
                                                        <span style={{
                                                            fontSize: 13, fontWeight: 600,
                                                            color: selectedPrice.direction === "up" ? "#34d399" : "#fb7185",
                                                        }}>
                                                            {formatPct(selectedPrice.changePct)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Sparkline chart area */}
                                        <div style={{ padding: "16px 24px", minHeight: 100 }}>
                                            <Sparkline
                                                data={selectedPrice.history}
                                                color={selectedPrice.direction === "up" ? "#34d399" : "#fb7185"}
                                                width={600}
                                                height={80}
                                            />
                                        </div>

                                        {/* OHLCV data strip */}
                                        <div style={{
                                            padding: "14px 24px",
                                            background: "rgba(0,0,0,0.2)",
                                            borderTop: "1px solid rgba(255,255,255,0.04)",
                                            display: "flex", flexWrap: "wrap", gap: 24,
                                        }}>
                                            {[
                                                { label: "Open", value: selectedPrice.open },
                                                { label: "High", value: selectedPrice.high },
                                                { label: "Low", value: selectedPrice.low },
                                                { label: "Close", value: selectedPrice.close },
                                                { label: "Volume", value: selectedPrice.volume, isVol: true },
                                            ].map(item => (
                                                <div key={item.label} className="flex-1 min-w-[80px]">
                                                    <p className="text-[10px] font-medium text-white/20 mb-1">{item.label}</p>
                                                    <p className="text-sm font-semibold font-mono text-white/70">
                                                        {item.isVol
                                                            ? (item.value > 1e6 ? `${(item.value / 1e6).toFixed(2)}M` : item.value.toLocaleString("en-IN"))
                                                            : `₹${item.value.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                                                        }
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </GlassCard>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-5">
                        {/* Sector Summary */}
                        <GlassCard style={{ padding: 20 }}>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-9 h-9 rounded-lg border flex items-center justify-center" style={{
                                    background: `${sectorDef.color}12`,
                                    borderColor: `${sectorDef.color}20`,
                                    color: sectorDef.color,
                                }}>
                                    <Layers size={16} strokeWidth={1.8} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-white">{activeSector} Sector</h3>
                                    <p className="text-[10px] text-white/25 font-normal mt-0.5">Live Overview</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {sectorSymbols.map(sym => {
                                    const pd = prices[sym.symbol];
                                    const dir = pd?.direction ?? "flat";
                                    const dirColor = dir === "up" ? "#34d399" : dir === "down" ? "#fb7185" : "rgba(255,255,255,0.2)";
                                    return (
                                        <button
                                            key={sym.symbol}
                                            onClick={() => setSelectedSymbol(sym.symbol)}
                                            className="w-full flex items-center justify-between py-2.5 px-3 rounded-xl transition-all duration-150 cursor-pointer"
                                            style={{
                                                background: selectedSymbol === sym.symbol ? "rgba(255,255,255,0.04)" : "transparent",
                                                border: selectedSymbol === sym.symbol ? "1px solid rgba(255,255,255,0.06)" : "1px solid transparent",
                                            }}
                                        >
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-1.5 h-1.5 rounded-full" style={{ background: dirColor, boxShadow: `0 0 6px ${dirColor}60` }} />
                                                <span className="text-xs font-medium text-white/60">{sym.displayName}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                {pd ? (
                                                    <>
                                                        <span className="text-xs font-mono text-white/50">₹{pd.price.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</span>
                                                        <span style={{ fontSize: 10, fontWeight: 600, color: dirColor }}>
                                                            {formatPct(pd.changePct)}
                                                        </span>
                                                    </>
                                                ) : (
                                                    <div className="w-16 h-3 rounded bg-white/5 animate-pulse" />
                                                )}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </GlassCard>

                        {/* Smart Alerts */}
                        <GlassCard glow="violet" style={{ padding: 24 }}>
                            <div className="space-y-5">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-lg bg-violet-500/15 border border-violet-500/20 flex items-center justify-center text-violet-400">
                                        <Bell size={16} strokeWidth={1.8} />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold text-white">Smart Alerts</h3>
                                        <p className="text-[10px] text-white/25 font-normal mt-0.5">
                                            {selectedDef ? selectedDef.displayName : "Select a stock"}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-5 gap-2">
                                    <div className="col-span-2 space-y-1.5">
                                        <label className="text-[10px] font-medium text-white/30 ml-1">Condition</label>
                                        <select
                                            value={alertDir}
                                            suppressHydrationWarning
                                            onChange={(e) => setAlertDir(e.target.value)}
                                            className="w-full px-3 py-2.5 rounded-lg text-xs bg-white/[0.04] border border-white/8 text-white focus:outline-none focus:border-violet-500/40 transition-colors"
                                        >
                                            <option value="above" className="bg-[#0c0d14]">Above</option>
                                            <option value="below" className="bg-[#0c0d14]">Below</option>
                                        </select>
                                    </div>
                                    <div className="col-span-3 space-y-1.5">
                                        <label className="text-[10px] font-medium text-white/30 ml-1">Price Trigger</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 text-xs">₹</span>
                                            <input
                                                type="number"
                                                suppressHydrationWarning
                                                placeholder="0.00"
                                                value={alertThreshold}
                                                onChange={(e) => setAlertThreshold(e.target.value)}
                                                className="w-full pl-7 pr-3 py-2.5 rounded-lg text-sm bg-white/[0.04] border border-white/8 text-white placeholder-white/10 focus:outline-none focus:border-violet-500/40 transition-colors font-mono"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <NeonButton size="sm" className="w-full mt-1 h-10" onClick={createAlert}>
                                    <div className="flex items-center gap-2">
                                        <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
                                        <span>Deploy Monitor</span>
                                    </div>
                                </NeonButton>
                            </div>
                        </GlassCard>

                        {/* Market insights */}
                        <GlassCard style={{ padding: 20 }}>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/15 flex items-center justify-center text-emerald-400">
                                    <BarChart3 size={16} strokeWidth={1.8} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-white">Market Pulse</h3>
                                    <p className="text-[10px] text-white/25 font-normal mt-0.5">Sector Summary</p>
                                </div>
                            </div>
                            <div className="space-y-3">
                                {(() => {
                                    const ups = sectorSymbols.filter(s => prices[s.symbol]?.direction === "up").length;
                                    const downs = sectorSymbols.filter(s => prices[s.symbol]?.direction === "down").length;
                                    const total = sectorSymbols.filter(s => prices[s.symbol]).length;
                                    return (
                                        <>
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs text-white/30">Gainers</span>
                                                <div className="flex items-center gap-2">
                                                    <TrendingUp size={12} className="text-emerald-400" />
                                                    <span className="text-sm font-semibold text-emerald-400">{ups}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs text-white/30">Losers</span>
                                                <div className="flex items-center gap-2">
                                                    <TrendingDown size={12} className="text-rose-400" />
                                                    <span className="text-sm font-semibold text-rose-400">{downs}</span>
                                                </div>
                                            </div>
                                            {total > 0 && (
                                                <div className="mt-2 h-1.5 rounded-full bg-white/5 overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full transition-all duration-500"
                                                        style={{
                                                            width: `${(ups / total) * 100}%`,
                                                            background: "linear-gradient(90deg, #34d399, #22d3ee)",
                                                        }}
                                                    />
                                                </div>
                                            )}
                                        </>
                                    );
                                })()}
                            </div>
                        </GlassCard>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
