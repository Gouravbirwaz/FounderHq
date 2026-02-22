"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { NeonButton } from "@/components/ui/NeonButton";
import { Zap, Mail, Lock, Shield, Check, Star, Users } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/Toast";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { login } = useAuth();
    const router = useRouter();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        login({
            name: "Gourav",
            role: "founder",
            user_id: "F-99421",
            vetting_badge: true
        });
        toast("success", "Authentication Successful", "Welcome back to the Command Center.");
        router.push("/market");
    };

    return (
        <div className="min-h-screen bg-[#05060b] flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Atmosphere */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-violet-600/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-cyan-600/10 blur-[120px] rounded-full" />
                <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
            </div>

            <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
                {/* Left Side: Branding */}
                <div className="hidden lg:block space-y-10">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600 to-cyan-400 flex items-center justify-center shadow-[0_0_20px_rgba(124,58,237,0.5)]">
                            <Zap size={24} className="text-white" />
                        </div>
                        <h1 className="text-2xl font-black text-white tracking-tighter">FounderHQ</h1>
                    </div>

                    <div className="space-y-6">
                        <h2 className="text-6xl font-black text-white leading-[1.1] tracking-tighter">
                            The Forge of <br />
                            <span className="text-grad-main">Indian Innovation.</span>
                        </h2>
                        <p className="text-lg text-white/40 font-medium max-w-md">Access deep market intelligence, connects with elite mentors, and scale your vision from POC to IPO.</p>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {[
                            { icon: Shield, label: "MCA Verified Identity", sub: "Bank-grade vetting for high-trust interactions" },
                            { icon: Users, label: "Founder-Only Network", sub: "Collaborate with top 1% peer group" },
                            { icon: Star, label: "Elite Mentorship", sub: "Direct access to Series B+ scaling playbooks" }
                        ].map((item, i) => (
                            <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="flex gap-4">
                                <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center flex-shrink-0">
                                    <item.icon size={18} className="text-violet-400" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-white/90">{item.label}</h4>
                                    <p className="text-xs text-white/30">{item.sub}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="flex items-center gap-8 pt-4">
                        <div>
                            <p className="text-2xl font-black text-white">10k+</p>
                            <p className="text-[10px] uppercase font-bold text-white/20 tracking-widest">Founders</p>
                        </div>
                        <div className="w-[1px] h-10 bg-white/5" />
                        <div>
                            <p className="text-2xl font-black text-white">₹500Cr+</p>
                            <p className="text-[10px] uppercase font-bold text-white/20 tracking-widest">Funding Pool</p>
                        </div>
                    </div>
                </div>

                {/* Right Side: Login Form */}
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
                    <GlassCard glow="violet" style={{ padding: 48 }}>
                        <div className="mb-10 text-center lg:text-left">
                            <h3 className="text-2xl font-black text-white mb-2">Initialize Session</h3>
                            <p className="text-sm text-white/30 font-bold uppercase tracking-widest">Authorized Personnel Only</p>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase font-bold text-white/40 ml-1">Terminal ID (Email)</label>
                                <div className="relative">
                                    <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-black/40 border border-white/5 rounded-xl py-4 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-violet-500/50 transition-all"
                                        placeholder="gourav@founderhq.io"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-[10px] uppercase font-bold text-white/40 ml-1">Access Key (Password)</label>
                                    <button type="button" className="text-[10px] uppercase font-bold text-violet-400 hover:text-violet-300 transition-colors">Forgot?</button>
                                </div>
                                <div className="relative">
                                    <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-black/40 border border-white/5 rounded-xl py-4 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-violet-500/50 transition-all"
                                        placeholder="••••••••••••"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-3 py-2">
                                <div className="w-5 h-5 rounded-md bg-violet-600 flex items-center justify-center">
                                    <Check size={12} className="text-white" strokeWidth={4} />
                                </div>
                                <span className="text-xs text-white/40 font-medium">Remember terminal for 30 days</span>
                            </div>

                            <NeonButton className="w-full h-14" type="submit">
                                <span className="text-sm uppercase tracking-widest font-black">Decrypt & Access</span>
                            </NeonButton>
                        </form>

                        <div className="mt-10 pt-8 border-t border-white/5 text-center">
                            <p className="text-sm text-white/30 font-medium">
                                New operative? <button className="text-violet-400 font-bold hover:text-violet-300 transition-colors ml-1">Establish Identity</button>
                            </p>
                        </div>
                    </GlassCard>
                </motion.div>
            </div>
        </div>
    );
}
