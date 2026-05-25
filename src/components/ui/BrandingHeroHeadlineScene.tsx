"use client";

import React from "react";
import { MaskedSlideReveal } from "./masked-slide-reveal";

export const MaskedSlideRevealScene = () => {
  return (
    <MaskedSlideReveal
      text="Identidade visual que DEVORA a concorrência."
      staggerDelay={3}
      fontSize={54}
      color="#000000"
      fontWeight={500}
      speed={1}
    />
  );
};
