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

/**
 * Normalize a recipe URL for deduplication purposes
 * - YouTube URLs: normalizes to canonical format (https://www.youtube.com/watch?v=VIDEO_ID)
 * - Blog URLs: removes query params, fragments, trailing slashes, normalizes hostname
 */
export function normalizeRecipeUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    
    // Normalize hostname: lowercase and remove www./m. prefixes
    const hostname = urlObj.hostname.toLowerCase().replace(/^(www\.|m\.)/i, "");
    
    // Check if it's a YouTube URL
    if (hostname === "youtube.com" || hostname === "youtu.be") {
      const videoId = extractYouTubeVideoId(url);
      if (videoId) {
        // Return canonical YouTube URL format
        return `https://www.youtube.com/watch?v=${videoId}`;
      }
    }
    
    // For blog URLs: normalize
    // Remove fragment
    urlObj.hash = "";
    
    // Remove common tracking query params but preserve essential ones
    const paramsToRemove = [
      "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term",
      "fbclid", "gclid", "ref", "source", "mc_cid", "mc_eid"
    ];
    paramsToRemove.forEach(param => urlObj.searchParams.delete(param));
    
    // Remove all query params for most blog URLs (they're usually not needed for content)
    // Exception: preserve params that might be needed for content access
    urlObj.search = "";
    
    // Normalize protocol to https
    urlObj.protocol = "https:";
    
    // Normalize hostname
    urlObj.hostname = hostname;
    
    // Remove trailing slash from pathname (unless it's just "/")
    if (urlObj.pathname.length > 1 && urlObj.pathname.endsWith("/")) {
      urlObj.pathname = urlObj.pathname.slice(0, -1);
    }
    
    return urlObj.toString();
  } catch {
    // If URL parsing fails, return original (lowercased and trimmed)
    return url.toLowerCase().trim();
  }
}

/**
 * Extract YouTube video ID from various URL formats
 * Supports: youtube.com/watch, youtu.be, youtube.com/embed, youtube.com/shorts, youtube.com/live
 */
function extractYouTubeVideoId(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase().replace(/^(www\.|m\.)/i, "");
    
    if (hostname === "youtube.com") {
      // Standard watch URL
      if (urlObj.pathname === "/watch") {
        return urlObj.searchParams.get("v");
      }
      // Embed URL
      if (urlObj.pathname.startsWith("/embed/")) {
        return urlObj.pathname.split("/embed/")[1]?.split("?")[0] || null;
      }
      // Old-style URL
      if (urlObj.pathname.startsWith("/v/")) {
        return urlObj.pathname.split("/v/")[1]?.split("?")[0] || null;
      }
      // Shorts URL
      if (urlObj.pathname.startsWith("/shorts/")) {
        return urlObj.pathname.split("/shorts/")[1]?.split("?")[0] || null;
      }
      // Live URL
      if (urlObj.pathname.startsWith("/live/")) {
        return urlObj.pathname.split("/live/")[1]?.split("?")[0] || null;
      }
    }
    
    if (hostname === "youtu.be") {
      return urlObj.pathname.slice(1).split("?")[0] || null;
    }
    
    return null;
  } catch {
    return null;
  }
}
