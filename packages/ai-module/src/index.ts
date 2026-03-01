/**
 * AI Module - Content Processing for Buzz News Platform
 *
 * Supports: OpenAI GPT-4, fallback to placeholders when no API key
 */

import OpenAI from "openai";

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

const GEN_Z_SYSTEM_PROMPT = `You are a Gen Z content editor. Rewrite content to be:
- Casual, relatable, and engaging (use "lowkey", "ngl", "vibes", "slay" sparingly)
- Use BULLET POINTS for key facts – one punchy line per bullet, scannable
- Keep each bullet under 15 words when possible
- No corporate jargon or stuffy language
- Include relevant emoji when it fits (1-2 max)
- Keep it authentic, not forced`;

export interface ProcessedContent {
  rewrittenContent: string;
  seoTitle: string;
  summary: string;
  tags: string[];
}

/**
 * Converts AI-rewritten text (with bullet points) to HTML.
 * Lines starting with •, -, or * become <li> items.
 */
export function textToBulletHtml(text: string): string {
  const lines = text.split(/\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) return "";

  const bulletRegex = /^[•\-*]\s*/;
  const items: string[] = [];
  let currentList: string[] = [];
  const flushList = () => {
    if (currentList.length > 0) {
      items.push(
        `<ul class="article-bullets">${currentList.map((t) => `<li>${escapeHtml(t)}</li>`).join("")}</ul>`
      );
      currentList = [];
    }
  };

  for (const line of lines) {
    const bulletMatch = line.match(bulletRegex);
    if (bulletMatch) {
      currentList.push(line.slice(bulletMatch[0].length).trim());
    } else {
      flushList();
      if (line) items.push(`<p>${escapeHtml(line)}</p>`);
    }
  }
  flushList();

  return items.join("");
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function callOpenAI(
  messages: OpenAI.Chat.ChatCompletionMessageParam[],
  options?: { maxTokens?: number }
): Promise<string> {
  if (!openai) throw new Error("OPENAI_API_KEY not configured");
  const res = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
    messages,
    max_tokens: options?.maxTokens ?? 2000,
    temperature: 0.7,
  });
  const content = res.choices[0]?.message?.content?.trim();
  if (!content) throw new Error("Empty AI response");
  return content;
}

/**
 * Rewrites raw content for Gen Z audience
 */
export async function rewriteContent(rawText: string): Promise<string> {
  console.log('[ai-module] - > Start ');
  const clean = rawText.replace(/\s+/g, " ").trim().slice(0, 8000);
  console.log('[ai-module] - > Start 2');
  const hasKey = !!process.env.OPENAI_API_KEY;
  console.log("[ai-module] rewriteContent", {
    inputLen: rawText.length,
    cleanLen: clean.length,
    hasOpenAiKey: hasKey,
  });

  if (!openai) {
    console.log("[ai-module] No OpenAI key, using fallback (truncate)");
    return clean.slice(0, 5000);
  }
  try {
    const result = await callOpenAI([
      { role: "system", content: GEN_Z_SYSTEM_PROMPT },
      {
        role: "user",
        content: `Rewrite this article as BULLET POINTS for a Gen Z audience. Each line should start with "•" and be one key fact or takeaway. Keep bullets punchy (under 15 words). Make it scannable and interactive. No long paragraphs.\n\n${clean}`,
      },
    ]);
    console.log('[ai-module] - > rewriteContent ', result);
    console.log("[ai-module] rewriteContent success", { outputLen: result?.length ?? 0 });
    return result.slice(0, 10000);
  } catch (err) {
    console.warn("[ai-module] rewriteContent failed, using fallback:", err);
    return clean.slice(0, 5000);
  }
}

/**
 * Generates SEO-optimized title (50-60 chars)
 */
export async function generateSEOTitle(
  originalTitle: string,
  _context?: string
): Promise<string> {
  if (!openai) {
    return originalTitle.slice(0, 60).trim();
  }
  try {
    const result = await callOpenAI(
      [
        {
          role: "user",
          content: `Create an SEO-friendly title (50-60 chars) for: "${originalTitle}". Return ONLY the title, no quotes.`,
        },
      ],
      { maxTokens: 80 }
    );
    return (result.replace(/^["']|["']$/g, "") || originalTitle).slice(0, 60);
  } catch (err) {
    console.warn("[ai-module] generateSEOTitle failed:", err);
    return originalTitle.slice(0, 60).trim();
  }
}

/**
 * Generates concise summary (2-3 sentences)
 */
export async function generateSummary(content: string): Promise<string> {
  const clean = content.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 4000);
  if (!openai) {
    return clean.slice(0, 300) + (content.length > 300 ? "..." : "");
  }
  try {
    const result = await callOpenAI(
      [
        {
          role: "user",
          content: `Summarize in 2-3 sentences (max 160 chars for meta):\n\n${clean}`,
        },
      ],
      { maxTokens: 150 }
    );
    return result.slice(0, 500);
  } catch (err) {
    console.warn("[ai-module] generateSummary failed:", err);
    return clean.slice(0, 300) + (content.length > 300 ? "..." : "");
  }
}

/**
 * Generates relevant tags (3-5)
 */
export async function generateTags(
  content: string,
  _title?: string
): Promise<string[]> {
  const clean = content.replace(/<[^>]*>/g, " ").replace(/[^a-z0-9\s]/gi, "").slice(0, 2000);
  if (!openai) {
    const words = clean
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 4);
    return [...new Set(words)].slice(0, 5).map((w) => w.replace(/\s+/g, "-"));
  }
  try {
    const result = await callOpenAI(
      [
        {
          role: "user",
          content: `Extract 3-5 topic tags (lowercase, hyphenated) from:\n\n${clean}\n\nReturn tags as comma-separated list, no other text.`,
        },
      ],
      { maxTokens: 80 }
    );
    return result
      .split(",")
      .map((t) => t.trim().toLowerCase().replace(/\s+/g, "-"))
      .filter(Boolean)
      .slice(0, 5);
  } catch (err) {
    console.warn("[ai-module] generateTags failed:", err);
    const words = clean.toLowerCase().split(/\s+/).filter((w) => w.length > 4);
    return [...new Set(words)].slice(0, 5).map((w) => w.replace(/\s+/g, "-"));
  }
}

/**
 * Process content through all AI pipelines
 */
export async function processContent(rawText: string): Promise<ProcessedContent> {
  const [rewrittenContent, seoTitle, summary, tags] = await Promise.all([
    rewriteContent(rawText),
    generateSEOTitle(rawText.slice(0, 100)),
    generateSummary(rawText),
    generateTags(rawText),
  ]);

  return {
    rewrittenContent,
    seoTitle,
    summary,
    tags,
  };
}
