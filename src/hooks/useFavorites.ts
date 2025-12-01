"use client";

import { useState, useEffect } from "react";

export type FavoriteType = "country" | "blog" | "consultant";

interface Favorite {
  id: number;
  type: FavoriteType;
  addedAt: number;
}

const STORAGE_KEY = "kolay-seyahat-favorites";

export function useFavorites() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load favorites from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setFavorites(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Failed to load favorites:", error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save favorites to localStorage
  const saveFavorites = (newFavorites: Favorite[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newFavorites));
      setFavorites(newFavorites);
    } catch (error) {
      console.error("Failed to save favorites:", error);
    }
  };

  // Add to favorites
  const addFavorite = (id: number, type: FavoriteType) => {
    const newFavorite: Favorite = {
      id,
      type,
      addedAt: Date.now(),
    };
    const newFavorites = [...favorites, newFavorite];
    saveFavorites(newFavorites);
  };

  // Remove from favorites
  const removeFavorite = (id: number, type: FavoriteType) => {
    const newFavorites = favorites.filter(
      (fav) => !(fav.id === id && fav.type === type)
    );
    saveFavorites(newFavorites);
  };

  // Toggle favorite
  const toggleFavorite = (id: number, type: FavoriteType) => {
    if (isFavorite(id, type)) {
      removeFavorite(id, type);
    } else {
      addFavorite(id, type);
    }
  };

  // Check if item is favorite
  const isFavorite = (id: number, type: FavoriteType) => {
    return favorites.some((fav) => fav.id === id && fav.type === type);
  };

  // Get favorites by type
  const getFavoritesByType = (type: FavoriteType) => {
    return favorites
      .filter((fav) => fav.type === type)
      .sort((a, b) => b.addedAt - a.addedAt);
  };

  // Get all favorite IDs by type
  const getFavoriteIds = (type: FavoriteType) => {
    return getFavoritesByType(type).map((fav) => fav.id);
  };

  return {
    favorites,
    isLoaded,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    getFavoritesByType,
    getFavoriteIds,
    count: favorites.length,
  };
}
