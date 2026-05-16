"use client";

import { useAdmin } from "@/contexts/AdminContext";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Tag, Trash2, Plus, AlertCircle } from "lucide-react";
import { useState } from "react";
import { Coupon } from "@/data/mockData";

export default function AdminCouponsPage() {
    const { coupons, addCoupon, deleteCoupon } = useAdmin();

    // New Coupon State
    const [code, setCode] = useState("");
    const [discountType, setDiscountType] = useState<"percentage" | "fixed">("percentage");
    const [value, setValue] = useState("");
    const [limitPerUser, setLimitPerUser] = useState(false);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAdd = async () => {
        if (!code || !value) return;
        setIsLoading(true);
        setError(null);

        try {
            const newCoupon: any = {
                code: code.toUpperCase().trim(),
                type: discountType,
                value: parseFloat(value),
                active: true,
                limitPerUser: limitPerUser
            };

            const result = await addCoupon(newCoupon);
            
            if (result?.success) {
                setCode("");
                setValue("");
            } else {
                setError(result?.error?.message || "Erro ao salvar cupom. Verifique a conexão.");
            }
        } catch (err) {
            setError("Erro inesperado ao criar cupom.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Container className="py-8 space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-semibold flex items-center gap-2">
                    <Tag className="text-transparent bg-clip-text bg-gradient-to-r from-brand to-brand-dark" /> Cupons de Desconto
                </h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Form */}
                <div className="md:col-span-1">
                    <div className="bg-white p-6 rounded-lg border border-border shadow-sm sticky top-24">
                        <h2 className="font-semibold mb-4 flex items-center gap-2">
                            <Plus size={18} /> Novo Cupom
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Código</label>
                                <Input
                                    placeholder="Ex: PROMO10"
                                    value={code}
                                    onChange={e => setCode(e.target.value.toUpperCase())}
                                    className="uppercase font-mono"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Tipo de Desconto</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        className={`p-2 text-sm border rounded hover:bg-gray-50 ${discountType === 'percentage' ? 'border-brand bg-gradient-to-r from-brand to-brand-dark/5 text-transparent bg-clip-text bg-gradient-to-r from-brand to-brand-dark font-semibold' : 'border-gray-200 text-gray-600'}`}
                                        onClick={() => setDiscountType('percentage')}
                                    >
                                        Porcentagem (%)
                                    </button>
                                    <button
                                        className={`p-2 text-sm border rounded hover:bg-gray-50 ${discountType === 'fixed' ? 'border-brand bg-gradient-to-r from-brand to-brand-dark/5 text-transparent bg-clip-text bg-gradient-to-r from-brand to-brand-dark font-semibold' : 'border-gray-200 text-gray-600'}`}
                                        onClick={() => setDiscountType('fixed')}
                                    >
                                        Valor Fixo (R$)
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">
                                    {discountType === 'percentage' ? 'Porcentagem do Desconto' : 'Valor do Desconto'}
                                </label>
                                <Input
                                    type="number"
                                    placeholder={discountType === 'percentage' ? "10" : "50.00"}
                                    value={value}
                                    onChange={e => setValue(e.target.value)}
                                />
                            </div>

                            <div className="flex items-center gap-2 pt-2">
                                <input
                                    type="checkbox"
                                    id="limitPerUser"
                                    checked={limitPerUser}
                                    onChange={e => setLimitPerUser(e.target.checked)}
                                    className="w-4 h-4 rounded border-gray-300 text-brand focus:ring-brand cursor-pointer"
                                />
                                <label htmlFor="limitPerUser" className="text-sm text-gray-600 font-medium cursor-pointer select-none">
                                    Limitar a 1 uso por conta?
                                </label>
                            </div>

                            {error && (
                                <div className="p-3 bg-red-50 border border-red-100 rounded text-red-600 text-xs flex items-center gap-2">
                                    <AlertCircle size={14} />
                                    {error}
                                </div>
                            )}

                            <Button 
                                onClick={handleAdd} 
                                disabled={!code || !value || isLoading} 
                                className="w-full"
                            >
                                {isLoading ? "Salvando..." : "Criar Cupom"}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* List */}
                <div className="md:col-span-2 space-y-4">
                    {coupons.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-12 bg-gray-50 border border-dashed border-gray-200 rounded-lg text-center">
                            <Tag size={48} className="text-gray-200 mb-4" />
                            <p className="font-semibold text-gray-500">Nenhum cupom ativo</p>
                            <p className="text-sm text-gray-400">Crie códigos promocionais para seus clientes.</p>
                        </div>
                    ) : (
                        coupons.map(coupon => (
                            <div key={coupon.id} className="bg-white p-4 rounded-lg border border-border flex items-center justify-between shadow-sm group">
                                <div className="flex items-center gap-4">
                                    <div className="bg-gradient-to-r from-brand to-brand-dark/10 w-12 h-12 rounded-full flex items-center justify-center text-transparent bg-clip-text bg-gradient-to-r from-brand to-brand-dark">
                                        <Tag size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg font-mono text-gray-900">{coupon.code}</h3>
                                        <p className="text-sm text-gray-500">
                                            Desconto de <span className="text-green-600 font-semibold">
                                                {coupon.type === 'percentage' ? `${coupon.value}%` : `R$ ${coupon.value.toFixed(2)}`}
                                            </span>
                                            {coupon.limitPerUser && (
                                                <span className="ml-2 px-1.5 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold uppercase rounded tracking-wider">
                                                    Uso Único
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => deleteCoupon(coupon.id)}
                                    className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                                    title="Excluir Cupom"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </Container>
    );
}
