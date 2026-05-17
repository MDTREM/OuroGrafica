"use client";

import { Container } from "@/components/ui/Container";
import { Input } from "@/components/ui/Input";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Mail, Lock, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const { signIn, signInWithSocial, isAdmin } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        const { error } = await signIn(email.trim(), password);

        if (error) {
            setError("E-mail ou senha incorretos.");
            setLoading(false);
        } else {
            // Success - Redirect based on role
            // We need to check the user role again or trust the context update
            // Ideally context updates fast enough, but safe bet is checking the target email or just default to home
            // For now, let's look at the email we just signed in with or the context
            // Using a timeout to ensure context updates or just hard reload logic?
            // Next.js router.push is client side.
            // Let's rely on simple logic: if email is admin@gmail.com -> /admin, else /

            if (email.trim().toLowerCase() === "vinkimpressos@gmail.com") {
                router.push("/admin");
            } else {
                router.push("/");
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative">
            {/* Back Button */}
            <Link href="/" className="absolute top-6 left-6 p-2 text-gray-500 hover:text-transparent bg-clip-text bg-gradient-to-r from-brand to-brand-dark transition-colors bg-white rounded-full shadow-sm border border-gray-100">
                <ArrowLeft size={20} />
            </Link>

            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <Link href="/" className="flex justify-center mb-6">
                    <img src="https://i.imgur.com/aS2efN8.png" alt="Vink" className="h-10 w-auto object-contain" />
                </Link>
                <h2 className="text-center text-3xl font-semibold tracking-tight text-gray-900">
                    Bem-vindo de volta
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Não tem uma conta?{" "}
                    <Link href="/cadastro" className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-brand to-brand-dark hover:text-transparent bg-clip-text bg-gradient-to-r from-brand to-brand-dark-dark transition-colors">
                        Cadastre-se grátis
                    </Link>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow-xl shadow-gray-100 sm:rounded-xl sm:px-10 border border-gray-100">
                    <form className="space-y-5" onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl text-center">
                                {error}
                            </div>
                        )}
                        <Input
                            label="E-mail"
                            type="email"
                            placeholder="seu@email.com"
                            icon={<Mail size={18} />}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />

                        <div className="space-y-2">
                            <Input
                                label="Senha"
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                icon={<Lock size={18} />}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <div className="flex items-center justify-between">
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
                                >
                                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                                    {showPassword ? "Ocultar senha" : "Mostar senha"}
                                </button>
                                <Link
                                    href="/recuperar-senha"
                                    className="text-sm font-medium text-transparent bg-clip-text bg-gradient-to-r from-brand to-brand-dark hover:text-transparent bg-clip-text bg-gradient-to-r from-brand to-brand-dark-dark"
                                >
                                    Esqueceu a senha?
                                </Link>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg shadow-brand/20 text-sm font-semibold text-white bg-gradient-to-r from-brand to-brand-dark hover:bg-gradient-to-r from-brand to-brand-dark-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? "Entrando..." : "Entrar na Conta"}
                        </button>
                    </form>


                </div>
                <p className="mt-8 text-center text-xs text-gray-500">
                    &copy; {new Date().getFullYear()} Vink. Todos os direitos reservados.
                </p>
            </div>
        </div>
    );
}
