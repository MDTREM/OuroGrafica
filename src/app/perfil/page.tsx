import { Container } from "@/components/ui/Container";
import Link from "next/link";
import { LogOut, ChevronRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function ProfilePage() {
    const { user, signOut } = useAuth();

    const menuItems = [
        {
            label: "Meus Pedidos",
            description: "Acompanhe suas compras",
            href: "/perfil/pedidos"
        },
        {
            label: "Endereços",
            description: "Gerencie seus endereços de entrega",
            href: "/perfil/enderecos"
        },
        {
            label: "Favoritos",
            description: "Produtos que você curtiu",
            href: "/favoritos"
        },
        {
            label: "Meus Dados",
            description: "Alterar senha e informações",
            href: "/perfil/dados"
        },
        {
            label: "Ajuda e Suporte",
            description: "Fale com nosso atendimento",
            href: "/atendimento"
        }
    ];

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p>Carregando perfil...</p>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen pb-20">
            {/* Header */}
            <div className="bg-white border-b border-gray-100 pt-8 pb-6 mb-6">
                <Container>
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 mb-1">Olá, {user.user_metadata?.full_name || user.user_metadata?.name || 'Cliente'}</h1>
                            <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                        <button className="text-sm font-medium text-brand hover:underline">
                            Editar
                        </button>
                    </div>
                </Container>
            </div>

            <Container>
                {/* Quick Actions Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                    {menuItems.map((item, index) => (
                        <Link
                            key={index}
                            href={item.href}
                            className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex items-center justify-between group"
                        >
                            <div>
                                <h3 className="font-bold text-gray-900 group-hover:text-brand transition-colors">{item.label}</h3>
                                <p className="text-xs text-gray-500 mt-1">{item.description}</p>
                            </div>
                            <ChevronRight size={18} className="text-gray-300 group-hover:text-brand flex-shrink-0 ml-4" />
                        </Link>
                    ))}
                </div>

                {/* Quit Button */}
                <button
                    onClick={() => signOut()}
                    className="w-full md:w-auto flex items-center justify-center gap-2 text-red-600 font-bold bg-white border border-red-100 hover:bg-red-50 px-6 py-3 rounded-xl transition-colors mx-auto md:mx-0">
                    <LogOut size={18} />
                    Sair da Conta
                </button>
            </Container>
        </div>
    );
}
