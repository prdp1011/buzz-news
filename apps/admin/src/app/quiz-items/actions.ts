"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "database";
import { getSession } from "@/lib/auth";

async function requireSession() {
  const s = await getSession();
  if (!s) redirect("/login");
}

export async function updateQuizItem(formData: FormData) {
  await requireSession();
  const id = String(formData.get("id") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const emoji = String(formData.get("emoji") ?? "").trim() || null;
  const published = formData.get("published") === "on";
  const sectionId = String(formData.get("sectionId") ?? "").trim();
  if (!id || !title || !sectionId) return;
  await prisma.quiz.update({
    where: { id },
    data: { title, description, emoji, published, sectionId },
  });
  revalidatePath("/quiz-items");
  revalidatePath("/", "layout");
  redirect("/quiz-items");
}
