'use client';

import { useState, useEffect } from 'react';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { getHomepageConfig, saveHomepageConfig, uploadImage, HomepageConfig, Banner, Section, SectionType, ComboItem } from '@/actions/homepage-actions';
import { getAllPostsAdmin, BlogPost } from '@/actions/blog-actions';
import { Trash2, Plus, ArrowUp, ArrowDown, Eye, EyeOff, Layout, Edit, X, Calendar, ChevronDown, Image as ImageIcon, Check } from 'lucide-react';
import { useAdmin } from '@/contexts/AdminContext';
import { cn } from '@/lib/utils';

export default function AdminHomeConfigPage() {
    const [config, setConfig] = useState<HomepageConfig | null>(null);
    const { products } = useAdmin();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Editing State
    const [editingSection, setEditingSection] = useState<Section | null>(null);

    // Banner Editing specifics
    const [uploading, setUploading] = useState(false);
    const [uploadingMobile, setUploadingMobile] = useState(false);
    const [editingBanner, setEditingBanner] = useState<Partial<Banner> | null>(null);
    const [editingBenefit, setEditingBenefit] = useState<any | null>(null);

    // Blog Selection State
    const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);

    // Section Adding State
    const [isAddingSection, setIsAddingSection] = useState(false);

    useEffect(() => {
        loadConfig();
    }, []);

    async function loadConfig() {
        setLoading(true);
        const [configData, postsData] = await Promise.all([
            getHomepageConfig(),
            getAllPostsAdmin()
        ]);
        setConfig(configData);
        setBlogPosts(postsData);
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

        const defaultCombos = type === 'combos' ? [
            {
                id: 'delivery-inicial-' + Date.now(),
                title: 'Delivery Inicial',
                subtitle: 'O essencial para começar com o pé direito',
                price: 199.90,
                originalPrice: 269.90,
                image: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=2070&auto=format&fit=crop',
                items: [
                    '1000 Cartões de Visita',
                    '500 Panfletos 10x14cm',
                    '100 Adesivos Redondos'
                ]
            },
            {
                id: 'combo-perfeito-' + Date.now(),
                title: 'Combo Perfeito',
                subtitle: 'A identidade completa para o seu negócio bombar',
                price: 399.90,
                originalPrice: 549.90,
                image: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=2070&auto=format&fit=crop',
                items: [
                    '1000 Cartões de Visita',
                    '1000 Panfletos 10x14cm',
                    '500 Adesivos Redondos',
                    '1 Banner 90x120cm',
                    'Logotipo Vetorial'
                ]
            }
        ] : undefined;

        const newSection: Section = {
            id: `${type}-${Date.now()}`,
            type,
            name,
            title,
            enabled: true,
            settings: filter ? { filter: filter as any } : undefined,
            banners: type === 'banner-carousel' ? [] : undefined,
            combos: defaultCombos
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

    async function handleMobileBannerUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingMobile(true);
        const formData = new FormData();
        formData.append('file', file);

        const path = await uploadImage(formData);
        setUploadingMobile(false);

        if (path) {
            setEditingBanner(prev => prev ? { ...prev, mobileImageUrl: path } : null);
        } else {
            alert('Erro ao fazer upload da imagem mobile.');
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

    // --- Combos Specifics ---
    const [editingCombo, setEditingCombo] = useState<any | null>(null);
    const [selectedProductId, setSelectedProductId] = useState("");
    const [selectedProductQtyString, setSelectedProductQtyString] = useState("");
    const [selectedProductFormat, setSelectedProductFormat] = useState("");
    const [selectedProductFinish, setSelectedProductFinish] = useState("");
    const [selectedProductExtra, setSelectedProductExtra] = useState("");
    const [selectedProductVariations, setSelectedProductVariations] = useState<Record<string, string>>({});
    const [uploadingComboImage, setUploadingComboImage] = useState(false);
    const [isProductDropdownOpen, setIsProductDropdownOpen] = useState(false);
    const [tempComboImage, setTempComboImage] = useState("");

    useEffect(() => {
        const prod = products.find(p => p.id === selectedProductId);
        if (prod) {
            setSelectedProductQtyString(prod.quantities?.[0] || "");
            setSelectedProductFormat(prod.formats?.[0] || "");
            setSelectedProductFinish(prod.finishes?.[0] || "");
            setSelectedProductExtra(prod.extras?.[0] || "");
            
            const initialVars: Record<string, string> = {};
            if (prod.variations) {
                prod.variations
                    .filter(v => 
                        !v.name.toLowerCase().includes("impressão") && 
                        !v.name.toLowerCase().includes("lado") && 
                        !v.name.toLowerCase().includes("cor") && 
                        !v.name.toLowerCase().includes("modelo") && 
                        !v.name.toLowerCase().includes("template")
                    )
                    .forEach(v => {
                        initialVars[v.name] = v.options?.[0] || "";
                    });
            }
            setSelectedProductVariations(initialVars);
        } else {
            setSelectedProductQtyString("");
            setSelectedProductFormat("");
            setSelectedProductFinish("");
            setSelectedProductExtra("");
            setSelectedProductVariations({});
        }
    }, [selectedProductId, products]);

    function addComboToSection() {
        if (!editingSection) return;
        setEditingCombo({
            id: 'combo-' + Date.now(),
            title: '',
            subtitle: '',
            price: 0,
            originalPrice: undefined,
            image: '',
            items: []
        });
        setSelectedProductId("");
        setSelectedProductQtyString("");
    }

    function removeComboFromSection(comboId: string) {
        if (!editingSection || !editingSection.combos) return;
        setEditingSection({
            ...editingSection,
            combos: editingSection.combos.filter(c => c.id !== comboId)
        });
    }

    async function handleComboImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingComboImage(true);
        const formData = new FormData();
        formData.append('file', file);

        const path = await uploadImage(formData);
        setUploadingComboImage(false);

        if (path) {
            setEditingCombo((prev: any) => prev ? { ...prev, image: path } : null);
        } else {
            alert('Erro ao fazer upload da imagem.');
        }
    }

    function saveCombo() {
        if (!editingSection || !editingCombo || !editingCombo.title) return;

        const comboToSave = {
            ...editingCombo,
            originalPrice: (editingCombo.originalPrice !== undefined && Number(editingCombo.originalPrice) > 0)
                ? Number(editingCombo.originalPrice)
                : undefined,
            original_price: (editingCombo.originalPrice !== undefined && Number(editingCombo.originalPrice) > 0)
                ? Number(editingCombo.originalPrice)
                : undefined
        };

        const combos = editingSection.combos || [];
        const existingIndex = combos.findIndex(c => c.id === comboToSave.id);

        let newCombos;
        if (existingIndex >= 0) {
            newCombos = [...combos];
            newCombos[existingIndex] = comboToSave;
        } else {
            const newCombo = { ...comboToSave };
            if (!newCombo.id) newCombo.id = 'combo-' + Date.now();
            newCombos = [...combos, newCombo];
        }

        setEditingSection({
            ...editingSection,
            combos: newCombos
        });
        setEditingCombo(null);
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
                <h1 className="text-2xl font-semibold flex items-center gap-2">
                    <Layout className="text-transparent bg-clip-text bg-gradient-to-r from-brand to-brand-dark" /> Editor da Home
                </h1>
                <Button onClick={handleSave} disabled={saving} className="bg-gradient-to-r from-brand to-brand-dark text-transparent bg-clip-text bg-gradient-to-r from-brand to-brand-dark-foreground hover:bg-gradient-to-r from-brand to-brand-dark/90">
                    {saving ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
            </div>

            {/* Sections Management */}
            <div className="bg-surface p-6 rounded-xl border border-border">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Estrutura da Página</h2>
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
                            <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-border rounded-xl shadow-lg py-2 z-10 transition-all">
                                <button className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm" onClick={() => addSection('product-row', 'Nova Lista de Produtos', 'Nova Lista', 'best-sellers')}>+ Lista de Produtos (Padrão)</button>
                                <button className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm" onClick={() => addSection('viral-row', 'Seção Viral', 'Produtos em Alta')}>+ Seção Viral</button>
                                <button className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm" onClick={() => addSection('banner-carousel', 'Novo Carrossel')}>+ Carrossel de Banners</button>
                                <button className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm" onClick={() => addSection('stacked-banners', 'Banners Promocionais')}>+ Banners Promocionais</button>
                                <button className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm" onClick={() => addSection('info-banner', 'Faixa Informativa')}>+ Faixa Informativa</button>
                                <button className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm" onClick={() => addSection('categories', 'Categorias')}>+ Categorias</button>
                                <button className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm" onClick={() => addSection('combos', 'Seção de Combos', 'Combos Especiais')}>+ Seção de Combos</button>

                                <button className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm" onClick={() => addSection('blog-preview', 'Preview do Blog', 'Dicas & Novidades')}>+ Preview do Blog</button>
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
                                    className="p-1 text-gray-400 hover:text-transparent bg-clip-text bg-gradient-to-r from-brand to-brand-dark disabled:opacity-30"
                                >
                                    <ArrowUp size={18} />
                                </button>
                                <button
                                    onClick={() => moveSection(index, 'down')}
                                    disabled={index === config.sections.length - 1}
                                    className="p-1 text-gray-400 hover:text-transparent bg-clip-text bg-gradient-to-r from-brand to-brand-dark disabled:opacity-30"
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
                    <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-semibold">Editar: {editingSection.name}</h3>
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
                        {['product-row', 'viral-row'].includes(editingSection.type) && (
                            <div className="space-y-4 pt-2 border-t border-gray-100">
                                <div>
                                    <label className="text-sm font-medium mb-2 block">Selecionar Produtos</label>
                                    <p className="text-xs text-gray-500 mb-2">Escolha os produtos que devem aparecer nesta lista.</p>
                                    <div className="border border-border rounded-xl max-h-60 overflow-y-auto bg-gray-50 p-2 space-y-1">
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
                                                        className={`flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-all border ${isSelected ? 'bg-gradient-to-r from-brand to-brand-dark/5 border-brand' : 'hover:bg-gray-50 border-transparent'}`}
                                                    >
                                                        <div className={`w-5 h-5 rounded border flex-shrink-0 flex items-center justify-center transition-colors ${isSelected ? 'bg-gradient-to-r from-brand to-brand-dark border-brand' : 'border-gray-300 bg-white'}`}>
                                                            {isSelected && <div className="w-2.5 h-2.5 bg-white rounded-xl" />}
                                                        </div>

                                                        <div className="relative w-10 h-10 rounded overflow-hidden flex-shrink-0 border border-gray-100">
                                                            {product.image ? (
                                                                <img src={product.image} className="w-full h-full object-cover" alt={product.title} />
                                                            ) : (
                                                                <div className={`w-full h-full ${product.color || 'bg-gray-200'}`} />
                                                            )}
                                                        </div>

                                                        <div className="flex-1 min-w-0">
                                                            <p className={`text-sm font-medium truncate ${isSelected ? 'text-transparent bg-clip-text bg-gradient-to-r from-brand to-brand-dark-dark' : 'text-gray-900'}`}>{product.title}</p>
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

                                {/* Reordering Selected Products */}
                                {editingSection.settings?.productIds && editingSection.settings.productIds.length > 0 && (
                                    <div>
                                        <label className="text-sm font-medium mb-2 block">Ordenação dos Produtos</label>
                                        <p className="text-xs text-gray-500 mb-2">Use as setas para alterar a ordem de exibição na home.</p>
                                        <div className="space-y-1">
                                            {editingSection.settings.productIds.map((id, index) => {
                                                const product = products.find(p => p.id === id);
                                                if (!product) return null;
                                                return (
                                                    <div key={id} className="flex items-center justify-between p-2 bg-white border border-gray-200 rounded-xl">
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-xs font-semibold text-gray-400 w-4">{index + 1}</span>
                                                            {product.image && <img src={product.image} className="w-8 h-8 rounded object-cover border border-gray-100" />}
                                                            <span className="text-sm font-medium text-gray-700">{product.title}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            {editingSection.type === 'viral-row' && (
                                                                <Input
                                                                    className="w-24 h-8 text-xs px-2"
                                                                    placeholder="Views (ex: 12K)"
                                                                    value={editingSection.settings?.productViews?.[id] || ''}
                                                                    onChange={(e) => {
                                                                        setEditingSection({
                                                                            ...editingSection,
                                                                            settings: {
                                                                                ...editingSection.settings,
                                                                                productViews: {
                                                                                    ...editingSection.settings?.productViews,
                                                                                    [id]: e.target.value
                                                                                }
                                                                            }
                                                                        });
                                                                    }}
                                                                />
                                                            )}
                                                            <div className="flex items-center gap-1">
                                                                <button
                                                                onClick={() => {
                                                                    const ids = [...(editingSection.settings?.productIds || [])];
                                                                    if (index > 0) {
                                                                        [ids[index], ids[index - 1]] = [ids[index - 1], ids[index]];
                                                                        setEditingSection({
                                                                            ...editingSection,
                                                                            settings: { ...editingSection.settings, productIds: ids }
                                                                        });
                                                                    }
                                                                }}
                                                                disabled={index === 0}
                                                                className="p-1 text-gray-400 hover:text-transparent bg-clip-text bg-gradient-to-r from-brand to-brand-dark disabled:opacity-30"
                                                            >
                                                                <ArrowUp size={16} />
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    const ids = [...(editingSection.settings?.productIds || [])];
                                                                    if (index < ids.length - 1) {
                                                                        [ids[index], ids[index + 1]] = [ids[index + 1], ids[index]];
                                                                        setEditingSection({
                                                                            ...editingSection,
                                                                            settings: { ...editingSection.settings, productIds: ids }
                                                                        });
                                                                    }
                                                                }}
                                                                disabled={index === (editingSection.settings?.productIds?.length || 0) - 1}
                                                                className="p-1 text-gray-400 hover:text-transparent bg-clip-text bg-gradient-to-r from-brand to-brand-dark disabled:opacity-30"
                                                            >
                                                                <ArrowDown size={16} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Banner Management for Banner Carousel and Stacked Banners */}
                        {['banner-carousel', 'stacked-banners'].includes(editingSection.type) && (
                            <div className="space-y-4 border-t border-gray-100 pt-4">
                                <div className="flex justify-between items-center">
                                    <h4 className="font-semibold">Banners desta seção</h4>
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
                                    <h4 className="font-semibold">Ícones e Textos</h4>
                                    <Button size="sm" onClick={addBenefitToSection}>
                                        <Plus size={16} className="mr-1" /> Adicionar Item
                                    </Button>
                                </div>

                                <div className="space-y-2">
                                    {editingSection.benefits?.map(benefit => (
                                        <div key={benefit.id} className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-200">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 flex items-center justify-center bg-white rounded border border-gray-200 text-transparent bg-clip-text bg-gradient-to-r from-brand to-brand-dark">
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

                        {/* Blog Selection UI */}
                        {editingSection.type === 'blog-preview' && (
                            <div className="space-y-4 pt-2 border-t border-gray-100">
                                <div>
                                    <label className="text-sm font-medium mb-2 block">Selecionar Artigos</label>
                                    <p className="text-xs text-gray-500 mb-2">Marque os artigos que deseja exibir na home (máximo 3 recomendados).</p>

                                    <div className="border border-border rounded-xl max-h-60 overflow-y-auto bg-gray-50 p-2 space-y-1">
                                        {blogPosts.length === 0 ? (
                                            <p className="text-xs text-gray-400 text-center py-2">Carregando artigos...</p>
                                        ) : (
                                            blogPosts.map(post => {
                                                const isSelected = editingSection.settings?.postIds?.includes(post.id);
                                                return (
                                                    <div
                                                        key={post.id}
                                                        onClick={() => {
                                                            const currentIds = editingSection.settings?.postIds || [];
                                                            const newIds = isSelected
                                                                ? currentIds.filter(id => id !== post.id)
                                                                : [...currentIds, post.id];

                                                            setEditingSection({
                                                                ...editingSection,
                                                                settings: {
                                                                    ...editingSection.settings,
                                                                    postIds: newIds
                                                                }
                                                            });
                                                        }}
                                                        className={`flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-all border ${isSelected ? 'bg-gradient-to-r from-brand to-brand-dark/5 border-brand' : 'hover:bg-gray-50 border-transparent'}`}
                                                    >
                                                        <div className={`w-5 h-5 rounded border flex-shrink-0 flex items-center justify-center transition-colors ${isSelected ? 'bg-gradient-to-r from-brand to-brand-dark border-brand' : 'border-gray-300 bg-white'}`}>
                                                            {isSelected && <div className="w-2.5 h-2.5 bg-white rounded-xl" />}
                                                        </div>

                                                        <div className="relative w-10 h-10 rounded overflow-hidden flex-shrink-0 border border-gray-100 bg-gray-200">
                                                            {post.cover_image ? (
                                                                <img src={post.cover_image} className="w-full h-full object-cover" alt={post.title} />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center"><Layout size={12} className="text-gray-400" /></div>
                                                            )}
                                                        </div>

                                                        <div className="flex-1 min-w-0">
                                                            <p className={`text-sm font-medium truncate ${isSelected ? 'text-transparent bg-clip-text bg-gradient-to-r from-brand to-brand-dark-dark' : 'text-gray-900'}`}>{post.title}</p>
                                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                                <span className={post.published ? 'text-green-600' : 'text-yellow-600'}>{post.published ? 'Publicado' : 'Rascunho'}</span>
                                                                <span>•</span>
                                                                <span>{new Date(post.created_at).toLocaleDateString()}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                    <p className="text-xs text-right text-gray-500 mt-1">
                                        {editingSection.settings?.postIds?.length || 0} selecionados
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Combos Management */}
                        {editingSection.type === 'combos' && (
                            <div className="space-y-4 border-t border-gray-100 pt-4">
                                <div className="flex justify-between items-center">
                                    <h4 className="font-semibold">Combos desta seção</h4>
                                    <Button size="sm" onClick={addComboToSection}>
                                        <Plus size={16} className="mr-1" /> Adicionar Combo
                                    </Button>
                                </div>

                                <div className="space-y-2">
                                    {editingSection.combos?.map(combo => (
                                        <div key={combo.id} className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-200">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 bg-white rounded border border-gray-200 overflow-hidden flex-shrink-0 relative">
                                                    {combo.image ? (
                                                        <img src={combo.image} className="w-full h-full object-cover" alt={combo.title} />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-xs text-gray-300 font-bold bg-gray-50">V</div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-sm text-gray-800">{combo.title}</p>
                                                    {combo.subtitle && <p className="text-xs text-gray-400 italic leading-none">{combo.subtitle}</p>}
                                                    <p className="text-xs text-brand font-semibold mt-1">R$ {combo.price.toFixed(2).replace('.', ',')} • {combo.items?.length || 0} itens</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-1">
                                                <Button size="sm" variant="ghost" onClick={() => setEditingCombo({ ...combo, originalPrice: combo.originalPrice ?? combo.original_price })}>
                                                    <Edit size={14} />
                                                </Button>
                                                <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-600" onClick={() => removeComboFromSection(combo.id)}>
                                                    <Trash2 size={14} />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                    {(!editingSection.combos || editingSection.combos.length === 0) && (
                                        <div className="text-center py-4 text-gray-500 text-sm">
                                            Nenhum combo adicionado.
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
                        <div className="bg-white rounded-xl p-6 w-full max-w-md space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-xl font-semibold">Editar Item</h3>
                                <button onClick={() => setEditingBenefit(null)}><X size={20} /></button>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Ícone</label>
                                <select
                                    className="w-full p-2 border border-border rounded-xl bg-white"
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
                                    <option value="package">Pacote</option>
                                    <option value="zap">Raio</option>
                                    <option value="award">Prêmio</option>
                                    <option value="gift">Presente</option>
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

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Link (opcional)</label>
                                <Input
                                    value={editingBenefit.link || ''}
                                    onChange={e => setEditingBenefit({ ...editingBenefit, link: e.target.value })}
                                    placeholder="Ex: /cupons"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Texto do Link (opcional)</label>
                                <Input
                                    value={editingBenefit.linkText || ''}
                                    onChange={e => setEditingBenefit({ ...editingBenefit, linkText: e.target.value })}
                                    placeholder="Ex: Confira"
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
                        <div className="bg-white rounded-xl p-6 w-full max-w-md space-y-4 max-h-[90vh] overflow-y-auto">
                            <h3 className="text-xl font-semibold">Banner</h3>

                            <div className="space-y-4">
                                {/* Desktop Image */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Imagem Desktop (Principal)</label>
                                    <Input type="file" accept="image/*" onChange={handleBannerUpload} disabled={uploading} />
                                    {uploading && <p className="text-xs text-transparent bg-clip-text bg-gradient-to-r from-brand to-brand-dark">Carregando...</p>}

                                    {editingBanner.imageUrl && (
                                        <div className="mt-2 rounded-xl overflow-hidden border border-gray-200 bg-gray-100 max-h-40">
                                            <img src={editingBanner.imageUrl} alt="Preview Desktop" className="w-full h-full object-contain" />
                                        </div>
                                    )}

                                    <div className="mt-1">
                                        <p className="text-xs text-gray-500 mb-1">Ou URL externa:</p>
                                        <Input
                                            value={editingBanner.imageUrl || ''}
                                            onChange={e => setEditingBanner({ ...editingBanner, imageUrl: e.target.value })}
                                            placeholder="https://..."
                                        />
                                    </div>
                                </div>

                                {/* Mobile Image */}
                                <div className="space-y-2 border-t border-gray-100 pt-4">
                                    <label className="text-sm font-medium">Imagem Mobile (Opcional)</label>
                                    <p className="text-xs text-gray-500">Se não informada, a imagem desktop será usada.</p>
                                    <Input type="file" accept="image/*" onChange={handleMobileBannerUpload} disabled={uploadingMobile} />
                                    {uploadingMobile && <p className="text-xs text-transparent bg-clip-text bg-gradient-to-r from-brand to-brand-dark">Carregando...</p>}

                                    {editingBanner.mobileImageUrl && (
                                        <div className="mt-2 rounded-xl overflow-hidden border border-gray-200 bg-gray-100 max-h-40">
                                            <img src={editingBanner.mobileImageUrl} alt="Preview Mobile" className="w-full h-full object-contain" />
                                        </div>
                                    )}

                                    <div className="mt-1">
                                        <p className="text-xs text-gray-500 mb-1">Ou URL externa:</p>
                                        <Input
                                            value={editingBanner.mobileImageUrl || ''}
                                            onChange={e => setEditingBanner({ ...editingBanner, mobileImageUrl: e.target.value })}
                                            placeholder="https://..."
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2 border-t border-gray-100 pt-4">
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

            {/* Combo Add/Edit Modal (Nested) */}
            {
                editingCombo && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-xl p-6 w-full max-w-md space-y-4 max-h-[90vh] overflow-y-auto">
                            <h3 className="text-xl font-semibold">Editar Combo</h3>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Nome do Combo</label>
                                <Input
                                    value={editingCombo.title}
                                    onChange={e => setEditingCombo({ ...editingCombo, title: e.target.value })}
                                    placeholder="Ex: Delivery Inicial"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Subtítulo / Descrição Curta</label>
                                <Input
                                    value={editingCombo.subtitle || ''}
                                    onChange={e => setEditingCombo({ ...editingCombo, subtitle: e.target.value })}
                                    placeholder="Ex: O essencial para começar com o pé direito"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Valor do Combo (Por) (R$)</label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    value={editingCombo.price}
                                    onChange={e => setEditingCombo({ ...editingCombo, price: parseFloat(e.target.value) || 0 })}
                                    placeholder="Ex: 199.90"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Valor Riscado (De) (R$ - Opcional)</label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    value={editingCombo.originalPrice || ''}
                                    onChange={e => setEditingCombo({ ...editingCombo, originalPrice: parseFloat(e.target.value) || undefined })}
                                    placeholder="Ex: 269.90"
                                />
                            </div>

                            {/* Imagem de Capa e Galeria de Fotos */}
                            <div className="space-y-4 pt-2 border-t border-gray-100">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Imagem de Capa (3:4)</label>
                                    <Input type="file" accept="image/*" onChange={handleComboImageUpload} disabled={uploadingComboImage} />
                                    {uploadingComboImage && <p className="text-xs text-brand animate-pulse">Carregando imagem...</p>}

                                    {editingCombo.image && (
                                        <div className="mt-2 rounded-xl overflow-hidden border border-gray-250 bg-gray-50 h-32 flex items-center justify-center relative">
                                            <img src={editingCombo.image} alt="Preview Capa" className="w-full h-full object-contain" />
                                        </div>
                                    )}

                                    <div className="mt-1">
                                        <p className="text-xs text-gray-400 mb-1">Ou URL externa:</p>
                                        <Input
                                            value={editingCombo.image || ''}
                                            onChange={e => setEditingCombo({ ...editingCombo, image: e.target.value })}
                                            placeholder="https://..."
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2 pt-2 border-t border-gray-100">
                                    <label className="text-sm font-medium block">Galeria de Fotos do Produto (4:3)</label>
                                    <div className="flex gap-2">
                                        <Input
                                            className="flex-1"
                                            placeholder="URL da foto do produto..."
                                            value={tempComboImage}
                                            onChange={(e) => setTempComboImage(e.target.value)}
                                        />
                                        <Button
                                            type="button"
                                            onClick={() => {
                                                if (tempComboImage.trim()) {
                                                    setEditingCombo({
                                                        ...editingCombo,
                                                        images: [...(editingCombo.images || []), tempComboImage.trim()]
                                                    });
                                                    setTempComboImage("");
                                                }
                                            }}
                                            className="bg-brand text-white hover:bg-brand-dark"
                                        >
                                            <Plus size={16} />
                                        </Button>
                                    </div>
                                    <div className="mt-1">
                                        <Input
                                            type="file"
                                            accept="image/*"
                                            onChange={async (e) => {
                                                const file = e.target.files?.[0];
                                                if (!file) return;
                                                const fData = new FormData();
                                                fData.append('file', file);
                                                const url = await uploadImage(fData);
                                                if (url) {
                                                    setEditingCombo({
                                                        ...editingCombo,
                                                        images: [...(editingCombo.images || []), url]
                                                    });
                                                }
                                            }}
                                        />
                                    </div>
                                    <div className="grid grid-cols-4 gap-2 mt-2">
                                        {editingCombo.images?.map((img: string, idx: number) => (
                                            <div key={idx} className="relative aspect-[4/3] rounded-lg overflow-hidden border border-gray-250 bg-gray-50">
                                                <img src={img} className="w-full h-full object-cover" alt="" />
                                                <button
                                                    type="button"
                                                    onClick={() => setEditingCombo({
                                                        ...editingCombo,
                                                        images: editingCombo.images.filter((_: any, i: number) => i !== idx)
                                                    })}
                                                    className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-1 hover:bg-red-650 transition-colors"
                                                >
                                                    <X size={10} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 pt-2 border-t border-gray-100">
                                <label className="text-sm font-medium block">Itens do Combo</label>
                                
                                <div className="space-y-2 relative">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Catálogo de Produtos</span>
                                    
                                    {/* Custom Dropdown Button */}
                                    <button
                                        type="button"
                                        onClick={() => setIsProductDropdownOpen(!isProductDropdownOpen)}
                                        className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-emerald-500 bg-white hover:bg-gray-50/50 transition-all text-left focus:outline-none focus:ring-2 focus:ring-emerald-500/10 cursor-pointer shadow-xs"
                                    >
                                        <div className="flex items-center gap-3">
                                            {selectedProductId ? (() => {
                                                const p = products.find(prod => prod.id === selectedProductId);
                                                const prodImg = p?.image || (p?.images && p.images[0]) || "";
                                                return (
                                                    <>
                                                        {prodImg ? (
                                                            <img src={prodImg} className="w-6 h-6 rounded-md object-cover bg-gray-50 border border-gray-150 shrink-0" alt={p?.title} />
                                                        ) : (
                                                            <div className="w-6 h-6 rounded-md bg-gray-50 border border-gray-150 flex items-center justify-center shrink-0 text-gray-400">
                                                                <ImageIcon size={12} />
                                                            </div>
                                                        )}
                                                        <span className="text-xs font-semibold text-gray-700">{p?.title}</span>
                                                    </>
                                                );
                                            })() : (
                                                <span className="text-xs text-gray-400 font-medium">Selecione um Produto...</span>
                                            )}
                                        </div>
                                        <ChevronDown size={16} className={cn("text-gray-400 transition-transform duration-200", isProductDropdownOpen && "rotate-180")} />
                                    </button>

                                    {/* Floating Dropdown List */}
                                    {isProductDropdownOpen && (
                                        <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-gray-150 rounded-xl shadow-lg py-1.5 z-50 max-h-60 overflow-y-auto no-scrollbar animate-in fade-in slide-in-from-top-1 duration-150">
                                            {products.length === 0 ? (
                                                <div className="px-4 py-3 text-xs text-gray-400 text-center italic">Nenhum produto cadastrado</div>
                                            ) : (
                                                products.map(p => {
                                                    const isSelected = selectedProductId === p.id;
                                                    const prodImg = p.image || (p.images && p.images[0]) || "";
                                                    return (
                                                        <button
                                                            key={p.id}
                                                            type="button"
                                                            onClick={() => {
                                                                setSelectedProductId(p.id);
                                                                setIsProductDropdownOpen(false);
                                                            }}
                                                            className={cn(
                                                                "flex items-center gap-3 w-full px-4 py-2 hover:bg-gray-50 text-left transition-colors cursor-pointer",
                                                                isSelected && "bg-emerald-50/50"
                                                            )}
                                                        >
                                                            {prodImg ? (
                                                                <img src={prodImg} className="w-8 h-8 rounded-lg object-cover bg-gray-50 border border-gray-200 shrink-0" alt={p.title} />
                                                            ) : (
                                                                <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center shrink-0 text-gray-400">
                                                                    <ImageIcon size={14} />
                                                                </div>
                                                            )}
                                                            <div className="flex-1 min-w-0">
                                                                <p className={cn("text-xs font-semibold truncate", isSelected ? "text-emerald-600" : "text-gray-700")}>{p.title}</p>
                                                            </div>
                                                            {isSelected && <Check size={14} className="text-emerald-500 shrink-0" strokeWidth={3} />}
                                                        </button>
                                                    );
                                                })
                                            )}
                                        </div>
                                    )}
                                </div>

                                {selectedProductId && (() => {
                                    const product = products.find(p => p.id === selectedProductId);
                                    if (!product) return null;
                                    
                                    const filteredVariations = product.variations?.filter(v => 
                                        !v.name.toLowerCase().includes("impressão") && 
                                        !v.name.toLowerCase().includes("lado") && 
                                        !v.name.toLowerCase().includes("cor") && 
                                        !v.name.toLowerCase().includes("modelo") && 
                                        !v.name.toLowerCase().includes("template")
                                    ) || [];

                                    return (
                                        <div className="bg-white border border-gray-200 rounded-xl p-4 mt-3 space-y-4 animate-in fade-in duration-300 shadow-xs">
                                            <div className="flex items-center gap-3">
                                                <div className="w-1.5 h-4 bg-brand rounded-full"></div>
                                                <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Configurar {product.title}</h4>
                                            </div>
                                            
                                            <div className="grid grid-cols-2 gap-3">
                                                {/* Tiragem */}
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Quantidade / Tiragem</label>
                                                    {product.quantities && product.quantities.length > 0 ? (
                                                        <select
                                                            value={selectedProductQtyString}
                                                            onChange={e => setSelectedProductQtyString(e.target.value)}
                                                            className="w-full h-8 px-2 rounded-lg border border-gray-200 bg-white text-xs font-medium text-gray-700 focus:outline-none focus:border-brand"
                                                        >
                                                            {product.quantities.map(qty => (
                                                                <option key={qty} value={qty}>{qty}</option>
                                                            ))}
                                                        </select>
                                                    ) : (
                                                        <div className="text-xs text-red-500 italic py-1">Sem tiragem cadastrada</div>
                                                    )}
                                                </div>

                                                {/* Formato */}
                                                {product.formats && product.formats.length > 0 && (
                                                    <div className="space-y-1">
                                                        <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Formato</label>
                                                        <select
                                                            value={selectedProductFormat}
                                                            onChange={e => setSelectedProductFormat(e.target.value)}
                                                            className="w-full h-8 px-2 rounded-lg border border-gray-200 bg-white text-xs font-medium text-gray-700 focus:outline-none focus:border-brand"
                                                        >
                                                            {product.formats.map(f => (
                                                                <option key={f} value={f}>{f}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                )}

                                                {/* Acabamento */}
                                                {product.finishes && product.finishes.length > 0 && (
                                                    <div className="space-y-1">
                                                        <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Acabamento</label>
                                                        <select
                                                            value={selectedProductFinish}
                                                            onChange={e => setSelectedProductFinish(e.target.value)}
                                                            className="w-full h-8 px-2 rounded-lg border border-gray-200 bg-white text-xs font-medium text-gray-700 focus:outline-none focus:border-brand"
                                                        >
                                                            {product.finishes.map(f => (
                                                                <option key={f} value={f}>{f}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                )}

                                                {/* Extras */}
                                                {product.extras && product.extras.length > 0 && (
                                                    <div className="space-y-1">
                                                        <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Extras</label>
                                                        <select
                                                            value={selectedProductExtra}
                                                            onChange={e => setSelectedProductExtra(e.target.value)}
                                                            className="w-full h-8 px-2 rounded-lg border border-gray-200 bg-white text-xs font-medium text-gray-700 focus:outline-none focus:border-brand"
                                                        >
                                                            {product.extras.map(e => (
                                                                <option key={e} value={e}>{e}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                )}

                                                {/* Outras Variações */}
                                                {filteredVariations.map(v => {
                                                    const currentVal = selectedProductVariations[v.name] || v.options?.[0] || "";
                                                    return (
                                                        <div key={v.name} className="space-y-1">
                                                            <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{v.name}</label>
                                                            <select
                                                                value={currentVal}
                                                                onChange={e => {
                                                                    const val = e.target.value;
                                                                    setSelectedProductVariations(prev => ({
                                                                        ...prev,
                                                                        [v.name]: val
                                                                    }));
                                                                }}
                                                                className="w-full h-8 px-2 rounded-lg border border-gray-200 bg-white text-xs font-medium text-gray-700 focus:outline-none focus:border-brand"
                                                            >
                                                                {v.options?.map(opt => (
                                                                    <option key={opt} value={opt}>{opt}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            <Button
                                                type="button"
                                                onClick={() => {
                                                    if (product.quantities && product.quantities.length > 0) {
                                                        const qtyMatch = selectedProductQtyString.match(/\d+/);
                                                        const extractedQty = qtyMatch ? parseInt(qtyMatch[0]) : 1000;
                                                        
                                                        let details: string[] = [];
                                                        if (selectedProductFormat) details.push(`Formato: ${selectedProductFormat}`);
                                                        if (selectedProductFinish) details.push(`Acabamento: ${selectedProductFinish}`);
                                                        if (selectedProductExtra) details.push(`Extras: ${selectedProductExtra}`);

                                                        Object.entries(selectedProductVariations).forEach(([name, val]) => {
                                                            if (val) {
                                                                details.push(`${name}: ${val}`);
                                                            }
                                                        });

                                                        const detailsStr = details.length > 0 ? ` (${details.join(", ")})` : "";
                                                        const formattedItemText = `${extractedQty} ${product.title}${detailsStr}`;
                                                        
                                                        setEditingCombo({
                                                            ...editingCombo,
                                                            items: [...(editingCombo.items || []), formattedItemText]
                                                        });
                                                        setSelectedProductId("");
                                                    } else {
                                                        alert("Por favor, selecione um produto com tiragem cadastrada.");
                                                    }
                                                }}
                                                className="w-full bg-brand text-white hover:bg-brand-dark h-10 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-brand/10 transition-all mt-2"
                                            >
                                                + Adicionar Item ao Combo
                                            </Button>
                                        </div>
                                    );
                                })()}
                                
                                <div className="space-y-1 max-h-40 overflow-y-auto pt-2">
                                    {editingCombo.items?.map((item: string, idx: number) => (
                                        <div key={idx} className="flex justify-between items-center bg-gray-50 px-3 py-1.5 rounded border border-gray-200 text-xs">
                                            <span className="text-gray-700 font-medium truncate flex-1 pr-2">{item}</span>
                                            <button
                                                type="button"
                                                onClick={() => setEditingCombo({
                                                    ...editingCombo,
                                                    items: editingCombo.items.filter((_: any, i: number) => i !== idx)
                                                })}
                                                className="text-red-500 hover:text-red-600 font-semibold shrink-0"
                                            >
                                                Remover
                                            </button>
                                        </div>
                                    ))}
                                    {(!editingCombo.items || editingCombo.items.length === 0) && (
                                        <p className="text-xs text-gray-400 italic text-center py-2">Sem itens adicionados.</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                                <Button variant="outline" onClick={() => setEditingCombo(null)}>Cancelar</Button>
                                <Button onClick={saveCombo} disabled={!editingCombo.title}>Salvar Combo</Button>
                            </div>
                        </div>
                    </div>
                )
            }

        </Container >
    );
}
