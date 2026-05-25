"use client";

import React from "react";
import { motion, HTMLMotionProps, Variants } from "framer-motion";

interface TimelineContentProps extends Omit<HTMLMotionProps<any>, "as"> {
  animationNum?: number;
  timelineRef?: React.RefObject<HTMLDivElement | null>;
  customVariants?: Variants;
  as?: keyof typeof motion | string;
  className?: string;
  children?: React.ReactNode;
}

export function TimelineContent({
  children,
  animationNum = 0,
  timelineRef,
  customVariants,
  as = "div",
  className,
  ...props
}: TimelineContentProps) {
  // Obter o componente motion apropriado (ex: motion.div, motion.p)
  const MotionComponent = (motion as any)[as as string] || motion.div;

  return (
    <MotionComponent
      custom={animationNum}
      variants={customVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      className={className}
      {...props}
    >
      {children}
    </MotionComponent>
  );
}
