'use client';

import { useState } from 'react';
import { BlogPost, savePost } from '@/actions/blog-actions';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { ArrowLeft, Save, Image as ImageIcon, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { uploadImage } from '@/actions/homepage-actions'; // Reusing existing upload logic

interface EditorProps {
    initialData?: Partial<BlogPost>;
    isNew?: boolean;
}

export function AdminPostEditor({ initialData, isNew }: EditorProps) {
    const router = useRouter();
    const [formData, setFormData] = useState<Partial<BlogPost>>(initialData || { published: true });
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, published: e.target.checked }));
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        setUploading(true);
        const file = e.target.files[0];
        const data = new FormData();
        data.append('file', file);

        const url = await uploadImage(data);

        if (url) {
            setFormData(prev => ({ ...prev, cover_image: url }));
        } else {
            alert('Erro ao fazer upload da imagem.');
        }
        setUploading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        const result = await savePost(formData);

        if (result.success) {
            alert('Post salvo com sucesso!');
            router.push('/admin/blog');
        } else {
            alert('Erro ao salvar post. Verifique o console.');
        }
        setSaving(false);
    };

    return (
        <Container className="py-8">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Link href="/admin/blog" className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
                        <ArrowLeft size={24} />
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900">{isNew ? 'Novo Artigo' : 'Editar Artigo'}</h1>
                </div>
                <Button
                    onClick={handleSubmit}
                    disabled={saving}
                    className="flex items-center gap-2"
                >
                    {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                    {saving ? 'Salvando...' : 'Salvar Post'}
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                            <input
                                required
                                type="text"
                                name="title"
                                value={formData.title || ''}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#FF6B07] focus:border-transparent outline-none"
                                placeholder="Ex: 5 Dicas para Economizar Tinta"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Slug (URL Amigável)</label>
                            <input
                                type="text"
                                name="slug"
                                value={formData.slug || ''}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-500 text-sm outline-none"
                                placeholder="Gerado automaticamente do título se vazio"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Resumo (Meta Description)</label>
                            <textarea
                                name="excerpt"
                                rows={3}
                                value={formData.excerpt || ''}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#FF6B07] focus:border-transparent outline-none resize-none"
                                placeholder="Um breve resumo para aparecer no Google e na listagem..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Conteúdo (HTML)</label>
                            <div className="text-xs text-gray-400 mb-2">Por enquanto aceita HTML simples. Futuramente podemos por um editor rico.</div>
                            <textarea
                                required
                                name="content"
                                rows={15}
                                value={formData.content || ''}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#FF6B07] focus:border-transparent outline-none font-mono text-sm"
                                placeholder="<p>Escreva seu conteúdo aqui...</p>"
                            />
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Status */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-4">Publicação</h3>
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.published || false}
                                onChange={handleToggle}
                                className="w-5 h-5 text-[#FF6B07] rounded focus:ring-[#FF6B07] border-gray-300"
                            />
                            <span className="text-sm font-medium text-gray-700">Publicado</span>
                        </label>
                    </div>

                    {/* Image */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-4">Imagem de Capa</h3>

                        <div className="mb-4 aspect-video bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center border-2 border-dashed border-gray-300 relative group">
                            {formData.cover_image ? (
                                <img src={formData.cover_image} alt="Capa" className="w-full h-full object-cover" />
                            ) : (
                                <ImageIcon className="text-gray-300" size={32} />
                            )}

                            <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                                <span className="text-white font-medium text-sm flex items-center gap-2">
                                    <ImageIcon size={16} />
                                    {uploading ? 'Enviando...' : 'Alterar Imagem'}
                                </span>
                                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                            </label>
                        </div>
                        <p className="text-xs text-center text-gray-400">Clique na imagem para alterar</p>
                    </div>
                </div>
            </div>
        </Container>
    );
}
