export interface ViralProduct {
    id: string;
    title: string;
    description: string;
    price: number;
    unit: string;
    image: string;
    views: string;
    badge: string;
    category: string;
    tip: string;
    bgColor: string;
    videoUrl?: string; // Simulação de reels/stories
}

export const VIRAL_PRODUCTS: ViralProduct[] = [
    {
        id: "viral-1",
        title: "Copo Fibra de Coco Holográfico",
        description: "Copo sustentável com acabamento furta-cor que reflete cores vibrantes dependendo do ângulo da luz. A sensação do momento nas cafeterias.",
        price: 7.90,
        unit: "unid. (min 100)",
        image: "https://images.unsplash.com/photo-1517256064527-09c53b2d0bc6?q=80&w=600&auto=format&fit=crop",
        views: "1.8M views",
        badge: "🔥 TikTok Trend",
        category: "Copos",
        tip: "Dica de Gravação: Mostre uma bebida colorida com gelo sendo servida sob a luz solar direta para capturar o efeito holográfico.",
        bgColor: "from-purple-900/40 to-slate-900",
        videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-pouring-orange-juice-into-a-glass-41793-large.mp4"
    },
    {
        id: "viral-2",
        title: "Sacola Delivery 'Provocações'",
        description: "Papel Kraft premium com frases interativas e divertidas que instigam o cliente a tirar foto e compartilhar antes mesmo de comer.",
        price: 1.80,
        unit: "unid. (min 250)",
        image: "https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=600&auto=format&fit=crop",
        views: "950k views",
        badge: "🎬 Campeão de Story",
        category: "Sacolas",
        tip: "Dica de Gravação: Grave o unboxing em primeira pessoa mostrando o cliente lendo a frase da sacola e rindo antes de abrir a comida.",
        bgColor: "from-emerald-900/40 to-slate-900",
        videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-holding-a-brown-paper-bag-40291-large.mp4"
    },
    {
        id: "viral-3",
        title: "Lacre de Segurança Neon Holográfico",
        description: "Lacre adesivo com tecnologia de reflexão de flash e frase de segurança super descolada. Garante a integridade brilhando muito.",
        price: 0.35,
        unit: "unid. (min 1000)",
        image: "https://images.unsplash.com/photo-1607344645866-009c320c5ab8?q=80&w=600&auto=format&fit=crop",
        views: "2.4M views",
        badge: "✨ Viral Flash",
        category: "Lacres",
        tip: "Dica de Gravação: Faça um vídeo curto ligando o flash da câmera à noite e gravando o lacre refletindo instantaneamente.",
        bgColor: "from-amber-900/40 to-slate-900",
        videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-box-sealed-with-shipping-tape-33069-large.mp4"
    },
    {
        id: "viral-4",
        title: "Caixa de Hambúrguer 'SoundBox'",
        description: "Embalagem térmica que vem com um QR Code gigante que destrava uma playlist de batidas para acompanhar o lanche e cupom surpresa.",
        price: 3.20,
        unit: "unid. (min 200)",
        image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=600&auto=format&fit=crop",
        views: "1.5M views",
        badge: "🎧 Experiência Sonora",
        category: "Caixas",
        tip: "Dica de Gravação: Grave um vídeo curto com música de fundo mostrando o celular escaneando a caixa e abrindo a playlist em sintonia.",
        bgColor: "from-blue-900/40 to-slate-900",
        videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-tasty-burger-rotating-on-a-surface-40228-large.mp4"
    }
];
