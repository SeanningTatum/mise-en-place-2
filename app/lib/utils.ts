import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Generate a unique ID for database records
 */
export function generateId(): string {
  return crypto.randomUUID();
}

/**
 * Chunk an array into smaller arrays of specified size
 * Useful for batching database inserts (e.g., D1 has a limit of 100 bound parameters per query)
 */
export function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}
