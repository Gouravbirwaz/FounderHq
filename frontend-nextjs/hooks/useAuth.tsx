"use client";
import { useState, useEffect, createContext, useContext } from "react";

interface User {
    name: string;
    role: "founder" | "investor" | "student" | "mentor" | string;
    user_id: string;
    vetting_badge: boolean;
}

interface AuthContextType {
    user: User | null;
    login: (userData: User) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const saved = localStorage.getItem("auth_user");
        if (saved) {
            try {
                setUser(JSON.parse(saved));
            } catch (e) {
                localStorage.removeItem("auth_user");
            }
        } else {
            // Default demo user
            const demo: User = {
                name: "Gourav",
                role: "founder",
                user_id: "F-99421",
                vetting_badge: true
            };
            setUser(demo);
        }
    }, []);

    const login = (userData: User) => {
        setUser(userData);
        localStorage.setItem("auth_user", JSON.stringify(userData));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("auth_user");
    };

    return (
        <AuthContext.Provider value= {{ user, login, logout }
}>
    { children }
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
