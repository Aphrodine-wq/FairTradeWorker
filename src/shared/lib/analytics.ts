import posthog from "posthog-js";

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST =
  process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";

export function initAnalytics() {
  if (typeof window !== "undefined" && POSTHOG_KEY) {
    posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,
      capture_pageview: true,
    });
  }
}

export function identify(
  userId: string,
  properties?: Record<string, any>
) {
  if (POSTHOG_KEY) posthog.identify(userId, properties);
}

export function track(event: string, properties?: Record<string, any>) {
  if (POSTHOG_KEY) posthog.capture(event, properties);
}

export function reset() {
  if (POSTHOG_KEY) posthog.reset();
}
