"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface FavoriteItem {
    id: string;
    title: string;
    price: string | number;
    image?: string;
    category?: string;
    unit?: string;
}

interface FavoritesContextType {
    favorites: FavoriteItem[];
    addToFavorites: (item: FavoriteItem) => void;
    removeFromFavorites: (id: string) => void;
    isFavorite: (id: string) => boolean;
    toggleFavorite: (item: FavoriteItem) => void;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: ReactNode }) {
    const [favorites, setFavorites] = useState<FavoriteItem[]>([]);

    useEffect(() => {
        const savedFavorites = localStorage.getItem("@ourografica:favorites");
        if (savedFavorites) {
            try {
                setFavorites(JSON.parse(savedFavorites));
            } catch (error) {
                console.error("Failed to parse favorites from local storage");
            }
        }
    }, []);

    useEffect(() => {
        localStorage.setItem("@ourografica:favorites", JSON.stringify(favorites));
    }, [favorites]);

    const addToFavorites = (item: FavoriteItem) => {
        setFavorites((prev) => {
            if (prev.some((i) => i.id === item.id)) return prev;
            return [...prev, item];
        });
    };

    const removeFromFavorites = (id: string) => {
        setFavorites((prev) => prev.filter((item) => item.id !== id));
    };

    const isFavorite = (id: string) => {
        return favorites.some((item) => item.id === id);
    };

    const toggleFavorite = (item: FavoriteItem) => {
        if (isFavorite(item.id)) {
            removeFromFavorites(item.id);
        } else {
            addToFavorites(item);
        }
    };

    return (
        <FavoritesContext.Provider value={{ favorites, addToFavorites, removeFromFavorites, isFavorite, toggleFavorite }}>
            {children}
        </FavoritesContext.Provider>
    );
}

export function useFavorites() {
    const context = useContext(FavoritesContext);
    if (context === undefined) {
        throw new Error("useFavorites must be used within a FavoritesProvider");
    }
    return context;
}
