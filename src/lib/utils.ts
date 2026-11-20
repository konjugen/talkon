import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function countWords(text: string): number {
  if (!text || !text.trim()) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function generateAnonymousHandle(): string {
  const adjectives = [
    "Sessiz", "Meraklı", "Gece", "Uzak", "Felsefi", "Derin", "Hızlı", 
    "Sakin", "Gizemli", "Özgür", "Kutup", "Mavi", "Altın", "Gölge"
  ];
  const nouns = [
    "Dinleyici", "Yolcu", "Düşünür", "Baykuş", "Fener", "Rüzgar", 
    "Pusula", "Yıldız", "Atlas", "Gözlemci", "Martı", "Ses"
  ];
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const num = Math.floor(100 + Math.random() * 900);
  return `${adj}${noun} #${num}`;
}
