'use client';

import { useState, useEffect } from 'react';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { getHomepageConfig, saveHomepageConfig, uploadImage, HomepageConfig, Banner, Section, SectionType } from '@/actions/homepage-actions';
import { Trash2, Plus, ArrowUp, ArrowDown, Eye, EyeOff, Layout, Edit, X } from 'lucide-react';
import { useAdmin } from '@/contexts/AdminContext';

export default function AdminHomeConfigPage() {
    const [config, setConfig] = useState<HomepageConfig | null>(null);
    const { products } = useAdmin();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Editing State
    const [editingSection, setEditingSection] = useState<Section | null>(null);

    // Banner Editing specifics
    const [uploading, setUploading] = useState(false);
    const [editingBanner, setEditingBanner] = useState<Partial<Banner> | null>(null);
    const [editingBenefit, setEditingBenefit] = useState<any | null>(null);

    // Section Adding State
    const [isAddingSection, setIsAddingSection] = useState(false);

    useEffect(() => {
        loadConfig();
    }, []);

    async function loadConfig() {
        setLoading(true);
        const data = await getHomepageConfig();
        setConfig(data);
        setLoading(false);
    }

    async function handleSave() {
        if (!config) return;
        setSaving(true);
        const success = await saveHomepageConfig(config);
        setSaving(false);
        if (success) {
            alert('Configurações salvas com sucesso!');
        } else {
            alert('Erro ao salvar configurações.');
        }
    }

    // --- Sections Handlers ---

    function toggleSection(sectionId: string) {
        if (!config) return;
        setConfig({
            ...config,
            sections: config.sections.map(s =>
                s.id === sectionId ? { ...s, enabled: !s.enabled } : s
            )
        });
    }

    function moveSection(index: number, direction: 'up' | 'down') {
        if (!config) return;
        const newSections = [...config.sections];
        if (direction === 'up' && index > 0) {
            [newSections[index], newSections[index - 1]] = [newSections[index - 1], newSections[index]];
        } else if (direction === 'down' && index < newSections.length - 1) {
            [newSections[index], newSections[index + 1]] = [newSections[index + 1], newSections[index]];
        }
        setConfig({ ...config, sections: newSections });
    }

    function removeSection(sectionId: string) {
        if (!config || !confirm('Remover esta seção?')) return;
        setConfig({
            ...config,
            sections: config.sections.filter(s => s.id !== sectionId)
        });
    }

    function addSection(type: SectionType, name: string, title?: string, filter?: string) {
        if (!config) return;
        const newSection: Section = {
            id: `${type}-${Date.now()}`,
            type,
            name,
            title,
            enabled: true,
            settings: filter ? { filter: filter as any } : undefined,
            banners: type === 'banner-carousel' ? [] : undefined
        };
        setConfig({
            ...config,
            sections: [...config.sections, newSection]
        });
        setIsAddingSection(false);
    }

    // --- Content Editing Handlers ---

    function handleEditSave() {
        if (!config || !editingSection) return;

        setConfig({
            ...config,
            sections: config.sections.map(s => s.id === editingSection.id ? editingSection : s)
        });
        setEditingSection(null);
    }

    // Banner Specifics within Modal
    function addBannerToSection() {
        if (!editingSection) return;
        setEditingBanner({
            id: Date.now().toString(),
            imageUrl: '',
            link: ''
        });
    }

    function removeBannerFromSection(bannerId: string) {
        if (!editingSection || !editingSection.banners) return;
        setEditingSection({
            ...editingSection,
            banners: editingSection.banners.filter(b => b.id !== bannerId)
        });
    }

    async function handleBannerUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        const path = await uploadImage(formData);
        setUploading(false);

        if (path) {
            setEditingBanner(prev => prev ? { ...prev, imageUrl: path } : null);
        } else {
            alert('Erro ao fazer upload da imagem.');
        }
    }

    function saveBanner() {
        if (!editingSection || !editingBanner || !editingBanner.imageUrl) return;

        const banners = editingSection.banners || [];
        // Check if updating existing
        const existingIndex = banners.findIndex(b => b.id === editingBanner.id);

        let newBanners;
        if (existingIndex >= 0) {
            newBanners = [...banners];
            newBanners[existingIndex] = editingBanner as Banner;
        } else {
            // New banner
            const newBannerData = editingBanner as Banner;
            if (!newBannerData.id) newBannerData.id = Date.now().toString();
            newBanners = [...banners, newBannerData];
        }

        setEditingSection({
            ...editingSection,
            banners: newBanners
        });
        setEditingBanner(null);
    }

    // --- Benefit Specifics ---
    function addBenefitToSection() {
        if (!editingSection) return;
        setEditingBenefit({
            id: Date.now().toString(),
            icon: 'star',
            title: '',
            subtitle: ''
        });
    }

    function removeBenefitFromSection(benefitId: string) {
        if (!editingSection || !editingSection.benefits) return;
        setEditingSection({
            ...editingSection,
            benefits: editingSection.benefits.filter(b => b.id !== benefitId)
        });
    }

    function saveBenefit() {
        if (!editingSection || !editingBenefit || !editingBenefit.title) return;

        const benefits = editingSection.benefits || [];
        const existingIndex = benefits.findIndex(b => b.id === editingBenefit.id);

        let newBenefits;
        if (existingIndex >= 0) {
            newBenefits = [...benefits];
            newBenefits[existingIndex] = editingBenefit;
        } else {
            const newBenefit = { ...editingBenefit };
            if (!newBenefit.id) newBenefit.id = Date.now().toString();
            newBenefits = [...benefits, newBenefit];
        }

        setEditingSection({
            ...editingSection,
            benefits: newBenefits
        });
        setEditingBenefit(null);
    }

    if (loading) return <Container className="py-8">Carregando...</Container>;
    if (!config) return <Container className="py-8">Erro ao carregar configurações.</Container>;

    return (
        <Container className="py-8 space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Layout className="text-brand" /> Editor da Home
                </h1>
                <Button onClick={handleSave} disabled={saving} className="bg-brand text-brand-foreground hover:bg-brand/90">
                    {saving ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
            </div>

            {/* Sections Management */}
            <div className="bg-surface p-6 rounded-lg border border-border">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Estrutura da Página</h2>
                    <div className="relative">
                        <Button
                            onClick={() => setIsAddingSection(!isAddingSection)}
                            size="sm"
                            variant="outline"
                            className="flex items-center gap-2"
                        >
                            <Plus size={16} /> Adicionar Seção
                        </Button>

                        {isAddingSection && (
                            <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-border rounded-lg shadow-lg py-2 z-10 transition-all">
                                <button className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm" onClick={() => addSection('product-row', 'Nova Lista de Produtos', 'Nova Lista', 'best-sellers')}>+ Lista de Produtos (Padrão)</button>
                                <button className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm" onClick={() => addSection('banner-carousel', 'Novo Carrossel')}>+ Carrossel de Banners</button>
                                <button className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm" onClick={() => addSection('stacked-banners', 'Banners Promocionais')}>+ Banners Promocionais</button>
                                <button className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm" onClick={() => addSection('info-banner', 'Faixa Informativa')}>+ Faixa Informativa</button>
                                <button className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm" onClick={() => addSection('categories', 'Categorias')}>+ Categorias</button>
                                <button className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm" onClick={() => addSection('maintenance-cta', 'Card de Manutenção')}>+ Card de Manutenção</button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-2">
                    {config.sections.map((section, index) => (
                        <div key={section.id} className="flex items-center justify-between p-3 bg-background hover:bg-gray-50 rounded border border-border group transition-colors">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => toggleSection(section.id)}
                                    className={`p-2 rounded-full transition-colors ${section.enabled ? 'text-green-600 bg-green-100 hover:bg-green-200' : 'text-gray-400 bg-gray-100 hover:bg-gray-200'}`}
                                    title={section.enabled ? 'Visível' : 'Oculto'}
                                >
                                    {section.enabled ? <Eye size={18} /> : <EyeOff size={18} />}
                                </button>
                                <div>
                                    <span className={`font-medium ${!section.enabled ? 'opacity-50' : ''}`}>{section.name}</span>
                                    {section.title && <p className="text-xs text-gray-500">Título: {section.title}</p>}
                                </div>
                            </div>
                            <div className="flex gap-1 items-center">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setEditingSection(section)}
                                    className="mr-2"
                                >
                                    <Edit size={14} className="mr-1" /> Conteúdo
                                </Button>

                                <button
                                    onClick={() => moveSection(index, 'up')}
                                    disabled={index === 0}
                                    className="p-1 text-gray-400 hover:text-brand disabled:opacity-30"
                                >
                                    <ArrowUp size={18} />
                                </button>
                                <button
                                    onClick={() => moveSection(index, 'down')}
                                    disabled={index === config.sections.length - 1}
                                    className="p-1 text-gray-400 hover:text-brand disabled:opacity-30"
                                >
                                    <ArrowDown size={18} />
                                </button>
                                <button
                                    onClick={() => removeSection(section.id)}
                                    className="p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity ml-2"
                                    title="Remover seção"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Editing Logic Modal (Section Content) */}
            {editingSection && !editingBanner && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-40">
                    <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-bold">Editar: {editingSection.name}</h3>
                            <button onClick={() => setEditingSection(null)} className="p-1 hover:bg-gray-100 rounded">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Title Editing */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Título Exibido (Opcional)</label>
                            <Input
                                value={editingSection.title || ''}
                                onChange={e => setEditingSection({ ...editingSection, title: e.target.value })}
                                placeholder="Ex: Nossos Destaques"
                            />
                        </div>

                        {/* Settings for Product Rows */}
                        {editingSection.type === 'product-row' && (
                            <div className="space-y-4 pt-2 border-t border-gray-100">
                                <div>
                                    <label className="text-sm font-medium mb-2 block">Selecionar Produtos</label>
                                    <p className="text-xs text-gray-500 mb-2">Escolha os produtos que devem aparecer nesta lista.</p>
                                    <div className="border border-border rounded-md max-h-60 overflow-y-auto bg-gray-50 p-2 space-y-1">
                                        {products.length === 0 ? (
                                            <p className="text-xs text-gray-400 text-center py-2">Nenhum produto cadastrado.</p>
                                        ) : (
                                            products.map(product => {
                                                const isSelected = editingSection.settings?.productIds?.includes(product.id);
                                                return (
                                                    <div
                                                        key={product.id}
                                                        onClick={() => {
                                                            const currentIds = editingSection.settings?.productIds || [];
                                                            const newIds = isSelected
                                                                ? currentIds.filter(id => id !== product.id)
                                                                : [...currentIds, product.id];

                                                            setEditingSection({
                                                                ...editingSection,
                                                                settings: {
                                                                    ...editingSection.settings,
                                                                    productIds: newIds,
                                                                    filter: newIds.length > 0 ? 'custom' : 'best-sellers'
                                                                }
                                                            });
                                                        }}
                                                        className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all border ${isSelected ? 'bg-brand/5 border-brand' : 'hover:bg-gray-50 border-transparent'}`}
                                                    >
                                                        <div className={`w-5 h-5 rounded border flex-shrink-0 flex items-center justify-center transition-colors ${isSelected ? 'bg-brand border-brand' : 'border-gray-300 bg-white'}`}>
                                                            {isSelected && <div className="w-2.5 h-2.5 bg-white rounded-[1px]" />}
                                                        </div>

                                                        <div className="relative w-10 h-10 rounded overflow-hidden flex-shrink-0 border border-gray-100">
                                                            {product.image ? (
                                                                <img src={product.image} className="w-full h-full object-cover" alt={product.title} />
                                                            ) : (
                                                                <div className={`w-full h-full ${product.color || 'bg-gray-200'}`} />
                                                            )}
                                                        </div>

                                                        <div className="flex-1 min-w-0">
                                                            <p className={`text-sm font-medium truncate ${isSelected ? 'text-brand-dark' : 'text-gray-900'}`}>{product.title}</p>
                                                            <p className="text-xs text-gray-500 truncate">{product.category}</p>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                    <p className="text-xs text-right text-gray-500 mt-1">
                                        {editingSection.settings?.productIds?.length || 0} selecionados
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Banner Management for Banner Carousel and Stacked Banners */}
                        {['banner-carousel', 'stacked-banners'].includes(editingSection.type) && (
                            <div className="space-y-4 border-t border-gray-100 pt-4">
                                <div className="flex justify-between items-center">
                                    <h4 className="font-bold">Banners desta seção</h4>
                                    <Button size="sm" onClick={addBannerToSection}>
                                        <Plus size={16} className="mr-1" /> Adicionar Banner
                                    </Button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {editingSection.banners?.map(banner => (
                                        <div key={banner.id} className="relative aspect-[3/1] bg-gray-100 rounded border border-gray-200 overflow-hidden group">
                                            {banner.imageUrl && <img src={banner.imageUrl} className="w-full h-full object-cover" />}
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                <Button size="sm" variant="outline" className="bg-white" onClick={() => setEditingBanner(banner)}>
                                                    Editar
                                                </Button>
                                                <Button size="sm" variant="outline" className="bg-white text-red-600" onClick={() => removeBannerFromSection(banner.id)}>
                                                    <Trash2 size={16} />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                    {(!editingSection.banners || editingSection.banners.length === 0) && (
                                        <div className="col-span-full text-center py-4 text-gray-500 text-sm">
                                            Sem banners. Adicione um para começar.
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Info Banner Management */}
                        {editingSection.type === 'info-banner' && (
                            <div className="space-y-4 border-t border-gray-100 pt-4">
                                <div className="flex justify-between items-center">
                                    <h4 className="font-bold">Ícones e Textos</h4>
                                    <Button size="sm" onClick={addBenefitToSection}>
                                        <Plus size={16} className="mr-1" /> Adicionar Item
                                    </Button>
                                </div>

                                <div className="space-y-2">
                                    {editingSection.benefits?.map(benefit => (
                                        <div key={benefit.id} className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-200">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 flex items-center justify-center bg-white rounded border border-gray-200 text-brand">
                                                    {/* We could render the actual icon here if we import the map, or just static for now */}
                                                    <Layout size={16} />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-sm">{benefit.title}</p>
                                                    <p className="text-xs text-gray-500">{benefit.subtitle}</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-1">
                                                <Button size="sm" variant="ghost" onClick={() => setEditingBenefit(benefit)}>
                                                    <Edit size={14} />
                                                </Button>
                                                <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-600" onClick={() => removeBenefitFromSection(benefit.id)}>
                                                    <Trash2 size={14} />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                    {(!editingSection.benefits || editingSection.benefits.length === 0) && (
                                        <div className="text-center py-4 text-gray-500 text-sm">
                                            Nenhum item adicionado.
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end pt-4 border-t border-gray-100">
                            <Button onClick={handleEditSave}>Concluir Edição</Button>
                        </div>
                    </div>
                </div>
            )
            }

            {/* Benefit Edit Modal */}
            {
                editingBenefit && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-md space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-xl font-bold">Editar Item</h3>
                                <button onClick={() => setEditingBenefit(null)}><X size={20} /></button>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Ícone</label>
                                <select
                                    className="w-full p-2 border border-border rounded-md bg-white"
                                    value={editingBenefit.icon}
                                    onChange={e => setEditingBenefit({ ...editingBenefit, icon: e.target.value })}
                                >
                                    <option value="star">Estrela</option>
                                    <option value="credit-card">Cartão</option>
                                    <option value="truck">Caminhão (Entrega)</option>
                                    <option value="shield">Escudo (Segurança)</option>
                                    <option value="pen">Caneta (Design)</option>
                                    <option value="heart">Coração</option>
                                    <option value="check">Check</option>
                                    <option value="clock">Relógio</option>
                                    <option value="map">Localização</option>
                                    <option value="phone">Telefone</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Título</label>
                                <Input
                                    value={editingBenefit.title}
                                    onChange={e => setEditingBenefit({ ...editingBenefit, title: e.target.value })}
                                    placeholder="Ex: Frete Grátis"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Subtítulo</label>
                                <Input
                                    value={editingBenefit.subtitle}
                                    onChange={e => setEditingBenefit({ ...editingBenefit, subtitle: e.target.value })}
                                    placeholder="Ex: em compras acima de R$100"
                                />
                            </div>

                            <div className="flex justify-end gap-2 mt-4">
                                <Button variant="outline" onClick={() => setEditingBenefit(null)}>Cancelar</Button>
                                <Button onClick={saveBenefit} disabled={!editingBenefit.title}>Salvar</Button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Banner Add/Edit Modal (Nested) */}
            {
                editingBanner && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-md space-y-4">
                            <h3 className="text-xl font-bold">Banner</h3>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Imagem</label>
                                <Input type="file" accept="image/*" onChange={handleBannerUpload} disabled={uploading} />
                                {uploading && <p className="text-xs text-brand">Carregando...</p>}

                                {editingBanner.imageUrl && (
                                    <div className="mt-2 rounded-lg overflow-hidden border border-gray-200 bg-gray-100 max-h-40">
                                        <img src={editingBanner.imageUrl} alt="Preview" className="w-full h-full object-contain" />
                                    </div>
                                )}

                                <div className="mt-2">
                                    <p className="text-xs text-gray-500 mb-1">Ou URL externa:</p>
                                    <Input
                                        value={editingBanner.imageUrl || ''}
                                        onChange={e => setEditingBanner({ ...editingBanner, imageUrl: e.target.value })}
                                        placeholder="https://..."
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Link de Destino</label>
                                <Input
                                    value={editingBanner.link || ''}
                                    onChange={e => setEditingBanner({ ...editingBanner, link: e.target.value })}
                                    placeholder="/produtos"
                                />
                            </div>

                            <div className="flex justify-end gap-2 mt-4">
                                <Button variant="outline" onClick={() => setEditingBanner(null)}>Cancelar</Button>
                                <Button onClick={saveBanner} disabled={!editingBanner.imageUrl}>Salvar Banner</Button>
                            </div>
                        </div>
                    </div>
                )
            }

        </Container >
    );
}
