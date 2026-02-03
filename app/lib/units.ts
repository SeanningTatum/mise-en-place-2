/**
 * Unit normalization and metric conversion utilities
 *
 * All quantities are stored in metric units on the backend:
 * - Volume: milliliters (ml)
 * - Weight: grams (g)
 *
 * Original units are preserved for display purposes.
 */

// Canonical unit names (normalized form)
export type VolumeUnit = "ml" | "l";
export type WeightUnit = "g" | "kg";
export type CountUnit = "piece" | "pinch" | "dash" | "to taste";
export type MetricUnit = VolumeUnit | WeightUnit;

// Unit aliases map to canonical names
const UNIT_ALIASES: Record<string, string> = {
  // Volume - US
  cup: "cup",
  cups: "cup",
  c: "cup",
  tablespoon: "tablespoon",
  tablespoons: "tablespoon",
  tbsp: "tablespoon",
  tbs: "tablespoon",
  tb: "tablespoon",
  teaspoon: "teaspoon",
  teaspoons: "teaspoon",
  tsp: "teaspoon",
  ts: "teaspoon",
  "fluid ounce": "fl oz",
  "fluid ounces": "fl oz",
  "fl oz": "fl oz",
  "fl. oz": "fl oz",
  floz: "fl oz",
  pint: "pint",
  pints: "pint",
  pt: "pint",
  quart: "quart",
  quarts: "quart",
  qt: "quart",
  gallon: "gallon",
  gallons: "gallon",
  gal: "gallon",

  // Volume - Metric
  milliliter: "ml",
  milliliters: "ml",
  ml: "ml",
  liter: "l",
  liters: "l",
  litre: "l",
  litres: "l",
  l: "l",

  // Weight - US
  pound: "lb",
  pounds: "lb",
  lb: "lb",
  lbs: "lb",
  ounce: "oz",
  ounces: "oz",
  oz: "oz",

  // Weight - Metric
  gram: "g",
  grams: "g",
  g: "g",
  kilogram: "kg",
  kilograms: "kg",
  kg: "kg",

  // Count/Other
  piece: "piece",
  pieces: "piece",
  pc: "piece",
  pcs: "piece",
  whole: "piece",
  clove: "clove",
  cloves: "clove",
  slice: "slice",
  slices: "slice",
  pinch: "pinch",
  pinches: "pinch",
  dash: "dash",
  dashes: "dash",
  bunch: "bunch",
  bunches: "bunch",
  sprig: "sprig",
  sprigs: "sprig",
  head: "head",
  heads: "head",
  stalk: "stalk",
  stalks: "stalk",
  can: "can",
  cans: "can",
  package: "package",
  packages: "package",
  pkg: "package",
  stick: "stick",
  sticks: "stick",
  large: "large",
  medium: "medium",
  small: "small",
};

// Conversion factors to metric base units (ml for volume, g for weight)
interface ConversionRule {
  metricUnit: MetricUnit;
  factor: number;
}

const METRIC_CONVERSIONS: Record<string, ConversionRule> = {
  // Volume to ml
  cup: { metricUnit: "ml", factor: 236.588 },
  tablespoon: { metricUnit: "ml", factor: 14.787 },
  teaspoon: { metricUnit: "ml", factor: 4.929 },
  "fl oz": { metricUnit: "ml", factor: 29.574 },
  pint: { metricUnit: "ml", factor: 473.176 },
  quart: { metricUnit: "ml", factor: 946.353 },
  gallon: { metricUnit: "ml", factor: 3785.41 },
  ml: { metricUnit: "ml", factor: 1 },
  l: { metricUnit: "ml", factor: 1000 },

  // Weight to g
  lb: { metricUnit: "g", factor: 453.592 },
  oz: { metricUnit: "g", factor: 28.3495 },
  g: { metricUnit: "g", factor: 1 },
  kg: { metricUnit: "g", factor: 1000 },
};

// Units that cannot be converted (count-based)
const NON_CONVERTIBLE_UNITS = new Set([
  "piece",
  "clove",
  "slice",
  "pinch",
  "dash",
  "bunch",
  "sprig",
  "head",
  "stalk",
  "can",
  "package",
  "stick",
  "large",
  "medium",
  "small",
]);

/**
 * Normalize a unit string to its canonical form
 * @param unit - Raw unit string (e.g., "cups", "tbsp", "Tablespoons")
 * @returns Normalized unit string (e.g., "cup", "tablespoon", "tablespoon")
 */
export function normalizeUnit(unit: string | null | undefined): string | null {
  if (!unit) return null;

  const normalized = unit.toLowerCase().trim();
  return UNIT_ALIASES[normalized] || normalized;
}

/**
 * Check if a unit can be converted to metric
 */
export function isConvertibleUnit(unit: string): boolean {
  const normalized = normalizeUnit(unit);
  if (!normalized) return false;
  return normalized in METRIC_CONVERSIONS;
}

/**
 * Parse a quantity string that may contain fractions
 * @param quantity - Quantity string (e.g., "1", "1/2", "1 1/2", "0.5")
 * @returns Parsed number or null if unparseable
 */
export function parseQuantity(quantity: string | null | undefined): number | null {
  if (!quantity) return null;

  const trimmed = quantity.trim();

  // Handle pure decimal/integer
  if (/^[\d.]+$/.test(trimmed)) {
    const num = parseFloat(trimmed);
    return isNaN(num) ? null : num;
  }

  // Handle fractions like "1/2"
  if (/^\d+\/\d+$/.test(trimmed)) {
    const [num, denom] = trimmed.split("/").map(Number);
    return denom === 0 ? null : num / denom;
  }

  // Handle mixed fractions like "1 1/2" or "1-1/2"
  const mixedMatch = trimmed.match(/^(\d+)[\s-]+(\d+)\/(\d+)$/);
  if (mixedMatch) {
    const whole = parseInt(mixedMatch[1], 10);
    const num = parseInt(mixedMatch[2], 10);
    const denom = parseInt(mixedMatch[3], 10);
    return denom === 0 ? null : whole + num / denom;
  }

  // Handle ranges like "2-3" - take the average
  const rangeMatch = trimmed.match(/^([\d.]+)\s*-\s*([\d.]+)$/);
  if (rangeMatch) {
    const low = parseFloat(rangeMatch[1]);
    const high = parseFloat(rangeMatch[2]);
    if (!isNaN(low) && !isNaN(high)) {
      return (low + high) / 2;
    }
  }

  return null;
}

/**
 * Convert a quantity and unit to metric
 * @param quantity - Numeric quantity or quantity string
 * @param unit - Unit string
 * @returns Metric conversion result or null if not convertible
 */
export function toMetric(
  quantity: number | string | null | undefined,
  unit: string | null | undefined
): { quantity: number; unit: MetricUnit } | null {
  const normalizedUnit = normalizeUnit(unit);
  if (!normalizedUnit) return null;

  const numericQuantity =
    typeof quantity === "number" ? quantity : parseQuantity(quantity as string);
  if (numericQuantity === null) return null;

  const conversion = METRIC_CONVERSIONS[normalizedUnit];
  if (!conversion) return null;

  return {
    quantity: Math.round(numericQuantity * conversion.factor * 100) / 100, // Round to 2 decimal places
    unit: conversion.metricUnit,
  };
}

/**
 * Convert from metric to a target unit (for display)
 * @param metricQuantity - Quantity in metric units
 * @param metricUnit - Metric unit (ml or g)
 * @param targetUnit - Target unit to convert to
 * @returns Converted quantity or null if not convertible
 */
export function fromMetric(
  metricQuantity: number,
  metricUnit: MetricUnit,
  targetUnit: string
): number | null {
  const normalizedTarget = normalizeUnit(targetUnit);
  if (!normalizedTarget) return null;

  const conversion = METRIC_CONVERSIONS[normalizedTarget];
  if (!conversion) return null;

  // Verify the metric units are compatible
  if (conversion.metricUnit !== metricUnit) return null;

  return Math.round((metricQuantity / conversion.factor) * 100) / 100;
}

/**
 * Format a metric quantity for display with appropriate unit scaling
 * For example, 1500ml -> 1.5l, 2000g -> 2kg
 */
export function formatMetricQuantity(
  quantity: number,
  unit: MetricUnit
): { quantity: number; unit: string } {
  if (unit === "ml" && quantity >= 1000) {
    return {
      quantity: Math.round((quantity / 1000) * 100) / 100,
      unit: "l",
    };
  }

  if (unit === "g" && quantity >= 1000) {
    return {
      quantity: Math.round((quantity / 1000) * 100) / 100,
      unit: "kg",
    };
  }

  return { quantity: Math.round(quantity * 100) / 100, unit };
}

/**
 * Check if a unit is count-based (not volume/weight)
 */
export function isCountUnit(unit: string | null | undefined): boolean {
  const normalized = normalizeUnit(unit);
  if (!normalized) return true; // No unit = count-based
  return NON_CONVERTIBLE_UNITS.has(normalized);
}

/**
 * Get the metric type for a unit (volume, weight, or count)
 */
export function getUnitType(
  unit: string | null | undefined
): "volume" | "weight" | "count" {
  const normalized = normalizeUnit(unit);
  if (!normalized) return "count";

  const conversion = METRIC_CONVERSIONS[normalized];
  if (!conversion) return "count";

  return conversion.metricUnit === "ml" ? "volume" : "weight";
}

/**
 * Process an ingredient for storage - converts to metric if possible
 * @returns Object with both original and metric values
 */
export function processIngredientForStorage(
  quantity: string | null | undefined,
  unit: string | null | undefined
): {
  quantity: string | null;
  unit: string | null;
  quantityMetric: number | null;
  unitMetric: "ml" | "g" | null;
} {
  const normalizedUnit = normalizeUnit(unit);
  const metric = toMetric(quantity, unit);

  return {
    quantity: quantity?.trim() || null,
    unit: normalizedUnit,
    quantityMetric: metric?.quantity ?? null,
    unitMetric: metric?.unit ?? null,
  };
}
