'use client';

import { useState, useEffect, useRef } from 'react';
import { BlogPost, savePost } from '@/actions/blog-actions';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { ArrowLeft, Save, Image as ImageIcon, Loader2, Bold, List, Heading2, Heading3, Quote, AlignLeft, Search, Phone, Printer, HelpCircle, FileText, Link as LinkIcon, Copy } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { uploadImage } from '@/actions/homepage-actions';

interface EditorProps {
    initialData?: Partial<BlogPost>;
    isNew?: boolean;
}

const CATEGORIES = [
    "Dicas de Impressão",
    "Manutenção",
    "Outsourcing",
    "Design Gráfico",
    "Papelaria",
    "Institucional"
];

const INTERNAL_LINKS = [
    { label: 'Serviço: Manutenção', url: '/servicos/manutencao' },
    { label: 'Serviço: Outsourcing', url: '/servicos/outsourcing' },
    { label: 'Página: Contato', url: 'https://wa.me/5531982190935' },
    { label: 'Blog Home', url: '/blog' },
];

const PROBLEM_SOLUTION_TEMPLATE = `
<p>Se você está enfrentando problemas com [PROBLEMA], você não está sozinho. Esse é um dos desafios mais comuns para quem trabalha com impressão.</p>
<p>Neste artigo, vamos explicar as principais causas e como resolver isso de forma prática.</p>

<h2>Por que isso acontece?</h2>
<p>Geralmente, esse problema é causado por alguns fatores principais:</p>
<ul>
  <li>Causa 1: ...</li>
  <li>Causa 2: ...</li>
  <li>Causa 3: ...</li>
</ul>

<div class="my-8 p-6 bg-blue-50 rounded-xl border border-blue-200 text-center">
    <h3 class="text-xl font-bold text-blue-900 mb-2">Precisa de ajuda profissional?</h3>
    <p class="text-blue-700 mb-4">Nossa equipe técnica resolve isso rápido para você.</p>
    <a href="https://wa.me/5531982190935" class="inline-block bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors">Falar com Técnico</a>
</div>

<h2>Como resolver (Passo a Passo)</h2>
<p>Antes de chamar a assistência, você pode tentar:</p>
<ul>
  <li>Passo 1: ...</li>
  <li>Passo 2: ...</li>
</ul>

<h2>Quando chamar a manutenção?</h2>
<p>Se as dicas acima não funcionaram, pode ser um desgaste de peça interna. Continuar forçando pode piorar a situação.</p>

<div class="my-8 p-6 bg-[#FF6B07] rounded-xl text-center text-white">
   <h3 class="text-xl font-bold mb-2">Evite parar sua produção!</h3>
   <p class="mb-4">Temos planos de manutenção e aluguel ideais para sua empresa.</p>
   <a href="/servicos/manutencao" class="inline-block bg-white text-[#FF6B07] font-bold py-3 px-6 rounded-lg hover:bg-gray-100 transition-colors">Ver Planos</a>
</div>
`;

export function AdminPostEditor({ initialData, isNew }: EditorProps) {
    const router = useRouter();
    const [formData, setFormData] = useState<Partial<BlogPost>>(initialData || {
        published: false,
        category: 'Dicas de Impressão'
    });
    const [activeTab, setActiveTab] = useState<'content' | 'seo'>('content');
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    // Auto-generate meta fields if empty
    useEffect(() => {
        if (!formData.meta_title && formData.title) {
            setFormData(prev => ({ ...prev, meta_title: prev.title?.slice(0, 60) }));
        }
    }, [formData.title]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, published: e.target.checked }));
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        setUploading(true);
        const file = e.target.files[0];
        const data = new FormData();
        data.append('file', file);

        const url = await uploadImage(data);

        if (url) {
            setFormData(prev => ({ ...prev, cover_image: url }));
        } else {
            alert('Erro ao fazer upload da imagem.');
        }
        setUploading(false);
    };

    // --- Toolbar Logic ---
    const contentRef = useRef<HTMLTextAreaElement>(null);

    const insertTag = (tagStart: string, tagEnd: string = '') => {
        const textarea = contentRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        const selection = text.substring(start, end);

        const before = text.substring(0, start);
        const after = text.substring(end, text.length);

        const newText = before + tagStart + selection + tagEnd + after;

        setFormData({ ...formData, content: newText });

        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + tagStart.length, end + tagStart.length);
        }, 0);
    };

    const insertCTA = (type: 'whatsapp' | 'rent' | 'maintenance') => {
        let html = '';
        if (type === 'whatsapp') {
            html = `\n<div class="my-8 p-6 bg-green-50 rounded-xl border border-green-200 text-center">
    <h3 class="text-xl font-bold text-green-800 mb-2">Precisa de ajuda agora?</h3>
    <p class="text-green-700 mb-4">Fale diretamente com nossa equipe técnica pelo WhatsApp.</p>
    <a href="https://wa.me/5531982190935" target="_blank" class="inline-flex items-center gap-2 bg-green-600 text-white font-bold py-3 px-6 rounded-full hover:bg-green-700 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
        Chamar no WhatsApp
    </a>
</div>\n`;
        } else if (type === 'rent') {
            html = `\n<div class="my-8 p-6 bg-blue-50 rounded-xl border border-blue-200 text-center">
    <h3 class="text-xl font-bold text-blue-900 mb-2">Reduza custos com Outsourcing</h3>
    <p class="text-blue-700 mb-4">Alugue impressoras profissionais e economize até 40%.</p>
    <a href="/servicos/outsourcing" class="inline-block bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors">Ver Planos de Aluguel</a>
</div>\n`;
        } else if (type === 'maintenance') {
            html = `\n<div class="my-8 p-6 bg-orange-50 rounded-xl border border-orange-200 text-center">
   <h3 class="text-xl font-bold text-orange-900 mb-2">Impressora parada?</h3>
   <p class="text-orange-700 mb-4">Temos técnicos especializados prontos para resolver.</p>
   <a href="/servicos/manutencao" class="inline-block bg-[#FF6B07] text-white font-bold py-3 px-6 rounded-lg hover:bg-[#e65a00] transition-colors">Agendar Manutenção</a>
</div>\n`;
        }
        insertTag(html);
    };

    const loadTemplate = () => {
        if (formData.content && !confirm('Isso vai substituir o conteúdo atual. Deseja continuar?')) return;
        setFormData({ ...formData, content: PROBLEM_SOLUTION_TEMPLATE });
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert('Link copiado!');
    };

    const insertLink = (url: string, label: string) => {
        insertTag(`<a href="${url}" title="${label}">`, `</a>`);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        const result = await savePost(formData);
        if (result.success) {
            alert('Post salvo com sucesso!');
            router.push('/admin/blog');
        } else {
            console.error(result.error);
            alert(`Erro ao salvar post: ${result.error}`);
        }
        setSaving(false);
    };

    return (
        <Container className="py-8 max-w-6xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Link href="/admin/blog" className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
                        <ArrowLeft size={24} />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{isNew ? 'Novo Artigo' : 'Editar Artigo'}</h1>
                        <p className="text-sm text-gray-500">Otimize seu conteúdo para alcançar mais clientes</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <div className="bg-gray-100 p-1 rounded-lg flex text-sm font-medium">
                        <button
                            onClick={() => setActiveTab('content')}
                            className={`px-4 py-2 rounded-md transition-all ${activeTab === 'content' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Conteúdo
                        </button>
                        <button
                            onClick={() => setActiveTab('seo')}
                            className={`px-4 py-2 rounded-md transition-all flex items-center gap-2 ${activeTab === 'seo' ? 'bg-white shadow text-[#FF6B07]' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <Search size={14} />
                            SEO & Google
                        </button>
                    </div>

                    <Button
                        onClick={handleSubmit}
                        disabled={saving}
                        className="flex items-center gap-2"
                    >
                        {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                        {saving ? 'Salvando...' : 'Salvar'}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Column */}
                <div className="lg:col-span-2 space-y-6">

                    {activeTab === 'content' ? (
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
                            {/* Title & Slug */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Título do Artigo (H1)</label>
                                    <input
                                        required
                                        type="text"
                                        name="title"
                                        value={formData.title || ''}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 text-lg font-semibold rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#FF6B07] focus:border-transparent outline-none"
                                        placeholder="Ex: Como escolher a melhor impressora para seu escritório"
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                                        <select
                                            name="category"
                                            value={formData.category}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white"
                                        >
                                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Slug (URL)</label>
                                        <input
                                            type="text"
                                            name="slug"
                                            value={formData.slug || ''}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-500 text-sm"
                                            placeholder="gerado-automaticamente"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Content Editor with Toolbar */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-sm font-bold text-gray-700">Conteúdo do Artigo</label>
                                    <Button size="sm" variant="outline" onClick={loadTemplate} className="text-xs h-8">
                                        <FileText size={14} className="mr-1" /> Carregar Modelo: Problema & Solução
                                    </Button>
                                </div>

                                {/* Toolbar */}
                                <div className="flex flex-wrap items-center gap-1 p-2 bg-gray-50 border border-gray-300 border-b-0 rounded-t-lg">
                                    <button onClick={() => insertTag('<h2>', '</h2>')} className="p-2 hover:bg-gray-200 rounded text-gray-600" title="Título 2"><Heading2 size={18} /></button>
                                    <button onClick={() => insertTag('<h3>', '</h3>')} className="p-2 hover:bg-gray-200 rounded text-gray-600" title="Título 3"><Heading3 size={18} /></button>
                                    <div className="w-px h-6 bg-gray-300 mx-1" />
                                    <button onClick={() => insertTag('<b>', '</b>')} className="p-2 hover:bg-gray-200 rounded text-gray-600" title="Negrito"><Bold size={18} /></button>
                                    <button onClick={() => insertTag('<ul>\n  <li>', '</li>\n</ul>')} className="p-2 hover:bg-gray-200 rounded text-gray-600" title="Lista"><List size={18} /></button>
                                    <button onClick={() => insertTag('<blockquote>', '</blockquote>')} className="p-2 hover:bg-gray-200 rounded text-gray-600" title="Citação"><Quote size={18} /></button>
                                    <div className="w-px h-6 bg-gray-300 mx-1" />
                                    <span className="text-xs font-semibold text-gray-400 px-2">CTA:</span>
                                    <button onClick={() => insertCTA('whatsapp')} className="p-2 hover:bg-green-100 text-green-600 rounded flex items-center gap-1 text-xs font-bold ring-1 ring-green-200 bg-white" title="Botão WhatsApp">
                                        <Phone size={14} /> Zap
                                    </button>
                                    <button onClick={() => insertCTA('maintenance')} className="p-2 hover:bg-orange-100 text-orange-600 rounded flex items-center gap-1 text-xs font-bold ring-1 ring-orange-200 bg-white" title="Botão Manutenção">
                                        <HelpCircle size={14} /> Manut.
                                    </button>
                                    <button onClick={() => insertCTA('rent')} className="p-2 hover:bg-blue-100 text-blue-600 rounded flex items-center gap-1 text-xs font-bold ring-1 ring-blue-200 bg-white" title="Botão Outsourcing">
                                        <Printer size={14} /> Aluguel
                                    </button>
                                </div>

                                <textarea
                                    ref={contentRef}
                                    required
                                    name="content"
                                    rows={20}
                                    value={formData.content || ''}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-b-lg border border-gray-300 focus:ring-2 focus:ring-[#FF6B07] focus:border-transparent outline-none font-mono text-sm leading-relaxed"
                                    placeholder="Comece a escrever aqui ou use um modelo..."
                                />
                                <div className="mt-2 text-xs text-gray-400 flex justify-between">
                                    <span>Use a barra acima para formatar. HTML aceito.</span>
                                    <span>~{formData.content?.split(' ').length || 0} palavras</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* SEO Simulator Card */}
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <h3 className="flex items-center gap-2 font-bold text-gray-900 mb-4 pb-2 border-b">
                                    <Search size={20} className="text-[#FF6B07]" />
                                    Simulação no Google
                                </h3>

                                <div className="bg-white p-4 rounded-lg border border-gray-100 max-w-2xl">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center text-[10px] text-gray-500 p-1">
                                            <img src="/icon.png" className="opacity-50" onError={(e) => e.currentTarget.style.display = 'none'} />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm text-[#202124]">Ouro Gráfica</span>
                                            <span className="text-xs text-[#5f6368]">https://ourografica.site › blog › {formData.slug || 'slug-do-post'}</span>
                                        </div>
                                    </div>
                                    <h3 className="text-xl text-[#1a0dab] font-medium hover:underline cursor-pointer truncate">
                                        {formData.meta_title || formData.title || 'Título do seu artigo aqui'}
                                    </h3>
                                    <p className="text-sm text-[#4d5156] mt-1 line-clamp-2">
                                        {formData.meta_description || formData.excerpt || 'A descrição que aparecerá no Google vai aqui. É importante que ela contenha a palavra-chave foco e chame a atenção do usuário para o clique.'}
                                    </p>
                                </div>
                            </div>

                            {/* SEO Fields Form */}
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Meta Title (Título SEO)</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            name="meta_title"
                                            value={formData.meta_title || ''}
                                            onChange={handleChange}
                                            maxLength={60}
                                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#FF6B07] outline-none"
                                            placeholder="Título otimizado para clique"
                                        />
                                        <span className={`absolute right-3 top-2.5 text-xs ${(formData.meta_title?.length || 0) > 60 ? 'text-red-500' : 'text-gray-400'}`}>
                                            {formData.meta_title?.length || 0}/60
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">Deve conter a palavra-chave e ser chamativo.</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description (Resumo SEO)</label>
                                    <div className="relative">
                                        <textarea
                                            name="meta_description"
                                            rows={3}
                                            maxLength={160}
                                            value={formData.meta_description || ''}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#FF6B07] outline-none resize-none"
                                            placeholder="Resumo que aparece no Google..."
                                        />
                                        <span className={`absolute right-3 bottom-2.5 text-xs ${(formData.meta_description?.length || 0) > 160 ? 'text-red-500' : 'text-gray-400'}`}>
                                            {formData.meta_description?.length || 0}/160
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Palavra-Chave Foco</label>
                                        <input
                                            type="text"
                                            name="focus_keyword"
                                            value={formData.focus_keyword || ''}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#FF6B07] outline-none"
                                            placeholder="Ex: aluguel de impressora"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Tags (separadas por vírgula)</label>
                                        <input
                                            type="text"
                                            // Handle array conversion visually
                                            value={formData.tags?.join(', ') || ''}
                                            onChange={(e) => setFormData({ ...formData, tags: e.target.value.split(',').map(t => t.trim()) })}
                                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#FF6B07] outline-none"
                                            placeholder="hp, epson, manutenção"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Status */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-4">Publicação</h3>
                        <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-gray-50 rounded-lg">
                            <input
                                type="checkbox"
                                checked={formData.published || false}
                                onChange={handleToggle}
                                className="w-5 h-5 text-[#FF6B07] rounded focus:ring-[#FF6B07] border-gray-300"
                            />
                            <span className="text-sm font-medium text-gray-700">Publicar Agora</span>
                        </label>
                        <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-500">
                            Última atualização: <br />
                            {formData.created_at ? new Date(formData.created_at).toLocaleString('pt-BR') : 'Nunca'}
                        </div>
                    </div>

                    {/* Internal Links Helper */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <LinkIcon size={16} className="text-[#FF6B07]" />
                            Links Internos
                        </h3>
                        <p className="text-xs text-gray-500 mb-3">Links úteis para citar no seu texto:</p>
                        <div className="space-y-2">
                            {INTERNAL_LINKS.map((link, idx) => (
                                <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-100 hover:border-[#FF6B07] group transition-colors">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-gray-700 truncate">{link.label}</p>
                                        <p className="text-[10px] text-gray-400 truncate">{link.url}</p>
                                    </div>
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => insertLink(link.url, link.label)}
                                            className="p-1.5 hover:bg-white rounded text-gray-500 hover:text-[#FF6B07]"
                                            title="Inserir Link no Texto"
                                        >
                                            <LinkIcon size={12} />
                                        </button>
                                        <button
                                            onClick={() => copyToClipboard(link.url)}
                                            className="p-1.5 hover:bg-white rounded text-gray-500 hover:text-blue-500"
                                            title="Copiar URL"
                                        >
                                            <Copy size={12} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Image */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-4">Imagem de Capa</h3>

                        <div className="mb-4 aspect-video bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center border-2 border-dashed border-gray-300 relative group">
                            {formData.cover_image ? (
                                <img src={formData.cover_image} alt="Capa" className="w-full h-full object-cover" />
                            ) : (
                                <ImageIcon className="text-gray-300" size={32} />
                            )}

                            <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                                <span className="text-white font-medium text-sm flex items-center gap-2">
                                    <ImageIcon size={16} />
                                    {uploading ? 'Enviando...' : 'Alterar Imagem'}
                                </span>
                                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                            </label>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Alt Text (Texto Alternativo) *</label>
                            <input
                                required
                                type="text"
                                name="alt_text"
                                value={formData.alt_text || ''}
                                onChange={handleChange}
                                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#FF6B07] outline-none"
                                placeholder="Descreva a imagem para deficientes visuais e Google"
                            />
                            <p className="text-[10px] text-gray-400 mt-1">Essencial para SEO. Descreva o que tem na imagem.</p>
                        </div>
                    </div>
                </div>
            </div>
        </Container>
    );
}
