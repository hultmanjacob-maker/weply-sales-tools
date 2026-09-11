import { createServerFn } from "@tanstack/react-start";

export type EmbedCheck = { embeddable: boolean; known: boolean };

function isBlocked(headers: Headers): boolean {
  const xfo = (headers.get("x-frame-options") ?? "").toLowerCase();
  if (xfo.includes("deny") || xfo.includes("sameorigin") || xfo.includes("allow-from")) {
    return true;
  }
  const csp = (headers.get("content-security-policy") ?? "").toLowerCase();
  const match = csp.match(/frame-ancestors([^;]*)/);
  if (match) {
    const value = (match[1] ?? "").trim();
    // 'none' or a list that doesn't include a wildcard blocks us.
    if (!value.includes("*")) return true;
  }
  return false;
}

export const checkEmbeddable = createServerFn({ method: "POST" })
  .inputValidator((data: { url: string }) => {
    if (!data?.url || !/^https?:\/\//i.test(data.url)) throw new Error("Invalid url");
    return { url: data.url };
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
