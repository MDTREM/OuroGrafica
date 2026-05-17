'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { ArrowLeft, Save, Image as ImageIcon, Plus, Trash2, Upload, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { saveCase, PortfolioCase } from '@/actions/portfolio-actions';
import { uploadImage } from '@/actions/homepage-actions';
import { supabase } from '@/lib/supabase';

export default function PortfolioFormPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const isNew = resolvedParams.id === 'novo';
    const { session } = useAuth();
    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(!isNew);
    const [uploadingCover, setUploadingCover] = useState(false);
    const [uploadingGallery, setUploadingGallery] = useState(false);
    
    const [formData, setFormData] = useState<Partial<PortfolioCase>>({
        title: '',
        slug: '',
        category: '',
        description: '',
        content: '',
        cover_image: '',
        images: [],
        published: true
    });

    useEffect(() => {
        if (!isNew) {
            fetchCase();
        }
    }, [isNew]);

    async function fetchCase() {
        try {
            const { data, error } = await supabase
                .from('portfolio_cases')
                .select('*')
                .eq('id', resolvedParams.id)
                .single();

            if (data) {
                setFormData(data);
            }
        } catch (error) {
            console.error('Error fetching case:', error);
        } finally {
            setFetching(false);
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: checked }));
    };

    const handleAddImageURL = () => {
        const url = prompt('Digite a URL da imagem:');
        if (url) {
            setFormData(prev => ({
                ...prev,
                images: [...(prev.images || []), url]
            }));
        }
    };

    const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        setUploadingCover(true);
        const file = e.target.files[0];
        const data = new FormData();
        data.append('file', file);

        const url = await uploadImage(data, 'portfolio');
        if (url) {
            setFormData(prev => ({ ...prev, cover_image: url }));
        } else {
            alert('Erro ao enviar imagem. Verifique se o bucket "portfolio" existe no Supabase.');
        }
        setUploadingCover(false);
    };

    const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        setUploadingGallery(true);
        const file = e.target.files[0];
        const data = new FormData();
        data.append('file', file);

        const url = await uploadImage(data, 'portfolio');
        if (url) {
            setFormData(prev => ({
                ...prev,
                images: [...(prev.images || []), url]
            }));
        } else {
            alert('Erro ao enviar imagem. Verifique se o bucket "portfolio" existe no Supabase.');
        }
        setUploadingGallery(false);
    };

    const handleRemoveImage = (index: number) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images?.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const result = await saveCase(formData, session?.access_token);
            if (result.success) {
                alert('Case salvo com sucesso!');
                router.push('/admin/portfolio');
            } else {
                alert(`Erro: ${result.error}`);
            }
        } catch (error) {
            alert('Erro ao salvar.');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return <Container className="py-8"><p>Carregando...</p></Container>;
    }

    return (
        <Container className="py-8 max-w-4xl">
            <div className="flex items-center gap-4 mb-8">
                <Link href="/admin/portfolio" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ArrowLeft size={24} className="text-gray-600" />
                </Link>
                <div>
                    <h1 className="text-3xl font-semibold text-gray-900">
                        {isNew ? 'Novo Case de Sucesso' : 'Editar Case'}
                    </h1>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Título do Case</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title || ''}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand focus:border-brand outline-none"
                                placeholder="Ex: Burger House Rebranding"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Slug (URL amigável)</label>
                            <input
                                type="text"
                                name="slug"
                                value={formData.slug || ''}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand focus:border-brand outline-none"
                                placeholder="Deixe em branco para gerar automático"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
                            <input
                                type="text"
                                name="category"
                                value={formData.category || ''}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand focus:border-brand outline-none"
                                placeholder="Ex: Hamburgueria, Pizzaria..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Imagem de Capa</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    name="cover_image"
                                    value={formData.cover_image || ''}
                                    onChange={handleChange}
                                    required
                                    className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand focus:border-brand outline-none"
                                    placeholder="https://..."
                                />
                                <label className="flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-600 px-4 py-3 rounded-xl cursor-pointer transition-colors whitespace-nowrap">
                                    {uploadingCover ? <Loader2 size={20} className="animate-spin" /> : <Upload size={20} />}
                                    <span className="ml-2 hidden sm:inline">{uploadingCover ? 'Enviando...' : 'Upload'}</span>
                                    <input type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} disabled={uploadingCover} />
                                </label>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Descrição Curta (Aparece na listagem)</label>
                        <textarea
                            name="description"
                            value={formData.description || ''}
                            onChange={handleChange}
                            required
                            rows={3}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand focus:border-brand outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Conteúdo / O Desafio e Solução</label>
                        <textarea
                            name="content"
                            value={formData.content || ''}
                            onChange={handleChange}
                            rows={8}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand focus:border-brand outline-none"
                        />
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <label className="block text-sm font-medium text-gray-700">Galeria de Imagens</label>
                            <button type="button" onClick={handleAddImageURL} className="text-sm flex items-center gap-1 text-brand hover:text-brand-dark">
                                <Plus size={16} /> URL Externa
                            </button>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {formData.images?.map((img, idx) => (
                                <div key={idx} className="relative aspect-square rounded-xl border border-gray-200 overflow-hidden group">
                                    <img src={img} alt="" className="w-full h-full object-cover" />
                                    <button 
                                        type="button" 
                                        onClick={() => handleRemoveImage(idx)}
                                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}
                            <label className="aspect-square rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-500 hover:border-brand hover:text-brand transition-colors cursor-pointer relative">
                                {uploadingGallery ? (
                                    <Loader2 size={24} className="animate-spin mb-2" />
                                ) : (
                                    <Upload size={24} className="mb-2" />
                                )}
                                <span className="text-xs">{uploadingGallery ? 'Enviando...' : 'Upload'}</span>
                                <input type="file" accept="image/*" className="hidden" onChange={handleGalleryUpload} disabled={uploadingGallery} />
                            </label>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                name="published"
                                checked={formData.published || false}
                                onChange={handleCheckboxChange}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand"></div>
                            <span className="ml-3 text-sm font-medium text-gray-700">Publicado</span>
                        </label>
                    </div>
                </div>

                <div className="flex justify-end">
                    <Button type="submit" disabled={loading} className="flex items-center gap-2">
                        <Save size={20} />
                        {loading ? 'Salvando...' : 'Salvar Case'}
                    </Button>
                </div>
            </form>
        </Container>
    );
}
