/**
 * Feature flag keys - centralized constants for type-safe feature flag access
 */
export const FEATURE_FLAGS = {
  // Add feature flags here as needed
  // Example: DOCUMENT_UPLOAD: "feature-document-upload",
} as const;

/**
 * Type for feature flag keys
 */
export type FeatureFlagKey = (typeof FEATURE_FLAGS)[keyof typeof FEATURE_FLAGS];

/**
 * Type for feature flags passed from loaders to components
 */
export interface FeatureFlags {
  // Add feature flag properties here as needed
  // Example: documentUploadEnabled: boolean;
}

/**
 * Default feature flag values (used in development or when PostHog unavailable)
 */
export const DEFAULT_FEATURE_FLAGS: FeatureFlags = {
  // Add default values here as needed
  // Example: documentUploadEnabled: false,
};

/**
 * Mapping from PostHog flag keys to their default values
 */
export const FLAG_KEY_TO_DEFAULT: Record<string, boolean> = {
  // Will be populated as flags are added
  // Example: [FEATURE_FLAGS.DOCUMENT_UPLOAD]: false,
};
