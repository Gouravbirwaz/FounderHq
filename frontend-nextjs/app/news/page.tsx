"use client";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { NewsSection } from "@/components/ui/NewsSection";
import { Radio } from "lucide-react";
import { useTheme } from "next-themes";
import * as React from "react";

export default function NewsPage() {
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;
    const isLight = resolvedTheme === "light";
    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto space-y-6" suppressHydrationWarning>
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">

                    <div className="flex flex-col items-end gap-2 text-right">
                        <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-rose-500/5 border border-rose-500/10 transition-all shadow-sm">
                            <Radio size={16} className="text-rose-400 animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-rose-400">Scanning 50+ Sources</span>
                        </div>
                        <p className="text-[10px] text-[var(--text-tertiary)] font-black uppercase tracking-[0.2em] opacity-60">Last sync: Just now</p>
                    </div>
                </div>

                {/* News Feed — card grid */}
                <NewsSection />
            </div>
        </DashboardLayout>
    );
}
