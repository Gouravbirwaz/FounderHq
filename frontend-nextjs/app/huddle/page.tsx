"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { GlassCard } from '@/components/ui/GlassCard';
import { Video, Mic, Plus, Users, Hash } from 'lucide-react';
import { motion } from 'framer-motion';

const HUDDLE_SERVICE_URL = process.env.NEXT_PUBLIC_HUDDLE_SERVICE_URL || 'http://localhost:5001';

export default function HuddleLandingPage() {
    const router = useRouter();
    const [roomCode, setRoomCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const createHuddle = async (type: 'voice' | 'video') => {
        setLoading(true);
        setError('');
        const token = localStorage.getItem('auth_token');
        if (!token) {
            router.push('/login');
            return;
        }

        try {
            const res = await fetch(`${HUDDLE_SERVICE_URL}/rooms/create`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ type })
            });

            if (res.ok) {
                const room = await res.json();
                router.push(`/huddle/${room.roomCode}`);
            } else {
                const data = await res.json();
                setError(data.message || 'Failed to create huddle');
            }
        } catch (e) {
            setError('Connection error. Is the huddle service running?');
        } finally {
            setLoading(false);
        }
    };

    const joinHuddle = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!roomCode || roomCode.length !== 8) {
            setError('Please enter a valid 8-character room code');
            return;
        }

        setLoading(true);
        setError('');
        const token = localStorage.getItem('auth_token');
        if (!token) {
            router.push('/login');
            return;
        }

        try {
            const res = await fetch(`${HUDDLE_SERVICE_URL}/rooms/${roomCode.toUpperCase()}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                const room = await res.json();
                if (room.active) {
                    router.push(`/huddle/${room.roomCode}`);
                } else {
                    setError('This huddle has already ended');
                }
            } else {
                setError('Room not found or invalid code');
            }
        } catch (e) {
            setError('Connection error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <div style={{ maxWidth: 800, margin: '0 auto', paddingTop: 40 }}>
                <header style={{ textAlign: 'center', marginBottom: 48 }}>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{ fontSize: 42, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 12, background: 'linear-gradient(135deg, var(--text-primary) 0%, var(--text-secondary) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
                    >
                        Huddle. Connect. Build.
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        style={{ fontSize: 16, color: 'var(--text-tertiary)', maxWidth: 500, margin: '0 auto' }}
                    >
                        High-quality voice and video rooms for effortless collaboration within the FounderHQ ecosystem.
                    </motion.p>
                </header>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 24 }}>
                    {/* Create Section */}
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                        <GlassCard style={{ height: '100%', padding: 32, display: 'flex', flexDirection: 'column' }}>
                            <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(var(--accent-violet-rgb), 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
                                <Plus size={24} color="rgb(var(--accent-violet-rgb))" />
                            </div>
                            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Create a Huddle</h2>
                            <p style={{ fontSize: 14, color: 'var(--text-tertiary)', marginBottom: 32, flex: 1 }}>
                                Start a new session and invite your team. Choose between voice or high-definition video.
                            </p>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                <button
                                    onClick={() => createHuddle('video')}
                                    disabled={loading}
                                    style={{
                                        padding: '14px', borderRadius: 12, border: 'none',
                                        background: 'linear-gradient(135deg, #8b5cf6 0%, #22d3ee 100%)',
                                        color: '#fff', fontWeight: 600, cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                        boxShadow: '0 4px 15px rgba(139, 92, 246, 0.3)',
                                        transition: 'transform 0.2s'
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                                    onMouseLeave={e => e.currentTarget.style.transform = 'none'}
                                >
                                    <Video size={18} /> Start Video Huddle
                                </button>
                                <button
                                    onClick={() => createHuddle('voice')}
                                    disabled={loading}
                                    style={{
                                        padding: '14px', borderRadius: 12, border: '1px solid rgba(var(--accent-violet-rgb), 0.2)',
                                        background: 'rgba(255, 255, 255, 0.03)',
                                        color: 'var(--text-primary)', fontWeight: 600, cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'}
                                >
                                    <Mic size={18} /> Start Voice Only
                                </button>
                            </div>
                        </GlassCard>
                    </motion.div>

                    {/* Join Section */}
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                        <GlassCard style={{ height: '100%', padding: 32, display: 'flex', flexDirection: 'column' }}>
                            <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(34, 211, 238, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
                                <Users size={24} color="#22d3ee" />
                            </div>
                            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Join a Huddle</h2>
                            <p style={{ fontSize: 14, color: 'var(--text-tertiary)', marginBottom: 32, flex: 1 }}>
                                Enter a unique 8-character room code to join an active huddle.
                            </p>

                            <form onSubmit={joinHuddle}>
                                <div style={{ position: 'relative', marginBottom: 12 }}>
                                    <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }}>
                                        <Hash size={16} />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Enter 8-digit code"
                                        value={roomCode}
                                        onChange={e => setRoomCode(e.target.value.toUpperCase())}
                                        maxLength={8}
                                        style={{
                                            width: '100%', padding: '14px 14px 14px 40px', borderRadius: 12, border: '1px solid var(--border-subtle)',
                                            background: 'rgba(0,0,0,0.2)', color: 'var(--text-primary)', fontSize: 15, fontWeight: 600,
                                            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
                                        }}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading || roomCode.length !== 8}
                                    style={{
                                        width: '100%', padding: '14px', borderRadius: 12, border: 'none',
                                        background: roomCode.length === 8 ? 'var(--text-primary)' : 'rgba(255,255,255,0.05)',
                                        color: roomCode.length === 8 ? 'var(--bg-primary)' : 'var(--text-tertiary)',
                                        fontWeight: 700, cursor: roomCode.length === 8 ? 'pointer' : 'not-allowed',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    Join Huddle
                                </button>
                            </form>
                        </GlassCard>
                    </motion.div>
                </div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                            marginTop: 24, padding: 12, borderRadius: 8, background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', textAlign: 'center', fontSize: 14
                        }}
                    >
                        {error}
                    </motion.div>
                )}
            </div>
        </DashboardLayout>
    );
}
