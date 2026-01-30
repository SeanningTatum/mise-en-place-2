// Client-side exports
export { PHProvider, useAnalytics, posthog } from "./provider";

// Server-side exports
export {
  createPostHogClient,
  getFeatureFlag,
  captureEvent,
  shutdownPostHog,
} from "./server";

// Feature flag exports
export {
  FEATURE_FLAGS,
  DEFAULT_FEATURE_FLAGS,
  FLAG_KEY_TO_DEFAULT,
  type FeatureFlagKey,
  type FeatureFlags,
} from "./feature-flags";
