"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function BrandingHeroHeadline() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const text = "Identidade visual que DEVORA a concorrência.";
  const words = text.split(" ");

  if (!isMounted) {
    return (
      <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] xl:text-[4rem] font-medium tracking-tight leading-[1.1] mb-6 text-black min-h-[120px] md:min-h-[160px] flex flex-col lg:flex-row lg:flex-wrap items-center lg:items-start justify-center lg:justify-start text-center lg:text-left">
        <span>Identidade visual </span>
        <span className="lg:ml-2">que <span className="text-brand font-bold italic">DEVORA</span></span>
        <span className="lg:ml-2"> a concorrência.</span>
      </h1>
    );
  }

  // Line groupings for mobile: line1 = "Identidade visual", line2 = "que DEVORA", line3 = "a concorrência."
  const line1 = ["Identidade", "visual"];
  const line2 = ["que", "DEVORA"];
  const line3 = ["a", "concorrência."];
  const lines = [line1, line2, line3];

  let wordIndex = 0;

  return (
    <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] xl:text-[4rem] font-medium tracking-tight leading-[1.1] mb-6 text-black flex flex-col lg:flex-row lg:flex-wrap justify-center lg:justify-start text-center lg:text-left min-h-[120px] md:min-h-[160px] items-center lg:items-start">
      {lines.map((line, lineIdx) => (
        <span key={lineIdx} className="flex flex-wrap justify-center lg:justify-start">
          {line.map((word) => {
            const currentIndex = wordIndex++;
            const cleanWord = word.toUpperCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
            const isDevora = cleanWord === "DEVORA";

            return (
              <span
                key={currentIndex}
                className="inline-block overflow-hidden mr-[0.22em] py-1"
              >
                <motion.span
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  transition={{
                    type: "spring",
                    damping: 15,
                    stiffness: 100,
                    delay: currentIndex * 0.08,
                  }}
                  className={`inline-block ${
                    isDevora
                      ? "text-brand font-bold italic"
                      : "text-black"
                  }`}
                >
                  {word}
                </motion.span>
              </span>
            );
          })}
        </span>
      ))}
    </h1>
  );
}

