"use client";
import { Shield, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function ShieldBadge({ verified, size = 16, className }: { verified: boolean; size?: number; className?: string }) {
    return (
        <div className={cn("relative flex items-center justify-center", className)} style={{ width: size, height: size }}>
            <Shield
                size={size}
                className={verified ? "text-emerald-400" : "text-white/10"}
                fill={verified ? "rgba(16,185,129,0.1)" : "none"}
                strokeWidth={2.5}
            />
            {verified && (
                <div className="absolute inset-0 flex items-center justify-center translate-y-[1px]">
                    <Check size={size * 0.5} className="text-emerald-400" strokeWidth={4} />
                </div>
            )}
        </div>
    );
}
