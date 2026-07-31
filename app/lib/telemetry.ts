export const telemetryEvents = ["arrival", "entered_guest", "entered_registered", "opened_gallery", "opened_terminal", "posted_photo"] as const;
export type TelemetryEvent = (typeof telemetryEvents)[number];

const anonymousIdKey = "vivico-anonymous-id";

function anonymousId() {
  try {
    const current = window.localStorage.getItem(anonymousIdKey);
    if (current && /^[0-9a-f-]{36}$/i.test(current)) return current;
    const created = crypto.randomUUID();
    window.localStorage.setItem(anonymousIdKey, created);
    return created;
  } catch { return null; }
}

export function trackAnonymous(event: TelemetryEvent) {
  const visitorId = anonymousId();
  if (!visitorId) return;
  void fetch("/api/telemetry", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ visitorId, event }),
    keepalive: true,
  }).catch(() => undefined);
}
