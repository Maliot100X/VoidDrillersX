import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(num: number): string {
  if (num < 1_000_000) return Math.floor(num).toLocaleString();
  if (num < 1_000_000_000) return (num / 1_000_000).toFixed(2) + 'M';
  if (num < 1_000_000_000_000) return (num / 1_000_000_000).toFixed(2) + 'B';
  if (num < 1_000_000_000_000_000) return (num / 1_000_000_000_000).toFixed(2) + 'T';
  return (num / 1_000_000_000_000_000).toFixed(2) + 'Q';
}
