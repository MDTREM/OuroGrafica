"use client";

import React from "react";
import { Container } from "@/components/ui/Container";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { MapPin, TrendingUp, Package, ShieldCheck } from "lucide-react";

export default function BrandExpansionSection() {
    return (
        <section className="py-16 md:py-24 bg-gray-50/60 border-t border-b border-gray-100 relative overflow-hidden font-sans">
            <Container className="relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center max-w-7xl mx-auto">
                    
                    {/* Left Column: Stats & Value Proposition */}
                    <div className="lg:col-span-5 space-y-8 text-center lg:text-left flex flex-col items-center lg:items-start w-full">
                        
                        <ScrollReveal>
                            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-brand/10 text-brand text-[10px] font-bold rounded-full uppercase tracking-wider select-none">
                                <TrendingUp size={12} /> Expansão Nacional
                            </span>
                        </ScrollReveal>
                        
                        <ScrollReveal delay={100}>
                            <h2 className="text-3xl md:text-4xl font-medium tracking-tight text-black leading-tight">
                                Nossa marca cresce com o <span className="text-brand font-bold italic">sucesso</span> dos nossos clientes.
                            </h2>
                            <p className="text-sm md:text-base text-gray-500 font-light leading-relaxed mt-4">
                                De Ouro Preto para todo o país. O design estratégico e as embalagens da Vink viajam diariamente alimentando negócios e gerando desejo visual em dezenas de estados.
                            </p>
                        </ScrollReveal>

                        {/* Numeric stats section */}
                        <div className="w-full space-y-6 pt-2">
                            <ScrollReveal delay={200}>
                                <div className="flex flex-col sm:flex-row items-center lg:items-start gap-4 p-4 rounded-2xl bg-white border border-gray-100/80 shadow-xs hover:shadow-sm transition-all duration-300">
                                    <div className="w-12 h-12 rounded-xl bg-brand/10 text-brand flex items-center justify-center shrink-0">
                                        <ShieldCheck size={22} />
                                    </div>
                                    <div className="text-center sm:text-left">
                                        <h3 className="text-2xl md:text-3xl font-extrabold text-black tracking-tight leading-none">
                                            +280 Marcas
                                        </h3>
                                        <p className="text-xs text-gray-400 font-medium mt-1 uppercase tracking-wider">
                                            Atendidas e transformadas estrategicamente
                                        </p>
                                    </div>
                                </div>
                            </ScrollReveal>

                            <ScrollReveal delay={300}>
                                <div className="flex flex-col sm:flex-row items-center lg:items-start gap-4 p-4 rounded-2xl bg-white border border-gray-100/80 shadow-xs hover:shadow-sm transition-all duration-300">
                                    <div className="w-12 h-12 rounded-xl bg-brand/10 text-brand flex items-center justify-center shrink-0">
                                        <Package size={22} />
                                    </div>
                                    <div className="text-center sm:text-left">
                                        <h3 className="text-2xl md:text-3xl font-extrabold text-black tracking-tight leading-none">
                                            +3.5 Milhões
                                        </h3>
                                        <p className="text-xs text-gray-400 font-medium mt-1 uppercase tracking-wider">
                                            De embalagens impressas e distribuídas
                                        </p>
                                    </div>
                                </div>
                            </ScrollReveal>
                        </div>

                        {/* Beautiful interactive-style action button */}
                        <ScrollReveal delay={400} className="w-full sm:w-auto">
                            <div className="inline-flex flex-col items-center justify-center bg-gradient-to-r from-brand to-brand-dark text-white rounded-2xl px-6 py-4 shadow-lg shadow-brand/15 border border-brand/20 w-full sm:w-auto select-none">
                                <span className="text-xs md:text-sm font-extrabold uppercase tracking-widest text-white/95">
                                    Estamos em TODO O BRASIL
                                </span>
                                <span className="text-[11px] font-semibold text-brand-light mt-1 flex items-center gap-1">
                                    <MapPin size={11} className="animate-bounce" /> +180 cidades atendidas
                                </span>
                            </div>
                        </ScrollReveal>
                    </div>
                    
                    {/* Right Column: Stylized interactive SVG map of Brazil */}
                    <div className="lg:col-span-7 flex items-center justify-center w-full relative">
                        <ScrollReveal delay={250} className="w-full max-w-lg lg:max-w-none">
                            <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 md:p-8 border border-gray-150 shadow-xl shadow-gray-200/40 relative overflow-hidden group">
                                {/* Subtle glowing gradient mesh behind the map */}
                                <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-brand/5 rounded-full filter blur-3xl pointer-events-none z-0" />
                                
                                <div className="relative z-10 w-full aspect-square md:aspect-[4/3] flex items-center justify-center">
                                    {/* Stylized Modern Outline Vector Map of Brazil */}
                                    <svg 
                                        viewBox="0 0 500 500" 
                                        className="w-full h-full max-h-[380px] drop-shadow-md select-none text-gray-200"
                                        fill="none" 
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        {/* Styled Geometric Grid Outline of Brazil */}
                                        <path 
                                            d="M174.5,92 C184.5,88.5 211,62 214,64 C217,66 230.5,58 238,62 C245.5,66 253,60 259.5,63.5 C266,67 278,63.5 281,66 C284,68.5 281.5,73 283.5,79 C285.5,85 292,89.5 296.5,95 C301,100.5 304,97 311,99.5 C318,102 329,91.5 334.5,95 C340,98.5 342,106.5 347.5,108.5 C353,110.5 357,105 359,109 C361,113 361.5,123.5 369.5,127 C377.5,130.5 391,126 397.5,132 C404,138 395,142 396.5,148 C398,154 407.5,159 407,163.5 C406.5,168 395.5,170 395.5,174 C395.5,178 399,183 398,187 C397,191 391.5,189.5 388,193 C384.5,196.5 383,205 379,207.5 C375,210 367.5,206.5 363.5,210 C359.5,213.5 359.5,224.5 358.5,229.5 C357.5,234.5 352,241 350.5,246 C349,251 349,259.5 344.5,263.5 C340,267.5 332.5,264.5 329.5,270.5 C326.5,276.5 328,284 324,287.5 C320,291 310.5,286.5 307.5,291.5 C304.5,296.5 304,307.5 298.5,311 C293,314.5 284,310.5 279,316 C274,321.5 275.5,333 271,338.5 C266.5,344 256.5,342 254.5,348.5 C252.5,355 256.5,368.5 251.5,373 C246.5,377.5 237.5,370.5 234.5,376 C231.5,381.5 235.5,395 231,399.5 C226.5,404 218,401 213,405 C208,409 203,420 197,422.5 C191,425 180.5,417 175.5,422 C170.5,427 169.5,439 162.5,441 C155.5,443 148,432.5 146.5,425.5 C145,418.5 148,408.5 149.5,402 C151,395.5 155.5,392.5 156,386 C156.5,379.5 152.5,373.5 155.5,367.5 C158.5,361.5 168.5,359.5 169,353 C169.5,346.5 160.5,339 161,332.5 C161.5,326 169,321 169,314.5 C169,308 160,303.5 160.5,297 C161,290.5 168.5,286 168.5,279.5 C168.5,273 160.5,268.5 160.5,262 C160.5,255.5 167,250.5 167.5,244 C168,237.5 161,232.5 162.5,226 C164,219.5 174,217.5 175.5,211 C177,204.5 170.5,197.5 173,191.5 C175.5,185.5 186.5,184 188.5,178 C190.5,172 184,163.5 187,157.5 C190,151.5 201.5,150.5 203.5,144.5 C205.5,138.5 197.5,130 200.5,124 C203.5,118 214.5,117.5 216.5,111.5 C218.5,105.5 210,97 207,91.5 C204,86 193.5,88.5 187.5,85 C181.5,81.5 177,74.5 174.5,70"
                                            className="stroke-gray-200 group-hover:stroke-brand/20 transition-colors duration-500"
                                            strokeWidth="2.5" 
                                            strokeLinecap="round" 
                                            strokeLinejoin="round" 
                                            fill="#f9fafb"
                                        />

                                        {/* State boundaries / inner geometric grid lines for a state-of-the-art tech aesthetic */}
                                        <path d="M216.5,111.5 L283.5,79 M254.5,348.5 L226,226 M188.5,178 L311,99.5 M279,316 L329,91.5 M155.5,367.5 L200,124 M350.5,246 L271,338.5 M298.5,311 L359,109 M324,287.5 L407,163.5 M169,353 L146.5,425.5" stroke="#f3f4f6" strokeWidth="1" strokeDasharray="3 3" />

                                        {/* PULSING BRAND MARKERS & CITY LABELS */}
                                        {/* 1. Ouro Preto / Mariana (Vink HQ - Large Pulsing Target) */}
                                        <g className="cursor-pointer">
                                            {/* Glowing ring animation */}
                                            <circle cx="280" cy="275" r="14" className="fill-brand/10 stroke-brand/35 animate-ping origin-center" style={{ animationDuration: '3s' }} />
                                            <circle cx="280" cy="275" r="7" className="fill-brand/30 stroke-brand/50 animate-pulse origin-center" />
                                            <circle cx="280" cy="275" r="4.5" className="fill-brand stroke-white" strokeWidth="1.5" />
                                            <text x="290" y="271" className="fill-gray-900 font-extrabold text-[10px] font-sans">Ouro Preto (HQ)</text>
                                            <text x="290" y="280" className="fill-brand font-bold text-[8px] font-sans">Vink Core</text>
                                        </g>

                                        {/* 2. Belo Horizonte (Pulsing Dot) */}
                                        <g className="cursor-pointer">
                                            <circle cx="258" cy="254" r="10" className="fill-brand/10 stroke-brand/30 animate-pulse origin-center" style={{ animationDuration: '2.5s' }} />
                                            <circle cx="258" cy="254" r="3.5" className="fill-brand stroke-white" strokeWidth="1.5" />
                                            <text x="202" y="252" className="fill-gray-600 font-bold text-[9px] font-sans text-right">Belo Horizonte</text>
                                        </g>

                                        {/* 3. São Paulo (Pulsing Dot) */}
                                        <g className="cursor-pointer">
                                            <circle cx="236" cy="305" r="9" className="fill-brand/10 stroke-brand/20 animate-pulse origin-center" style={{ animationDuration: '3.2s' }} />
                                            <circle cx="236" cy="305" r="3.5" className="fill-brand stroke-white" strokeWidth="1.5" />
                                            <text x="184" y="308" className="fill-gray-600 font-bold text-[9px] font-sans">São Paulo</text>
                                        </g>

                                        {/* 4. Rio de Janeiro (Pulsing Dot) */}
                                        <g className="cursor-pointer">
                                            <circle cx="286" cy="301" r="8" className="fill-brand/10 stroke-brand/20 animate-pulse origin-center" />
                                            <circle cx="286" cy="301" r="3.5" className="fill-brand stroke-white" strokeWidth="1.5" />
                                            <text x="296" y="304" className="fill-gray-600 font-bold text-[9px] font-sans">Rio de Janeiro</text>
                                        </g>

                                        {/* 5. Brasília (Pulsing Dot) */}
                                        <g className="cursor-pointer">
                                            <circle cx="225" cy="188" r="8" className="fill-brand/10 stroke-brand/20 animate-pulse origin-center" style={{ animationDuration: '2.8s' }} />
                                            <circle cx="225" cy="188" r="3.5" className="fill-brand stroke-white" strokeWidth="1.5" />
                                            <text x="234" y="191" className="fill-gray-600 font-bold text-[9px] font-sans">Brasília</text>
                                        </g>

                                        {/* 6. Salvador (Pulsing Dot) */}
                                        <g className="cursor-pointer">
                                            <circle cx="348" cy="162" r="8" className="fill-brand/10 stroke-brand/20 animate-pulse origin-center" />
                                            <circle cx="348" cy="162" r="3.5" className="fill-brand stroke-white" strokeWidth="1.5" />
                                            <text x="312" y="152" className="fill-gray-600 font-bold text-[9px] font-sans">Salvador</text>
                                        </g>

                                        {/* 7. Curitiba (Pulsing Dot) */}
                                        <g className="cursor-pointer">
                                            <circle cx="204" cy="358" r="7" className="fill-brand/10 stroke-brand/15 animate-pulse origin-center" />
                                            <circle cx="204" cy="358" r="3" className="fill-brand stroke-white" strokeWidth="1" />
                                            <text x="212" y="361" className="fill-gray-500 font-semibold text-[8px] font-sans">Curitiba</text>
                                        </g>

                                        {/* 8. Porto Alegre (Pulsing Dot) */}
                                        <g className="cursor-pointer">
                                            <circle cx="168" cy="412" r="7" className="fill-brand/10 stroke-brand/15 animate-pulse origin-center" style={{ animationDuration: '3.5s' }} />
                                            <circle cx="168" cy="412" r="3" className="fill-brand stroke-white" strokeWidth="1" />
                                            <text x="176" y="415" className="fill-gray-500 font-semibold text-[8px] font-sans">Porto Alegre</text>
                                        </g>
                                    </svg>
                                </div>
                                
                                {/* Aesthetic map caption overlay */}
                                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400 select-none">
                                    <span>Hotspots pulsing: Vink strategic deliveries</span>
                                    <span className="font-semibold text-brand animate-pulse">Live network active</span>
                                </div>
                            </div>
                        </ScrollReveal>
                    </div>

                </div>
            </Container>
        </section>
    );
}
