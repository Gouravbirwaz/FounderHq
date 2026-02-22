"use client";
import { motion } from "framer-motion";
import { Stock } from "@/hooks/useMarketData";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

export function MarketTicker({ stocks }: { stocks: Stock[] }) {
    return (
        <div style={{
            height: 34,
            background: "rgba(6,7,12,0.9)",
            borderBottom: "1px solid rgba(255,255,255,0.04)",
            display: "flex",
            alignItems: "center",
            overflow: "hidden",
            whiteSpace: "nowrap",
            zIndex: 40,
            position: "relative"
        }}>
            <div style={{
                display: "flex", alignItems: "center", gap: 8, padding: "0 14px",
                borderRight: "1px solid rgba(255,255,255,0.06)",
                background: "rgba(139,92,246,0.08)", height: "100%", zIndex: 2,
            }}>
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#34d399]" />
                <span style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.7)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Live Feed</span>
            </div>

            <motion.div
                animate={{ x: [0, -1000] }}
                transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
                style={{ display: "flex", gap: 28, paddingLeft: 24 }}
            >
                {[...stocks, ...stocks, ...stocks].map((s, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.5)", letterSpacing: "0.03em" }}>{s.ticker}</span>
                        <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.9)", fontFamily: "monospace" }}>₹{s.price.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        <div className={cn(
                            "flex items-center gap-1 text-[9px] font-semibold px-1.5 py-0.5 rounded-md",
                            s.direction === "up" ? "text-emerald-400 bg-emerald-400/10" : "text-rose-400 bg-rose-400/10"
                        )}>
                            {s.direction === "up" ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
                            {(s.change_pct > 0 ? "+" : "") + s.change_pct.toFixed(2)}%
                        </div>
                    </div>
                ))}
            </motion.div>
        </div>
    );
}
