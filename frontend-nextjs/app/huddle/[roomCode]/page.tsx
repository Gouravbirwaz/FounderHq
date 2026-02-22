"use client";
import React, { useEffect, useRef, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { io } from 'socket.io-client';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Users, Copy, Check, Share2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { GlassCard } from '@/components/ui/GlassCard';
import { motion, AnimatePresence } from 'framer-motion';

const HUDDLE_SERVICE_URL = process.env.NEXT_PUBLIC_HUDDLE_SERVICE_URL || 'http://localhost:5001';

export default function HuddleRoomPage() {
    const { roomCode } = useParams() as { roomCode: string };
    const router = useRouter();
    const [room, setRoom] = useState<any>(null);
    const [isMicOn, setIsMicOn] = useState(true);
    const [isCamOn, setIsCamOn] = useState(false);
    const [participants, setParticipants] = useState<any[]>([]);
    const [copied, setCopied] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const socketRef = useRef<any>(null);
    const localStreamRef = useRef<MediaStream | null>(null);
    const peersRef = useRef<{ [key: string]: RTCPeerConnection }>({});

    useEffect(() => {
        const init = async () => {
            const token = localStorage.getItem('auth_token');
            if (!token) {
                router.push('/login');
                return;
            }

            try {
                const res = await fetch(`${HUDDLE_SERVICE_URL}/rooms/${roomCode}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (res.ok) {
                    const roomData = await res.json();
                    if (!roomData.active) {
                        setError('This huddle has ended');
                        setLoading(false);
                        return;
                    }
                    setRoom(roomData);
                    setIsCamOn(roomData.type === 'video');
                    await joinSocketRoom(roomData, token);
                } else {
                    setError('Room not found');
                }
            } catch (e) {
                setError('Failed to connect to room');
            } finally {
                setLoading(false);
            }
        };

        if (roomCode) init();

        return () => {
            leaveRoom();
        };
    }, [roomCode]);

    const getMedia = async (video: boolean) => {
        if (localStreamRef.current) return localStreamRef.current;
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: video
            });
            localStreamRef.current = stream;
            return stream;
        } catch (e) {
            console.error("Media access denied", e);
            return null;
        }
    };

    const joinSocketRoom = async (roomData: any, token: string) => {
        if (socketRef.current) return;

        socketRef.current = io(HUDDLE_SERVICE_URL, {
            auth: { token },
            reconnectionAttempts: 5
        });

        const stream = await getMedia(roomData.type === 'video');
        if (!stream) {
            setError('Could not access microphone/camera');
            return;
        }

        socketRef.current.on('connect', () => {
            console.log('Socket connected, joining room:', roomData.roomCode);
            socketRef.current.emit('join-room', { roomCode: roomData.roomCode });
        });

        socketRef.current.on('user-joined', async ({ userId, socketId }: any) => {
            console.log('User joined:', userId, socketId);
            if (peersRef.current[socketId]) return;

            const pc = createPeerConnection(socketId, userId, roomData.type === 'video');
            peersRef.current[socketId] = pc;

            stream.getTracks().forEach(track => pc.addTrack(track, stream));

            try {
                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);
                socketRef.current.emit('offer', { to: socketId, offer });
            } catch (e) {
                console.error("Error creating/setting offer:", e);
            }
        });

        socketRef.current.on('offer', async ({ from, offer }: any) => {
            console.log('Received offer from:', from);
            let pc = peersRef.current[from];
            if (!pc) {
                pc = createPeerConnection(from, 'remote', roomData.type === 'video');
                peersRef.current[from] = pc;
                stream.getTracks().forEach(track => pc.addTrack(track, stream));
            }

            try {
                if (pc.signalingState !== "stable") {
                    await Promise.all([
                        pc.setLocalDescription({ type: "rollback" }),
                        pc.setRemoteDescription(new RTCSessionDescription(offer))
                    ]);
                } else {
                    await pc.setRemoteDescription(new RTCSessionDescription(offer));
                }

                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);
                socketRef.current.emit('answer', { to: from, answer });
            } catch (e) {
                console.error("Error handling offer:", e);
            }
        });

        socketRef.current.on('answer', async ({ from, answer }: any) => {
            console.log('Received answer from:', from);
            const pc = peersRef.current[from];
            if (pc && pc.signalingState === "have-local-offer") {
                try {
                    await pc.setRemoteDescription(new RTCSessionDescription(answer));
                } catch (e) {
                    console.error("Error setting answer:", e);
                }
            }
        });

        socketRef.current.on('ice-candidate', async ({ from, candidate }: any) => {
            const pc = peersRef.current[from];
            if (pc) {
                try {
                    if (pc.remoteDescription) {
                        await pc.addIceCandidate(new RTCIceCandidate(candidate));
                    } else {
                        // Queue candidate or just ignore small blips
                        console.warn("Received ICE candidate before remote description");
                    }
                } catch (e) {
                    console.error("Error adding ice candidate:", e);
                }
            }
        });

        socketRef.current.on('user-left', ({ socketId }: any) => {
            console.log('User left:', socketId);
            if (peersRef.current[socketId]) {
                peersRef.current[socketId].close();
                delete peersRef.current[socketId];
            }
            setParticipants(prev => prev.filter(p => p.socketId !== socketId));
        });

        socketRef.current.on('disconnect', () => {
            console.warn("Socket disconnected");
        });
    };

    const createPeerConnection = (socketId: string, userId: string, isVideo: boolean) => {
        const pc = new RTCPeerConnection({
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        });

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                socketRef.current.emit('ice-candidate', { to: socketId, candidate: event.candidate });
            }
        };

        pc.ontrack = (event) => {
            setParticipants(prev => {
                if (prev.find(p => p.socketId === socketId)) return prev;
                return [...prev, { socketId, userId, stream: event.streams[0] }];
            });
        };

        return pc;
    };

    const leaveRoom = () => {
        if (socketRef.current) {
            socketRef.current.emit('leave-room', { roomCode });
            socketRef.current.disconnect();
            socketRef.current = null;
        }
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => track.stop());
            localStreamRef.current = null;
        }
        Object.values(peersRef.current).forEach(pc => pc.close());
        peersRef.current = {};
        setParticipants([]);
    };

    const toggleMic = () => {
        if (localStreamRef.current) {
            const audioTrack = localStreamRef.current.getAudioTracks()[0];
            if (audioTrack) audioTrack.enabled = !isMicOn;
            setIsMicOn(!isMicOn);
        }
    };

    const toggleCam = () => {
        if (localStreamRef.current) {
            const videoTrack = localStreamRef.current.getVideoTracks()[0];
            if (videoTrack) videoTrack.enabled = !isCamOn;
            setIsCamOn(!isCamOn);
        }
    };

    const copyLink = () => {
        const link = window.location.href;
        navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) return <DashboardLayout><div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: 'var(--text-tertiary)' }}>Joining huddle...</div></DashboardLayout>;

    if (error) return (
        <DashboardLayout>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 20 }}>
                <p style={{ color: '#ef4444', fontSize: 18, fontWeight: 600 }}>{error}</p>
                <button onClick={() => router.push('/huddle')} style={{ padding: '10px 20px', borderRadius: 8, background: 'var(--text-primary)', color: 'var(--bg-primary)', fontWeight: 600, border: 'none', cursor: 'pointer' }}>Back to Huddles</button>
            </div>
        </DashboardLayout>
    );

    return (
        <DashboardLayout>
            <div style={{ height: 'calc(100vh - 180px)', display: 'flex', flexDirection: 'column', gap: 24 }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 style={{ fontSize: 24, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10 }}>
                            {room.type === 'video' ? <Video size={24} color="#22d3ee" /> : <Mic size={24} color="#8b5cf6" />}
                            {room.type === 'video' ? 'Video Huddle' : 'Voice Huddle'}
                            <span style={{ fontSize: 14, color: 'var(--text-tertiary)', fontWeight: 400, marginLeft: 8 }}>· {participants.length + 1} participating</span>
                        </h1>
                        <p style={{ fontSize: 13, color: 'var(--text-tertiary)', marginTop: 4 }}>Locked & Encrypted session</p>
                    </div>

                    <div style={{ display: 'flex', gap: 12 }}>
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: 12, padding: '8px 16px', borderRadius: 12,
                            background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)'
                        }}>
                            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>{room.roomCode}</span>
                            <div style={{ width: 1, height: 16, background: 'var(--border-subtle)' }} />
                            <button onClick={copyLink} style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600 }}>
                                {copied ? <Check size={14} color="#34d399" /> : <Copy size={14} />}
                                {copied ? 'Copied' : 'Copy Link'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Video Grid */}
                <div style={{
                    flex: 1, display: 'grid',
                    gridTemplateColumns: `repeat(auto-fit, minmax(${participants.length > 2 ? '300px' : '450px'}, 1fr))`,
                    gap: 20, overflowY: 'auto', paddingBottom: 20
                }} className="custom-scrollbar">

                    {/* Local Stream */}
                    <motion.div layout>
                        <GlassCard style={{ position: 'relative', overflow: 'hidden', height: '100%', minHeight: 240, background: '#000' }}>
                            <video
                                autoPlay muted playsInline
                                ref={el => { if (el && localStreamRef.current) el.srcObject = localStreamRef.current }}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                            <div style={{ position: 'absolute', bottom: 16, left: 16, display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', borderRadius: 8, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#34d399', boxShadow: '0 0 8px #34d399' }} />
                                <span style={{ fontSize: 12, fontWeight: 600 }}>You</span>
                                {!isMicOn && <MicOff size={12} color="#ef4444" />}
                            </div>
                            {!isCamOn && room.type === 'video' && (
                                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface-1)' }}>
                                    <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(var(--accent-violet-rgb), 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <VideoOff size={32} color="var(--text-tertiary)" />
                                    </div>
                                </div>
                            )}
                        </GlassCard>
                    </motion.div>

                    {/* Remote Streams */}
                    <AnimatePresence>
                        {participants.map((p, idx) => (
                            <motion.div key={p.socketId} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} layout>
                                <GlassCard style={{ position: 'relative', overflow: 'hidden', height: '100%', minHeight: 240, background: '#000' }}>
                                    <video
                                        autoPlay playsInline
                                        ref={el => { if (el) el.srcObject = p.stream }}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                    <div style={{ position: 'absolute', bottom: 16, left: 16, display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', borderRadius: 8, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22d3ee' }} />
                                        <span style={{ fontSize: 12, fontWeight: 600 }}>Founder #{idx + 1}</span>
                                    </div>
                                </GlassCard>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {/* Controls Bar */}
                <div style={{
                    display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 20,
                    padding: '20px', borderRadius: 24, background: 'var(--surface-1)',
                    border: '1px solid var(--border-subtle)', boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
                    position: 'relative', zIndex: 10
                }}>
                    <button
                        onClick={toggleMic}
                        style={{
                            width: 52, height: 52, borderRadius: '50%',
                            background: isMicOn ? 'rgba(var(--accent-violet-rgb), 0.1)' : '#ef4444',
                            border: '1px solid rgba(var(--accent-violet-rgb), 0.2)', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s'
                        }}
                    >
                        {isMicOn ? <Mic size={22} color="rgb(var(--accent-violet-rgb))" /> : <MicOff size={22} color="#fff" />}
                    </button>

                    {room?.type === 'video' && (
                        <button
                            onClick={toggleCam}
                            style={{
                                width: 52, height: 52, borderRadius: '50%',
                                background: isCamOn ? 'rgba(34, 211, 238, 0.1)' : '#ef4444',
                                border: '1px solid rgba(34, 211, 238, 0.2)', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s'
                            }}
                        >
                            {isCamOn ? <Video size={22} color="#22d3ee" /> : <VideoOff size={22} color="#fff" />}
                        </button>
                    )}

                    <div style={{ width: 2, height: 32, background: 'var(--border-subtle)', margin: '0 10px' }} />

                    <button
                        onClick={() => router.push('/huddle')}
                        style={{
                            padding: '0 24px', height: 52, borderRadius: 26,
                            background: '#ef4444', color: '#fff', fontSize: 15, fontWeight: 700,
                            border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10,
                            boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)', transition: 'transform 0.2s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        <PhoneOff size={20} /> Leave Huddle
                    </button>
                </div>
            </div>
        </DashboardLayout>
    );
}
