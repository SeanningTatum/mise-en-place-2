import { PostHog } from "posthog-node";
import { FLAG_KEY_TO_DEFAULT, type FeatureFlagKey } from "./feature-flags";

const POSTHOG_HOST = "https://us.i.posthog.com";

/**
 * Create a PostHog client for Cloudflare Workers
 * Following: https://posthog.com/docs/libraries/cloudflare-workers
 *
 * IMPORTANT: We set flushAt to 1 and flushInterval to 0 to send data immediately.
 * Cloudflare Workers can terminate before batched data is sent, causing data loss.
 */
export function createPostHogClient(
  apiKey: string | undefined
): PostHog | null {
  if (!apiKey) {
    return null;
  }

  return new PostHog(apiKey, {
    host: POSTHOG_HOST,
    flushAt: 1, // Send events immediately in edge environment
    flushInterval: 0, // Don't wait for interval
  });
}

/**
 * Evaluate a feature flag for a specific user
 */
export async function getFeatureFlag(
  client: PostHog | null,
  distinctId: string,
  flagKey: FeatureFlagKey,
  defaultValue: boolean = false
): Promise<boolean> {
  // In local development, use the default values
  if (import.meta.env.DEV) {
    return FLAG_KEY_TO_DEFAULT[flagKey] ?? defaultValue;
  }

  if (!client || !distinctId) {
    return defaultValue;
  }

  try {
    const result = await client.isFeatureEnabled(flagKey, distinctId);
    return result ?? defaultValue;
  } catch (error) {
    console.error(
      `[PostHog] Error evaluating feature flag "${flagKey}":`,
      error
    );
    return defaultValue;
  }
}

/**
 * Capture a server-side event
 * Should be wrapped in ctx.waitUntil() to not block the response
 */
export async function captureEvent(
  client: PostHog | null,
  distinctId: string,
  event: string,
  properties?: Record<string, unknown>
): Promise<void> {
  if (!client || !distinctId) {
    return;
  }

  try {
    await client.captureImmediate({
      distinctId,
      event,
      properties,
    });
  } catch (error) {
    console.error(`[PostHog] Error capturing event "${event}":`, error);
  }
}

/**
 * Shutdown the PostHog client - call in ctx.waitUntil()
 * at the end of the request to ensure all events are flushed
 */
export async function shutdownPostHog(client: PostHog | null): Promise<void> {
  if (!client) {
    return;
  }

  try {
    await client.shutdown();
  } catch (error) {
    console.error("[PostHog] Error during shutdown:", error);
  }
}
