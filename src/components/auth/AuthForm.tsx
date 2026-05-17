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


            {/* Toggle Login/Register */}
            <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
                <button
                    onClick={() => setMode('register')}
                    className={`flex-1 py-2 text-sm font-semibold rounded-xl transition-all ${mode === 'register' ? 'bg-white text-transparent bg-clip-text bg-gradient-to-r from-brand to-brand-dark shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Criar Conta
                </button>
                <button
                    onClick={() => setMode('login')}
                    className={`flex-1 py-2 text-sm font-semibold rounded-xl transition-all ${mode === 'login' ? 'bg-white text-transparent bg-clip-text bg-gradient-to-r from-brand to-brand-dark shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Já tenho conta
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl text-center border border-red-100">
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
                    className="w-full h-12 bg-gradient-to-r from-brand to-brand-dark text-white font-semibold rounded-xl hover:bg-gradient-to-r from-brand to-brand-dark/90 transition-all flex items-center justify-center gap-2 mt-4 shadow-lg shadow-brand/20 disabled:opacity-70 disabled:cursor-not-allowed"
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
