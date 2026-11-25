"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

const PUBLIC_PATHS = new Set(["/", "/employer/pricing"]);
const TRACKER_ID = "payguard-public-analytics";
const TRACKER_URL = "https://analytics.bartlettlabs.io/api/script.js?siteId=af0207dc75c2&policy=public-v2";

type AnalyticsWindow = Window & { rybbit?: { pageview: () => void } };

export default function PublicAnalytics() {
  const pathname = usePathname();
  const previousPath = useRef<string | null>(null);

  useEffect(() => {
    if (previousPath.current === pathname) return;
    previousPath.current = pathname;

    const { hostname, pathname: browserPath } = window.location;
    if (hostname !== "payguard.bartlettlabs.io" || browserPath !== pathname || !PUBLIC_PATHS.has(pathname)) return;

    if (document.getElementById(TRACKER_ID)) {
      (window as AnalyticsWindow).rybbit?.pageview();
      return;
    }

    const script = document.createElement("script");
    script.id = TRACKER_ID;
    script.src = TRACKER_URL;
    script.async = true;
    script.dataset.skipPatterns = JSON.stringify(["re:^(?!/$|/employer/pricing$).+"]);
    script.addEventListener("error", () => script.remove(), { once: true });
    document.head.append(script);
  }, [pathname]);

  return null;
}
