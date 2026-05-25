"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";

interface ImageComparisonProps {
    beforeImage: string;
    afterImage: string;
    altBefore?: string;
    altAfter?: string;
    className?: string;
}

// This component takes two image URLs (before and after) and creates a slider to compare them.
export const ImageComparison: React.FC<ImageComparisonProps> = ({
    beforeImage,
    afterImage,
    altBefore = "Antes",
    altAfter = "Depois",
    className = ""
}) => {
    // State to track the slider's position (from 0 to 100)
    const [sliderPosition, setSliderPosition] = useState(50);
    // State to track if the user is currently dragging the slider
    const [isDragging, setIsDragging] = useState(false);

    // Ref to the main container element to get its dimensions
    const containerRef = useRef<HTMLDivElement>(null);

    // Function to handle the slider movement (for both mouse and touch)
    const handleMove = useCallback(
        (clientX: number) => {
            // If not dragging or no container ref, do nothing
            if (!isDragging || !containerRef.current) return;

            // Get the bounding box of the container
            const rect = containerRef.current.getBoundingClientRect();
            // Calculate the new slider position as a percentage
            let newPosition = ((clientX - rect.left) / rect.width) * 100;

            // Clamp the position to be between 0 and 100 to prevent it from going out of bounds
            newPosition = Math.max(0, Math.min(100, newPosition));

            setSliderPosition(newPosition);
        },
        [isDragging]
    );

    // Mouse event handlers
    const handleMouseDown = () => setIsDragging(true);
    const handleMouseUp = () => setIsDragging(false);
    const handleMouseMove = (e: React.MouseEvent) => handleMove(e.clientX);

    // Touch event handlers
    const handleTouchStart = () => setIsDragging(true);
    const handleTouchEnd = () => setIsDragging(false);
    const handleTouchMove = (e: React.TouchEvent) => handleMove(e.touches[0].clientX);

    // Effect to add and clean up global event listeners for mouse up/leave
    // This ensures dragging stops even if the cursor leaves the component area
    useEffect(() => {
        const handleGlobalMouseUp = () => setIsDragging(false);
        window.addEventListener("mouseup", handleGlobalMouseUp);
        // Clean up the event listener when the component unmounts
        return () => {
            window.removeEventListener("mouseup", handleGlobalMouseUp);
        };
    }, []);

    return (
        <div
            ref={containerRef}
            className={`relative w-full max-w-4xl mx-auto select-none rounded-2xl overflow-hidden shadow-2xl border border-gray-150/50 bg-gray-50 aspect-[16/9] ${className}`}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseUp} // Stop dragging if mouse leaves the container
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            {/* After Image (Top Layer) - Its visibility is controlled by the clip-path */}
            <div
                className="absolute top-0 left-0 h-full w-full overflow-hidden z-10"
                style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
            >
                <img
                    src={beforeImage}
                    alt={altBefore}
                    className="absolute top-0 left-0 h-full w-full object-cover object-center grayscale"
                    draggable="false"
                />
                {/* Badge AMADOR */}
                <div className="absolute top-4 left-4 bg-red-600/90 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest backdrop-blur-sm z-30">
                    AMADOR
                </div>
            </div>

            {/* Before Image (Bottom Layer) */}
            <img
                src={afterImage}
                alt={altAfter}
                className="block h-full w-full object-cover object-center"
                draggable="false"
            />
            {/* Badge PREMIUM */}
            <div className="absolute top-4 right-4 bg-brand/90 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest backdrop-blur-sm z-20">
                PREMIUM
            </div>

            {/* Slider Handle */}
            <div
                className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize flex items-center justify-center z-25 group"
                style={{ left: `${sliderPosition}%` }}
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
            >
                <div
                    className={`bg-white rounded-full h-12 w-12 flex items-center justify-center shadow-2xl transition-all duration-300 ease-out border border-gray-100 ${
                        isDragging
                            ? "scale-110 ring-4 ring-brand/35 bg-brand text-white"
                            : "group-hover:scale-105 group-hover:ring-4 group-hover:ring-white/25 text-gray-700"
                    }`}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={isDragging ? "text-white" : "text-gray-700"}
                    >
                        <polyline points="15 18 9 12 15 6"></polyline>
                        <polyline points="9 18 15 12 9 6" className="opacity-40"></polyline>
                    </svg>
                </div>
            </div>
        </div>
    );
};
