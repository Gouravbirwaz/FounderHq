"use client";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ReactNode, ButtonHTMLAttributes } from "react";

interface NeonButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode;
    variant?: "primary" | "secondary" | "ghost" | "danger";
    size?: "sm" | "md" | "lg";
    loading?: boolean;
}

const variantStyles = {
    primary: "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white border border-violet-400/30 shadow-[0_4px_24px_rgba(139,92,246,0.25)] hover:shadow-[0_4px_32px_rgba(139,92,246,0.4)]",
    secondary: "bg-white/[0.05] border border-white/10 text-white/90 hover:bg-white/[0.08] hover:border-white/16",
    ghost: "bg-transparent border border-white/6 text-white/50 hover:bg-white/[0.04] hover:text-white/80 hover:border-white/12",
    danger: "bg-rose-500/10 border border-rose-500/25 text-rose-400 hover:bg-rose-500/20 hover:border-rose-500/40",
};

const sizeStyles = {
    sm: "px-4 h-9 text-xs font-semibold tracking-wide",
    md: "px-6 h-11 text-sm font-semibold tracking-wide",
    lg: "px-8 h-13 text-sm font-bold tracking-wide",
};

export function NeonButton({
    children,
    variant = "primary",
    size = "md",
    loading,
    className,
    disabled,
    ...props
}: NeonButtonProps) {
    return (
        <motion.button
            whileHover={{ scale: 1.015, y: -1 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
                "relative inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-250 cursor-pointer select-none",
                variantStyles[variant],
                sizeStyles[size],
                (disabled || loading) && "opacity-50 cursor-not-allowed pointer-events-none",
                className
            )}
            disabled={disabled || loading}
            {...(props as any)}
        >
            {loading && (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            )}
            {children}
        </motion.button>
    );
}
