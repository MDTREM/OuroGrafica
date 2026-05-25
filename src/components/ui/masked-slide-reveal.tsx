"use client";

import { spring, useCurrentFrame, useVideoConfig } from "remotion";

export interface MaskedSlideRevealProps {
  text: string;
  staggerDelay?: number;
  fontSize?: number | string;
  color?: string;
  fontWeight?: number | string;
  speed?: number;
  className?: string;
}

export function MaskedSlideReveal({
  text,
  staggerDelay = 3,
  fontSize = 72,
  color = "#171717",
  fontWeight = 700,
  speed = 1,
  className,
}: MaskedSlideRevealProps) {
  const frame = useCurrentFrame() * speed;
  const { fps } = useVideoConfig();

  const words = text.split(" ");

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "transparent",
      }}
    >
      <span
        className={className}
        style={{
          fontSize,
          fontWeight,
          color,
          letterSpacing: "-0.03em",
          fontFamily:
            "var(--font-outfit), -apple-system, BlinkMacSystemFont, sans-serif",
          textAlign: "center",
          display: "inline-block",
          width: "100%",
        }}
      >
        {words.map((word, i) => {
          const t = spring({
            frame: frame - i * staggerDelay,
            fps,
            config: { damping: 14 },
          });

          // Check if the word is DEVORA (ignoring punctuation)
          const cleanWord = word.toUpperCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
          const isDevora = cleanWord === "DEVORA";

          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                overflow: "hidden",
                verticalAlign: "bottom",
                lineHeight: 1.1,
                marginRight: "0.22em",
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  transform: `translateY(${(1 - t) * 100}%)`,
                  color: isDevora ? "#15cb98" : color,
                  fontWeight: isDevora ? "bold" : fontWeight,
                  fontStyle: isDevora ? "italic" : "normal",
                }}
              >
                {word}
              </span>
            </span>
          );
        })}
      </span>
    </div>
  );
}
