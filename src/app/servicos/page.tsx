import { Container } from "@/components/ui/Container";
import Link from "next/link";
import { ChevronRight, Wrench, Printer, Cog } from "lucide-react";

export default function ServicesPage() {
    const services = [
        {
            id: 'manutencao',
            name: 'Assistência Técnica',
            description: 'Manutenção de impressoras e computadores',
            icon: Wrench,
            href: '/servicos/manutencao',
            color: 'text-[#FF6B07]',
            bg: 'bg-orange-50'
        },
        {
            id: 'aluguel',
            name: 'Aluguel de Impressoras',
            description: 'Locação de equipamentos para sua empresa',
            icon: Printer,
            href: '/servicos/aluguel',
            color: 'text-[#FF6B07]',
            bg: 'bg-orange-50'
        }
    ];

    return (
        <div className="bg-gray-50 min-h-screen pb-24">
            {/* Header */}
            <div className="bg-white border-b border-gray-100 p-4 sticky top-0 z-30 flex items-center justify-center">
                <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Cog size={20} className="text-brand" />
                    Nossos Serviços
                </h1>
            </div>

            <Container className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {services.map((service) => (
                        <Link
                            key={service.id}
                            href={service.href}
                            className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-5 hover:shadow-md hover:border-brand/30 transition-all group"
                        >
                            <div className={`w-14 h-14 ${service.bg} rounded-xl flex items-center justify-center ${service.color}`}>
                                <service.icon size={26} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-lg font-bold text-gray-900 group-hover:text-brand transition-colors">{service.name}</h3>
                                <p className="text-sm text-gray-500">{service.description}</p>
                            </div>
                            <ChevronRight size={20} className="text-gray-300 group-hover:text-brand" />
                        </Link>
                    ))}
                </div>
            </Container>
        </div>
    );
}
