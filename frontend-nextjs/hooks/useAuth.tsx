"use client";
import { useState, useEffect, createContext, useContext } from "react";
import { apiFetch } from "@/lib/api";

interface User {
    user_id: string;
    name: string;
    email?: string;
    role: "founder" | "investor" | "student" | "mentor" | string;
    vetting_badge: boolean;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (token: string, userData: User) => void;
    logout: () => void;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const refreshUser = async () => {
        const token = localStorage.getItem("auth_token");
        if (!token) {
            setUser(null);
            setLoading(false);
            return;
        }

        try {
            const data = await apiFetch("/auth/me");
            const mappedUser: User = {
                user_id: data.id,
                name: data.name,
                email: data.email,
                role: data.role,
                vetting_badge: data.vetting_badge
            };
            setUser(mappedUser);
            localStorage.setItem("auth_user", JSON.stringify(mappedUser));
        } catch (e) {
            console.error("Auth refresh failed:", e);
            logout();
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshUser();
    }, []);

    const login = (token: string, userData: User) => {
        localStorage.setItem("auth_token", token);
        localStorage.setItem("auth_user", JSON.stringify(userData));
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_user");
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
