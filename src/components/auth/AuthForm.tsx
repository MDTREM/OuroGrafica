"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/Input";
import { Mail, Lock, Eye, EyeOff, User, Phone, FileText } from "lucide-react";

interface AuthFormProps {
    onSuccess: () => void;
}

export function AuthForm({ onSuccess }: AuthFormProps) {
    const [mode, setMode] = useState<'login' | 'register'>('login');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Login State
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    // Register State (adds Name, Phone, CPF)
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [cpf, setCpf] = useState("");

    const { signIn, signUp, signInWithSocial } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            if (mode === 'login') {
                const { error } = await signIn(email, password);
                if (error) throw error;
            } else {
                const { error } = await signUp(email, password, name, phone, cpf);
                if (error) throw error;
            }
            onSuccess();
        } catch (err: any) {
            console.error(err);
            if (err.message?.includes("Invalid login")) {
                setError("E-mail ou senha incorretos.");
            } else if (err.message?.includes("already registered")) {
                setError("Este e-mail já está cadastrado. Faça login.");
                setMode('login');
            } else {
                setError(err.message || "Erro ao autenticar. Tente novamente.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        try {
            const { error } = await signInWithSocial('google');
            if (error) throw error;
            // Redirect happens via OAuth
        } catch (err) {
            console.error(err);
            setError("Erro ao conectar com Google.");
            setLoading(false);
        }
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value.replace(/\D/g, "");
        if (val.length > 11) val = val.slice(0, 11);
        if (val.length > 2) val = `(${val.slice(0, 2)}) ${val.slice(2)}`;
        if (val.length > 10) val = `${val.slice(0, 10)}-${val.slice(10)}`;
        setPhone(val);
    };

    const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value.replace(/\D/g, "");
        if (val.length > 11) val = val.slice(0, 11);
        val = val.replace(/(\d{3})(\d)/, "$1.$2");
        val = val.replace(/(\d{3})(\d)/, "$1.$2");
        val = val.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
        setCpf(val);
    };

    return (
        <div className="max-w-md mx-auto">
            {/* Social Login */}
            <div className="mb-6">
                <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="w-full h-12 bg-white text-gray-700 font-bold rounded-xl border border-gray-200 hover:bg-gray-50 transition-all flex items-center justify-center gap-2 mb-4"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    Continuar com Google
                </button>

                <div className="relative flex items-center justify-center mb-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <span className="relative z-10 bg-white px-2 text-sm text-gray-400">ou entre com e-mail</span>
                </div>
            </div>

            {/* Toggle Login/Register */}
            <div className="flex bg-gray-100 p-1 rounded-lg mb-6">
                <button
                    onClick={() => setMode('register')}
                    className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${mode === 'register' ? 'bg-white text-brand shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Criar Conta
                </button>
                <button
                    onClick={() => setMode('login')}
                    className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${mode === 'login' ? 'bg-white text-brand shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Já tenho conta
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg text-center border border-red-100">
                        {error}
                    </div>
                )}

                {mode === 'register' && (
                    <div className="animate-in fade-in slide-in-from-top-1 space-y-4">
                        <Input
                            label="Nome Completo"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            icon={<User size={18} />}
                            placeholder="Seu nome"
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="WhatsApp"
                                required
                                value={phone}
                                onChange={handlePhoneChange}
                                icon={<Phone size={18} />}
                                placeholder="(00) 00000-0000"
                            />
                            <Input
                                label="CPF"
                                required
                                value={cpf}
                                onChange={handleCpfChange}
                                icon={<FileText size={18} />}
                                placeholder="000.000.000-00"
                            />
                        </div>
                    </div>
                )}

                <Input
                    label="E-mail"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    icon={<Mail size={18} />}
                    placeholder="seu@email.com"
                />

                <div className="space-y-2">
                    <Input
                        label="Senha"
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        icon={<Lock size={18} />}
                        placeholder="••••••••"
                    />
                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
                        >
                            {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                            {showPassword ? "Ocultar" : "Mostrar"}
                        </button>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 bg-brand text-white font-bold rounded-xl hover:bg-brand/90 transition-all flex items-center justify-center gap-2 mt-4 shadow-lg shadow-brand/20 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        "Processando..."
                    ) : (
                        mode === 'login' ? "Entrar" : "Criar Conta"
                    )}
                </button>
            </form>
        </div>
    );
}
