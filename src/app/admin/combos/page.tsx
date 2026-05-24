'use client';

import { useState, useEffect } from 'react';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { getHomepageConfig, saveHomepageConfig, uploadImage, HomepageConfig, Section, ComboItem } from '@/actions/homepage-actions';
import { Trash2, Plus, Edit, X, Save, ArrowLeft, Check, Image as ImageIcon, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useAdmin } from '@/contexts/AdminContext';
import { cn } from '@/lib/utils';

export default function AdminCombosPage() {
    const { products } = useAdmin();
    const [config, setConfig] = useState<HomepageConfig | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Combos Specific States
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

    useEffect(() => {
        loadConfig();
    }, []);

    async function loadConfig() {
        setLoading(true);
        const configData = await getHomepageConfig();
        setConfig(configData);
        setLoading(false);
    }

    async function handleSave(updatedConfig: HomepageConfig) {
        setSaving(true);
        const success = await saveHomepageConfig(updatedConfig);
        setSaving(false);
        if (success) {
            alert('Combos salvos com sucesso!');
        } else {
            alert('Erro ao salvar alterações.');
        }
    }

    // Find the combos section or return null
    function getCombosSection(currentConfig: HomepageConfig | null): Section | null {
        if (!currentConfig) return null;
        return currentConfig.sections.find(s => s.type === 'combos') || null;
    }

    // Initialize or update the combos list in the config
    function updateCombosInConfig(newCombos: ComboItem[]) {
        if (!config) return;
        
        let combosSection = getCombosSection(config);
        let updatedSections = [...config.sections];

        if (!combosSection) {
            // Create a new default combos section if it does not exist
            const newSection: Section = {
                id: 'combos-' + Date.now(),
                type: 'combos',
                name: 'Combos Especiais',
                title: 'Combos Especiais',
                enabled: true,
                combos: newCombos
            };
            updatedSections.push(newSection);
        } else {
            // Update the existing combos section
            updatedSections = config.sections.map(s => {
                if (s.type === 'combos') {
                    return { ...s, combos: newCombos };
                }
                return s;
            });
        }

        const updatedConfig = { ...config, sections: updatedSections };
        setConfig(updatedConfig);
        handleSave(updatedConfig); // Auto-save for ease of use
    }

    function addCombo() {
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
    }

    function deleteCombo(comboId: string) {
        if (!confirm('Deseja realmente excluir este combo?')) return;
        const combosSection = getCombosSection(config);
        if (!combosSection) return;

        const currentCombos = combosSection.combos || [];
        const newCombos = currentCombos.filter(c => c.id !== comboId);
        updateCombosInConfig(newCombos);
    }

    async function handleComboImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingComboImage(true);
        const formData = new FormData();
        formData.append('file', file);

        const path = await uploadImage(formData, 'products'); // using products bucket
        setUploadingComboImage(false);

        if (path) {
            setEditingCombo((prev: any) => prev ? { ...prev, image: path } : null);
        } else {
            alert('Erro ao fazer upload da imagem.');
        }
    }

    function saveCombo() {
        if (!editingCombo || !editingCombo.title) return;
        
        const combosSection = getCombosSection(config);
        const currentCombos = combosSection?.combos || [];
        
        const existingIndex = currentCombos.findIndex(c => c.id === editingCombo.id);
        let newCombos;

        if (existingIndex >= 0) {
            newCombos = [...currentCombos];
            newCombos[existingIndex] = editingCombo;
        } else {
            const newCombo = { ...editingCombo };
            if (!newCombo.id) newCombo.id = 'combo-' + Date.now();
            newCombos = [...currentCombos, newCombo];
        }

        updateCombosInConfig(newCombos);
        setEditingCombo(null);
    }

    const combosSection = getCombosSection(config);
    const combos = combosSection?.combos || [];

    if (loading) {
        return (
            <div className="min-h-[50vh] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Gerenciar Combos</h1>
                    <p className="text-sm text-gray-500">Configure os pacotes e combos especiais exibidos na página inicial.</p>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <Button onClick={addCombo} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-brand text-white hover:bg-brand-dark">
                        <Plus size={18} /> Adicionar Combo
                    </Button>
                </div>
            </div>

            {/* Combos Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {combos.map((combo) => (
                    <div key={combo.id} className="bg-white rounded-xl border border-gray-150 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow">
                        <div className="p-5 space-y-4">
                            <div className="flex gap-4">
                                {/* Image Preview */}
                                <div className="w-20 h-20 bg-gray-50 rounded-lg border border-gray-200 overflow-hidden flex-shrink-0 relative">
                                    {combo.image ? (
                                        <img src={combo.image} className="w-full h-full object-cover" alt={combo.title} />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                                            <ImageIcon size={20} />
                                            <span className="text-[8px] mt-1 font-semibold uppercase">Sem Foto</span>
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <h3 className="font-semibold text-gray-800 text-base">{combo.title}</h3>
                                    {combo.subtitle && <p className="text-xs text-gray-400 italic line-clamp-1">{combo.subtitle}</p>}
                                    <div className="flex items-baseline gap-2 pt-1">
                                        <span className="text-sm font-bold text-brand">R$ {combo.price.toFixed(2).replace('.', ',')}</span>
                                        {combo.originalPrice && (
                                            <span className="text-xs text-gray-400 line-through">R$ {combo.originalPrice.toFixed(2).replace('.', ',')}</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Bullet Points */}
                            <div className="space-y-1.5">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Itens Inclusos</span>
                                <ul className="grid grid-cols-1 gap-1">
                                    {combo.items.map((item, idx) => (
                                        <li key={idx} className="flex items-start gap-1.5 text-xs text-gray-600">
                                            <Check size={12} className="text-brand shrink-0 mt-0.5" strokeWidth={3} />
                                            <span className="truncate">{item}</span>
                                        </li>
                                    ))}
                                    {(!combo.items || combo.items.length === 0) && (
                                        <span className="text-xs text-gray-400 italic">Nenhum item adicionado.</span>
                                    )}
                                </ul>
                            </div>

                            {/* Variations Preview Removed */}
                        </div>

                        {/* Card Actions */}
                        <div className="bg-gray-50/50 px-5 py-3 border-t border-gray-150 flex justify-end gap-2">
                            <Button size="sm" variant="outline" onClick={() => setEditingCombo(combo)} className="flex items-center gap-1">
                                <Edit size={14} /> Editar
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => deleteCombo(combo.id)} className="text-red-500 hover:text-red-600 hover:bg-red-50 border-gray-200 flex items-center gap-1">
                                <Trash2 size={14} /> Excluir
                            </Button>
                        </div>
                    </div>
                ))}

                {combos.length === 0 && (
                    <div className="col-span-2 bg-white rounded-xl border border-gray-150 p-12 text-center space-y-4">
                        <ImageIcon className="mx-auto text-gray-300" size={48} />
                        <div>
                            <h3 className="font-semibold text-gray-800">Nenhum Combo Cadastrado</h3>
                            <p className="text-sm text-gray-400">Clique no botão superior para criar o seu primeiro combo.</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Nest Combo Editor Modal */}
            {editingCombo && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-lg space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl">
                        <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                            <h3 className="text-lg font-bold text-gray-800">
                                {editingCombo.title ? `Editar Combo: ${editingCombo.title}` : 'Adicionar Novo Combo'}
                            </h3>
                            <button onClick={() => setEditingCombo(null)} className="text-gray-400 hover:text-gray-600">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* Nome */}
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-500 uppercase">Nome do Combo</label>
                                <Input
                                    value={editingCombo.title}
                                    onChange={e => setEditingCombo({ ...editingCombo, title: e.target.value })}
                                    placeholder="Ex: Delivery Inicial"
                                />
                            </div>

                            {/* Descrição */}
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-500 uppercase">Subtítulo / Descrição Curta</label>
                                <Input
                                    value={editingCombo.subtitle || ''}
                                    onChange={e => setEditingCombo({ ...editingCombo, subtitle: e.target.value })}
                                    placeholder="Ex: O essencial para começar com o pé direito"
                                />
                            </div>

                            {/* Preços */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-gray-500 uppercase">Valor do Combo (Por) (R$)</label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={editingCombo.price || ''}
                                        onChange={e => setEditingCombo({ ...editingCombo, price: parseFloat(e.target.value) || 0 })}
                                        placeholder="Ex: 199.90"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-gray-500 uppercase">Valor Riscado (De) (R$ - Opcional)</label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={editingCombo.originalPrice || ''}
                                        onChange={e => setEditingCombo({ ...editingCombo, originalPrice: parseFloat(e.target.value) || undefined })}
                                        placeholder="Ex: 269.90"
                                    />
                                </div>
                            </div>

                            {/* Imagem de Capa e Galeria de Fotos */}
                            <div className="space-y-4 pt-2 border-t border-gray-100">
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-gray-500 uppercase block">Imagem de Capa (3:4)</label>
                                    <Input type="file" accept="image/*" onChange={handleComboImageUpload} disabled={uploadingComboImage} />
                                    {uploadingComboImage && <p className="text-xs text-brand animate-pulse">Fazendo upload da imagem...</p>}

                                    {editingCombo.image && (
                                        <div className="mt-2 rounded-lg overflow-hidden border border-gray-250 bg-gray-50 h-32 flex items-center justify-center relative">
                                            <img src={editingCombo.image} alt="Preview Capa" className="w-full h-full object-contain" />
                                        </div>
                                    )}

                                    <div className="mt-1">
                                        <p className="text-[10px] text-gray-400 mb-1">Ou insira uma URL de imagem externa:</p>
                                        <Input
                                            value={editingCombo.image || ''}
                                            onChange={e => setEditingCombo({ ...editingCombo, image: e.target.value })}
                                            placeholder="https://..."
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2 pt-2 border-t border-gray-100">
                                    <label className="text-xs font-semibold text-gray-500 uppercase block">Galeria de Fotos do Produto (4:3)</label>
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
                                                const url = await uploadImage(fData, 'products');
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

                            {/* Itens */}
                            <div className="space-y-4 pt-2 border-t border-gray-100">
                                <label className="text-xs font-semibold text-gray-500 uppercase block">Itens do Combo</label>
                                
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
                                
                                <div className="space-y-1 max-h-36 overflow-y-auto pt-1">
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
                                        <p className="text-xs text-gray-400 italic text-center py-2">Nenhum item adicionado.</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                            <Button variant="outline" onClick={() => setEditingCombo(null)}>Cancelar</Button>
                            <Button onClick={saveCombo} disabled={!editingCombo.title} className="bg-brand text-white hover:bg-brand-dark">
                                Salvar Alterações
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
