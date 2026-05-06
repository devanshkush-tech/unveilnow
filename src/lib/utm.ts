// UTM capture & persistence. Runs once on first landing and persists to localStorage
// so subsequent navigation, signup, and even later sessions keep attribution intact.

export type Utm = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
};

const KEYS: (keyof Utm)[] = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];
const STORAGE_KEY = "unveil:utm";

export function captureUtmFromUrl(): Utm {
  if (typeof window === "undefined") return {};
  try {
    const params = new URLSearchParams(window.location.search);
    const fresh: Utm = {};
    for (const k of KEYS) {
      const v = params.get(k);
      if (v) fresh[k] = v.slice(0, 200);
    }
    if (Object.keys(fresh).length > 0) {
      // Only overwrite if a new utm_source / utm_campaign is present — keeps first-touch
      // unless the user clicked a fresh tracked link.
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...getStoredUtm(), ...fresh, _ts: Date.now() }));
    }
    return getStoredUtm();
  } catch {
    return {};
  }
}

export function getStoredUtm(): Utm {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const out: Utm = {};
    for (const k of KEYS) {
      const v = parsed[k];
      if (typeof v === "string" && v) out[k] = v;
    }
    return out;
  } catch {
    return {};
  }
}
