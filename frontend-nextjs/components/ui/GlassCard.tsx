"use client";
import { motion, HTMLMotionProps } from "framer-motion";
import { ReactNode } from "react";

interface GlassCardProps extends Omit<HTMLMotionProps<"div">, "style"> {
    children?: ReactNode;
    glow?: "violet" | "cyan" | "emerald" | "amber" | "none";
    className?: string;
    index?: number;
    style?: React.CSSProperties;
    noPadding?: boolean;
}

const GLOW_COLORS: Record<string, string> = {
    violet: "139, 92, 246",
    cyan: "34, 211, 238",
    emerald: "52, 211, 153",
    amber: "251, 191, 36",
    none: "",
};

export function GlassCard({ children, glow = "none", className, index = 0, style, noPadding, ...props }: GlassCardProps) {
    const glowRgb = GLOW_COLORS[glow];
    const hasGlow = glow !== "none";

    return (
        <motion.div
            className={className}
            style={{
                background: "var(--card-bg)",
                backdropFilter: "blur(24px) saturate(160%)",
                WebkitBackdropFilter: "blur(24px) saturate(160%)",
                border: hasGlow
                    ? `1px solid rgba(${glowRgb}, 0.2)`
                    : "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-xl)",
                boxShadow: hasGlow
                    ? `0 0 0 1px rgba(${glowRgb}, 0.08), 0 8px 32px rgba(0,0,0,0.4), 0 0 60px rgba(${glowRgb}, 0.06)`
                    : "0 8px 32px rgba(0,0,0,0.05), 1px 1px 0px rgba(255,255,255,0.1) inset",
                padding: noPadding ? 0 : "24px",
                position: "relative",
                overflow: "hidden",
                transition: "all 0.3s ease",
                ...style,
            }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94], delay: index * 0.05 }}
            whileHover={{
                borderColor: hasGlow
                    ? `rgba(${glowRgb}, 0.35)`
                    : "rgba(255,255,255,0.14)",
                boxShadow: hasGlow
                    ? `0 0 0 1px rgba(${glowRgb}, 0.15), 0 12px 40px rgba(0,0,0,0.5), 0 0 80px rgba(${glowRgb}, 0.1)`
                    : "0 0 0 1px rgba(255,255,255,0.08), 0 12px 40px rgba(0,0,0,0.5)",
            }}
            {...props}
        >
            {/* Top edge shimmer */}
            <div style={{
                position: "absolute", top: 0, left: 0, right: 0, height: "1px",
                background: hasGlow
                    ? `linear-gradient(90deg, transparent 10%, rgba(${glowRgb}, 0.4) 50%, transparent 90%)`
                    : "linear-gradient(90deg, transparent 10%, rgba(255,255,255,0.12) 50%, transparent 90%)",
                pointerEvents: "none",
            }} />

            {/* Inner content */}
            <div style={{ position: "relative", zIndex: 1, height: "100%" }}>
                {children}
            </div>
        </motion.div>
    );
}
