"use client";

import { Input } from "@/components/ui/Input";
import Link from "next/link";
import { Mail, ArrowLeft, Send } from "lucide-react";

export default function ForgotPasswordPage() {
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
                    Recuperar Senha
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600 px-6">
                    Informe seu e-mail cadastrado e enviaremos um link para você redefinir sua senha.
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow-xl shadow-gray-100 sm:rounded-2xl sm:px-10 border border-gray-100">
                    <form className="space-y-6">
                        <Input
                            label="E-mail Cadastrado"
                            type="email"
                            placeholder="seu@email.com"
                            icon={<Mail size={18} />}
                        />

                        <button
                            type="submit"
                            className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-lg shadow-brand/20 text-sm font-bold text-white bg-brand hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand transition-all"
                        >
                            <Send size={18} />
                            Enviar Link de Recuperação
                        </button>
                    </form>

                    <div className="mt-8">
                        <Link href="/login" className="flex items-center justify-center gap-2 text-sm font-bold text-gray-500 hover:text-brand transition-colors">
                            <ArrowLeft size={16} />
                            Voltar para o Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
