"use client";

import { Toaster as Sonner } from "sonner";

function Toaster() {
  return (
    <Sonner
      position="bottom-right"
      richColors
      toastOptions={{
        style: {
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', system-ui, sans-serif",
        },
      }}
    />
  );
}

export { Toaster };
