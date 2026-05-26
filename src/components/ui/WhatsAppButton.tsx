'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Mail, Calendar, X, Compass, Check } from 'lucide-react';
import Link from 'next/link';
import { Magnetic } from '@/components/ui/Magnetic';

export function WhatsAppButton() {
    const [isOpen, setIsOpen] = useState(false);
    const [copiedEmail, setCopiedEmail] = useState(false);
    const widgetRef = useRef<HTMLDivElement>(null);

    // Close when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (widgetRef.current && !widgetRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleCopyEmail = (e: React.MouseEvent) => {
        e.preventDefault();
        navigator.clipboard.writeText("contato@vink.com.br");
        setCopiedEmail(true);
        setTimeout(() => setCopiedEmail(false), 2000);
    };

    const menuItems = [
        {
            icon: <svg viewBox="0 0 448 512" className="w-5 h-5 fill-current" aria-hidden="true"><path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7 .9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" /></svg>,
            label: "Chamar no WhatsApp",
            href: "https://wa.me/5531989880161",
            color: "bg-[#25D366] hover:bg-[#20ba5a] text-white shadow-[#25D366]/20",
            target: "_blank"
        },
        {
            icon: <Calendar size={18} />,
            label: "Agendar Reunião 15m",
            href: "https://wa.me/5531989880161?text=Olá! Gostaria de agendar uma reunião rápida de 15 minutos para falar sobre um projeto de branding.",
            color: "bg-orange-500 hover:bg-orange-600 text-white shadow-orange-500/20",
            target: "_blank"
        },
        {
            icon: copiedEmail ? <Check size={18} /> : <Mail size={18} />,
            label: copiedEmail ? "E-mail Copiado!" : "contato@vink.com.br",
            href: "mailto:contato@vink.com.br",
            color: "bg-blue-500 hover:bg-blue-600 text-white shadow-blue-500/20",
            onClick: handleCopyEmail
        }
    ];

    return (
        <div ref={widgetRef} className="fixed bottom-24 right-4 md:bottom-8 md:right-8 z-[999] flex flex-col items-end gap-3.5">
            {/* Pop-up Stack of Buttons */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        className="flex flex-col items-end gap-3 pb-2"
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        variants={{
                            visible: { transition: { staggerChildren: 0.07 } }
                        }}
                    >
                        {menuItems.map((item, idx) => (
                            <motion.div
                                key={idx}
                                variants={{
                                    hidden: { opacity: 0, y: 15, scale: 0.8 },
                                    visible: { opacity: 1, y: 0, scale: 1 }
                                }}
                                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                                className="flex items-center gap-3 group relative cursor-pointer"
                            >
                                {/* Hover Tooltip Label */}
                                <span className="pointer-events-none md:pointer-events-auto opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0 bg-[#111111]/90 backdrop-blur-md text-white text-[11px] font-semibold py-1.5 px-3 rounded-lg shadow-md border border-white/10 whitespace-nowrap text-right shrink-0">
                                    {item.label}
                                </span>

                                {/* Action Circular Button */}
                                {item.onClick ? (
                                    <button
                                        onClick={item.onClick}
                                        className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-transform duration-300 hover:scale-110 active:scale-95 ${item.color}`}
                                        aria-label={item.label}
                                    >
                                        {item.icon}
                                    </button>
                                ) : (
                                    <Link
                                        href={item.href}
                                        target={item.target || "_self"}
                                        rel={item.target ? "noopener noreferrer" : undefined}
                                        className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-transform duration-300 hover:scale-110 active:scale-95 ${item.color}`}
                                        aria-label={item.label}
                                    >
                                        {item.icon}
                                    </Link>
                                )}
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Primary Trigger FAB */}
            <Magnetic range={0.45} strength={0.4}>
                <motion.button
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-13 h-13 bg-[#111111] hover:bg-black text-white rounded-full shadow-xl flex items-center justify-center relative cursor-pointer border border-white/10 transition-transform active:scale-95 group"
                    animate={{ rotate: isOpen ? 135 : 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 18 }}
                    aria-label="Contatos da Agência"
                >
                    <div className="absolute inset-0 rounded-full bg-brand/10 group-hover:bg-brand/20 transition-colors animate-pulse pointer-events-none" />
                    <AnimatePresence mode="wait">
                        {isOpen ? (
                            <motion.div
                                key="close"
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                transition={{ duration: 0.15 }}
                            >
                                <X size={20} className="stroke-[2.5]" />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="open"
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                transition={{ duration: 0.15 }}
                                className="relative flex items-center justify-center"
                            >
                                <MessageCircle size={22} className="stroke-[2.2]" />
                                {/* Notification Dot */}
                                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-brand rounded-full border-2 border-[#111111]"></span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.button>
            </Magnetic>
        </div>
    );
}
