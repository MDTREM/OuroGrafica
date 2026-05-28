'use client';

import React, { useState, useEffect } from 'react';
import { useAdmin } from '@/contexts/AdminContext';
import { useAuth } from '@/contexts/AuthContext';
import { formatPrice } from '@/lib/utils';
import { 
    getPricingItems, 
    savePricingItem, 
    deletePricingItem, 
    PricingItem 
} from '@/actions/pricing-actions';
import { 
    Calculator, 
    Plus, 
    Trash2, 
    Download, 
    Sparkles, 
    Check, 
    AlertCircle, 
    Link as LinkIcon, 
    Search,
    ChevronDown,
    Save,
    ExternalLink
} from 'lucide-react';
import Link from 'next/link';

export default function PricingSpreadsheetPage() {
    const { products } = useAdmin();
    const { session } = useAuth();
    const token = session?.access_token;
    
    const [items, setItems] = useState<PricingItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCatalogProduct, setSelectedCatalogProduct] = useState<string>("");
    
    // Notification state
    const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    // Initial load
    useEffect(() => {
        const loadData = async () => {
            if (!token) return;
            setIsLoading(true);
            const res = await getPricingItems(token);
            
            if (res.success && res.data && res.data.length > 0) {
                setItems(res.data);
                localStorage.setItem('@Vink:pricing_items', JSON.stringify(res.data));
            } else if (res.success && res.data) {
                setItems([]);
                localStorage.setItem('@Vink:pricing_items', JSON.stringify([]));
            } else {
                // Fallback to localStorage
                const localData = localStorage.getItem('@Vink:pricing_items');
                if (localData) {
                    try {
                        setItems(JSON.parse(localData));
                    } catch (e) {
                        console.error("Failed to parse local pricing items");
                    }
                } else {
                    // Start with placeholder/sample rows
                    const defaultRows: PricingItem[] = [
                        {
                            id: '1',
                            product_name: 'Cartão de Visita Premium',
                            quantity: 1000,
                            type: 'Frente e Verso',
                            material: 'Couchê 300g',
                            finish: 'Verniz Localizado',
                            extras: 'Furo',
                            cost: 45.00,
                            markup: 2.2,
                            base_price: 150.00,
                            card_fee_percentage: 3.49,
                            shipping_cost: 25.00
                        },
                        {
                            id: '2',
                            product_name: 'Banner Roll-Up',
                            quantity: 1,
                            type: 'Só Frente',
                            material: 'Lona 440g',
                            finish: 'Bastão e Cordão',
                            extras: 'Nenhum',
                            cost: 60.00,
                            markup: 2.5,
                            base_price: 210.00,
                            card_fee_percentage: 3.49,
                            shipping_cost: 25.00
                        }
                    ];
                    setItems(defaultRows);
                    localStorage.setItem('@Vink:pricing_items', JSON.stringify(defaultRows));
                }
            }
            setIsLoading(false);
        };
        
        if (token) {
            loadData();
        } else {
            // Load local storage fallback while auth is loading for smoother initial render
            const localData = localStorage.getItem('@Vink:pricing_items');
            if (localData) {
                try {
                    setItems(JSON.parse(localData));
                } catch (e) {}
            }
            setIsLoading(false);
        }
    }, [token]);

    // Show temporary notifications
    const triggerNotification = (type: 'success' | 'error', message: string) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 3000);
    };

    // Calculate final sale price
    const calculateSalePrice = (item: PricingItem) => {
        const costFactor = item.cost * item.markup;
        const totalCostBeforeFee = costFactor + item.shipping_cost;
        const feePercentage = item.card_fee_percentage / 100;
        
        if (feePercentage >= 1) return 0;
        return totalCostBeforeFee / (1 - feePercentage);
    };

    // Calculate profit
    const calculateProfit = (item: PricingItem) => {
        const salePrice = calculateSalePrice(item);
        const cardFee = salePrice * (item.card_fee_percentage / 100);
        return salePrice - item.cost - item.shipping_cost - cardFee;
    };

    // Add a new row
    const addRow = async () => {
        let matchedProduct = null;
        if (selectedCatalogProduct) {
            matchedProduct = products.find(p => p.id === selectedCatalogProduct);
        }

        const newItem: PricingItem = {
            id: crypto.randomUUID(),
            product_id: matchedProduct?.id || undefined,
            product_name: matchedProduct?.title || "Novo Produto Planilha",
            quantity: matchedProduct?.minQuantity || 100,
            type: "Frente e Verso",
            material: matchedProduct?.technicalSpecs?.paper || "Papel Couchê",
            finish: matchedProduct?.finishes?.[0] || "Verniz",
            extras: "Nenhum",
            cost: matchedProduct?.price ? (matchedProduct.price * 0.4) : 20.00, // assume cost is 40% of standard price as default
            markup: 2.0,
            base_price: matchedProduct?.price || 50.00,
            card_fee_percentage: 3.49,
            shipping_cost: 25.00
        };

        const updatedItems = [newItem, ...items];
        setItems(updatedItems);
        localStorage.setItem('@Vink:pricing_items', JSON.stringify(updatedItems));

        // Async save to database
        try {
            const res = await savePricingItem(newItem, token);
            if (res.success && res.data) {
                // replace UUID with Supabase created item or keep local mapping
                setItems(prev => prev.map(p => p.id === newItem.id ? res.data! : p));
                triggerNotification('success', 'Produto adicionado e sincronizado com o banco!');
            } else {
                triggerNotification('success', 'Salvo localmente (rodando em modo fallback)');
            }
        } catch (e) {
            triggerNotification('success', 'Salvo localmente (offline)');
        }
        
        setSelectedCatalogProduct("");
    };

    // Delete a row
    const deleteRow = async (id: string) => {
        const updatedItems = items.filter(item => item.id !== id);
        setItems(updatedItems);
        localStorage.setItem('@Vink:pricing_items', JSON.stringify(updatedItems));

        try {
            const res = await deletePricingItem(id, token);
            if (res.success) {
                triggerNotification('success', 'Linha removida com sucesso!');
            } else {
                triggerNotification('success', 'Linha removida localmente');
            }
        } catch (e) {
            triggerNotification('success', 'Linha removida localmente (offline)');
        }
    };

    // Update cell value
    const updateCell = async (id: string, field: keyof PricingItem, val: any) => {
        let processedValue = val;
        
        // Convert numbers
        if (field === 'quantity') {
            processedValue = parseInt(val) || 0;
        } else if (['cost', 'markup', 'base_price', 'card_fee_percentage', 'shipping_cost'].includes(field)) {
            processedValue = parseFloat(String(val).replace(',', '.')) || 0;
        }

        const updatedItems = items.map(item => {
            if (item.id === id) {
                return { ...item, [field]: processedValue };
            }
            return item;
        });

        setItems(updatedItems);
        localStorage.setItem('@Vink:pricing_items', JSON.stringify(updatedItems));

        // Debounced or async single save
        const itemToSave = updatedItems.find(item => item.id === id);
        if (itemToSave) {
            setIsSaving(id);
            try {
                const res = await savePricingItem(itemToSave, token);
                if (res.success && res.data) {
                    // Update state with Supabase response
                    setItems(prev => prev.map(p => p.id === id ? res.data! : p));
                }
            } catch (e) {
                console.error("Offline save fallback active");
            }
            setIsSaving(null);
        }
    };

    // Export spreadsheet to CSV
    const exportToCSV = () => {
        const headers = [
            "Quantidade", 
            "Produto", 
            "Tipo", 
            "Material", 
            "Acabamento", 
            "Extras", 
            "Custo (R$)", 
            "Markup", 
            "Venda Calculada (R$)", 
            "Lucro (R$)", 
            "Preço Base Concorrente (R$)", 
            "Taxa Cartão (%)", 
            "Frete (R$)"
        ];
        
        const rows = items.map(item => [
            item.quantity,
            `"${item.product_name}"`,
            `"${item.type || ''}"`,
            `"${item.material || ''}"`,
            `"${item.finish || ''}"`,
            `"${item.extras || ''}"`,
            item.cost.toFixed(2),
            item.markup.toFixed(2),
            calculateSalePrice(item).toFixed(2),
            calculateProfit(item).toFixed(2),
            item.base_price.toFixed(2),
            item.card_fee_percentage.toFixed(2),
            item.shipping_cost.toFixed(2)
        ]);

        const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
            + [headers.join(";"), ...rows.map(e => e.join(";"))].join("\n");
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "precificacao_ourografica.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        triggerNotification('success', 'Planilha exportada com sucesso em formato CSV!');
    };

    const filteredItems = items.filter(item => 
        item.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.material && item.material.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="space-y-6 pb-24">
            {/* Notifications */}
            {notification && (
                <div className={`fixed top-4 right-4 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-xl border animate-in slide-in-from-top duration-300 ${
                    notification.type === 'success' 
                    ? 'bg-green-50 border-green-200 text-green-800' 
                    : 'bg-red-50 border-red-200 text-red-800'
                }`}>
                    {notification.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
                    <span className="text-xs font-semibold">{notification.message}</span>
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Calculator className="text-brand" size={28} />
                        Planilha de Precificação
                    </h1>
                    <p className="text-gray-500 text-sm">Gerencie custos, markups, taxas e lucros em tempo real.</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {/* Add Product from Catalog Select */}
                    <div className="relative flex items-center bg-white border border-gray-200 rounded-xl px-2 shadow-sm h-11">
                        <LinkIcon size={14} className="text-gray-400 ml-1 mr-2" />
                        <select
                            className="bg-transparent border-none outline-none text-xs text-gray-700 font-medium pr-8 cursor-pointer focus:ring-0"
                            value={selectedCatalogProduct}
                            onChange={(e) => setSelectedCatalogProduct(e.target.value)}
                        >
                            <option value="">Produto do Catálogo...</option>
                            {products.map(p => (
                                <option key={p.id} value={p.id}>{p.title}</option>
                            ))}
                        </select>
                    </div>

                    <button
                        onClick={addRow}
                        className="bg-brand hover:bg-brand-dark text-white font-bold text-xs px-4 h-11 rounded-xl shadow-md shadow-brand/20 transition-all flex items-center gap-2"
                    >
                        <Plus size={16} /> Nova Linha
                    </button>

                    <button
                        onClick={exportToCSV}
                        className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold text-xs px-4 h-11 rounded-xl shadow-sm transition-all flex items-center gap-2"
                    >
                        <Download size={16} /> Exportar CSV
                    </button>
                </div>
            </div>

            {/* Explanatory Info Card */}
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex gap-3 items-start">
                    <div className="bg-brand/10 p-2.5 rounded-lg text-brand shrink-0">
                        <Sparkles size={20} />
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wide">Fórmula de Margem Comercial Sincronizada</h4>
                        <p className="text-xs text-gray-500 leading-relaxed max-w-2xl mt-1">
                            Calculamos a venda com: <strong className="text-gray-700">((Custo × Markup) + Frete) ÷ (1 - Taxa Cartão)</strong>. 
                            Isso repassa perfeitamente a taxa de cartão de <strong>3,49%</strong> sobre o valor final e o custo do frete padrão (<strong>R$ 25</strong>), blindando o seu lucro líquido!
                        </p>
                    </div>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="relative w-full sm:max-w-xs">
                    <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar por nome ou material..."
                        className="pl-10 w-full rounded-xl border-gray-250 text-xs focus:border-brand focus:ring-brand h-10 px-3 border border-gray-200"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <span className="text-xs font-semibold text-gray-500 shrink-0">
                    Mostrando {filteredItems.length} de {items.length} itens cadastrados
                </span>
            </div>

            {/* Spreadsheet Table Container */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left text-xs border-collapse">
                        <thead>
                            <tr className="bg-gray-50 text-gray-800 font-bold border-b border-gray-100">
                                <th className="px-3 py-3 w-16 text-center">Ações</th>
                                <th className="px-3 py-3 w-20 text-center">Quant.</th>
                                <th className="px-4 py-3 min-w-[200px]">Nome do Produto</th>
                                <th className="px-3 py-3 min-w-[120px]">Tipo</th>
                                <th className="px-3 py-3 min-w-[120px]">Material</th>
                                <th className="px-3 py-3 min-w-[120px]">Acabamento</th>
                                <th className="px-3 py-3 min-w-[100px]">Extras</th>
                                <th className="px-3 py-3 w-24 text-right">Custo</th>
                                <th className="px-3 py-3 w-20 text-center">Markup</th>
                                <th className="px-3 py-3 w-28 text-right bg-brand/5 font-semibold text-brand">Venda (Vink)</th>
                                <th className="px-3 py-3 w-24 text-right bg-green-50/50 font-bold text-green-700">Lucro Líq.</th>
                                <th className="px-3 py-3 w-24 text-right">Preço Base (Concorr.)</th>
                                <th className="px-3 py-3 w-20 text-center">Taxa Cartão</th>
                                <th className="px-3 py-3 w-20 text-right">Frete</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={14} className="text-center py-12 text-gray-500 font-medium">
                                        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-brand border-r-2 mx-auto mb-3"></div>
                                        Carregando planilha de precificação...
                                    </td>
                                </tr>
                            ) : filteredItems.length === 0 ? (
                                <tr>
                                    <td colSpan={14} className="text-center py-12 text-gray-400 font-medium">
                                        Nenhum registro encontrado. Crie uma nova linha ou ajuste os filtros.
                                    </td>
                                </tr>
                            ) : (
                                filteredItems.map((item) => {
                                    const salePrice = calculateSalePrice(item);
                                    const profit = calculateProfit(item);
                                    const competitorDiff = item.base_price > 0 
                                        ? ((salePrice - item.base_price) / item.base_price) * 100 
                                        : 0;
                                    const matchedProduct = products.find(p => p.id === item.product_id);

                                    return (
                                        <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group">
                                            {/* Action Delete & Supplier Link */}
                                            <td className="px-3 py-2 text-center whitespace-nowrap">
                                                <div className="flex items-center justify-center gap-1">
                                                    <button
                                                        onClick={() => deleteRow(item.id)}
                                                        className="text-gray-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-all"
                                                        title="Excluir Linha"
                                                    >
                                                        <Trash2 size={15} />
                                                    </button>
                                                    {matchedProduct?.supplierLink && (
                                                        <a
                                                            href={matchedProduct.supplierLink}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-brand hover:text-brand-dark p-1.5 rounded-lg hover:bg-brand/15 hover:scale-105 transition-all inline-block"
                                                            title="Ver Produto no Fornecedor"
                                                        >
                                                            <ExternalLink size={15} />
                                                        </a>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Quantity */}
                                            <td className="px-2 py-2">
                                                <input
                                                    type="number"
                                                    className="w-full text-center border-transparent hover:border-gray-200 focus:border-brand focus:ring-brand rounded px-1.5 py-1 font-semibold text-gray-800 bg-transparent focus:bg-white text-xs"
                                                    value={item.quantity}
                                                    onChange={(e) => updateCell(item.id, 'quantity', e.target.value)}
                                                />
                                            </td>

                                            {/* Product Name */}
                                            <td className="px-3 py-2 font-medium">
                                                <div className="flex items-center gap-1.5">
                                                    <input
                                                        type="text"
                                                        className="w-full border-transparent hover:border-gray-200 focus:border-brand focus:ring-brand rounded px-2 py-1 bg-transparent focus:bg-white text-xs font-semibold text-gray-900"
                                                        value={item.product_name}
                                                        onChange={(e) => updateCell(item.id, 'product_name', e.target.value)}
                                                    />
                                                    {item.product_id && (
                                                        <span className="text-[10px] bg-brand/10 text-brand px-1.5 py-0.5 rounded-full shrink-0 font-bold" title="Vinculado ao Catálogo">
                                                            Catálogo
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Type */}
                                            <td className="px-2 py-2">
                                                <input
                                                    type="text"
                                                    className="w-full border-transparent hover:border-gray-200 focus:border-brand focus:ring-brand rounded px-1.5 py-1 bg-transparent focus:bg-white text-xs text-gray-700"
                                                    value={item.type || ""}
                                                    placeholder="Frente/Verso..."
                                                    onChange={(e) => updateCell(item.id, 'type', e.target.value)}
                                                />
                                            </td>

                                            {/* Material */}
                                            <td className="px-2 py-2">
                                                <input
                                                    type="text"
                                                    className="w-full border-transparent hover:border-gray-200 focus:border-brand focus:ring-brand rounded px-1.5 py-1 bg-transparent focus:bg-white text-xs text-gray-700"
                                                    value={item.material || ""}
                                                    placeholder="Couchê 300g..."
                                                    onChange={(e) => updateCell(item.id, 'material', e.target.value)}
                                                />
                                            </td>

                                            {/* Finish */}
                                            <td className="px-2 py-2">
                                                <input
                                                    type="text"
                                                    className="w-full border-transparent hover:border-gray-200 focus:border-brand focus:ring-brand rounded px-1.5 py-1 bg-transparent focus:bg-white text-xs text-gray-700"
                                                    value={item.finish || ""}
                                                    placeholder="Laminação..."
                                                    onChange={(e) => updateCell(item.id, 'finish', e.target.value)}
                                                />
                                            </td>

                                            {/* Extras */}
                                            <td className="px-2 py-2">
                                                <input
                                                    type="text"
                                                    className="w-full border-transparent hover:border-gray-200 focus:border-brand focus:ring-brand rounded px-1.5 py-1 bg-transparent focus:bg-white text-xs text-gray-700"
                                                    value={item.extras || ""}
                                                    placeholder="Furo/Corte..."
                                                    onChange={(e) => updateCell(item.id, 'extras', e.target.value)}
                                                />
                                            </td>

                                            {/* Cost */}
                                            <td className="px-2 py-2">
                                                <input
                                                    type="text"
                                                    className="w-full text-right border-transparent hover:border-gray-200 focus:border-brand focus:ring-brand rounded px-1.5 py-1 bg-transparent focus:bg-white text-xs font-semibold text-gray-800"
                                                    value={item.cost}
                                                    onChange={(e) => updateCell(item.id, 'cost', e.target.value)}
                                                />
                                            </td>

                                            {/* Markup */}
                                            <td className="px-2 py-2">
                                                <input
                                                    type="text"
                                                    className="w-full text-center border-transparent hover:border-gray-200 focus:border-brand focus:ring-brand rounded px-1.5 py-1 bg-transparent focus:bg-white text-xs font-semibold text-gray-800"
                                                    value={item.markup}
                                                    onChange={(e) => updateCell(item.id, 'markup', e.target.value)}
                                                />
                                            </td>

                                            {/* Calculated Sale Price */}
                                            <td className="px-3 py-2 text-right bg-brand/5 font-semibold text-brand text-xs">
                                                {formatPrice(salePrice)}
                                            </td>

                                            {/* Calculated Profit */}
                                            <td className="px-3 py-2 text-right bg-green-50/50 text-xs font-bold text-green-700">
                                                {formatPrice(profit)}
                                                <span className="block text-[9px] text-green-600/70 font-medium leading-none mt-0.5">
                                                    {salePrice > 0 ? ((profit / salePrice) * 100).toFixed(1) : 0}% margem
                                                </span>
                                            </td>

                                            {/* Competitor Price (Base Price) */}
                                            <td className="px-2 py-2">
                                                <div className="relative">
                                                    <input
                                                        type="text"
                                                        className="w-full text-right border-transparent hover:border-gray-200 focus:border-brand focus:ring-brand rounded px-1.5 py-1 bg-transparent focus:bg-white text-xs font-semibold text-gray-800 pr-5"
                                                        value={item.base_price}
                                                        onChange={(e) => updateCell(item.id, 'base_price', e.target.value)}
                                                    />
                                                    {item.base_price > 0 && (
                                                        <span className={`absolute right-1 top-2.5 w-1.5 h-1.5 rounded-full ${
                                                            competitorDiff <= 0 ? 'bg-green-500' : 'bg-red-400'
                                                        }`} title={competitorDiff <= 0 
                                                            ? `Vink está ${Math.abs(competitorDiff).toFixed(1)}% mais barato que o concorrente` 
                                                            : `Vink está ${competitorDiff.toFixed(1)}% mais caro que o concorrente`
                                                        }></span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Card Fee */}
                                            <td className="px-2 py-2">
                                                <input
                                                    type="text"
                                                    className="w-full text-center border-transparent hover:border-gray-200 focus:border-brand focus:ring-brand rounded px-1.5 py-1 bg-transparent focus:bg-white text-xs text-gray-800"
                                                    value={item.card_fee_percentage}
                                                    onChange={(e) => updateCell(item.id, 'card_fee_percentage', e.target.value)}
                                                />
                                            </td>

                                            {/* Shipping Cost */}
                                            <td className="px-2 py-2">
                                                <input
                                                    type="text"
                                                    className="w-full text-right border-transparent hover:border-gray-200 focus:border-brand focus:ring-brand rounded px-1.5 py-1 bg-transparent focus:bg-white text-xs text-gray-800"
                                                    value={item.shipping_cost}
                                                    onChange={(e) => updateCell(item.id, 'shipping_cost', e.target.value)}
                                                />
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
