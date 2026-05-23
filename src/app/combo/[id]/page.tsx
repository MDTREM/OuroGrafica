import { Metadata } from "next";
import ComboClient from "./ComboClient";
import { getComboById } from "@/actions/get-combo-by-id";

interface ComboPageProps {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ComboPageProps): Promise<Metadata> {
    const resolvedParams = await params;
    const combo = await getComboById(resolvedParams.id);

    if (!combo) {
        return {
            title: "Combo Não Encontrado | Vink",
            description: "O combo que você procura não está disponível."
        };
    }

    return {
        title: `${combo.title} | Vink`,
        description: combo.subtitle || `Compre o ${combo.title} na Vink. Vantagens exclusivas.`,
        openGraph: {
            title: combo.title,
            description: combo.subtitle,
            images: combo.image ? [{ url: combo.image }] : [],
        }
    };
}

export default async function ComboPage({ params }: ComboPageProps) {
    const resolvedParams = await params;
    const combo = await getComboById(resolvedParams.id);

    if (!combo) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background">
                <p className="text-gray-500 font-medium">Combo não encontrado.</p>
                <a href="/" className="bg-brand hover:bg-brand-dark text-white font-semibold py-2 px-6 rounded-xl transition-all shadow-md shadow-brand/10">Voltar para a loja</a>
            </div>
        );
    }

    return <ComboClient combo={combo} />;
}
