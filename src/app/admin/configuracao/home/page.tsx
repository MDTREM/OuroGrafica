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
    const [uploadingMobile, setUploadingMobile] = useState(false);
    const [editingBanner, setEditingBanner] = useState<Partial<Banner> | null>(null);
    const [editingBenefit, setEditingBenefit] = useState<any | null>(null);

    // ... (rest of the code)

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

    // ... (saveBanner function remains similar but will include mobileImageUrl naturally since it's in editingBanner)

    // ... (inside the return JSX, in the Banner Modal)

                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-md space-y-4 max-h-[90vh] overflow-y-auto">
                            <h3 className="text-xl font-bold">Banner</h3>

                            <div className="space-y-4">
                                {/* Desktop Image */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Imagem Desktop (Principal)</label>
                                    <Input type="file" accept="image/*" onChange={handleBannerUpload} disabled={uploading} />
                                    {uploading && <p className="text-xs text-brand">Carregando...</p>}

                                    {editingBanner.imageUrl && (
                                        <div className="mt-2 rounded-lg overflow-hidden border border-gray-200 bg-gray-100 max-h-40">
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
                                    {uploadingMobile && <p className="text-xs text-brand">Carregando...</p>}

                                    {editingBanner.mobileImageUrl && (
                                        <div className="mt-2 rounded-lg overflow-hidden border border-gray-200 bg-gray-100 max-h-40">
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

        </Container >
    );
}
