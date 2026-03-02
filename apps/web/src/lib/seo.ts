/** Shared SEO constants */
export const SITE_NAME = "Buzz News";
export const SITE_DESCRIPTION =
  "Your daily dose of news that matters. AI-powered summaries, no paywalls, multiple perspectives.";

export function getBaseUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "https://buzznews.com";
}
