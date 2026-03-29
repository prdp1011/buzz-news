import { headers } from "next/headers";
import { getBaseUrl } from "@/lib/seo";

/** Server-only: call this app's quiz API from RSC / server actions (no Prisma in pages). */
export async function fetchQuizApi(path: string): Promise<Response> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "http";
  const base = host ? `${proto}://${host}` : getBaseUrl();
  return fetch(`${base}${path}`, { cache: "no-store" });
}
