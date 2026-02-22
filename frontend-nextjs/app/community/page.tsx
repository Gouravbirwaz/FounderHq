"use client";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { GlassCard } from "@/components/ui/GlassCard";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import {
    MessageCircle, Image as ImageIcon, FileText, Send,
    MoreHorizontal, Heart, MessageSquare, Share2,
    Plus, Filter, Search, User, Paperclip, TrendingUp, Star, X, Download, CornerDownRight,
    ArrowUpRight, Users, Trash2
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { toast, ToastProvider } from "@/components/ui/Toast";
import { apiFetch } from "@/lib/api";
import * as React from "react";

interface Comment {
    id: string;
    post_id: string;
    author_id: string;
    author_name: string;
    author_role: string;
    content: string;
    timestamp: string;
}

interface Post {
    id: string;
    author_id: string;
    author_name: string;
    author_role: string;
    content: string;
    timestamp: string;
    likes_count: number;
    has_liked: boolean;
    comments_count: number;
    tags: string[];
    has_image: boolean;
    image_alt?: string;
    image_url?: string;
    has_file: boolean;
    file_name?: string;
    file_url?: string;
    fetched_comments?: Comment[];
    is_comments_open?: boolean;
}

export default function CommunityPage() {
    const { user } = useAuth();
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [postContent, setPostContent] = useState("");
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);

    // Media states
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    // Comment states
    const [activeCommentText, setActiveCommentText] = useState<{ [postId: string]: string }>({});

    const imageInputRef = useRef<HTMLInputElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    const fetchPosts = async () => {
        try {
            const data = await apiFetch("/community/");
            setPosts(data.map((p: any) => ({ ...p, fetched_comments: [], is_comments_open: false })));
        } catch (err: any) {
            console.error("Failed to fetch posts:", err);
            toast("error", "Failed to load discussions", err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setMounted(true);
        fetchPosts();
    }, []);

    useEffect(() => {
        if (!selectedImage) {
            setImagePreview(null);
            return;
        }
        const objectUrl = URL.createObjectURL(selectedImage);
        setImagePreview(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
    }, [selectedImage]);

    if (!mounted) return null;

    const isLight = resolvedTheme === "light";

    const handlePost = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!postContent.trim() && !selectedImage && !selectedFile) return;

        try {
            const formData = new FormData();
            formData.append("content", postContent);
            formData.append("tags", JSON.stringify(["Community"]));
            if (selectedImage) formData.append("image", selectedImage);
            if (selectedFile) formData.append("file", selectedFile);

            const token = localStorage.getItem("auth_token");
            const response = await fetch(`${API_BASE}/api/v1/community/`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`
                },
                body: formData
            });

            if (!response.ok) throw new Error("Failed to upload");

            const data = await response.json();
            setPosts([{ ...data, fetched_comments: [], is_comments_open: false }, ...posts]);
            setPostContent("");
            setSelectedImage(null);
            setSelectedFile(null);
            toast("success", "Topic Posted", "Your discussion has been shared with the community.");
        } catch (err: any) {
            toast("error", "Failed to Post", err.message);
        }
    };

    const handleLike = async (postId: string) => {
        try {
            const data = await apiFetch(`/community/${postId}/like`, { method: "POST" });
            setPosts(posts.map(p => p.id === postId ? {
                ...p,
                likes_count: data.likes_count,
                has_liked: data.has_liked
            } : p));
        } catch (err: any) {
            toast("error", "Action Failed", err.message);
        }
    }

    const toggleComments = async (postId: string) => {
        const post = posts.find(p => p.id === postId);
        if (!post) return;

        if (!post.is_comments_open && (post.fetched_comments?.length === 0)) {
            try {
                const comments = await apiFetch(`/community/${postId}/comments`);
                setPosts(posts.map(p => p.id === postId ? {
                    ...p,
                    fetched_comments: comments,
                    is_comments_open: !p.is_comments_open
                } : p));
            } catch (err: any) {
                toast("error", "Failed to load comments", err.message);
            }
        } else {
            setPosts(posts.map(p => p.id === postId ? {
                ...p,
                is_comments_open: !p.is_comments_open
            } : p));
        }
    };

    const handleAddComment = async (postId: string) => {
        const text = activeCommentText[postId];
        if (!text?.trim()) return;

        try {
            const comment = await apiFetch(`/community/${postId}/comments`, {
                method: "POST",
                body: JSON.stringify({ content: text })
            });

            setPosts(posts.map(p => p.id === postId ? {
                ...p,
                comments_count: p.comments_count + 1,
                fetched_comments: [...(p.fetched_comments || []), comment]
            } : p));

            setActiveCommentText({ ...activeCommentText, [postId]: "" });
            toast("success", "Comment Added", "Your response has been posted.");
        } catch (err: any) {
            toast("error", "Failed to comment", err.message);
        }
    };

    const handleDelete = async (postId: string) => {
        if (!window.confirm("Are you sure you want to delete this broadcast?")) return;
        try {
            await apiFetch(`/community/${postId}`, { method: "DELETE" });
            setPosts(posts.filter(p => p.id !== postId));
            toast("success", "Terminated", "Broadcast has been removed from the collective.");
        } catch (err: any) {
            toast("error", "Failed to delete", err.message);
        }
    };

    const formatTimestamp = (ts: string) => {
        const date = new Date(ts);
        const now = new Date();
        const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diff < 60) return "Just now";
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        return date.toLocaleDateString();
    };

    return (
        <DashboardLayout>
            <ToastProvider />

            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&display=swap');
                
                :root {
                    --community-violet: #8b5cf6;
                    --community-cyan: #06b6d4;
                    --premium-glass: rgba(255, 255, 255, 0.03);
                    --premium-glass-hover: rgba(255, 255, 255, 0.05);
                    --premium-border: rgba(255, 255, 255, 0.06);
                    --premium-border-hover: rgba(255, 255, 255, 0.12);
                }

                .font-syne { font-family: 'Syne', sans-serif; }
                
                .mesh-gradient {
                    background: 
                        radial-gradient(at 0% 0%, rgba(139, 92, 246, 0.05) 0px, transparent 50%),
                        radial-gradient(at 100% 0%, rgba(6, 182, 212, 0.05) 0px, transparent 50%),
                        radial-gradient(at 100% 100%, rgba(139, 92, 246, 0.05) 0px, transparent 50%),
                        radial-gradient(at 0% 100%, rgba(6, 182, 212, 0.05) 0px, transparent 50%);
                }

                .grid-overlay {
                    background-image: radial-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px);
                    background-size: 24px 24px;
                }

                .premium-text-gradient {
                    background: linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.7) 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
            `}</style>

            {/* Ambient Atmosphere */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden mesh-gradient grid-overlay" />

            <div className="relative z-10 max-w-[800px] mx-auto pt-10 px-6 pb-24">
                {/* ── Header Section ── */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 mb-16 px-2">

                    <div className="flex items-center gap-4">
                        <div className="relative group">
                            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] group-focus-within:text-violet-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search the collective..."
                                className="pl-12 pr-6 py-4 rounded-2xl bg-[var(--surface-2)] border border-[var(--border-subtle)] focus:border-violet-500/50 outline-none text-sm transition-all w-full md:w-[320px] font-semibold shadow-2xl backdrop-blur-xl"
                            />
                        </div>
                        <button className="p-4 rounded-2xl bg-[var(--surface-2)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-violet-500/40 hover:bg-[var(--surface-3)] transition-all flex items-center justify-center shadow-2xl backdrop-blur-xl group">
                            <Filter size={20} className="group-hover:rotate-180 transition-transform duration-500" />
                        </button>
                    </div>
                </div>

                <div className="space-y-10">
                    {/* ── Content: Feed ── */}
                    <div className="space-y-10">
                        {/* New Post Input - Layered Glass */}
                        <div className="relative">
                            <div className="absolute -inset-[1px] bg-gradient-to-r from-violet-500/20 via-cyan-500/20 to-violet-500/20 rounded-[28px] blur-sm opacity-50 group-focus-within:opacity-100 transition-opacity" />
                            <GlassCard className="p-0 overflow-hidden border-white/5 relative bg-white/[0.01] backdrop-blur-3xl rounded-[24px]">
                                <div className="p-8">
                                    <div className="flex gap-6">
                                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center text-white font-black text-2xl shrink-0 shadow-2xl shadow-violet-500/30 border border-white/20 relative group overflow-hidden">
                                            <div className="absolute inset-0 bg-white/20 group-hover:translate-y-full transition-transform duration-500" />
                                            <span className="relative z-10">{user?.name?.[0] || 'F'}</span>
                                        </div>
                                        <div className="flex-1 space-y-4">
                                            <textarea
                                                value={postContent}
                                                onChange={(e) => setPostContent(e.target.value)}
                                                placeholder="Broadcast your latest breakthrough..."
                                                className="w-full bg-transparent border-none focus:ring-0 text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] resize-none min-h-[140px] font-semibold text-xl pt-2 leading-tight"
                                            />

                                            {/* Previews with high-end framing */}
                                            <AnimatePresence>
                                                {imagePreview && (
                                                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative inline-block mt-4">
                                                        <div className="absolute -inset-2 bg-violet-500/20 blur-xl rounded-full" />
                                                        <img src={imagePreview} alt="Preview" className="h-40 rounded-2xl border border-white/10 shadow-2xl relative z-10" />
                                                        <button onClick={() => setSelectedImage(null)} className="absolute -top-3 -right-3 p-2 bg-rose-500 text-white rounded-full shadow-2xl hover:bg-rose-600 transition-all hover:scale-110 active:scale-90 z-20">
                                                            <X size={14} />
                                                        </button>
                                                    </motion.div>
                                                )}
                                                {selectedFile && (
                                                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex items-center gap-4 px-5 py-4 bg-violet-500/5 rounded-2xl border border-violet-500/10 mt-4 max-w-fit shadow-xl backdrop-blur-md">
                                                        <div className="p-2 bg-violet-500/10 rounded-xl text-violet-400">
                                                            <Paperclip size={18} />
                                                        </div>
                                                        <span className="text-xs font-black tracking-widest text-[var(--text-secondary)] uppercase">{selectedFile.name}</span>
                                                        <button onClick={() => setSelectedFile(null)} className="p-2 hover:bg-rose-500/10 rounded-xl text-rose-400 transition-colors">
                                                            <X size={16} />
                                                        </button>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </div>
                                </div>
                                <div className="px-8 py-5 bg-white/[0.015] border-t border-white/5 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <input type="file" accept="image/*" className="hidden" ref={imageInputRef} onChange={(e) => { const file = e.target.files?.[0]; if (file) setSelectedImage(file); }} />
                                        <input type="file" className="hidden" ref={fileInputRef} onChange={(e) => { const file = e.target.files?.[0]; if (file) setSelectedFile(file); }} />

                                        <button onClick={() => imageInputRef.current?.click()} className="flex items-center gap-3 px-5 py-2.5 rounded-xl hover:bg-violet-500/10 text-[var(--text-tertiary)] hover:text-violet-400 transition-all font-black text-[10px] uppercase tracking-[0.2em] border border-transparent hover:border-violet-500/20">
                                            <ImageIcon size={20} className="text-violet-500/60" />
                                            <span className="hidden sm:inline">Visual Assets</span>
                                        </button>
                                        <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-3 px-5 py-2.5 rounded-xl hover:bg-cyan-500/10 text-[var(--text-tertiary)] hover:text-cyan-400 transition-all font-black text-[10px] uppercase tracking-[0.2em] border border-transparent hover:border-cyan-500/20">
                                            <Paperclip size={20} className="text-cyan-500/60" />
                                            <span className="hidden sm:inline">Data Sheets</span>
                                        </button>
                                    </div>
                                    <button
                                        onClick={handlePost}
                                        disabled={!postContent.trim() && !selectedImage && !selectedFile}
                                        className="relative group/post"
                                    >
                                        <div className="absolute -inset-1 bg-violet-600 blur opacity-40 group-hover/post:opacity-60 transition-opacity rounded-2xl" />
                                        <div className="relative px-10 py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 to-violet-500 text-white font-black text-[11px] uppercase tracking-[0.25em] flex items-center gap-3 transition-all active:scale-95 border border-white/10">
                                            Broadcast <Send size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                        </div>
                                    </button>
                                </div>
                            </GlassCard>
                        </div>

                        {/* Feed Posts with premium card design */}
                        {loading ? (
                            <div className="space-y-10">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-[300px] w-full bg-white/[0.02] rounded-[32px] border border-white/5 animate-pulse" />
                                ))}
                            </div>
                        ) : (
                            <AnimatePresence>
                                {posts.map((post, i) => (
                                    <motion.div
                                        key={post.id}
                                        initial={{ opacity: 0, y: 40 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                                    >
                                        <GlassCard className="p-10 hover:border-violet-500/30 transition-all duration-500 group/card border-white/5 relative bg-white/[0.01] hover:bg-white/[0.02] rounded-[32px] shadow-2xl">
                                            {/* Top Bar */}
                                            <div className="flex justify-between items-start mb-8">
                                                <div className="flex items-center gap-5">
                                                    <div className="w-14 h-14 rounded-2xl bg-[var(--surface-3)] border border-white/5 flex items-center justify-center font-black text-2xl premium-text-gradient shadow-2xl group-hover/card:border-violet-500/40 transition-all duration-500">
                                                        {post.author_name[0]}
                                                    </div>
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-3">
                                                            <p className="text-xl font-extrabold text-[var(--text-primary)] font-syne tracking-tight group-hover/card:text-violet-400 transition-colors">
                                                                {post.author_name}
                                                            </p>
                                                            <div className={`px-3 py-1 rounded-full text-[9px] uppercase font-black tracking-[0.2em] border backdrop-blur-md ${post.author_role === 'founder' ? 'bg-violet-500/10 text-violet-400 border-violet-500/20' :
                                                                post.author_role === 'investor' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                                    'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                                                                }`}>
                                                                {post.author_role}
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3 opacity-60">
                                                            <span className="text-[10px] text-[var(--text-tertiary)] font-black uppercase tracking-[0.2em]">
                                                                {formatTimestamp(post.timestamp)}
                                                            </span>
                                                            <div className="w-1 h-1 rounded-full bg-white/20" />
                                                            <span className="text-[10px] text-[var(--text-tertiary)] font-black uppercase tracking-[0.2em]">Validated Node</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {user?.user_id === post.author_id && (
                                                        <button
                                                            onClick={() => handleDelete(post.id)}
                                                            className="text-rose-500/60 hover:text-rose-500 p-3 rounded-2xl hover:bg-rose-500/10 transition-all group/del"
                                                            title="Delete Broadcast"
                                                        >
                                                            <Trash2 size={20} className="group-hover/del:scale-110 transition-transform" />
                                                        </button>
                                                    )}
                                                    <button className="text-[var(--text-tertiary)] hover:text-violet-400 p-3 rounded-2xl hover:bg-violet-500/10 transition-all group/opt">
                                                        <MoreHorizontal size={24} className="group-hover/opt:rotate-90 transition-transform duration-300" />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Content */}
                                            <p className="text-[var(--text-secondary)] font-medium text-xl leading-relaxed mb-10 whitespace-pre-wrap px-1">
                                                {post.content}
                                            </p>

                                            {/* Media Rendering with premium framing */}
                                            {post.has_image && post.image_url && (
                                                <div className="mb-10 rounded-[28px] overflow-hidden border border-white/10 aspect-video bg-black/40 relative group/img cursor-pointer shadow-inner">
                                                    <img
                                                        src={`${API_BASE}${post.image_url}`}
                                                        alt={post.image_alt || "Intelligence Visual"}
                                                        className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover/img:scale-105"
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover/img:opacity-40 transition-opacity" />
                                                    <div className="absolute bottom-8 left-8 right-8 flex items-end justify-between">
                                                        <div className="backdrop-blur-xl bg-black/40 px-6 py-3 rounded-2xl border border-white/10 transform transition-all duration-500 group-hover/img:-translate-y-2">
                                                            <p className="text-[11px] uppercase font-black tracking-[0.3em] text-white/80">{post.image_alt || 'COLLECTIVE_FILE_SYNC'}</p>
                                                        </div>
                                                        <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white opacity-0 group-hover/img:opacity-100 transition-all duration-500 translate-y-4 group-hover/img:translate-y-0">
                                                            <ArrowUpRight size={24} />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {post.has_file && post.file_url && (
                                                <a
                                                    href={`${API_BASE}${post.file_url}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="mb-10 flex items-center justify-between p-6 bg-white/[0.02] border border-white/5 rounded-[24px] hover:bg-violet-500/5 hover:border-violet-500/20 transition-all duration-500 group/file shadow-sm"
                                                >
                                                    <div className="flex items-center gap-6">
                                                        <div className="p-4 bg-cyan-500/10 rounded-2xl text-cyan-400 group-hover/file:scale-110 transition-transform duration-500">
                                                            <FileText size={28} />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <p className="text-lg font-extrabold text-[var(--text-primary)] font-syne tracking-tight group-hover/file:text-cyan-400 transition-colors">{post.file_name || "Nexus Attachment"}</p>
                                                            <p className="text-[10px] uppercase font-black tracking-[0.25em] text-[var(--text-tertiary)] opacity-60">Verified Document Source</p>
                                                        </div>
                                                    </div>
                                                    <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-[var(--text-tertiary)] group-hover/file:text-cyan-400 group-hover/file:bg-cyan-400/10 group-hover/file:border-cyan-400/20 transition-all duration-500">
                                                        <Download size={22} className="group-hover/file:-translate-y-1 animate-bounce-slow" />
                                                    </div>
                                                </a>
                                            )}

                                            {/* Interaction Bar */}
                                            <div className="flex items-center justify-between pt-8 border-t border-white/[0.05]">
                                                <div className="flex items-center gap-10">
                                                    <button
                                                        onClick={() => handleLike(post.id)}
                                                        className={`flex items-center gap-3 transition-all group/btn ${post.has_liked ? 'text-rose-500 scale-105' : 'text-[var(--text-tertiary)] hover:text-rose-500'}`}
                                                    >
                                                        <div className={`p-3 rounded-2xl transition-all duration-300 ${post.has_liked ? 'bg-rose-500/15 shadow-[0_0_20px_rgba(244,63,94,0.15)]' : 'group-hover/btn:bg-rose-500/10'}`}>
                                                            <Heart size={22} className={post.has_liked ? 'fill-rose-500' : 'group-hover/btn:scale-110 transition-transform'} />
                                                        </div>
                                                        <span className="text-sm font-black tracking-widest leading-none">{post.likes_count}</span>
                                                    </button>

                                                    <button
                                                        onClick={() => toggleComments(post.id)}
                                                        className={`flex items-center gap-3 transition-all group/btn ${post.is_comments_open ? 'text-violet-500' : 'text-[var(--text-tertiary)] hover:text-violet-500'}`}
                                                    >
                                                        <div className={`p-3 rounded-2xl transition-all duration-300 ${post.is_comments_open ? 'bg-violet-500/15 shadow-[0_0_20px_rgba(139,92,246,0.15)]' : 'group-hover/btn:bg-violet-500/10'}`}>
                                                            <MessageSquare size={22} className="group-hover/btn:scale-110 transition-transform" />
                                                        </div>
                                                        <span className="text-sm font-black tracking-widest leading-none">{post.comments_count}</span>
                                                    </button>
                                                </div>

                                                <button className="flex items-center gap-3 text-[var(--text-tertiary)] hover:text-cyan-400 transition-all group/btn px-6 py-3 rounded-2xl hover:bg-cyan-500/10 hover:border-cyan-500/20 border border-transparent">
                                                    <Share2 size={22} className="group-hover/btn:scale-110 transition-transform" />
                                                    <span className="text-[11px] font-black uppercase tracking-[0.25em]">Sync</span>
                                                </button>
                                            </div>

                                            {/* Threaded Comments */}
                                            <AnimatePresence>
                                                {post.is_comments_open && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        className="overflow-hidden"
                                                    >
                                                        <div className="mt-8 pt-8 space-y-8 border-t border-white/[0.05]">
                                                            {post.fetched_comments?.map((comment) => (
                                                                <div key={comment.id} className="flex gap-5 group/comment pl-4 border-l-2 border-white/5 hover:border-violet-500/30 transition-colors duration-500">
                                                                    <div className="w-10 h-10 rounded-xl bg-[var(--surface-3)] border border-white/5 flex items-center justify-center font-black text-xs text-white/50 shrink-0 shadow-lg">
                                                                        {comment.author_name[0]}
                                                                    </div>
                                                                    <div className="flex-1 space-y-1">
                                                                        <div className="flex items-center gap-3">
                                                                            <span className="text-sm font-extrabold text-[var(--text-primary)] font-syne">{comment.author_name}</span>
                                                                            <span className="text-[10px] uppercase font-black tracking-[0.2em] text-[var(--text-tertiary)] opacity-40">
                                                                                {formatTimestamp(comment.timestamp)}
                                                                            </span>
                                                                        </div>
                                                                        <p className="text-base text-[var(--text-secondary)] font-medium leading-relaxed">
                                                                            {comment.content}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            ))}

                                                            {/* Enhanced Input Field */}
                                                            <div className="flex gap-5 pt-4">
                                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center text-white font-black text-xs shrink-0 shadow-lg border border-white/10">
                                                                    {user?.name?.[0] || 'F'}
                                                                </div>
                                                                <div className="flex-1 relative">
                                                                    <input
                                                                        type="text"
                                                                        value={activeCommentText[post.id] || ""}
                                                                        onChange={(e) => setActiveCommentText({ ...activeCommentText, [post.id]: e.target.value })}
                                                                        onKeyDown={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                                                                        placeholder="Contribute to the dialogue..."
                                                                        className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-3 px-6 text-sm font-semibold focus:border-violet-500/50 outline-none transition-all pr-14 shadow-inner"
                                                                    />
                                                                    <button
                                                                        onClick={() => handleAddComment(post.id)}
                                                                        disabled={!(activeCommentText[post.id]?.trim())}
                                                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-violet-500 hover:bg-violet-500/10 rounded-xl transition-all disabled:opacity-20 group/send"
                                                                    >
                                                                        <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </GlassCard>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
