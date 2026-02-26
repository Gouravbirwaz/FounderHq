"use client";
import React, { useState, useEffect, useRef } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { GlassCard } from '@/components/ui/GlassCard';
import { useAuth } from '@/hooks/useAuth';
import { io } from 'socket.io-client';
import { Send, User, Search, MessageSquare, MoreVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const HUDDLE_SERVICE_URL = process.env.NEXT_PUBLIC_HUDDLE_SERVICE_URL || 'http://localhost:5001';

export default function DirectMessagePage() {
    const { user } = useAuth();
    const [conversations, setConversations] = useState<any[]>([]);
    const [selectedConv, setSelectedConv] = useState<any>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);

    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [searching, setSearching] = useState(false);

    const socketRef = useRef<any>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchConversations();

        const token = localStorage.getItem('auth_token');
        if (token) {
            socketRef.current = io(HUDDLE_SERVICE_URL, { auth: { token } });

            socketRef.current.on('receive-message', (message: any) => {
                setMessages(prev => [...prev, message]);
                fetchConversations(); // Refresh last message preview
            });

            socketRef.current.on('message-sent', (message: any) => {
                setMessages(prev => [...prev, message]);
                fetchConversations();
            });
        }

        return () => {
            if (socketRef.current) socketRef.current.disconnect();
        };
    }, []);

    useEffect(() => {
        if (selectedConv) {
            fetchMessages(selectedConv._id);
        }
    }, [selectedConv]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchQuery.trim()) {
                handleSearch(searchQuery);
            } else {
                setSearchResults([]);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    const fetchConversations = async () => {
        const token = localStorage.getItem('auth_token');
        try {
            const res = await fetch(`${HUDDLE_SERVICE_URL}/messages/conversations`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setConversations(data);
            }
        } catch (e) {
            console.error("Failed to fetch conversations", e);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (query: string) => {
        setSearching(true);
        const token = localStorage.getItem('auth_token');
        try {
            // Using the global apiUrl if possible, but let's stick to the env var or default
            const API_BASE = process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/api/v1` : 'http://127.0.0.1:8000/server/api/v1';
            const res = await fetch(`${API_BASE}/auth/search?q=${query}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setSearchResults(data);
            }
        } catch (e) {
            console.error("Search failed", e);
        } finally {
            setSearching(false);
        }
    };

    const startConversation = async (participantId: string) => {
        const token = localStorage.getItem('auth_token');
        try {
            const res = await fetch(`${HUDDLE_SERVICE_URL}/messages/conversations`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ participantId })
            });
            if (res.ok) {
                const conv = await res.json();
                setSelectedConv(conv);
                setSearchQuery('');
                setSearchResults([]);
                fetchConversations();
            }
        } catch (e) {
            console.error("Failed to start conversation", e);
        }
    };

    const fetchMessages = async (convId: string) => {
        const token = localStorage.getItem('auth_token');
        try {
            const res = await fetch(`${HUDDLE_SERVICE_URL}/messages/conversations/${convId}/messages`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setMessages(data);
            }
        } catch (e) {
            console.error("Failed to fetch messages", e);
        }
    };

    const sendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedConv || !socketRef.current) return;

        const receiverId = selectedConv.participants.find((id: string) => id !== user?.user_id);

        socketRef.current.emit('send-message', {
            conversationId: selectedConv._id,
            receiverId,
            text: newMessage.trim()
        });

        setNewMessage('');
    };

    return (
        <DashboardLayout>
            <div style={{ display: 'flex', height: 'calc(100vh - 180px)', gap: 24 }}>
                {/* Conversations Sidebar */}
                <GlassCard style={{ width: 320, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <div style={{ padding: 20, borderBottom: '1px solid var(--border-subtle)' }}>
                        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Messages</h2>
                        <div style={{ position: 'relative' }}>
                            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                            <input
                                type="text"
                                placeholder="Search users..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                style={{
                                    width: '100%', padding: '10px 12px 10px 36px', borderRadius: 10,
                                    background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-subtle)',
                                    color: 'var(--text-primary)', fontSize: 14, outline: 'none'
                                }}
                            />
                        </div>
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto', position: 'relative' }} className="custom-scrollbar">
                        {/* Search Results Overlay */}
                        <AnimatePresence>
                            {searchQuery.trim() && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    style={{
                                        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                                        background: 'var(--bg-primary)', zIndex: 10, padding: '10px 0'
                                    }}
                                >
                                    {searching ? (
                                        <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-tertiary)' }}>Searching...</div>
                                    ) : searchResults.length === 0 ? (
                                        <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-tertiary)' }}>No users found</div>
                                    ) : (
                                        searchResults.map(u => (
                                            <div
                                                key={u.id}
                                                onClick={() => startConversation(u.id)}
                                                style={{
                                                    padding: '12px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12,
                                                    transition: 'background 0.2s'
                                                }}
                                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                            >
                                                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <User size={18} color="var(--text-secondary)" />
                                                </div>
                                                <div>
                                                    <p style={{ fontSize: 14, fontWeight: 600 }}>{u.name}</p>
                                                    <p style={{ fontSize: 11, color: 'var(--text-tertiary)', textTransform: 'capitalize' }}>{u.role}</p>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {loading ? (
                            <div style={{ padding: 20, color: 'var(--text-tertiary)', textAlign: 'center' }}>Loading chats...</div>
                        ) : conversations.length === 0 ? (
                            <div style={{ padding: 40, textAlign: 'center' }}>
                                <MessageSquare size={32} color="var(--text-tertiary)" style={{ margin: '0 auto 12px', opacity: 0.3 }} />
                                <p style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>No messages yet</p>
                            </div>
                        ) : (
                            conversations.map(conv => (
                                <div
                                    key={conv._id}
                                    onClick={() => setSelectedConv(conv)}
                                    style={{
                                        padding: '16px 20px', cursor: 'pointer', transition: 'all 0.2s',
                                        background: selectedConv?._id === conv._id ? 'rgba(var(--accent-violet-rgb), 0.1)' : 'transparent',
                                        borderLeft: `3px solid ${selectedConv?._id === conv._id ? 'rgb(var(--accent-violet-rgb))' : 'transparent'}`
                                    }}
                                >
                                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                                        <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #8b5cf6, #22d3ee)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <User size={20} color="#fff" />
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                                                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{conv.otherParticipant?.name || `User ${conv.participants.find((id: string) => id !== user?.user_id)?.substring(0, 8)}`}</p>
                                                <span style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>{conv.lastMessage ? new Date(conv.lastMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                                            </div>
                                            <p style={{ fontSize: 12, color: 'var(--text-tertiary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {conv.lastMessage ? conv.lastMessage.text : 'Start a conversation'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </GlassCard>

                {/* Chat Area */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 24 }}>
                    {selectedConv ? (
                        <GlassCard style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0 }}>
                            {/* Chat Header */}
                            <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(var(--accent-violet-rgb), 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <User size={18} color="rgb(var(--accent-violet-rgb))" />
                                    </div>
                                    <div>
                                        <p style={{ fontSize: 15, fontWeight: 700 }}>{selectedConv.otherParticipant?.name || `User ${selectedConv.participants.find((id: string) => id !== user?.user_id)?.substring(0, 8)}`}</p>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#34d399' }} />
                                            <span style={{ fontSize: 11, color: '#34d399', fontWeight: 500 }}>Online</span>
                                        </div>
                                    </div>
                                </div>
                                <button style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer' }}>
                                    <MoreVertical size={20} />
                                </button>
                            </div>

                            {/* Messages List */}
                            <div
                                ref={scrollRef}
                                style={{ flex: 1, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}
                                className="custom-scrollbar"
                            >
                                {messages.map((msg, idx) => {
                                    const isMe = msg.senderId === user?.user_id;
                                    return (
                                        <motion.div
                                            key={msg._id || idx}
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            style={{
                                                alignSelf: isMe ? 'flex-end' : 'flex-start',
                                                maxWidth: '70%',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: isMe ? 'flex-end' : 'flex-start'
                                            }}
                                        >
                                            <div style={{
                                                padding: '12px 16px', borderRadius: 16,
                                                background: isMe ? 'linear-gradient(135deg, #8b5cf6, #7c3aed)' : 'rgba(255,255,255,0.05)',
                                                color: isMe ? '#fff' : 'var(--text-primary)',
                                                border: isMe ? 'none' : '1px solid var(--border-subtle)',
                                                borderBottomRightRadius: isMe ? 4 : 16,
                                                borderBottomLeftRadius: isMe ? 16 : 4,
                                                boxShadow: isMe ? '0 4px 15px rgba(139, 92, 246, 0.2)' : 'none'
                                            }}>
                                                <p style={{ fontSize: 14, lineHeight: 1.5 }}>{msg.text}</p>
                                            </div>
                                            <span style={{ fontSize: 10, color: 'var(--text-tertiary)', marginTop: 4, padding: '0 4px' }}>
                                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </motion.div>
                                    );
                                })}
                            </div>

                            {/* Message Input */}
                            <form onSubmit={sendMessage} style={{ padding: 24, borderTop: '1px solid var(--border-subtle)', background: 'rgba(0,0,0,0.1)' }}>
                                <div style={{ display: 'flex', gap: 12 }}>
                                    <input
                                        type="text"
                                        placeholder="Type a message..."
                                        value={newMessage}
                                        onChange={e => setNewMessage(e.target.value)}
                                        style={{
                                            flex: 1, padding: '14px 20px', borderRadius: 12,
                                            background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-subtle)',
                                            color: 'var(--text-primary)', fontSize: 14, outline: 'none'
                                        }}
                                    />
                                    <button
                                        type="submit"
                                        disabled={!newMessage.trim()}
                                        style={{
                                            width: 50, height: 50, borderRadius: 12, border: 'none',
                                            background: newMessage.trim() ? 'rgb(var(--accent-violet-rgb))' : 'rgba(255,255,255,0.05)',
                                            color: '#fff', cursor: newMessage.trim() ? 'pointer' : 'not-allowed',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            transition: 'all 0.2s',
                                            boxShadow: newMessage.trim() ? '0 4px 15px rgba(139, 92, 246, 0.3)' : 'none'
                                        }}
                                    >
                                        <Send size={20} />
                                    </button>
                                </div>
                            </form>
                        </GlassCard>
                    ) : (
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <div style={{ textAlign: 'center', maxWidth: 300 }}>
                                <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(var(--accent-violet-rgb), 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                                    <MessageSquare size={32} color="rgb(var(--accent-violet-rgb))" />
                                </div>
                                <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Select a conversation</h3>
                                <p style={{ fontSize: 14, color: 'var(--text-tertiary)' }}>Choose a chat from the sidebar to start messaging your fellow founders.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
