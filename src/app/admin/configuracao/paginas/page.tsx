'use client';

import { useState, useEffect } from 'react';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { getPagesConfig, savePagesConfig, uploadImage, PagesConfig } from '@/actions/homepage-actions';
import { Image as ImageIcon, Save } from 'lucide-react';

export default function AdminPagesConfigPage() {
    const [config, setConfig] = useState<PagesConfig | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState<'maintenance' | 'outsourcing' | null>(null);

    useEffect(() => {
        loadConfig();
    }, []);

    async function loadConfig() {
        setLoading(true);
        const data = await getPagesConfig();
        setConfig(data);
        setLoading(false);
    }

    async function handleSave() {
        if (!config) return;
        setSaving(true);
        const success = await savePagesConfig(config);
        setSaving(false);
        if (success) {
            alert('Configurações salvas com sucesso!');
        } else {
            alert('Erro ao salvar configurações.');
        }
    }

    async function handleUpload(e: React.ChangeEvent<HTMLInputElement>, type: 'maintenance' | 'outsourcing') {
        const file = e.target.files?.[0];
        if (!file || !config) return;

        setUploading(type);
        const formData = new FormData();
        formData.append('file', file);

        const path = await uploadImage(formData);
        setUploading(null);

        if (path) {
            if (type === 'maintenance') {
                setConfig({
                    ...config,
                    maintenanceBanners: [...(config.maintenanceBanners || []), path]
                });
            } else {
                setConfig({
                    ...config,
                    outsourcingBanners: [...(config.outsourcingBanners || []), path]
                });
            }
        } else {
            alert('Erro ao fazer upload da imagem.');
        }

        // Reset input
        e.target.value = '';
    }

    function removeBanner(type: 'maintenance' | 'outsourcing', index: number) {
        if (!config) return;
        if (type === 'maintenance') {
            const newBanners = [...(config.maintenanceBanners || [])];
            newBanners.splice(index, 1);
            setConfig({ ...config, maintenanceBanners: newBanners });
        } else {
            const newBanners = [...(config.outsourcingBanners || [])];
            newBanners.splice(index, 1);
            setConfig({ ...config, outsourcingBanners: newBanners });
        }
    }

    if (loading) return <Container className="py-8">Carregando...</Container>;
    if (!config) return <Container className="py-8">Erro ao carregar configurações.</Container>;

    return (
        <Container className="py-8 space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <ImageIcon className="text-brand" /> Banners das Páginas
                </h1>
                <Button onClick={handleSave} disabled={saving} className="bg-brand text-brand-foreground hover:bg-brand/90 flex items-center gap-2">
                    <Save size={18} />
                    {saving ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Manutenção Card */}
                <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm space-y-4">
                    <h2 className="text-lg font-bold border-b border-gray-100 pb-2">Página de Manutenção (Carrossel)</h2>

                    <div className="grid grid-cols-2 gap-4">
                        {config.maintenanceBanners?.map((banner, idx) => (
                            <div key={idx} className="aspect-video relative group border rounded-md overflow-hidden bg-gray-50">
                                <img src={banner} alt={`Banner ${idx}`} className="w-full h-full object-cover" />
                                <button
                                    onClick={() => removeBanner('maintenance', idx)}
                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center w-6 h-6 leading-none"
                                    title="Remover"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="space-y-2 pt-4 border-t border-gray-50">
                        <label className="text-sm font-medium">Adicionar Nova Imagem</label>
                        <div className="flex gap-2">
                            <Input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleUpload(e, 'maintenance')}
                                disabled={uploading === 'maintenance'}
                                className="cursor-pointer"
                            />
                        </div>
                        {uploading === 'maintenance' && <p className="text-xs text-brand">Carregando...</p>}
                    </div>
                </div>

                {/* Outsourcing/Aluguel Card */}
                <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm space-y-4">
                    <h2 className="text-lg font-bold border-b border-gray-100 pb-2">Página de Aluguel/Outsourcing (Carrossel)</h2>

                    <div className="grid grid-cols-2 gap-4">
                        {config.outsourcingBanners?.map((banner, idx) => (
                            <div key={idx} className="aspect-video relative group border rounded-md overflow-hidden bg-gray-50">
                                <img src={banner} alt={`Banner ${idx}`} className="w-full h-full object-cover" />
                                <button
                                    onClick={() => removeBanner('outsourcing', idx)}
                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center w-6 h-6 leading-none"
                                    title="Remover"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="space-y-2 pt-4 border-t border-gray-50">
                        <label className="text-sm font-medium">Adicionar Nova Imagem</label>
                        <div className="flex gap-2">
                            <Input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleUpload(e, 'outsourcing')}
                                disabled={uploading === 'outsourcing'}
                                className="cursor-pointer"
                            />
                        </div>
                        {uploading === 'outsourcing' && <p className="text-xs text-brand">Carregando...</p>}
                    </div>
                </div>
            </div>
        </Container>
    );
}
