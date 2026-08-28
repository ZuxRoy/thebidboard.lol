import { useEffect } from "react";
import { sendHeartbeat } from "./api";

const STORAGE_KEY = "tbb_visitor_id";
const HEARTBEAT_INTERVAL_MS = 20_000;

function createVisitorId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `v_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

export function getVisitorId(): string {
  if (typeof window === "undefined") return createVisitorId();
  try {
    const existing = window.localStorage.getItem(STORAGE_KEY);
    if (existing) return existing;
    const created = createVisitorId();
    window.localStorage.setItem(STORAGE_KEY, created);
    return created;
  } catch {
    return createVisitorId();
  }
}

export function usePresenceHeartbeat() {
  useEffect(() => {
    const visitorId = getVisitorId();
    sendHeartbeat(visitorId);

    const interval = window.setInterval(() => {
      sendHeartbeat(visitorId);
    }, HEARTBEAT_INTERVAL_MS);

    function handleVisibility() {
      if (document.visibilityState === "visible") {
        sendHeartbeat(visitorId);
      }
    }
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);
}
