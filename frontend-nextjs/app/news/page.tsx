"use client";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { NewsSection } from "@/components/ui/NewsSection";
import { Radio } from "lucide-react";

export default function NewsPage() {
    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto space-y-6" suppressHydrationWarning>
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-rose-400" style={{ boxShadow: "0 0 8px #fb7185" }} />
                            <span className="text-[10px] font-medium uppercase tracking-widest text-rose-400/70">Intelligence Hub</span>
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-white">Market News</h1>
                        <p className="text-sm text-white/35 mt-2 max-w-xl font-normal">Curated, real-time insights from global startup ecosystems, funding announcements, and market shifts.</p>
                    </div>
                    <div className="hidden md:flex flex-col items-end gap-1">
                        <div className="flex items-center gap-2 text-rose-400/80 font-medium text-xs">
                            <Radio size={12} />
                            Scanning 50+ Sources
                        </div>
                        <p className="text-[10px] text-white/20 font-normal">Last Update: Just now</p>
                    </div>
                </div>

                {/* News Feed — card grid */}
                <NewsSection />
            </div>
        </DashboardLayout>
    );
}
