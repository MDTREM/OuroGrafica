"use client";

import { Container } from "../ui/Container";
import { MapPin, ExternalLink } from "lucide-react";
import { Button } from "../ui/Button";

export function LocationMap() {
    const googleMapsUrl = "https://www.google.com/maps/search/?api=1&query=Rua+José+Moringa+9+Bauxita+Ouro+Preto+MG";

    return (
        <section className="py-8 pb-12">
            <Container>
                <div className="relative w-full h-[200px] md:h-[400px] rounded-xl md:rounded-[2.5rem] overflow-hidden shadow-sm border border-gray-200 group">
                    {/* Map Background */}
                    <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3745.385764843075!2d-43.5188806!3d-20.3920977!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xa40e6c52697843%3A0xe962804363240e4e!2sR.%20Jos%C3%A9%20Moringa%2C%209%20-%20Bauxita%2C%20Ouro%20Preto%20-%20MG%2C%2035400-000!5e0!3m2!1spt-BR!2sbr!4v1700000000000!5m2!1spt-BR!2sbr"
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        className="absolute inset-0 w-full h-full grayscale-[50%] group-hover:grayscale-0 transition-all duration-700 opacity-90"
                    />

                    {/* Centered Button Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <a
                            href={googleMapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="pointer-events-auto bg-white text-[#1a1a1a] font-bold text-sm md:text-lg py-3 px-6 md:py-4 md:px-8 rounded-xl md:rounded-2xl shadow-2xl flex items-center gap-2 md:gap-3 hover:scale-105 transition-transform duration-300 border border-gray-100"
                        >
                            <div className="w-8 h-1 bg-brand rounded-full absolute bottom-2 md:bottom-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <MapPin className="text-brand fill-brand text-white" size={20} />
                            Ver no Mapa
                        </a>
                    </div>
                </div>
            </Container>
        </section>
    );
}
