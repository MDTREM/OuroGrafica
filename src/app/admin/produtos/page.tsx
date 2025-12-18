"use client";

import { useAdmin } from "@/contexts/AdminContext";
import { formatPrice } from "@/lib/utils";
import { Plus, Search, Edit, Trash2, Upload, Copy } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/Input";

export default function AdminProductsPage() {
    const { products, deleteProduct, importProducts, duplicateProduct } = useAdmin();
    const [query, setQuery] = useState("");

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            if (!text) return;

            // Simple CSV Parser
            // Assumes header: title,price,category,description
            const lines = text.split("\n");
            const newProducts: any[] = [];

            // Skip header (index 0)
            for (let i = 1; i < lines.length; i++) {
                const line = lines[i].trim();
                if (!line) continue;

                const cols = line.split(","); // Use a real parser library for production
                if (cols.length >= 2) {
                    newProducts.push({
                        id: Math.random().toString(36).substr(2, 9),
                        title: cols[0]?.trim() || "Sem Nome",
                        price: parseFloat(cols[1]?.trim()) || 0,
                        category: cols[2]?.trim() || "Geral",
                        description: cols[3]?.trim() || "",
                        isFeatured: false,
                        isNew: true
                    });
                }
            }

            if (newProducts.length > 0) {
                importProducts(newProducts);
                alert(`${newProducts.length} produtos importados com sucesso!`);
            }
        };
        reader.readAsText(file);
    };

    const filteredProducts = products.filter(p =>
        p.title.toLowerCase().includes(query.toLowerCase()) ||
        p.category.toLowerCase().includes(query.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Produtos</h1>
                    <p className="text-gray-500">Gerencie seu catálogo.</p>
                </div>
                <div className="flex gap-2">
                    <label className="bg-white border border-gray-200 text-gray-700 font-bold py-2.5 px-4 rounded-xl shadow-sm hover:bg-gray-50 transition-colors flex items-center gap-2 cursor-pointer">
                        <Upload size={18} />
                        Importar CSV
                        <input
                            type="file"
                            accept=".csv"
                            className="hidden"
                            onChange={handleFileUpload}
                        />
                    </label>
                    <Link href="/admin/produtos/novo" className="bg-brand text-white font-bold py-2.5 px-6 rounded-xl shadow-lg shadow-brand/20 hover:bg-brand-dark transition-colors flex items-center gap-2">
                        <Plus size={18} />
                        Novo Produto
                    </Link>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <Input
                    placeholder="Buscar produtos..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    icon={<Search size={18} />}
                />
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50 text-gray-900 font-medium">
                            <tr>
                                <th className="px-6 py-4">Produto</th>
                                <th className="px-6 py-4">Categoria</th>
                                <th className="px-6 py-4">Preço</th>
                                <th className="px-6 py-4">Destaques</th>
                                <th className="px-6 py-4 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredProducts.map((product) => (
                                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden flex-shrink-0">
                                                {product.image ? (
                                                    <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className={`w-full h-full ${product.color || "bg-gray-100"}`} />
                                                )}
                                            </div>
                                            <span className="font-medium text-gray-900 line-clamp-2 max-w-[200px]" title={product.title}>{product.title}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
                                            {product.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-bold">{formatPrice(product.price)}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-1">
                                            {product.isFeatured && (
                                                <span className="w-2 h-2 rounded-full bg-blue-500" title="Destaque"></span>
                                            )}
                                            {product.isNew && (
                                                <span className="w-2 h-2 rounded-full bg-green-500" title="Novo"></span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => duplicateProduct(product)}
                                                title="Duplicar"
                                                className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                            >
                                                <Copy size={18} />
                                            </button>
                                            <Link href={`/admin/produtos/editar/${product.id}`} className="p-2 text-gray-500 hover:bg-gray-50 rounded-lg transition-colors">
                                                <Edit size={18} />
                                            </Link>
                                            <button
                                                onClick={() => {
                                                    if (confirm("Tem certeza que deseja excluir este produto?")) {
                                                        deleteProduct(product.id);
                                                    }
                                                }}
                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
