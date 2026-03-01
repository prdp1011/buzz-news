"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function NavigationLoader() {
  const pathname = usePathname();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  // When pathname changes, navigation completed - finish the bar
  useEffect(() => {
    if (!visible) return;
    setProgress(100);
    const t = setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 200);
    return () => clearTimeout(t);
  }, [pathname]);

  // Listen for link clicks to start the bar immediately
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a[href]");
      if (!anchor) return;
      const href = (anchor as HTMLAnchorElement).getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;
      if (href.startsWith("http") && !href.startsWith(window.location.origin)) return;
      setVisible(true);
      setProgress(10);
      const t = setInterval(() => {
        setProgress((p) => Math.min(p + 15, 90));
      }, 100);
      const stop = () => {
        clearInterval(t);
      };
      setTimeout(stop, 2000);
      // Fallback: hide after 3s if pathname never changed (e.g. same page)
      setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 3000);
    };

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed top-0 left-0 z-[9999] h-[3px] bg-amber-400 transition-[width] duration-150 ease-out"
      style={{ width: `${progress}%` }}
    />
  );
}
