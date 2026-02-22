"use client";
import * as React from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { MarketTicker } from "@/components/market/MarketTicker";
import HuddlePanel from "@/components/huddle/HuddlePanel";
import { useMarketData } from "@/hooks/useMarketData";
import { useTheme } from "next-themes";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = React.useState(false);
    const [huddleOpen, setHuddleOpen] = React.useState(false);
    const { stocks } = useMarketData();
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return (
        <div style={{ display: "flex", height: "100vh", background: "var(--surface-0)" }} />
    );

    const isLight = resolvedTheme === "light";

    return (
        <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "var(--surface-0)", position: "relative" }}>
            {/* Background atmosphere */}
            <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
                {/* ... existing atmosphere divs ... */}
            </div>

            {/* Sidebar */}
            <div style={{ position: "relative", zIndex: 10 }}>
                <Sidebar
                    open={sidebarOpen}
                    onCloseAction={() => setSidebarOpen(false)}
                    onHuddleToggle={() => setHuddleOpen(!huddleOpen)}
                    huddleActive={huddleOpen}
                />
            </div>

            {/* Main content */}
            <div style={{ flex: 1, display: "flex", flexDirection: "row", minWidth: 0, overflow: "hidden", position: "relative", zIndex: 1 }}>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
                    <MarketTicker stocks={stocks} />
                    <TopBar onMenuClickAction={() => setSidebarOpen(true)} />
                    <main style={{ flex: 1, overflowY: "auto", padding: "28px 32px" }} className="custom-scrollbar">
                        {children}
                    </main>
                </div>

                {/* Huddle Panel */}
                {huddleOpen && <HuddlePanel />}
            </div>
        </div>
    );
}
