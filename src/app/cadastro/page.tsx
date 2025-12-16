"use client";

import { Input } from "@/components/ui/Input";
import Link from "next/link";
import { useState } from "react";
import { Mail, Lock, User, Phone, Eye, EyeOff, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function RegisterPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const { signUp, signInWithSocial } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        const { error } = await signUp(email.trim(), password, name);

        if (error) {
            setError(error.message || "Erro ao criar conta.");
            setLoading(false);
        } else {
            // Success
            alert("Conta criada com sucesso!");
            router.push("/admin");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <Link href="/" className="flex justify-center mb-6">
                    <img
                        src="https://i.imgur.com/B9Cg1wQ.png"
                        alt="Ouro Gráfica"
                        className="h-8 w-auto object-contain"
                    />
                </Link>
                <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900">
                    Crie sua conta
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Já é cliente?{" "}
                    <Link href="/login" className="font-bold text-brand hover:text-brand-dark transition-colors">
                        Faça login
                    </Link>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow-xl shadow-gray-100 sm:rounded-2xl sm:px-10 border border-gray-100">
                    <form className="space-y-5" onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg text-center">
                                {error}
                            </div>
                        )}
                        <Input
                            label="Nome Completo"
                            type="text"
                            placeholder="Seu nome"
                            icon={<User size={18} />}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />

                        <Input
                            label="E-mail"
                            type="email"
                            placeholder="seu@email.com"
                            icon={<Mail size={18} />}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />

                        <Input
                            label="Telefone / WhatsApp"
                            type="tel"
                            placeholder="(00) 00000-0000"
                            icon={<Phone size={18} />}
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                        />

                        <div className="space-y-2">
                            <Input
                                label="Senha"
                                type={showPassword ? "text" : "password"}
                                placeholder="Pelo menos 8 caracteres"
                                icon={<Lock size={18} />}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1 ml-auto"
                            >
                                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                                {showPassword ? "Ocultar senha" : "Mostar senha"}
                            </button>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg shadow-brand/20 text-sm font-bold text-white bg-brand hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? "Criando Conta..." : "Criar Conta"}
                        </button>
                    </form>

                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="bg-white px-2 text-gray-500">Ou cadastre-se com</span>
                            </div>
                        </div>

                        <div className="mt-6 grid grid-cols-1 gap-3">
                            <button
                                type="button"
                                onClick={() => signInWithSocial("google")}
                                className="w-full inline-flex justify-center items-center py-2.5 px-4 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                                    <path
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                        fill="#4285F4"
                                    />
                                    <path
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        fill="#34A853"
                                    />
                                    <path
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                        fill="#FBBC05"
                                    />
                                    <path
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                        fill="#EA4335"
                                    />
                                </svg>
                                Google
                            </button>
                        </div>
                    </div>

                    <div className="mt-6">
                        <p className="text-center text-xs text-gray-400">
                            Ao se cadastrar, você concorda com nossos <Link href="/termos" className="underline hover:text-gray-600">Termos de Uso</Link> e <Link href="/privacidade" className="underline hover:text-gray-600">Política de Privacidade</Link>.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
