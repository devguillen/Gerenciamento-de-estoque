import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatQuantity(value: number | string | null | undefined) {
  const numberValue = Number(value ?? 0);
  if (Number.isNaN(numberValue)) return "0";
  if (Number.isInteger(numberValue)) {
    return String(numberValue);
  }
  return numberValue.toFixed(2).replace('.', ',');
}
