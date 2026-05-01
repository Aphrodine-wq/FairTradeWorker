"use client";

import { useEffect, useCallback, useState } from "react";
import Script from "next/script";
import { toast } from "sonner";
import { authStore, type UserRoleClient } from "@shared/lib/auth-store";
import { identify, track } from "@shared/lib/analytics";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";
const APPLE_SERVICE_ID = process.env.NEXT_PUBLIC_APPLE_SERVICE_ID || "";
const APPLE_REDIRECT_URI = process.env.NEXT_PUBLIC_APPLE_REDIRECT_URI || "";

declare global {
  interface Window {
    AppleID?: {
      auth: {
        init: (config: Record<string, unknown>) => void;
        signIn: () => Promise<{
          authorization: { id_token: string; code: string; state?: string };
          user?: { name?: { firstName?: string; lastName?: string }; email?: string };
        }>;
      };
    };
  }
}

interface OAuthButtonsProps {
  role?: UserRoleClient;
  /** Called with the authenticated user — page decides where to route */
  onSuccess: (role: string) => void;
  /** Optional event suffix for analytics (e.g. "login" or "signup") */
  trackEvent?: string;
  /** Width passed to Google's renderButton, defaults to 360 */
  buttonWidth?: number;
  /** Render the Google button into a unique DOM ID — required when used on
   *  multiple pages or shown twice on the same page */
  buttonId?: string;
}

export function OAuthButtons({
  role,
  onSuccess,
  trackEvent = "login",
  buttonWidth = 360,
  buttonId = "google-signin-button",
}: OAuthButtonsProps) {
  const [loading, setLoading] = useState(false);

  const onGoogleCredential = useCallback(
    async (credential: string) => {
      try {
        setLoading(true);
        const user = await authStore.loginWithGoogle(credential, role);
        identify(user.id, { email: user.email, role: user.role });
        track(trackEvent, { method: "google", role: user.role });
        onSuccess(user.role);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Google sign-in failed");
      } finally {
        setLoading(false);
      }
    },
    [role, onSuccess, trackEvent]
  );

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;
    type GsiResponse = { credential: string };
    type Gsi = {
      accounts: {
        id: {
          initialize: (cfg: { client_id: string; callback: (r: GsiResponse) => void }) => void;
          renderButton: (el: HTMLElement, opts: Record<string, unknown>) => void;
        };
      };
    };
    const init = () => {
      const w = window as unknown as { google?: Gsi };
      if (!w.google?.accounts?.id) return;
      w.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (r) => onGoogleCredential(r.credential),
      });
      const target = document.getElementById(buttonId);
      if (target) {
        target.innerHTML = "";
        w.google.accounts.id.renderButton(target, {
          theme: "outline",
          size: "large",
          text: "continue_with",
          width: buttonWidth,
        });
      }
    };
    init();
    window.addEventListener("gsi-loaded", init);
    return () => window.removeEventListener("gsi-loaded", init);
  }, [onGoogleCredential, buttonWidth, buttonId]);

  const onAppleScriptLoad = () => {
    if (!APPLE_SERVICE_ID || !window.AppleID) return;
    window.AppleID.auth.init({
      clientId: APPLE_SERVICE_ID,
      scope: "name email",
      redirectURI: APPLE_REDIRECT_URI || `${window.location.origin}/login`,
      usePopup: true,
    });
  };

  const onAppleSignIn = async () => {
    if (!APPLE_SERVICE_ID || typeof window === "undefined" || !window.AppleID) {
      toast.error("Apple sign-in not configured");
      return;
    }
    try {
      setLoading(true);
      const result = await window.AppleID.auth.signIn();
      const idToken = result.authorization.id_token;
      const name = result.user
        ? [result.user.name?.firstName, result.user.name?.lastName].filter(Boolean).join(" ")
        : undefined;
      const user = await authStore.loginWithApple(idToken, name, role);
      identify(user.id, { email: user.email, role: user.role });
      track(trackEvent, { method: "apple", role: user.role });
      onSuccess(user.role);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Apple sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  if (!GOOGLE_CLIENT_ID && !APPLE_SERVICE_ID) return null;

  return (
    <>
      {GOOGLE_CLIENT_ID && (
        <Script
          src="https://accounts.google.com/gsi/client"
          strategy="afterInteractive"
          onLoad={() => window.dispatchEvent(new Event("gsi-loaded"))}
        />
      )}
      {APPLE_SERVICE_ID && (
        <Script
          src="https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js"
          strategy="afterInteractive"
          onLoad={onAppleScriptLoad}
        />
      )}
      {GOOGLE_CLIENT_ID && (
        <div className="flex justify-center" id={buttonId} />
      )}
      {APPLE_SERVICE_ID && (
        <button
          type="button"
          onClick={onAppleSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2.5 h-11 rounded-md bg-black hover:bg-gray-900 text-white text-sm font-semibold transition-colors disabled:opacity-50"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.7 9.05 7.4c1.39.07 2.34.74 3.15.8 1.19-.24 2.33-.93 3.6-.84 1.53.12 2.68.72 3.43 1.9-3.15 1.88-2.4 5.98.82 7.14-.57 1.5-1.32 2.99-3 3.88zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
          </svg>
          Sign in with Apple
        </button>
      )}
    </>
  );
}
