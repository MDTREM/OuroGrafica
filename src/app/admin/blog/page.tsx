'use client';

import { useEffect, useState } from 'react';
import { getAllPostsAdmin, deletePost, BlogPost } from '@/actions/blog-actions';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { Plus, Edit, Trash2, FileText, Globe } from 'lucide-react';
import Link from 'next/link';

export default function AdminBlogPage() {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadPosts();
    }, []);

    async function loadPosts() {
        setLoading(true);
        const data = await getAllPostsAdmin();
        setPosts(data);
        setLoading(false);
    }

    async function handleDelete(id: string) {
        if (!confirm('Tem certeza que deseja excluir este post?')) return;

        const success = await deletePost(id);
        if (success) {
            loadPosts();
        } else {
            alert('Erro ao excluir post.');
        }
    }

    return (
        <Container className="py-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Gerenciar Blog</h1>
                    <p className="text-gray-500">Crie e edite artigos para o blog</p>
                </div>
                <Link href="/admin/blog/novo">
                    <Button className="flex items-center gap-2">
                        <Plus size={20} />
                        Novo Artigo
                    </Button>
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">Carregando posts...</div>
                ) : posts.length === 0 ? (
                    <div className="p-12 text-center flex flex-col items-center gap-4 text-gray-500">
                        <FileText size={48} className="text-gray-300" />
                        <div>
                            <p className="text-lg font-medium text-gray-900">Nenhum post encontrado</p>
                            <p>Comece criando seu primeiro artigo!</p>
                        </div>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {posts.map(post => (
                            <div key={post.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                                        {post.cover_image ? (
                                            <img src={post.cover_image} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                <FileText />
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-bold text-gray-900">{post.title}</h3>
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${post.published ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                {post.published ? 'Publicado' : 'Rascunho'}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500 max-w-md truncate">{post.excerpt || 'Sem resumo...'}</p>
                                        <div className="text-xs text-gray-400 mt-1">
                                            Atualizado em: {new Date(post.created_at).toLocaleDateString('pt-BR')}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    {post.published && (
                                        <a href={`/blog/${post.slug}`} target="_blank" rel="noreferrer" title="Ver no site" className="p-2 text-gray-400 hover:text-[#FF6B07] transition-colors">
                                            <Globe size={18} />
                                        </a>
                                    )}
                                    <Link href={`/admin/blog/${post.id}`}>
                                        <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors" title="Editar">
                                            <Edit size={18} />
                                        </button>
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(post.id)}
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
