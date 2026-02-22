"use client";
import React, { useState, useEffect, createContext, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "info";

interface Toast {
    id: number;
    type: ToastType;
    title: string;
    message: string;
}

let toastSubscriber: ((type: ToastType, title: string, message: string) => void) | null = null;

export const toast = (type: ToastType, title: string, message: string) => {
    if (toastSubscriber) {
        toastSubscriber(type, title, message);
    }
};

export function ToastProvider() {
    const [toasts, setToasts] = useState<Toast[]>([]);

    useEffect(() => {
        toastSubscriber = (type, title, message) => {
            const id = Date.now();
            setToasts(prev => [...prev, { id, type, title, message }]);
            setTimeout(() => {
                setToasts(prev => prev.filter(t => t.id !== id));
            }, 4000);
        };
        return () => { toastSubscriber = null; };
    }, []);

    const removeToast = (id: number) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    return (
        <div style={{ position: "fixed", top: 24, right: 24, zIndex: 9999, display: "flex", flexDirection: "column", gap: 12 }}>
            <AnimatePresence>
                {toasts.map(t => (
                    <motion.div
                        key={t.id}
                        initial={{ opacity: 0, x: 20, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        style={{
                            minWidth: 320,
                            padding: "16px",
                            borderRadius: "16px",
                            background: "rgba(12, 12, 20, 0.9)",
                            backdropFilter: "blur(20px)",
                            border: `1px solid ${t.type === "success" ? "rgba(16,185,129,0.3)" : t.type === "error" ? "rgba(244,63,94,0.3)" : "rgba(124,58,237,0.3)"}`,
                            boxShadow: "0 10px 40px rgba(0,0,0,0.4)",
                            display: "flex",
                            gap: 12,
                        }}
                    >
                        <div style={{ color: t.type === "success" ? "#10B981" : t.type === "error" ? "#F43F5E" : "#8B5CF6" }}>
                            {t.type === "success" && <CheckCircle2 size={20} />}
                            {t.type === "error" && <AlertCircle size={20} />}
                            {t.type === "info" && <Info size={20} />}
                        </div>
                        <div style={{ flex: 1 }}>
                            <h4 style={{ margin: 0, fontSize: 13, fontWeight: 800, color: "#fff", textTransform: "uppercase", letterSpacing: "0.05em" }}>{t.title}</h4>
                            <p style={{ margin: "4px 0 0", fontSize: 12, color: "rgba(255,255,255,0.5)", fontWeight: 500 }}>{t.message}</p>
                        </div>
                        <button onClick={() => removeToast(t.id)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.2)", cursor: "pointer", padding: 0 }}>
                            <X size={14} />
                        </button>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
