"use client";

import { useEffect } from "react";
import posthog from "posthog-js";
import { PostHogProvider, usePostHog } from "@posthog/react";

const POSTHOG_HOST = "https://us.i.posthog.com";

interface User {
  id: string;
  email: string;
  name: string;
}

interface PHProviderProps {
  children: React.ReactNode;
  apiKey: string | undefined;
  user: User | null;
}

/**
 * Component that handles user identification with PostHog
 */
function PostHogIdentify({ user }: { user: User | null }) {
  const posthogClient = usePostHog();

  useEffect(() => {
    if (!posthogClient) return;

    if (user) {
      posthogClient.identify(user.id, {
        email: user.email,
        name: user.name,
      });
    }
  }, [user, posthogClient]);

  return null;
}

/**
 * PostHog Provider component
 * Wraps the application with PostHog context and handles user identification
 */
export function PHProvider({ children, apiKey, user }: PHProviderProps) {
  useEffect(() => {
    if (!apiKey || typeof window === "undefined") return;

    // Only initialize if not already initialized
    if (posthog.__loaded) return;

    posthog.init(apiKey, {
      api_host: POSTHOG_HOST,
      person_profiles: "identified_only",
      capture_pageview: true,
      capture_pageleave: true,
      autocapture: true,
      session_recording: {
        maskAllInputs: false,
        maskInputOptions: {
          password: true,
        },
      },
      loaded: (ph) => {
        if (import.meta.env.DEV) {
          console.log("PostHog initialized in development mode");
        }
      },
    });
  }, [apiKey]);

  if (!apiKey || typeof window === "undefined") {
    return <>{children}</>;
  }

  return (
    <PostHogProvider client={posthog}>
      <PostHogIdentify user={user} />
      {children}
    </PostHogProvider>
  );
}

/**
 * Hook to track custom events
 */
export function useAnalytics() {
  const posthogClient = usePostHog();

  const trackEvent = (
    eventName: string,
    properties?: Record<string, unknown>
  ) => {
    if (posthogClient) {
      posthogClient.capture(eventName, properties);
    }
  };

  const reset = () => {
    if (posthogClient) {
      posthogClient.reset();
    }
  };

  return { trackEvent, reset, posthog: posthogClient };
}

export { posthog };
