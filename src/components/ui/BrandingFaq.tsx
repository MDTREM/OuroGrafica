'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FAQItem {
    question: string;
    answer: string;
}

interface BrandingFaqProps {
    items: FAQItem[];
}

export function BrandingFaq({ items }: BrandingFaqProps) {
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    const toggleIndex = (index: number) => {
        setActiveIndex(prev => (prev === index ? null : index));
    };

    return (
        <div className="space-y-4 max-w-3xl mx-auto w-full">
            {items.map((item, idx) => {
                const isOpen = activeIndex === idx;

                return (
                    <div 
                        key={idx}
                        className={cn(
                            "group border border-gray-150/80 bg-white/70 backdrop-blur-md rounded-2xl overflow-hidden transition-all duration-300 shadow-2xs hover:shadow-sm hover:border-gray-200",
                            isOpen ? "border-brand/35 bg-white/90 shadow-md ring-4 ring-brand/5" : ""
                        )}
                    >
                        <button
                            onClick={() => toggleIndex(idx)}
                            className="w-full flex items-center justify-between p-6 text-left font-medium text-black focus:outline-none cursor-pointer"
                        >
                            <h4 className={cn(
                                "text-[15px] md:text-lg tracking-tight transition-colors duration-200",
                                isOpen ? "text-brand-dark font-semibold" : "text-gray-800"
                            )}>
                                {item.question}
                            </h4>
                            <span 
                                className={cn(
                                    "p-1.5 rounded-full bg-gray-50 border border-gray-100 text-gray-400 group-hover:text-brand-dark group-hover:bg-brand/5 transition-all duration-300",
                                    isOpen ? "bg-brand/10 border-brand/20 text-brand-dark rotate-180" : ""
                                )}
                            >
                                <ChevronDown size={18} strokeWidth={2.5} />
                            </span>
                        </button>

                        <AnimatePresence initial={false}>
                            {isOpen && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ 
                                        height: "auto", 
                                        opacity: 1,
                                        transition: {
                                            height: {
                                                type: "spring",
                                                stiffness: 300,
                                                damping: 26
                                            },
                                            opacity: { duration: 0.25, delay: 0.05 }
                                        }
                                    }}
                                    exit={{ 
                                        height: 0, 
                                        opacity: 0,
                                        transition: {
                                            height: { duration: 0.25, ease: "easeInOut" },
                                            opacity: { duration: 0.15 }
                                        }
                                    }}
                                >
                                    <div className="px-6 pb-6 pt-1 text-gray-500 font-light text-sm md:text-[15px] leading-relaxed pr-10 border-t border-gray-100/50">
                                        {item.answer}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                );
            })}
        </div>
    );
}
