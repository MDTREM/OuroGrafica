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
      <h1 className="text-4xl md:text-5xl lg:text-[4rem] xl:text-[4.5rem] font-medium tracking-tight leading-[1.1] mb-6 text-black min-h-[120px] md:min-h-[160px] flex items-center justify-center text-center">
        Identidade visual que <span className="text-brand font-bold italic">DEVORA</span> a concorrência.
      </h1>
    );
  }

  return (
    <h1 className="text-4xl md:text-5xl lg:text-[4rem] xl:text-[4.5rem] font-medium tracking-tight leading-[1.1] mb-6 text-black flex flex-wrap justify-center text-center min-h-[120px] md:min-h-[160px] items-center">
      {words.map((word, i) => {
        const cleanWord = word.toUpperCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
        const isDevora = cleanWord === "DEVORA";

        return (
          <span
            key={i}
            className="inline-block overflow-hidden mr-[0.22em] py-1"
          >
            <motion.span
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              transition={{
                type: "spring",
                damping: 15,
                stiffness: 100,
                delay: i * 0.08,
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
    </h1>
  );
}
