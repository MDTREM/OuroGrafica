"use client";

import { useState } from "react";
import { MapPin } from "lucide-react";

export function OutsourcingMap() {
    const [activeCity, setActiveCity] = useState<number | null>(null);

    const locations = [
        { name: "Ouro Preto", x: "53%", y: "63%" },
        { name: "Mariana", x: "60%", y: "61%" },
        { name: "Itabirito", x: "46%", y: "54%" },
        { name: "Ouro Branco", x: "49%", y: "72%" },
        { name: "Ponte Nova", x: "70%", y: "62%" },
        { name: "Cachoeira do Campo", x: "46%", y: "61%" },
        { name: "Conselheiro Lafaiete", x: "47%", y: "81%" }
    ];

    return (
        <div className="bg-white rounded-2xl p-6 md:p-10 shadow-sm border border-gray-100 flex flex-col items-center gap-6">
            <div className="w-full text-left">
                <h2 className="text-2xl font-bold text-gray-900">Veja onde atuamos</h2>
                <p className="text-gray-500 mt-2">Clique nos pinos no mapa para ver as cidades atendidas.</p>
            </div>

            <div className="relative w-full max-w-3xl mx-auto aspect-square flex items-center justify-center rounded-2xl overflow-hidden">
                {/* Map Image */}
                <div className="relative w-full h-full">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src="https://media.istockphoto.com/id/944066468/pt/vetorial/map-of-minas-gerais.jpg?s=612x612&w=0&k=20&c=5CYTQFo_QMsd-Xfd_67SFvrzigUABYnYGWnViXTVbfw="
                        alt="Mapa de Minas Gerais"
                        className="w-full h-full object-contain opacity-20 mix-blend-multiply grayscale hover:grayscale-0 transition-all duration-700"
                    />

                    {/* Pins Overlay - Adjusted roughly to clustered region in MG */}
                    {locations.map((loc, idx) => (
                        <button
                            key={idx}
                            onClick={() => setActiveCity(activeCity === idx ? null : idx)}
                            className="absolute flex flex-col items-center group cursor-pointer z-10 transition-transform active:scale-95 outline-none"
                            style={{ left: loc.x, top: loc.y }}
                        >
                            <MapPin
                                className={`w-8 h-8 fill-current drop-shadow-md transition-all duration-300 ${activeCity === idx ? 'text-[#FF6B07] scale-125' : 'text-orange-400/80 hover:text-[#FF6B07] hover:scale-110'}`}
                            />

                            {/* Tooltip / Label */}
                            <div className={`absolute bottom-full mb-3 bg-white text-gray-900 px-4 py-2 rounded-xl shadow-xl font-bold text-sm whitespace-nowrap transition-all duration-300 border border-gray-100 z-20 ${activeCity === idx ? 'opacity-100 transform translate-y-0 scale-100' : 'opacity-0 transform translate-y-2 scale-95 pointer-events-none'}`}>
                                {loc.name}
                                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px] w-3 h-3 bg-white border-r border-b border-gray-100 transform rotate-45"></div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
