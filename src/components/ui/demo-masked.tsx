"use client";

import { Player } from "@remotion/player";
import { MaskedSlideReveal } from "@/components/ui/masked-slide-reveal";

const MaskedSlideRevealScene = () => (
  <MaskedSlideReveal
    text="Reveal from the mask"
    staggerDelay={3}
    fontSize={72}
    color="#171717"
    fontWeight={700}
    speed={1}
  />
);

export default function DemoDefault() {
  return (
    <div className="w-full min-h-screen overflow-hidden bg-white">
      <Player
        component={MaskedSlideRevealScene}
        durationInFrames={90}
        fps={30}
        compositionWidth={1280}
        compositionHeight={720}
        controls={false}
        autoPlay
        loop
        style={{ width: "100vw", height: "100vh" }}
      />
    </div>
  );
}
