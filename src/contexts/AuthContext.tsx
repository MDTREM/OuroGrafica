"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { User, Session, Provider } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

interface AuthContextType {
    user: User | null;
    session: Session | null;
    isLoading: boolean;
    signIn: (email: string, password: string) => Promise<{ data?: any; error: any }>;
    signUp: (email: string, password: string, name: string) => Promise<{ data?: any; error: any }>;
    signInWithSocial: (provider: Provider) => Promise<{ data?: any; error: any }>;
    signOut: () => Promise<void>;
    isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            setIsLoading(false);
        });

        // Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            setIsLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const signIn = async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        return { data, error };
    };

    const signUp = async (email: string, password: string, name: string) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: name,
                    role: 'user', // Default role
                }
            }
        });
        return { data, error };
    };

    const signInWithSocial = async (provider: Provider) => {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: provider,
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });
        return { data, error };
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        router.push("/login"); // Redirect to login after logout
    };

    // Admin Check: Metadata 'role' === 'admin' OR hardcoded email fallback
    const isAdmin = user?.user_metadata?.role === 'admin' || user?.email === 'admin@gmail.com';

    return (
        <AuthContext.Provider value={{ user, session, isLoading, signIn, signUp, signInWithSocial, signOut, isAdmin }}>
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
