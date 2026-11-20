"use client";

import React from "react";

interface AvatarProps {
  seed: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const colorPairs = [
  ["from-purple-500", "to-indigo-600"],
  ["from-emerald-400", "to-teal-600"],
  ["from-rose-500", "to-pink-600"],
  ["from-amber-400", "to-orange-500"],
  ["from-blue-500", "to-cyan-600"],
  ["from-violet-500", "to-fuchsia-600"],
];

export const Avatar: React.FC<AvatarProps> = ({ seed, size = "md", className = "" }) => {
  // Deterministic color selection from seed
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colorIndex = Math.abs(hash) % colorPairs.length;
  const [fromColor, toColor] = colorPairs[colorIndex];

  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-11 h-11 text-sm font-semibold",
    lg: "w-16 h-16 text-lg font-bold",
    xl: "w-20 h-20 text-2xl font-bold",
  };

  const initial = seed.charAt(0).toUpperCase();

  return (
    <div
      className={`rounded-full flex items-center justify-center text-white shadow-md bg-gradient-to-br ${fromColor} ${toColor} ${sizeClasses[size]} ${className} shrink-0 select-none`}
    >
      {initial}
    </div>
  );
};
