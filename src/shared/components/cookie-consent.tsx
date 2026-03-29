"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : null;
}

function setCookie(name: string, value: string, days: number) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = getCookie("ftw-cookie-consent");
    if (!consent) {
      setVisible(true);
    }
  }, []);

  function handleAccept() {
    setCookie("ftw-cookie-consent", "accepted", 365);
    setVisible(false);
  }

  function handleDecline() {
    setCookie("ftw-cookie-consent", "declined", 365);
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-border shadow-[0_-2px_8px_rgba(0,0,0,0.06)]">
      <div className="max-w-4xl mx-auto p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <p className="text-sm text-gray-800">
          We use cookies to improve your experience and analyze site traffic.{" "}
          <Link
            href="/privacy"
            className="text-brand-600 underline hover:text-brand-700 transition-colors duration-150"
          >
            Privacy Policy
          </Link>
        </p>
        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            onClick={handleDecline}
            className="px-4 py-2 text-sm text-gray-900 border border-border rounded-none hover:bg-gray-50 transition-colors duration-150"
          >
            Decline
          </button>
          <button
            onClick={handleAccept}
            className="px-4 py-2 text-sm text-white bg-brand-600 rounded-none hover:bg-brand-700 transition-colors duration-150"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
