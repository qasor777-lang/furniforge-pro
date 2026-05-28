// Lightweight client-side analytics (localStorage based)
// In production, replace with a real analytics backend

type AnalyticsEvent = {
  action: "page_view" | "save" | "export" | "3d_interact" | "add_model" | "undo" | "redo";
  page: string;
  ts: string;
  metadata?: Record<string, any>;
};

const STORAGE_KEY = "ff_analytics";
const MAX_EVENTS = 500;

export function track(action: AnalyticsEvent["action"], metadata?: Record<string, any>) {
  try {
    const events: AnalyticsEvent[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    events.push({
      action,
      page: typeof window !== "undefined" ? window.location.pathname : "",
      ts: new Date().toISOString(),
      metadata,
    });
    if (events.length > MAX_EVENTS) events.shift();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  } catch {
    // localStorage may be disabled
  }
}

export function getEvents(): AnalyticsEvent[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}
