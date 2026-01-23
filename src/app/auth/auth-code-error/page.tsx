import Link from "next/link";
import { AlertCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default function AuthCodeError({
    searchParams,
}: {
    searchParams: { error?: string };
}) {
    const errorMessage = searchParams?.error;

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 text-red-600">
                    <AlertCircle size={32} />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Erro na Autenticação</h1>
                <p className="text-gray-600 mb-6">
                    Não foi possível fazer o login.
                </p>

                {errorMessage && (
                    <div className="bg-red-50 border border-red-100 rounded-lg p-3 mb-6 text-sm text-red-800 break-words font-mono">
                        {errorMessage}
                    </div>
                )}
                <Link
                    href="/login"
                    className="block w-full bg-brand text-white font-bold py-3 rounded-xl hover:bg-brand/90 transition-colors"
                >
                    Tentar Novamente
                </Link>
                <Link
                    href="/"
                    className="block mt-4 text-sm text-gray-500 hover:text-gray-900"
                >
                    Voltar para o Início
                </Link>
            </div>
        </div>
    );
}
