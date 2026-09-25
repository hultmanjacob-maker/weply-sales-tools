import { createServerFn } from "@tanstack/react-start";

export type EmbedCheck = { embeddable: boolean; known: boolean };

function isBlocked(headers: Headers, origin: string): boolean {
  const xfo = (headers.get("x-frame-options") ?? "").toLowerCase();
  if (xfo.includes("deny") || xfo.includes("sameorigin") || xfo.includes("allow-from")) {
    return true;
  }
  const csp = (headers.get("content-security-policy") ?? "").toLowerCase();
  const match = csp.match(/frame-ancestors([^;]*)/);
  if (match) {
    const value = (match[1] ?? "").trim();
    const tokens = value.split(/\s+/).filter(Boolean);
    // 'none' or a list that contains neither a wildcard nor our own origin blocks us.
    const normalizedOrigin = origin.toLowerCase().replace(/\/+$/, "");
    const allowed = tokens.some(
      (t) => t === "*" || t.replace(/\/+$/, "") === normalizedOrigin,
    );
    if (!allowed) return true;
  }
  return false;
}

export const checkEmbeddable = createServerFn({ method: "POST" })
  .inputValidator((data: { url: string; origin: string }) => {
    if (!data?.url || !/^https?:\/\//i.test(data.url)) throw new Error("Invalid url");
    if (!data?.origin || !/^https?:\/\//i.test(data.origin)) throw new Error("Invalid origin");
    return { url: data.url, origin: data.origin };
  })
  .handler(async ({ data }): Promise<EmbedCheck> => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    try {
      let res: Response;
      try {
        res = await fetch(data.url, { method: "HEAD", redirect: "follow", signal: controller.signal });
        if (!res.ok || res.status === 405) {
          res = await fetch(data.url, { method: "GET", redirect: "follow", signal: controller.signal });
        }
      } catch {
        res = await fetch(data.url, { method: "GET", redirect: "follow", signal: controller.signal });
      }
      return { embeddable: !isBlocked(res.headers), known: true };
    } catch {
      // Unknown — let the iframe try as before.
      return { embeddable: true, known: false };
    } finally {
      clearTimeout(timer);
    }
  });
