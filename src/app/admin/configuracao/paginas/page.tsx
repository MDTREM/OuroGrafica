'use client';

import { useState, useEffect } from 'react';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { getPagesConfig, savePagesConfig, uploadImage, PagesConfig, Banner } from '@/actions/homepage-actions';
import { Image as ImageIcon, Save, Smartphone, Monitor } from 'lucide-react';

export default function AdminPagesConfigPage() {
    const [config, setConfig] = useState<PagesConfig | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState<{ type: 'maintenance' | 'outsourcing', index?: number, isMobile: boolean } | null>(null);

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

    async function handleUpload(e: React.ChangeEvent<HTMLInputElement>, type: 'maintenance' | 'outsourcing', index?: number, isMobile: boolean = false) {
        const file = e.target.files?.[0];
        if (!file || !config) return;

        setUploading({ type, index, isMobile });
        const formData = new FormData();
        formData.append('file', file);

        const path = await uploadImage(formData);

        if (path) {
            if (type === 'maintenance') {
                const newBanners = [...(config.maintenanceBanners || [])];

                if (typeof index === 'number') {
                    // Updating existing banner
                    const banner = { ...newBanners[index] };
                    if (isMobile) banner.mobileImageUrl = path;
                    else banner.imageUrl = path;
                    newBanners[index] = banner;
                } else {
                    // New banner
                    const newBanner: Banner = {
                        id: Date.now().toString(),
                        imageUrl: isMobile ? '' : path, // Technically shouldn't start with mobile only but handling flexibility
                        mobileImageUrl: isMobile ? path : undefined
                    };
                    newBanners.push(newBanner);
                }

                setConfig({ ...config, maintenanceBanners: newBanners });
            } else {
                const newBanners = [...(config.outsourcingBanners || [])];

                if (typeof index === 'number') {
                    // Updating existing banner
                    const banner = { ...newBanners[index] };
                    if (isMobile) banner.mobileImageUrl = path;
                    else banner.imageUrl = path;
                    newBanners[index] = banner;
                } else {
                    // New banner
                    const newBanner: Banner = {
                        id: Date.now().toString(),
                        imageUrl: isMobile ? '' : path,
                        mobileImageUrl: isMobile ? path : undefined
                    };
                    newBanners.push(newBanner);
                }

                setConfig({ ...config, outsourcingBanners: newBanners });
            }
        } else {
            alert('Erro ao fazer upload da imagem.');
        }

        setUploading(null);
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

                    <div className="space-y-6">
                        {config.maintenanceBanners?.map((banner, idx) => (
                            <div key={banner.id || idx} className="border rounded-lg p-4 bg-gray-50 relative group">
                                <button
                                    onClick={() => removeBanner('maintenance', idx)}
                                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-100 hover:bg-red-600 transition-colors flex items-center justify-center w-6 h-6 leading-none z-10"
                                    title="Remover Banner Completo"
                                >
                                    ×
                                </button>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                            <Monitor size={16} /> Desktop
                                        </div>
                                        <div className="aspect-video relative bg-gray-200 rounded overflow-hidden">
                                            {banner.imageUrl ? (
                                                <img src={banner.imageUrl} alt="Desktop" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">Sem imagem</div>
                                            )}
                                        </div>
                                        <Input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleUpload(e, 'maintenance', idx, false)}
                                            disabled={!!uploading}
                                            className="text-xs"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                            <Smartphone size={16} /> Mobile
                                        </div>
                                        <div className="aspect-[4/3] relative bg-gray-200 rounded overflow-hidden">
                                            {banner.mobileImageUrl ? (
                                                <img src={banner.mobileImageUrl} alt="Mobile" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs p-2 text-center">Usará a de Desktop</div>
                                            )}
                                        </div>
                                        <Input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleUpload(e, 'maintenance', idx, true)}
                                            disabled={!!uploading}
                                            className="text-xs"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="space-y-2 pt-4 border-t border-gray-100">
                        <label className="text-sm font-medium">Adicionar Novo Banner</label>
                        <div className="flex gap-2 items-center">
                            <span className="text-xs text-gray-500">Selecione a imagem Desktop para criar:</span>
                            <Input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleUpload(e, 'maintenance')}
                                disabled={!!uploading}
                                className="cursor-pointer"
                            />
                        </div>
                        {uploading?.type === 'maintenance' && !uploading.index && <p className="text-xs text-brand">Carregando...</p>}
                    </div>
                </div>

                {/* Outsourcing/Aluguel Card */}
                <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm space-y-4">
                    <h2 className="text-lg font-bold border-b border-gray-100 pb-2">Página de Aluguel/Outsourcing (Carrossel)</h2>

                    <div className="space-y-6">
                        {config.outsourcingBanners?.map((banner, idx) => (
                            <div key={banner.id || idx} className="border rounded-lg p-4 bg-gray-50 relative group">
                                <button
                                    onClick={() => removeBanner('outsourcing', idx)}
                                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-100 hover:bg-red-600 transition-colors flex items-center justify-center w-6 h-6 leading-none z-10"
                                    title="Remover Banner Completo"
                                >
                                    ×
                                </button>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                            <Monitor size={16} /> Desktop
                                        </div>
                                        <div className="aspect-video relative bg-gray-200 rounded overflow-hidden">
                                            {banner.imageUrl ? (
                                                <img src={banner.imageUrl} alt="Desktop" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">Sem imagem</div>
                                            )}
                                        </div>
                                        <Input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleUpload(e, 'outsourcing', idx, false)}
                                            disabled={!!uploading}
                                            className="text-xs"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                            <Smartphone size={16} /> Mobile
                                        </div>
                                        <div className="aspect-[4/3] relative bg-gray-200 rounded overflow-hidden">
                                            {banner.mobileImageUrl ? (
                                                <img src={banner.mobileImageUrl} alt="Mobile" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs p-2 text-center">Usará a de Desktop</div>
                                            )}
                                        </div>
                                        <Input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleUpload(e, 'outsourcing', idx, true)}
                                            disabled={!!uploading}
                                            className="text-xs"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="space-y-2 pt-4 border-t border-gray-100">
                        <label className="text-sm font-medium">Adicionar Novo Banner</label>
                        <div className="flex gap-2 items-center">
                            <span className="text-xs text-gray-500">Selecione a imagem Desktop para criar:</span>
                            <Input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleUpload(e, 'outsourcing')}
                                disabled={!!uploading}
                                className="cursor-pointer"
                            />
                        </div>
                        {uploading?.type === 'outsourcing' && !uploading.index && <p className="text-xs text-brand">Carregando...</p>}
                    </div>
                </div>
            </div>
        </Container>
    );
}
