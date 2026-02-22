"use client";
import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { MarketTicker } from "@/components/market/MarketTicker";
import { useMarketData } from "@/hooks/useMarketData";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { stocks } = useMarketData();

    return (
        <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "var(--surface-0)", position: "relative" }}>
            {/* Background atmosphere */}
            <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
                {/* Dot grid */}
                <div style={{
                    position: "absolute", inset: 0,
                    backgroundImage: "radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)",
                    backgroundSize: "28px 28px",
                }} />

                {/* Large grid lines */}
                <div style={{
                    position: "absolute", inset: 0,
                    backgroundImage: "linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)",
                    backgroundSize: "140px 140px",
                }} />

                {/* Violet glow — top left */}
                <div style={{
                    position: "absolute", top: "-18%", left: "-8%",
                    width: "60%", height: "60%",
                    background: "radial-gradient(ellipse at center, rgba(139,92,246,0.1) 0%, rgba(139,92,246,0.03) 40%, transparent 70%)",
                    filter: "blur(80px)",
                }} />

                {/* Cyan glow — bottom right */}
                <div style={{
                    position: "absolute", bottom: "-12%", right: "-8%",
                    width: "50%", height: "50%",
                    background: "radial-gradient(ellipse at center, rgba(34,211,238,0.07) 0%, rgba(34,211,238,0.02) 40%, transparent 70%)",
                    filter: "blur(80px)",
                }} />

                {/* Rose hint — left */}
                <div style={{
                    position: "absolute", top: "35%", left: "-5%",
                    width: "30%", height: "30%",
                    background: "radial-gradient(circle at center, rgba(251,113,133,0.04) 0%, transparent 70%)",
                    filter: "blur(60px)",
                }} />
            </div>

            {/* Sidebar */}
            <div style={{ position: "relative", zIndex: 10 }}>
                <Sidebar open={sidebarOpen} onCloseAction={() => setSidebarOpen(false)} />
            </div>

            {/* Main content */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden", position: "relative", zIndex: 1 }}>
                <MarketTicker stocks={stocks} />
                <TopBar onMenuClickAction={() => setSidebarOpen(true)} />
                <main style={{ flex: 1, overflowY: "auto", padding: "28px 32px" }} className="custom-scrollbar">
                    {children}
                </main>
            </div>
        </div>
    );
}
