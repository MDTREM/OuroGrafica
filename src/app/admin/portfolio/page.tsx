'use client';

import { useEffect, useState } from 'react';
import { getAllCasesAdmin, deleteCase, PortfolioCase } from '@/actions/portfolio-actions';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { Plus, Edit, Trash2, Image as ImageIcon, Globe } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminPortfolioPage() {
    const { session } = useAuth();
    const [cases, setCases] = useState<PortfolioCase[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadCases();
    }, []);

    async function loadCases() {
        setLoading(true);
        const data = await getAllCasesAdmin();
        setCases(data);
        setLoading(false);
    }

    async function handleDelete(id: string) {
        if (!confirm('Tem certeza que deseja excluir este case de sucesso?')) return;

        const token = session?.access_token;

        const result = await deleteCase(id, token);
        if (result.success) {
            loadCases();
        } else {
            alert(`Erro ao excluir case: ${result.error}`);
        }
    }

    return (
        <Container className="py-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-semibold text-gray-900">Gerenciar Portfólio</h1>
                    <p className="text-gray-500">Crie e edite seus cases de sucesso</p>
                </div>
                <Link href="/admin/portfolio/novo">
                    <Button className="flex items-center gap-2">
                        <Plus size={20} />
                        Novo Case
                    </Button>
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">Carregando cases...</div>
                ) : cases.length === 0 ? (
                    <div className="p-12 text-center flex flex-col items-center gap-4 text-gray-500">
                        <ImageIcon size={48} className="text-gray-300" />
                        <div>
                            <p className="text-lg font-medium text-gray-900">Nenhum case encontrado</p>
                            <p>Comece criando seu primeiro case de sucesso!</p>
                        </div>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {cases.map(item => (
                            <div key={item.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                                        {item.cover_image ? (
                                            <img src={item.cover_image} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                <ImageIcon />
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-semibold text-gray-900">{item.title}</h3>
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${item.published ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                {item.published ? 'Publicado' : 'Rascunho'}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500 max-w-md truncate">{item.category} • {item.description || 'Sem descrição...'}</p>
                                        <div className="text-xs text-gray-400 mt-1">
                                            Criado em: {new Date(item.created_at).toLocaleDateString('pt-BR')}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    {item.published && (
                                        <a href={`/portfolio/${item.slug}`} target="_blank" rel="noreferrer" title="Ver no site" className="p-2 text-gray-400 hover:text-brand transition-colors">
                                            <Globe size={18} />
                                        </a>
                                    )}
                                    <Link href={`/admin/portfolio/${item.id}`}>
                                        <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors" title="Editar">
                                            <Edit size={18} />
                                        </button>
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        className="p-2 text-gray-400 hover:text-red-600 transition-colors" title="Excluir"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Container>
    );
}
