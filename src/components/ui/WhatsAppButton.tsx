'use client';

import { MessageCircle } from 'lucide-react';
import Link from 'next/link';

export function WhatsAppButton() {
    return (
        <Link
            href="https://wa.me/5531982190935" // Replace with actual number if different, using the one from AdminPostEditor
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-24 right-4 md:bottom-8 md:right-8 z-[90] flex items-center justify-center w-12 h-12 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg transition-transform hover:scale-110 animate-in fade-in zoom-in duration-300"
            aria-label="Falar no WhatsApp"
        >
            <MessageCircle size={24} fill="currentColor" strokeWidth={0} />
            <span className="absolute w-3 h-3 bg-red-500 rounded-full top-0 right-0 border-2 border-green-500"></span>
        </Link>
    );
}
