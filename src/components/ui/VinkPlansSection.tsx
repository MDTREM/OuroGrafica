"use client";

import React, { useRef } from "react";
import { Container } from "@/components/ui/Container";
import { Sparkles as SparklesComp } from "@/components/ui/sparkles";
import { TimelineContent } from "@/components/ui/timeline-animation";
import { VerticalCutReveal } from "@/components/ui/vertical-cut-reveal";

export default function VinkPlansSection() {
  const pricingRef = useRef<HTMLDivElement>(null);

  const revealVariants = {
    visible: (i: number) => ({
      y: 0,
      opacity: 1,
      filter: "blur(0px)",
      transition: {
        delay: i * 0.15,
        duration: 0.5,
      },
    }),
    hidden: {
      filter: "blur(10px)",
      y: 20,
      opacity: 0,
    },
  };

  return (
    <section 
      id="planos" 
      ref={pricingRef}
      className="py-12 md:py-24 bg-white text-gray-900 border-t border-gray-100 relative overflow-hidden"
    >
      {/* Background Sparkles & Grid Effect */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
        <SparklesComp
          density={100}
          direction="bottom"
          speed={0.4}
          color="#15cb98"
          className="absolute inset-0 h-full w-full [mask-image:radial-gradient(50%_50%,white,transparent_90%)]"
        />
      </div>

      <Container className="relative z-10">
        <div className="max-w-2xl mb-20 text-center mx-auto space-y-4">
          <h2 className="text-4xl font-medium tracking-tight mb-4 text-black">
            Planos <span className="text-brand font-bold italic pr-2">sob medida</span>
          </h2>
          
          <TimelineContent
            as="p"
            animationNum={0}
            timelineRef={pricingRef}
            customVariants={revealVariants}
            className="text-gray-500 font-light"
          >
            Escolha o tamanho do seu apetite por crescimento.
          </TimelineContent>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto items-stretch">
          
          {/* Plan 1 - Basic Taste */}
          <TimelineContent
            animationNum={1}
            timelineRef={pricingRef}
            customVariants={revealVariants}
            className="flex flex-col"
          >
            <div className="p-8 border border-gray-100 flex flex-col bg-gray-50/50 rounded-xl relative group hover:-translate-y-2 hover:shadow-xl hover:border-gray-200 transition-all duration-300 flex-1">
              <h3 className="text-xl font-medium mb-2 text-black">Basic Taste</h3>
              <p className="text-gray-500 text-sm font-light mb-8 h-10">O essencial para começar com o pé direito.</p>
              
              <ul className="space-y-4 mb-10 flex-1 text-sm font-light text-gray-500">
                <li className="flex items-start gap-2">
                  <span className="text-brand text-xs mt-1">✦</span>
                  <span>Logo principal</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand text-xs mt-1">✦</span>
                  <span>Versões da Logo</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand text-xs mt-1">✦</span>
                  <span>Paleta de cores</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand text-xs mt-1">✦</span>
                  <span>Tipografia</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand text-xs mt-1">✦</span>
                  <span>Manual básico</span>
                </li>
              </ul>

              <a 
                href="https://wa.me/5531989880161?text=Olá,%20quero%20saber%20mais%20sobre%20o%20plano%20Basic%20Taste!" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="block w-full py-4 border border-gray-200 text-black text-xs tracking-wide uppercase font-medium text-center rounded-xl hover:border-black hover:bg-black hover:text-white transition-all duration-300"
              >
                Solicitar Orçamento
              </a>
            </div>
          </TimelineContent>

          {/* Plan 2 - Combo Perfeito (Mais Escolhido) */}
          <TimelineContent
            animationNum={2}
            timelineRef={pricingRef}
            customVariants={revealVariants}
            className="flex flex-col"
          >
            <div className="p-8 border-2 border-brand flex flex-col relative bg-white rounded-xl shadow-lg -translate-y-2 group hover:-translate-y-3 hover:shadow-[0_12px_40px_rgba(21,203,152,0.15)] transition-all duration-300 flex-1 z-10">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand text-white text-[10px] font-bold px-4 py-1 rounded-full uppercase tracking-widest whitespace-nowrap">
                Mais Escolhido
              </div>
              <h3 className="text-xl font-medium mb-2 text-black">Combo Perfeito</h3>
              <p className="text-gray-500 text-sm font-light mb-8 h-10">Branding completo + impressos.</p>
              
              <ul className="space-y-4 mb-10 flex-1 text-sm font-light text-gray-500">
                <li className="flex items-start gap-2">
                  <span className="text-brand text-xs mt-1">✦</span>
                  <span className="text-black font-semibold">Tudo do Basic Taste</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand text-xs mt-1">✦</span>
                  <span>Design de Cardápio</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand text-xs mt-1">✦</span>
                  <span>Design de Cartões de Visita</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand text-xs mt-1">✦</span>
                  <span>Design de Panfletos</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand text-xs mt-1">✦</span>
                  <span>Design de Adesivos e Lacres</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand text-xs mt-1">✦</span>
                  <span>Manual de Marca</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand text-xs mt-1">✦</span>
                  <span>Posicionamento e Tom de voz</span>
                </li>
              </ul>

              <a 
                href="https://wa.me/5531989880161?text=Olá,%20quero%20saber%20mais%20sobre%20o%20plano%20Combo%20Perfeito!" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="block w-full py-4 bg-brand text-white text-xs tracking-wide uppercase font-medium text-center rounded-xl hover:bg-brand-dark hover:scale-[1.02] active:scale-95 shadow-md shadow-brand/20 transition-all duration-300"
              >
                Solicitar Orçamento
              </a>
            </div>
          </TimelineContent>

          {/* Plan 3 - Banquete Viral */}
          <TimelineContent
            animationNum={3}
            timelineRef={pricingRef}
            customVariants={revealVariants}
            className="flex flex-col"
          >
            <div className="p-8 border border-gray-200 flex flex-col bg-white rounded-xl relative group hover:-translate-y-2 hover:shadow-xl hover:border-black transition-all duration-300 flex-1">
              <h3 className="text-xl font-medium mb-2 text-black">Banquete Viral</h3>
              <p className="text-gray-500 text-sm font-light mb-8 h-10">O pacote definitivo para dominar sua região.</p>
              
              <ul className="space-y-4 mb-10 flex-1 text-sm font-light text-gray-500">
                <li className="flex items-start gap-2">
                  <span className="text-brand text-xs mt-1">✦</span>
                  <span className="text-black font-semibold">Tudo do Combo Perfeito</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand text-xs mt-1">✦</span>
                  <span>Design de Embalagens</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand text-xs mt-1">✦</span>
                  <span>Design de Sacolas</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand text-xs mt-1">✦</span>
                  <span>Design de Uniformes e Crachás</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand text-xs mt-1">✦</span>
                  <span>Design de Fachada</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand text-xs mt-1">✦</span>
                  <span>Design de Frota</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand text-xs mt-1">✦</span>
                  <span>Estratégia de Unboxing Experience</span>
                </li>
              </ul>

              <a 
                href="https://wa.me/5531989880161?text=Olá,%20quero%20saber%20mais%20sobre%20o%20plano%20Banquete%20Viral!" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="block w-full py-4 border border-gray-200 text-black text-xs tracking-wide uppercase font-medium text-center rounded-xl hover:border-black hover:bg-black hover:text-white transition-all duration-300"
              >
                Solicitar Orçamento
              </a>
            </div>
          </TimelineContent>

          {/* Plan 4 - Vink Club */}
          <TimelineContent
            animationNum={4}
            timelineRef={pricingRef}
            customVariants={revealVariants}
            className="flex flex-col"
          >
            <div className="p-8 border border-[#333] flex flex-col bg-[#141414] rounded-xl relative group hover:-translate-y-2 hover:shadow-[0_12px_40px_rgba(0,0,0,0.4)] transition-all duration-300 flex-1">
              <h3 className="text-xl font-medium mb-2 text-white">Vink Club</h3>
              <p className="text-gray-400 text-sm font-light mb-8 h-10">Padronização e recorrência de materiais.</p>
              
              <ul className="space-y-4 mb-10 flex-1 text-sm font-light text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="text-brand text-xs mt-1">✦</span>
                  <span className="text-white font-semibold">Tudo do Combo Perfeito</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand text-xs mt-1">✦</span>
                  <span>Envio Mensal de Impressos</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand text-xs mt-1">✦</span>
                  <span>Gestão de Ativos de Marca</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand text-xs mt-1">✦</span>
                  <span>Consultoria de Expansão</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand text-xs mt-1">✦</span>
                  <span>Suporte Prioritário</span>
                </li>
              </ul>

              <a 
                href="https://wa.me/5531989880161?text=Olá,%20quero%20saber%20mais%20sobre%20o%20Vink%20Club!" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="block w-full py-4 bg-white text-black text-xs tracking-wide uppercase font-medium text-center rounded-xl hover:bg-gray-100 hover:scale-[1.02] active:scale-95 transition-all duration-300"
              >
                Solicitar Orçamento
              </a>
            </div>
          </TimelineContent>

        </div>
      </Container>
    </section>
  );
}
