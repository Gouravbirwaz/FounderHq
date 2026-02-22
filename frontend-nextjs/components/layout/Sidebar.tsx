"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, TrendingUp, Lightbulb, Landmark, User, Zap, X, Newspaper as NewspaperIcon, MessageCircle as CommunityIcon } from "lucide-react";

const NAV = [
    { label: "Dashboard", href: "/dashboard", Icon: LayoutDashboard, accent: "#8b5cf6" },
    { label: "Terminal", href: "/market", Icon: TrendingUp, accent: "#22d3ee" },
    { label: "News", href: "/news", Icon: NewspaperIcon, accent: "#fb7185" },
    { label: "Community", href: "/community", Icon: CommunityIcon, accent: "#a855f7" },
    { label: "Ideation Hub", href: "/ideation", Icon: Lightbulb, accent: "#fbbf24" },
    { label: "Funding Vault", href: "/funding", Icon: Landmark, accent: "#34d399" },
    { label: "Profile", href: "/profile", Icon: User, accent: "#f472b6" },
];

import { MessageSquare as HuddleIcon } from "lucide-react";

const SIDEBAR_BG = "var(--surface-1)";

function SidebarContent({ onCloseAction, onHuddleToggle, huddleActive }: {
    onCloseAction: () => void;
    onHuddleToggle?: () => void;
    huddleActive?: boolean;
}) {
    const path = usePathname();

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>

            {/* Logo */}
            <div style={{ padding: "20px 20px 16px", display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
                <div
                    className="logo-glow"
                    style={{
                        width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                        background: "linear-gradient(135deg, #8b5cf6 0%, #22d3ee 100%)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        position: "relative", overflow: "hidden",
                    }}
                >
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(255,255,255,0.25) 0%, transparent 60%)" }} />
                    <Zap size={16} color="#fff" strokeWidth={2.5} style={{ position: "relative", zIndex: 1 }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 15, fontWeight: 700, letterSpacing: "-0.02em", color: "var(--text-primary)" }}>FounderHQ</p>
                    <p style={{ fontSize: 10, color: "var(--text-tertiary)", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase", marginTop: 1 }}>Command Center</p>
                </div>
                <button onClick={onCloseAction} style={{ background: "none", border: "none", color: "var(--text-tertiary)", cursor: "pointer", padding: 4 }} className="lg:hidden">
                    <X size={16} />
                </button>
            </div>

            {/* Divider */}
            <div style={{ height: 1, margin: "0 20px", background: "linear-gradient(90deg, rgba(139,92,246,0.4), rgba(34,211,238,0.2) 60%, transparent)", flexShrink: 0 }} />

            {/* Nav */}
            <nav style={{ padding: "16px 12px", display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
                <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-tertiary)", padding: "0 10px", marginBottom: 8, opacity: 0.6 }}>Workspace</p>

                {NAV.map(({ label, href, Icon, accent }) => {
                    const active = path.startsWith(href);
                    return (
                        <Link key={href} href={href} onClick={onCloseAction} style={{ textDecoration: "none" }}>
                            <motion.div
                                whileHover={{ x: active ? 0 : 2 }}
                                whileTap={{ scale: 0.98 }}
                                style={{
                                    display: "flex", alignItems: "center", gap: 10,
                                    padding: "9px 12px", borderRadius: 12,
                                    background: active ? `${accent}18` : "transparent",
                                    border: active ? `1px solid ${accent}30` : "1px solid transparent",
                                    cursor: "pointer", transition: "all 0.2s ease",
                                }}
                                onMouseEnter={e => !active && ((e.currentTarget as HTMLDivElement).style.background = "rgba(var(--accent-violet-rgb, 139, 92, 246), 0.05)")}
                                onMouseLeave={e => !active && ((e.currentTarget as HTMLDivElement).style.background = "transparent")}
                            >
                                <div style={{
                                    width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    background: active ? `${accent}20` : "rgba(var(--accent-violet-rgb, 139, 92, 246), 0.05)",
                                    border: active ? `1px solid ${accent}35` : "1px solid var(--border-subtle)",
                                    transition: "all 0.2s ease",
                                }}>
                                    <Icon size={15} color={active ? accent : "var(--text-tertiary)"} strokeWidth={1.8} />
                                </div>
                                <span style={{
                                    flex: 1, fontSize: 13, fontWeight: active ? 600 : 450,
                                    color: active ? "var(--text-primary)" : "var(--text-secondary)",
                                    letterSpacing: "-0.01em",
                                    transition: "color 0.2s ease",
                                }}>
                                    {label}
                                </span>
                                {active && (
                                    <div style={{
                                        width: 5, height: 5, borderRadius: "50%",
                                        background: accent,
                                        boxShadow: `0 0 8px ${accent}`,
                                    }} />
                                )}
                            </motion.div>
                        </Link>
                    );
                })}

                {/* Huddle Toggle */}
                <div
                    onClick={onHuddleToggle}
                    style={{ textDecoration: "none", marginTop: 4 }}
                >
                    <motion.div
                        whileHover={{ x: huddleActive ? 0 : 2 }}
                        whileTap={{ scale: 0.98 }}
                        style={{
                            display: "flex", alignItems: "center", gap: 10,
                            padding: "9px 12px", borderRadius: 12,
                            background: huddleActive ? `#8b5cf618` : "transparent",
                            border: huddleActive ? `1px solid #8b5cf630` : "1px solid transparent",
                            cursor: "pointer", transition: "all 0.2s ease",
                        }}
                    >
                        <div style={{
                            width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            background: huddleActive ? `#8b5cf620` : "rgba(var(--accent-violet-rgb, 139, 92, 246), 0.05)",
                            border: huddleActive ? `1px solid #8b5cf635` : "1px solid var(--border-subtle)",
                            transition: "all 0.2s ease",
                        }}>
                            <HuddleIcon size={15} color={huddleActive ? "#8b5cf6" : "var(--text-tertiary)"} strokeWidth={1.8} />
                        </div>
                        <span style={{
                            flex: 1, fontSize: 13, fontWeight: huddleActive ? 600 : 450,
                            color: huddleActive ? "var(--text-primary)" : "var(--text-secondary)",
                            letterSpacing: "-0.01em",
                            transition: "color 0.2s ease",
                        }}>
                            Huddle
                        </span>
                        {huddleActive && (
                            <div style={{
                                width: 5, height: 5, borderRadius: "50%",
                                background: "#8b5cf6",
                                boxShadow: `0 0 8px #8b5cf6`,
                            }} />
                        )}
                    </motion.div>
                </div>
            </nav>

            {/* Promo card */}
            <div style={{ padding: "0 12px 16px", flexShrink: 0 }}>
                <div style={{
                    borderRadius: 14, padding: "14px 16px",
                    background: "linear-gradient(135deg, rgba(139,92,246,0.12), rgba(34,211,238,0.06))",
                    border: "1px solid rgba(139,92,246,0.18)",
                    position: "relative", overflow: "hidden",
                }}>
                    <div style={{ position: "absolute", top: -20, right: -20, width: 60, height: 60, borderRadius: "50%", background: "rgba(139,92,246,0.3)", filter: "blur(20px)", pointerEvents: "none" }} />
                    <p style={{ position: "relative", zIndex: 1, fontSize: 12, fontWeight: 600, color: "var(--text-primary)" }}>🇮🇳 India Startup OS</p>
                    <p style={{ position: "relative", zIndex: 1, fontSize: 11, color: "var(--text-tertiary)", marginTop: 3 }}>10,000+ founders · 500+ investors</p>
                </div>
            </div>
        </div>
    );
}

export function Sidebar({ open, onCloseAction, onHuddleToggle, huddleActive }: {
    open: boolean;
    onCloseAction: () => void;
    onHuddleToggle?: () => void;
    huddleActive?: boolean;
}) {
    const sidebarStyle: React.CSSProperties = {
        width: 260,
        height: "100vh",
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        background: SIDEBAR_BG,
        backdropFilter: "blur(40px) saturate(180%)",
        WebkitBackdropFilter: "blur(40px) saturate(180%)",
        borderRight: "1px solid var(--border-subtle)",
        boxShadow: "0 0 40px rgba(0,0,0,0.1)",
        position: "sticky",
        top: 0,
        overflow: "hidden",
    };

    return (
        <>
            {/* Desktop */}
            <aside className="hidden lg:block" style={sidebarStyle}>
                <SidebarContent onCloseAction={onCloseAction} onHuddleToggle={onHuddleToggle} huddleActive={huddleActive} />
            </aside>

            {/* Mobile */}
            <AnimatePresence>
                {open && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={onCloseAction}
                            style={{ position: "fixed", inset: 0, zIndex: 40, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
                        />
                        <motion.aside
                            initial={{ x: -260 }} animate={{ x: 0 }} exit={{ x: -260 }}
                            transition={{ type: "spring", stiffness: 380, damping: 40 }}
                            className="lg:hidden"
                            style={{ ...sidebarStyle, position: "fixed", left: 0, top: 0, zIndex: 50 }}
                        >
                            <SidebarContent onCloseAction={onCloseAction} onHuddleToggle={onHuddleToggle} huddleActive={huddleActive} />
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
