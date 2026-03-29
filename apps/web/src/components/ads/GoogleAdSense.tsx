"use client";

import Script from "next/script";
import { useEffect, useRef } from "react";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

const CLIENT = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT_ID ?? "";

function slotFor(placement: string): string {
  const map: Record<string, string | undefined> = {
    top: process.env.NEXT_PUBLIC_GOOGLE_AD_SLOT_TOP,
    bottom: process.env.NEXT_PUBLIC_GOOGLE_AD_SLOT_BOTTOM,
    "rail-left": process.env.NEXT_PUBLIC_GOOGLE_AD_SLOT_RAIL_LEFT,
    "rail-right": process.env.NEXT_PUBLIC_GOOGLE_AD_SLOT_RAIL_RIGHT,
  };
  return map[placement] ?? "";
}

export function AdSenseLoader() {
  if (!CLIENT) return null;
  return (
    <Script
      id="adsense-script"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${CLIENT}`}
      strategy="afterInteractive"
      crossOrigin="anonymous"
    />
  );
}

export type AdPlacement = "top" | "bottom" | "rail-left" | "rail-right";

const PLACEHOLDER: Record<AdPlacement, string> = {
  top: "min-h-[90px] w-full",
  bottom: "min-h-[90px] w-full",
  "rail-left": "min-h-[280px] w-full max-w-[160px] mx-auto",
  "rail-right": "min-h-[280px] w-full",
};

export function AdSlot({
  placement,
  className = "",
}: {
  placement: AdPlacement;
  className?: string;
}) {
  const insRef = useRef<HTMLModElement>(null);
  const slot = slotFor(placement);
  const active = Boolean(CLIENT && slot);

  useEffect(() => {
    if (!active || !insRef.current) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      /* empty */
    }
  }, [active, placement, slot]);

  if (!active) {
    return (
      <div
        className={`flex items-center justify-center rounded-lg border border-dashed border-zinc-700/80 bg-zinc-900/30 text-[11px] uppercase tracking-wide text-zinc-600 ${PLACEHOLDER[placement]} ${className}`}
        aria-label="Advertisement placeholder"
      >
        Ad space
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <ins
        ref={insRef}
        className="adsbygoogle block"
        style={{ display: "block" }}
        data-ad-client={CLIENT}
        data-ad-slot={slot}
        data-ad-format={placement.startsWith("rail") ? "vertical" : "horizontal"}
        data-full-width-responsive="true"
      />
    </div>
  );
}
