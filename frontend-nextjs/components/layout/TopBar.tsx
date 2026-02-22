"use client";
import { useState } from "react";
import { Bell, Search, Command, Menu } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import Link from "next/link";

export function TopBar({ onMenuClickAction }: { onMenuClickAction: () => void }) {
    const { user } = useAuth();
    const [focused, setFocused] = useState(false);

    const ROLE_GRADIENTS: Record<string, string> = {
        founder: "linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%)",
        investor: "linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)",
        student: "linear-gradient(135deg, #22d3ee 0%, #3b82f6 100%)",
        mentor: "linear-gradient(135deg, #34d399 0%, #059669 100%)",
    };
    const currentGrad = user?.role ? ROLE_GRADIENTS[user.role] : ROLE_GRADIENTS.founder;

    return (
        <header style={{
            height: 60,
            display: "flex", alignItems: "center", gap: 16,
            padding: "0 28px",
            background: "var(--topbar-bg, rgba(6,7,12,0.85))",
            backdropFilter: "blur(24px) saturate(160%)",
            WebkitBackdropFilter: "blur(24px) saturate(160%)",
            borderBottom: "1px solid var(--border-color, rgba(255,255,255,0.06))",
            position: "sticky", top: 0, zIndex: 30,
        }}>
            {/* Mobile hamburger */}
            <motion.button
                suppressHydrationWarning
                whileTap={{ scale: 0.9 }}
                onClick={onMenuClickAction}
                className="lg:hidden"
                style={{ background: "var(--border-subtle)", border: "1px solid var(--border-subtle)", borderRadius: 10, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)", cursor: "pointer" }}
            >
                <Menu size={16} />
            </motion.button>

            {/* Search bar */}
            <div style={{ flex: 1, maxWidth: 440, position: "relative" }}>
                <Search size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: focused ? "#8b5cf6" : "var(--text-tertiary)", opacity: 0.5, pointerEvents: "none", transition: "color 0.25s" }} />
                <input
                    readOnly
                    suppressHydrationWarning
                    placeholder="Search startups, POCs, metrics..."
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    style={{
                        width: "100%",
                        padding: "10px 80px 10px 40px",
                        borderRadius: "12px",
                        font: "inherit",
                        fontSize: "13px",
                        fontWeight: 500,
                        background: focused ? "var(--border-subtle)" : "transparent",
                        border: "1px solid",
                        borderColor: focused ? "rgba(139,92,246,0.4)" : "var(--border-subtle)",
                        boxShadow: focused ? "0 0 16px rgba(139,92,246,0.08)" : "none",
                        color: "var(--text-primary)",
                        outline: "none",
                        transition: "all 0.25s ease",
                        caretColor: "#8b5cf6",
                    }}
                />
                <div style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", display: "flex", alignItems: "center", gap: 3, pointerEvents: "none", background: "var(--border-subtle)", padding: "3px 7px", borderRadius: "6px", border: "1px solid var(--border-subtle)" }}>
                    <Command size={10} style={{ color: "var(--text-tertiary)" }} />
                    <span style={{ fontSize: "10px", color: "var(--text-tertiary)", fontWeight: 700 }}>K</span>
                </div>
            </div>

            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
                {/* Theme Toggle */}
                <ThemeToggle />

                {/* Bell */}
                <motion.button
                    suppressHydrationWarning
                    whileHover={{ scale: 1.06 }}
                    whileTap={{ scale: 0.94 }}
                    style={{
                        width: 38, height: 38, borderRadius: 11,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        background: "transparent",
                        border: "1px solid var(--border-subtle)",
                        color: "var(--text-secondary)",
                        cursor: "pointer", position: "relative",
                        transition: "all 0.2s ease",
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = "var(--text-primary)"; (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--text-tertiary)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = "var(--text-secondary)"; (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border-subtle)"; }}
                >
                    <Bell size={16} />
                    <span style={{ position: "absolute", top: 9, right: 9, width: 6, height: 6, borderRadius: "50%", background: "#8b5cf6", boxShadow: "0 0 8px #8b5cf6" }} />
                </motion.button>

                {/* Divider */}
                <div style={{ width: 1, height: 24, background: "var(--border-subtle)", margin: "0 2px" }} />

                {/* User pill */}
                <Link href="/profile" style={{ textDecoration: "none" }}>
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        style={{
                            display: "flex", alignItems: "center", gap: 10,
                            padding: "5px 14px 5px 6px",
                            borderRadius: 12,
                            background: "transparent",
                            border: "1px solid var(--border-subtle)",
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                        }}
                        onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "var(--text-tertiary)"; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border-subtle)"; }}
                    >
                        <div style={{
                            width: 30, height: 30, borderRadius: 9, flexShrink: 0,
                            background: currentGrad,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 12, fontWeight: 700, color: "#fff",
                        }}>
                            {user?.name?.[0]?.toUpperCase() ?? "F"}
                        </div>
                        <div className="hidden sm:block">
                            <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", lineHeight: 1 }}>{user?.name ?? "Founder"}</p>
                            <p style={{ fontSize: 10, color: "var(--text-tertiary)", textTransform: "capitalize", marginTop: 2 }}>{user?.role ?? "founder"}</p>
                        </div>
                    </motion.div>
                </Link>
            </div>
        </header>
    );
}
