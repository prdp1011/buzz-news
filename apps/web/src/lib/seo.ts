/** Shared SEO constants */
export const SITE_NAME = "QuizLab";
export const SITE_DESCRIPTION =
  "Quick trivia quizzes — pick a topic, answer multiple-choice questions, and see your score.";

export function getBaseUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}
