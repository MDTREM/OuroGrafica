'use client';

import { useState, useEffect } from 'react';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { getHomepageConfig, saveHomepageConfig, uploadImage, HomepageConfig, Section, ComboItem } from '@/actions/homepage-actions';
import { Trash2, Plus, Edit, X, Save, ArrowLeft, Check, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';

export default function AdminCombosPage() {
    const [config, setConfig] = useState<HomepageConfig | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Combos Specific States
    const [editingCombo, setEditingCombo] = useState<any | null>(null);
    const [newComboItemText, setNewComboItemText] = useState("");
    const [uploadingComboImage, setUploadingComboImage] = useState(false);
    const [newVarName, setNewVarName] = useState("");
    const [newVarOptions, setNewVarOptions] = useState("");

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
            items: [],
            variations: []
        });
        setNewVarName("");
        setNewVarOptions("");
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

                            {/* Variations Preview */}
                            {combo.variations && combo.variations.length > 0 && (
                                <div className="space-y-1.5 pt-2 border-t border-gray-100">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Variações</span>
                                    <div className="flex flex-wrap gap-2">
                                        {combo.variations.map((v, idx) => (
                                            <div key={idx} className="bg-gray-50 border border-gray-200 px-2 py-1 rounded text-[10px] flex flex-col gap-0.5">
                                                <span className="font-bold text-gray-500 uppercase text-[8px]">{v.name}</span>
                                                <span className="text-gray-700 truncate max-w-[140px] font-medium">{v.options.join(', ')}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
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

                            {/* Imagem */}
                            <div className="space-y-2 pt-2 border-t border-gray-100">
                                <label className="text-xs font-semibold text-gray-500 uppercase block">Imagem do Combo</label>
                                <Input type="file" accept="image/*" onChange={handleComboImageUpload} disabled={uploadingComboImage} />
                                {uploadingComboImage && <p className="text-xs text-brand animate-pulse">Fazendo upload da imagem...</p>}

                                {editingCombo.image && (
                                    <div className="mt-2 rounded-lg overflow-hidden border border-gray-250 bg-gray-50 h-32 flex items-center justify-center relative">
                                        <img src={editingCombo.image} alt="Preview Combo" className="w-full h-full object-contain" />
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

                            {/* Itens */}
                            <div className="space-y-2 pt-2 border-t border-gray-100">
                                <label className="text-xs font-semibold text-gray-500 uppercase block">Itens do Combo</label>
                                <div className="flex gap-2">
                                    <Input
                                        value={newComboItemText}
                                        onChange={e => setNewComboItemText(e.target.value)}
                                        placeholder="Ex: 1000 Cartões de Visita"
                                        onKeyDown={e => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                if (newComboItemText.trim()) {
                                                    setEditingCombo({
                                                        ...editingCombo,
                                                        items: [...(editingCombo.items || []), newComboItemText.trim()]
                                                    });
                                                    setNewComboItemText("");
                                                }
                                            }
                                        }}
                                    />
                                    <Button
                                        type="button"
                                        onClick={() => {
                                            if (newComboItemText.trim()) {
                                                setEditingCombo({
                                                    ...editingCombo,
                                                    items: [...(editingCombo.items || []), newComboItemText.trim()]
                                                });
                                                setNewComboItemText("");
                                            }
                                        }}
                                        className="bg-brand text-white hover:bg-brand-dark"
                                    >
                                        +
                                    </Button>
                                </div>
                                
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

                            {/* Variações */}
                            <div className="space-y-2 pt-2 border-t border-gray-100">
                                <label className="text-xs font-semibold text-gray-500 uppercase block">Variações do Combo (ex: Papel, Acabamento)</label>
                                
                                <div className="space-y-2 bg-gray-50 p-3 rounded-lg border border-gray-200">
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-bold text-gray-400 uppercase">Nome</label>
                                            <Input
                                                value={newVarName}
                                                onChange={e => setNewVarName(e.target.value)}
                                                placeholder="Ex: Papel"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-bold text-gray-400 uppercase">Opções (por vírgula)</label>
                                            <Input
                                                value={newVarOptions}
                                                onChange={e => setNewVarOptions(e.target.value)}
                                                placeholder="Couchê 300g, Reciclato 240g"
                                            />
                                        </div>
                                    </div>
                                    <Button
                                        type="button"
                                        size="sm"
                                        className="w-full mt-1 bg-brand text-white hover:bg-brand-dark"
                                        onClick={() => {
                                            if (newVarName.trim() && newVarOptions.trim()) {
                                                const optionsArray = newVarOptions
                                                    .split(",")
                                                    .map(opt => opt.trim())
                                                    .filter(Boolean);
                                                
                                                if (optionsArray.length > 0) {
                                                    setEditingCombo({
                                                        ...editingCombo,
                                                        variations: [
                                                            ...(editingCombo.variations || []),
                                                            { name: newVarName.trim(), options: optionsArray }
                                                        ]
                                                    });
                                                    setNewVarName("");
                                                    setNewVarOptions("");
                                                }
                                            }
                                        }}
                                    >
                                        + Adicionar Variação
                                    </Button>
                                </div>

                                <div className="space-y-2 max-h-36 overflow-y-auto pt-1">
                                    {editingCombo.variations?.map((v: any, idx: number) => (
                                        <div key={idx} className="bg-white p-2.5 rounded border border-gray-200 text-xs space-y-1.5 shadow-sm">
                                            <div className="flex justify-between items-center">
                                                <span className="font-semibold text-gray-800">{v.name}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => setEditingCombo({
                                                        ...editingCombo,
                                                        variations: editingCombo.variations.filter((_: any, i: number) => i !== idx)
                                                    })}
                                                    className="text-red-500 hover:text-red-600 font-semibold text-[11px]"
                                                >
                                                    Remover
                                                </button>
                                            </div>
                                            <div className="flex flex-wrap gap-1">
                                                {v.options.map((opt: string, optIdx: number) => (
                                                    <span key={optIdx} className="bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded text-[10px] font-medium border border-gray-200">
                                                        {opt}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                    {(!editingCombo.variations || editingCombo.variations.length === 0) && (
                                        <p className="text-xs text-gray-400 italic text-center py-2">Sem variações adicionadas.</p>
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
