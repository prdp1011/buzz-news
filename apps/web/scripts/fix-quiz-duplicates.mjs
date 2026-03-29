#!/usr/bin/env node
/**
 * 1) Remove duplicate questions within each quiz (same normalized prompt text).
 * 2) Replace "60× copy-paste" template quizzes with 12 unique stems per slug/topic.
 */
import fs from "node:fs";
import path from "node:path";

const DIR = path.join(import.meta.dirname, "../data/section-wise-question");

function norm(t) {
  return String(t || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[""'']/g, '"')
    .trim();
}

function humanizeSlug(slug) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function isPlaceholderOptions(questions) {
  if (questions.length < 8) return false;
  let generic = 0;
  const optRe = /^Option [A-D]$/i;
  for (const q of questions) {
    const opts = q.options || [];
    if (opts.length !== 4) continue;
    if (opts.every((o) => optRe.test(String(o.text || "").trim()))) generic++;
  }
  return generic / questions.length >= 0.7;
}

function isNumberedStubQuiz(questions) {
  if (questions.length < 20) return false;
  let stub = 0;
  for (const q of questions) {
    if (/\bquestion\s+\d+\?/i.test(String(q.text || ""))) stub++;
  }
  return stub / questions.length >= 0.85;
}

function needsTemplateRebuild(questions) {
  if (!questions.length) return false;
  if (isPlaceholderOptions(questions)) return true;
  if (isNumberedStubQuiz(questions)) return true;
  const norms = questions.map((q) => norm(q.text));
  const u = new Set(norms);
  if (questions.length >= 15 && u.size <= 2) return true;
  if (questions.length >= 10 && u.size / questions.length < 0.25) return true;
  return false;
}

function dedupeKeepOrder(questions) {
  const seen = new Set();
  const out = [];
  for (const q of questions) {
    const n = norm(q.text);
    if (!n || seen.has(n)) continue;
    seen.add(n);
    out.push(q);
  }
  return out;
}

function buildTwelveQuestions(slug, title) {
  const Topic = humanizeSlug(slug);
  const topic = Topic.toLowerCase();

  const templates = [
    {
      text: `You are starting with ${topic}. What is the most sensible first move?`,
      description: `Foundations matter: ${Topic} rewards patience more than impulse buys.`,
      correct: "Learn the basics, then add gear or complexity gradually",
      wrong: [
        "Buy every popular accessory on day one",
        "Skip safety or setup steps to save time",
        "Copy a random viral trend without context",
      ],
    },
    {
      text: `Which habit usually hurts progress in ${topic}?`,
      description: `Consistency beats intensity for most people exploring ${Topic}.`,
      correct: "Doing nothing regularly and only binge-practicing",
      wrong: [
        "Tracking small wins week to week",
        "Asking experienced people targeted questions",
        "Adjusting your approach when something clearly fails",
      ],
    },
    {
      text: `In ${topic}, why is it risky to ignore fundamentals?`,
      description: `Core concepts in ${Topic} prevent expensive or discouraging setbacks.`,
      correct: "Mistakes compound and become harder to untangle later",
      wrong: [
        "Fundamentals never matter for hobbies",
        "You will automatically absorb basics without study",
        "Only experts need to understand the basics",
      ],
    },
    {
      text: `What is a realistic expectation when learning ${topic}?`,
      description: `${Topic} is a skill curve: early progress can feel slow.`,
      correct: "Noticeable improvement often takes weeks of steady practice",
      wrong: [
        "You should master it perfectly within a few days",
        "If it feels hard, you are not suited for it",
        "Talent alone replaces practice",
      ],
    },
    {
      text: `Which approach helps you learn ${topic} from feedback?`,
      description: `Useful feedback speeds up learning in ${Topic}.`,
      correct: "Change one variable at a time and observe the outcome",
      wrong: [
        "Change five things at once every session",
        "Ignore results that contradict your assumptions",
        "Avoid ever repeating a failed attempt",
      ],
    },
    {
      text: `When budgeting time for ${topic}, what usually works best?`,
      description: `Short regular sessions often beat rare marathons for ${Topic}.`,
      correct: "Short, frequent sessions that fit your calendar",
      wrong: [
        "Only practice once a month for eight hours straight",
        "Wait until you feel 100% motivated",
        "Quit the first day you miss a session",
      ],
    },
    {
      text: `How can you avoid misinformation about ${topic}?`,
      description: `Cross-checking sources helps with ${Topic}, where myths spread quickly.`,
      correct: "Compare multiple reputable sources and look for consensus",
      wrong: [
        "Trust the first bold claim you see online",
        "Assume older advice is always outdated",
        "Believe anything that uses technical jargon",
      ],
    },
    {
      text: `What role does community play in ${topic}?`,
      description: `Many people improve faster in ${Topic} with peers or mentors.`,
      correct: "Communities can answer niche questions and share sane defaults",
      wrong: [
        "Communities always agree and never argue",
        "You should never share your beginner questions",
        "Online advice is never useful",
      ],
    },
    {
      text: `Which goal-setting style fits ${topic} for most beginners?`,
      description: `Small measurable goals keep motivation for ${Topic}.`,
      correct: "One clear, achievable milestone per week",
      wrong: [
        "A vague goal to be the best in the world immediately",
        "No goals—only random experimentation forever",
        "Only goals you cannot measure or verify",
      ],
    },
    {
      text: `What is a sign you should slow down in ${topic}?`,
      description: `Pacing prevents injury, burnout, or wasted money in ${Topic}.`,
      correct: "You feel constant frustration, pain, or overspending",
      wrong: [
        "You still enjoy it and stay within your limits",
        "You completed a small task successfully",
        "You asked a thoughtful question",
      ],
    },
    {
      text: `How should you document what you learn in ${topic}?`,
      description: `Notes turn experiments into reusable knowledge for ${Topic}.`,
      correct: "Keep a simple log: what you tried, what happened, what next",
      wrong: [
        "Rely only on memory for every detail",
        "Never write anything because it feels slow",
        "Copy others' notes without understanding them",
      ],
    },
    {
      text: `Which attitude helps long-term growth in ${topic}?`,
      description: `${title ? `"${title}"` : Topic} rewards curiosity over perfectionism.`,
      correct: "Treat mistakes as data and iterate calmly",
      wrong: [
        "Quit after the first imperfect attempt",
        "Assume you must never ask basic questions",
        "Compare your day one to someone else's year five",
      ],
    },
  ];

  return templates.map((tpl, order) => ({
    order,
    text: tpl.text,
    description: tpl.description,
    options: [
      { text: tpl.correct, isCorrect: true },
      ...tpl.wrong.map((text) => ({ text, isCorrect: false })),
    ],
  }));
}

function main() {
  const files = fs.readdirSync(DIR).filter((f) => f.endsWith(".json"));
  let fixed = 0;
  let rebuilt = 0;

  for (const file of files) {
    const fp = path.join(DIR, file);
    const raw = fs.readFileSync(fp, "utf8");
    let j;
    try {
      j = JSON.parse(raw);
    } catch {
      console.error("SKIP invalid JSON", file);
      continue;
    }
    if (!j.questions || !Array.isArray(j.questions)) continue;

    const original = j.questions;
    const before = original.length;
    const rebuild = needsTemplateRebuild(original);
    let questions = dedupeKeepOrder(original);
    const afterDedupe = questions.length;

    if (rebuild) {
      questions = buildTwelveQuestions(j.slug || path.basename(file, ".json"), j.title || "");
      rebuilt++;
    }

    const changed = rebuild || afterDedupe !== before;
    if (changed) {
      questions = questions.map((q, i) => ({ ...q, order: i }));
      j.questions = questions;
      if (
        rebuild &&
        j.description &&
        typeof j.description === "string" &&
        /\b60\b/.test(j.description)
      ) {
        j.description = j.description.replace(/\b60\b/g, String(questions.length));
      }
      fs.writeFileSync(fp, JSON.stringify(j, null, 2) + "\n");
      fixed++;
      console.log(file, before, "→", questions.length, rebuild ? "(rebuilt)" : "(deduped)");
    }
  }

  console.log("\nDone. Files updated:", fixed, "| template rebuilds:", rebuilt);
}

main();
