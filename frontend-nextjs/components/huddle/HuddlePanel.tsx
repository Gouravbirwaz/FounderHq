"use client";
import React, { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Users } from 'lucide-react';

const HUDDLE_SERVICE_URL = 'http://localhost:5001';

export default function HuddlePanel() {
    const [activeTab, setActiveTab] = useState<'rooms' | 'active'>('rooms');
    const [rooms, setRooms] = useState<any[]>([]);
    const [currentRoom, setCurrentRoom] = useState<any>(null);
    const [isMicOn, setIsMicOn] = useState(true);
    const [isCamOn, setIsCamOn] = useState(false);
    const [participants, setParticipants] = useState<any[]>([]);

    const socketRef = useRef<any>(null);
    const localStreamRef = useRef<MediaStream | null>(null);
    const peersRef = useRef<{ [key: string]: RTCPeerConnection }>({});
    const remoteVideosRef = useRef<{ [key: string]: HTMLVideoElement | null }>({});

    useEffect(() => {
        fetchRooms();
    }, []);

    const fetchRooms = async () => {
        // This would fetch from the microservice
        // For now mocking or calling the endpoint if token available
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const res = await fetch(`${HUDDLE_SERVICE_URL}/rooms/active`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            // if not found /active, fallback to mock for UI dev
            if (res.ok) {
                const data = await res.json();
                setRooms(data);
            }
        } catch (e) {
            console.error("Failed to fetch rooms", e);
        }
    };

    const createRoom = async (type: 'voice' | 'video') => {
        const token = localStorage.getItem('token');
        if (!token) return;

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
            joinRoom(room);
        }
    };

    const joinRoom = (room: any) => {
        setCurrentRoom(room);
        setActiveTab('active');

        const token = localStorage.getItem('token');
        socketRef.current = io(HUDDLE_SERVICE_URL, {
            auth: { token }
        });

        socketRef.current.emit('join-room', { roomId: room.roomId });

        socketRef.current.on('user-joined', async ({ userId, socketId }: any) => {
            console.log('User joined:', userId);
            // Create PeerConnection and Send Offer
            const pc = createPeerConnection(socketId, userId);
            peersRef.current[socketId] = pc;

            const stream = await getMedia(room.type === 'video');
            stream.getTracks().forEach(track => pc.addTrack(track, stream));

            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            socketRef.current.emit('offer', { to: socketId, offer });
        });

        socketRef.current.on('offer', async ({ from, offer }: any) => {
            const pc = createPeerConnection(from, 'remote'); // In real app, match userId
            peersRef.current[from] = pc;

            await pc.setRemoteDescription(new RTCSessionDescription(offer));
            const stream = await getMedia(room.type === 'video');
            stream.getTracks().forEach(track => pc.addTrack(track, stream));

            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            socketRef.current.emit('answer', { to: from, answer });
        });

        socketRef.current.on('answer', async ({ from, answer }: any) => {
            await peersRef.current[from].setRemoteDescription(new RTCSessionDescription(answer));
        });

        socketRef.current.on('ice-candidate', async ({ from, candidate }: any) => {
            await peersRef.current[from].addIceCandidate(new RTCIceCandidate(candidate));
        });

        socketRef.current.on('user-left', ({ socketId }: any) => {
            if (peersRef.current[socketId]) {
                peersRef.current[socketId].close();
                delete peersRef.current[socketId];
            }
            setParticipants(prev => prev.filter(p => p.socketId !== socketId));
        });
    };

    const getMedia = async (video: boolean) => {
        if (localStreamRef.current) return localStreamRef.current;
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: video
        });
        localStreamRef.current = stream;
        return stream;
    };

    const createPeerConnection = (socketId: string, userId: string) => {
        const pc = new RTCPeerConnection({
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        });

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                socketRef.current.emit('ice-candidate', { to: socketId, candidate: event.candidate });
            }
        };

        pc.ontrack = (event) => {
            console.log('Got remote track', event.streams[0]);
            // Update UI with remote stream
            setParticipants(prev => {
                if (prev.find(p => p.socketId === socketId)) return prev;
                return [...prev, { socketId, userId, stream: event.streams[0] }];
            });
        };

        return pc;
    };

    const leaveRoom = () => {
        if (socketRef.current) {
            socketRef.current.emit('leave-room', { roomId: currentRoom.roomId });
            socketRef.current.disconnect();
        }
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => track.stop());
            localStreamRef.current = null;
        }
        Object.values(peersRef.current).forEach(pc => pc.close());
        peersRef.current = {};
        setCurrentRoom(null);
        setParticipants([]);
        setActiveTab('rooms');
    };

    return (
        <div style={{
            width: 320,
            height: '100%',
            backgroundColor: 'var(--surface-1)',
            borderLeft: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            color: 'var(--text-primary)'
        }}>
            <div style={{ padding: '20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '16px', fontWeight: 600 }}>Huddles</h2>
                <Users size={18} color="var(--text-tertiary)" />
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
                {activeTab === 'rooms' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <button
                            onClick={() => createRoom('voice')}
                            style={{
                                width: '100%', padding: '12px', borderRadius: '12px',
                                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                                color: '#fff', fontWeight: 600, border: 'none', cursor: 'pointer'
                            }}
                        >
                            Start Voice Huddle
                        </button>
                        <button
                            onClick={() => createRoom('video')}
                            style={{
                                width: '100%', padding: '12px', borderRadius: '12px',
                                background: 'rgba(34, 211, 238, 0.1)',
                                color: '#22d3ee', fontWeight: 600, border: '1px solid #22d3ee40', cursor: 'pointer'
                            }}
                        >
                            Start Video Huddle
                        </button>

                        <div style={{ marginTop: '20px' }}>
                            <p style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-tertiary)', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '12px' }}>Active Rooms</p>
                            {rooms.length === 0 ? (
                                <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', textAlign: 'center', marginTop: '20px' }}>No active huddles</p>
                            ) : (
                                rooms.map(room => (
                                    <div key={room.roomId} onClick={() => joinRoom(room)} style={{
                                        padding: '10px 12px', borderRadius: '10px', backgroundColor: 'rgba(255,255,255,0.03)',
                                        border: '1px solid var(--border-subtle)', cursor: 'pointer', marginBottom: '8px'
                                    }}>
                                        <p style={{ fontSize: '13px', fontWeight: 500 }}>{room.type.toUpperCase()} Room</p>
                                        <p style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{room.participants.length} developers</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
                            {/* Local Preview */}
                            <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#000', aspectRatio: '16/9' }}>
                                <video
                                    autoPlay muted playsInline
                                    ref={el => { if (el && localStreamRef.current) el.srcObject = localStreamRef.current }}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                                <div style={{ position: 'absolute', bottom: '8px', left: '8px', fontSize: '10px', backgroundColor: 'rgba(0,0,0,0.5)', padding: '2px 6px', borderRadius: '4px' }}>You</div>
                            </div>

                            {/* Remote Users */}
                            {participants.map(p => (
                                <div key={p.socketId} style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#000', aspectRatio: '16/9' }}>
                                    <video
                                        autoPlay playsInline
                                        ref={el => { if (el) el.srcObject = p.stream }}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                    <div style={{ position: 'absolute', bottom: '8px', left: '8px', fontSize: '10px', backgroundColor: 'rgba(0,0,0,0.5)', padding: '2px 6px', borderRadius: '4px' }}>Opponent</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {currentRoom && (
                <div style={{ padding: '16px', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'center', gap: '16px', backgroundColor: 'rgba(0,0,0,0.2)' }}>
                    <button onClick={() => setIsMicOn(!isMicOn)} style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: isMicOn ? 'rgba(255,255,255,0.05)' : '#ef4444', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {isMicOn ? <Mic size={18} color="#fff" /> : <MicOff size={18} color="#fff" />}
                    </button>
                    {currentRoom.type === 'video' && (
                        <button onClick={() => setIsCamOn(!isCamOn)} style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: isCamOn ? 'rgba(255,255,255,0.05)' : '#ef4444', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {isCamOn ? <Video size={18} color="#fff" /> : <VideoOff size={18} color="#fff" />}
                        </button>
                    )}
                    <button onClick={leaveRoom} style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#ef4444', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <PhoneOff size={18} color="#fff" />
                    </button>
                </div>
            )}
        </div>
    );
}
