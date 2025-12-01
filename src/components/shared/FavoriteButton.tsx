"use client";

import { Heart } from "lucide-react";
import { useFavorites, FavoriteType } from "@/hooks/useFavorites";
import { useState, useEffect } from "react";

interface FavoriteButtonProps {
  id: number;
  type: FavoriteType;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export function FavoriteButton({ id, type, size = "md", showLabel = false }: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite, isLoaded } = useFavorites();
  const [isAnimating, setIsAnimating] = useState(false);
  const favorite = isLoaded && isFavorite(id, type);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    toggleFavorite(id, type);
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);
  };

  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  };

  const iconSizes = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  if (!isLoaded) {
    return (
      <button
        className={`${sizeClasses[size]} flex items-center justify-center rounded-full border border-slate-200 bg-white transition-colors`}
        disabled
      >
        <Heart className={`${iconSizes[size]} text-slate-300`} />
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className={`${sizeClasses[size]} group flex items-center justify-center rounded-full border transition-all ${
        favorite
          ? "border-red-200 bg-red-50 hover:bg-red-100"
          : "border-slate-200 bg-white hover:border-red-200 hover:bg-red-50"
      } ${isAnimating ? "scale-110" : ""}`}
      aria-label={favorite ? "Favorilerden çıkar" : "Favorilere ekle"}
      title={favorite ? "Favorilerden çıkar" : "Favorilere ekle"}
    >
      <Heart
        className={`${iconSizes[size]} transition-all ${
          favorite
            ? "fill-red-500 text-red-500"
            : "text-slate-400 group-hover:text-red-500"
        }`}
      />
      {showLabel && (
        <span className="ml-2 text-sm font-medium">
          {favorite ? "Favorilerde" : "Favorilere Ekle"}
        </span>
      )}
    </button>
  );
}
