export type ParamSource = {
  get(name: string): string | null;
};

export function isoDateDaysFromNow(daysFromNow = 1): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().slice(0, 10);
}

export function getParam(params: ParamSource, key: string, fallback: string): string {
  return params.get(key) ?? fallback;
}

export function getArrivalParam(params: ParamSource, fallbackDaysFromNow = 1): string {
  return params.get("arrival") ?? isoDateDaysFromNow(fallbackDaysFromNow);
}

export function buildPrefillParams(input: Record<string, string | number | undefined | null>): string {
  const qs = new URLSearchParams();
  qs.set("prefill", "1");
  for (const [key, value] of Object.entries(input)) {
    if (value === undefined || value === null) continue;
    qs.set(key, String(value));
  }
  return qs.toString();
}

export function buildQrPayload(input: { ref: string; name: string; arrival: string; sig?: string }): string {
  const { ref, name, arrival, sig } = input;
  return JSON.stringify(sig ? { ref, name, arrival, sig } : { ref, name, arrival });
}

export function getWifiCredentials(ref: string | null | undefined): { network: string; password: string } | null {
  if (!ref || ref === "—") return null;
  return {
    network: `GRANDMARINA-${ref.slice(-4).padStart(4, "0")}`,
    password: `${ref.toUpperCase()}2024`,
  };
}


