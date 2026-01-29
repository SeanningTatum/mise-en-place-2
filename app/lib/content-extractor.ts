import * as cheerio from "cheerio";
import { Readability } from "@mozilla/readability";
import { parseHTML } from "linkedom";
import { createLayerLogger } from "./logger";

const log = createLayerLogger("server");

export interface ExtractedContent {
  title: string;
  content: string;
  thumbnailUrl: string | null;
  author: string | null;
}

export interface JsonLdRecipe {
  "@type": string;
  name: string;
  description?: string;
  image?: string | string[] | { url: string };
  author?: string | { name: string };
  recipeIngredient?: string[];
  recipeInstructions?: Array<string | { text: string }>;
  prepTime?: string;
  cookTime?: string;
  recipeYield?: string;
  nutrition?: {
    calories?: string;
    proteinContent?: string;
    carbohydrateContent?: string;
    fatContent?: string;
    fiberContent?: string;
  };
}

/**
 * Check if a URL is a blog/recipe site (not YouTube)
 */
export function isBlogUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    // Remove www. and m. prefixes for consistent matching
    const hostname = urlObj.hostname.replace(/^(www\.|m\.)/i, "");
    // Exclude YouTube URLs
    return hostname !== "youtube.com" && hostname !== "youtu.be";
  } catch {
    return false;
  }
}

/**
 * Extract JSON-LD Recipe schema from HTML
 * Many recipe websites use this structured data format
 */
export function extractJsonLdRecipe(html: string): JsonLdRecipe | null {
  const $ = cheerio.load(html);

  // Find all JSON-LD scripts
  const jsonLdScripts = $('script[type="application/ld+json"]');

  for (let i = 0; i < jsonLdScripts.length; i++) {
    try {
      const content = $(jsonLdScripts[i]).html();
      if (!content) continue;

      const data = JSON.parse(content);

      // Handle @graph format (common in WordPress recipe plugins)
      if (data["@graph"]) {
        const recipe = data["@graph"].find(
          (item: { "@type": string | string[] }) =>
            item["@type"] === "Recipe" ||
            (Array.isArray(item["@type"]) && item["@type"].includes("Recipe"))
        );
        if (recipe) return recipe as JsonLdRecipe;
      }

      // Handle direct Recipe type
      if (data["@type"] === "Recipe") {
        return data as JsonLdRecipe;
      }

      // Handle array format
      if (Array.isArray(data)) {
        const recipe = data.find(
          (item: { "@type": string | string[] }) =>
            item["@type"] === "Recipe" ||
            (Array.isArray(item["@type"]) && item["@type"].includes("Recipe"))
        );
        if (recipe) return recipe as JsonLdRecipe;
      }
    } catch {
      // JSON parse error, continue to next script
      continue;
    }
  }

  return null;
}

/**
 * Convert JSON-LD recipe to formatted text for Gemini processing
 */
export function formatJsonLdRecipeForExtraction(recipe: JsonLdRecipe): string {
  const parts: string[] = [];

  parts.push(`RECIPE TITLE: ${recipe.name}`);

  if (recipe.description) {
    parts.push(`\nDESCRIPTION: ${recipe.description}`);
  }

  if (recipe.recipeYield) {
    parts.push(`\nSERVINGS: ${recipe.recipeYield}`);
  }

  if (recipe.prepTime) {
    parts.push(`PREP TIME: ${recipe.prepTime}`);
  }

  if (recipe.cookTime) {
    parts.push(`COOK TIME: ${recipe.cookTime}`);
  }

  if (recipe.nutrition) {
    parts.push("\nNUTRITION (per serving):");
    if (recipe.nutrition.calories) parts.push(`- Calories: ${recipe.nutrition.calories}`);
    if (recipe.nutrition.proteinContent) parts.push(`- Protein: ${recipe.nutrition.proteinContent}`);
    if (recipe.nutrition.carbohydrateContent) parts.push(`- Carbs: ${recipe.nutrition.carbohydrateContent}`);
    if (recipe.nutrition.fatContent) parts.push(`- Fat: ${recipe.nutrition.fatContent}`);
    if (recipe.nutrition.fiberContent) parts.push(`- Fiber: ${recipe.nutrition.fiberContent}`);
  }

  if (recipe.recipeIngredient && recipe.recipeIngredient.length > 0) {
    parts.push("\nINGREDIENTS:");
    recipe.recipeIngredient.forEach((ingredient) => {
      parts.push(`- ${ingredient}`);
    });
  }

  if (recipe.recipeInstructions && recipe.recipeInstructions.length > 0) {
    parts.push("\nINSTRUCTIONS:");
    recipe.recipeInstructions.forEach((instruction, index) => {
      const text = typeof instruction === "string" ? instruction : instruction.text;
      parts.push(`${index + 1}. ${text}`);
    });
  }

  return parts.join("\n");
}

/**
 * Extract main content using Mozilla Readability
 */
export function extractWithReadability(html: string, url: string): ExtractedContent | null {
  try {
    const { document } = parseHTML(html);
    const reader = new Readability(document);
    const article = reader.parse();

    if (!article) {
      return null;
    }

    // Try to find a thumbnail image
    const $ = cheerio.load(html);
    const ogImage = $('meta[property="og:image"]').attr("content");
    const twitterImage = $('meta[name="twitter:image"]').attr("content");

    return {
      title: article.title || "Untitled",
      content: article.textContent || "",
      thumbnailUrl: ogImage || twitterImage || null,
      author: article.byline || null,
    };
  } catch (error) {
    log.error({ error, url }, "Readability extraction failed");
    return null;
  }
}

/**
 * Extract the image URL from JSON-LD recipe
 */
function extractImageUrl(image: JsonLdRecipe["image"]): string | null {
  if (!image) return null;
  if (typeof image === "string") return image;
  if (Array.isArray(image)) return image[0] || null;
  if (typeof image === "object" && "url" in image) return image.url;
  return null;
}

/**
 * Extract the author name from JSON-LD recipe
 */
function extractAuthorName(author: JsonLdRecipe["author"]): string | null {
  if (!author) return null;
  if (typeof author === "string") return author;
  if (typeof author === "object" && "name" in author) return author.name;
  return null;
}

/**
 * Fetch and extract content from a blog/recipe URL
 */
export async function extractBlogContent(url: string): Promise<ExtractedContent> {
  const startTime = Date.now();
  log.info({ url }, "Extracting blog content");

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; RecipeExtractor/1.0; +https://mise-en-place.app)",
        Accept: "text/html,application/xhtml+xml",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch page: ${response.status} ${response.statusText}`);
    }

    const html = await response.text();
    log.debug({ url, htmlLength: html.length }, "Page fetched successfully");

    // First, try to extract JSON-LD Recipe schema (most accurate)
    const jsonLdRecipe = extractJsonLdRecipe(html);
    if (jsonLdRecipe) {
      log.info({ url, method: "json-ld" }, "Found JSON-LD Recipe schema");
      const content = formatJsonLdRecipeForExtraction(jsonLdRecipe);

      const durationMs = Date.now() - startTime;
      log.info({ url, durationMs, contentLength: content.length }, "Blog content extracted via JSON-LD");

      return {
        title: jsonLdRecipe.name,
        content,
        thumbnailUrl: extractImageUrl(jsonLdRecipe.image),
        author: extractAuthorName(jsonLdRecipe.author),
      };
    }

    // Fallback to Readability for general content extraction
    log.debug({ url }, "No JSON-LD found, falling back to Readability");
    const readabilityContent = extractWithReadability(html, url);

    if (readabilityContent) {
      const durationMs = Date.now() - startTime;
      log.info({ url, durationMs, contentLength: readabilityContent.content.length }, "Blog content extracted via Readability");
      return readabilityContent;
    }

    throw new Error("Could not extract content from page");
  } catch (error) {
    log.error({ error, url }, "Failed to extract blog content");
    throw new Error(
      `Failed to extract content from URL: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}
