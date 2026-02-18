import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatCurrency = (value: number | string) => {
  if (value === undefined || value === null || value === "") return "";
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return "";

  return new Intl.NumberFormat("it-IT", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
};

export const formatCurrencyInput = (value: string) => {
  // Remove non-digit characters except comma
  const raw = value.replace(/[^\d,]/g, "");
  if (!raw) return "";

  // Split integer and decimal parts
  const parts = raw.split(",");
  const integerPart = parts[0];
  const decimalPart = parts[1] !== undefined ? "," + parts[1].slice(0, 2) : "";

  // Format integer part with dots
  const formattedInteger = new Intl.NumberFormat("it-IT").format(BigInt(integerPart || "0"));

  // Return formatted string
  if (!integerPart && !decimalPart) return "";

  return (integerPart ? formattedInteger : "0") + decimalPart;
};

export const parseCurrency = (value: string): number => {
  if (!value) return 0;
  // Remove dots and replace comma with dot for parsing
  const clean = value.replace(/\./g, "").replace(",", ".");
  const parsed = parseFloat(clean);
  return isNaN(parsed) ? 0 : parsed;
};
