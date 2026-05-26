"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface SlideInButtonProps {
    children: React.ReactNode;
    href?: string;
    onClick?: () => void;
    /** Default (idle) background color */
    bgColor?: string;
    /** Hover background fill color */
    hoverBgColor?: string;
    /** Default text color */
    textColor?: string;
    /** Hover text color */
    hoverTextColor?: string;
    /** Border color (optional) */
    borderColor?: string;
    /** Show arrow icon on hover */
    showArrow?: boolean;
    /** Open link in new tab */
    newTab?: boolean;
    className?: string;
    size?: "sm" | "md" | "lg";
}

export function SlideInButton({
    children,
    href,
    onClick,
    bgColor = "#15cb98",
    hoverBgColor = "#0fa87d",
    textColor = "#ffffff",
    hoverTextColor = "#ffffff",
    borderColor,
    showArrow = true,
    newTab = false,
    className = "",
    size = "lg",
}: SlideInButtonProps) {
    const sizeClasses = {
        sm: "px-6 py-2.5 text-sm",
        md: "px-7 py-3 text-sm",
        lg: "px-8 py-4 text-base",
    };

    const content = (
        <motion.span
            className={cn(
                "relative inline-flex items-center justify-center font-medium rounded-xl overflow-hidden cursor-pointer w-full sm:w-auto",
                sizeClasses[size],
                className
            )}
            style={{
                backgroundColor: bgColor,
                color: textColor,
                border: borderColor ? `1px solid ${borderColor}` : undefined,
            }}
            initial="idle"
            whileHover="hover"
            whileTap={{ scale: 0.97 }}
        >
            {/* Expanding circle fill */}
            <motion.span
                className="absolute rounded-full"
                style={{ backgroundColor: hoverBgColor }}
                variants={{
                    idle: {
                        width: 0,
                        height: 0,
                        x: "-50%",
                        y: "-50%",
                        opacity: 1,
                    },
                    hover: {
                        width: "300%",
                        height: "300%",
                        x: "-50%",
                        y: "-50%",
                        opacity: 1,
                    },
                }}
                transition={{
                    type: "spring",
                    bounce: 0.1,
                    duration: 0.5,
                }}
                aria-hidden
                style={{
                    top: "50%",
                    left: "50%",
                    backgroundColor: hoverBgColor,
                    pointerEvents: "none",
                }}
            />

            {/* Text */}
            <motion.span
                className="relative z-10 flex items-center gap-2"
                variants={{
                    idle: { color: textColor },
                    hover: { color: hoverTextColor },
                }}
                transition={{ duration: 0.3 }}
            >
                <span>{children}</span>

                {/* Sliding arrow */}
                {showArrow && (
                    <motion.span
                        className="inline-flex"
                        variants={{
                            idle: { opacity: 0, x: -8, width: 0 },
                            hover: { opacity: 1, x: 0, width: "auto" },
                        }}
                        transition={{
                            type: "spring",
                            bounce: 0.1,
                            duration: 0.5,
                        }}
                    >
                        <ArrowRight size={size === "sm" ? 14 : size === "md" ? 16 : 18} />
                    </motion.span>
                )}
            </motion.span>
        </motion.span>
    );

    if (href) {
        const isExternal = href.startsWith("http") || href.startsWith("//");

        if (isExternal || newTab) {
            return (
                <a
                    href={href}
                    target={newTab ? "_blank" : undefined}
                    rel={newTab ? "noopener noreferrer" : undefined}
                    className="inline-flex w-full sm:w-auto"
                >
                    {content}
                </a>
            );
        }

        return (
            <Link href={href} className="inline-flex w-full sm:w-auto">
                {content}
            </Link>
        );
    }

    return (
        <button onClick={onClick} className="inline-flex w-full sm:w-auto">
            {content}
        </button>
    );
}
