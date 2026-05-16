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

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, ""); // Remove invalid chars
        if (value.length > 11) value = value.slice(0, 11);

        // Mask (XX) XXXXX-XXXX
        if (value.length > 10) {
            value = value.replace(/^(\d\d)(\d{5})(\d{4}).*/, "($1) $2-$3");
        } else if (value.length > 5) {
            value = value.replace(/^(\d\d)(\d{4})(\d{0,4}).*/, "($1) $2-$3");
        } else if (value.length > 2) {
            value = value.replace(/^(\d\d)(\d{0,5}).*/, "($1) $2");
        } else {
            value = value.replace(/^(\d*)/, "($1");
        }

        setPhone(value);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        const { data, error } = await signUp(email.trim(), password, name);

        if (error) {
            setError(error.message || "Erro ao criar conta.");
            setLoading(false);
        } else {
            // Success
            alert("Conta criada com sucesso!");

            if (email.trim().toLowerCase() === "vinkimpressos@gmail.com") {
                router.push("/admin");
            } else {
                router.push("/");
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <Link href="/" className="flex justify-center mb-6">
                    <img src="https://i.imgur.com/Kizb68g.png" alt="Vink" className="h-10 w-auto object-contain" />
                </Link>
                <h2 className="text-center text-3xl font-semibold tracking-tight text-gray-900">
                    Crie sua conta
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Já é cliente?{" "}
                    <Link href="/login" className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-brand to-brand-dark hover:text-transparent bg-clip-text bg-gradient-to-r from-brand to-brand-dark-dark transition-colors">
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
                            onChange={handlePhoneChange}
                            maxLength={15} // (11) 99999-9999
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
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg shadow-brand/20 text-sm font-semibold text-white bg-gradient-to-r from-brand to-brand-dark hover:bg-gradient-to-r from-brand to-brand-dark-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? "Criando Conta..." : "Criar Conta"}
                        </button>
                    </form>



                    <div className="mt-6">
                        <p className="text-center text-xs text-gray-400">
                            Ao se cadastrar, você concorda com nossos <Link href="/termos-de-uso" className="underline hover:text-gray-600">Termos de Uso</Link> e <Link href="/politica-de-privacidade" className="underline hover:text-gray-600">Política de Privacidade</Link>.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
