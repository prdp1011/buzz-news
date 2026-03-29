"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "database";
import { getSession } from "@/lib/auth";

async function requireSession() {
  const s = await getSession();
  if (!s) redirect("/login");
}

function slugify(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function createQuizSection(formData: FormData) {
  await requireSession();
  const slug = slugify(String(formData.get("slug") ?? ""));
  const label = String(formData.get("label") ?? "").trim();
  const coverRaw = String(formData.get("coverImageUrl") ?? "").trim();
  const coverImageUrl = coverRaw.length > 0 ? coverRaw : null;
  if (!slug || !label) return;
  try {
    await prisma.quizSection.create({
      data: { slug, label, coverImageUrl },
    });
  } catch {
    return;
  }
  revalidatePath("/quiz-sections");
  revalidatePath("/", "layout");
}

export async function updateQuizSection(formData: FormData) {
  await requireSession();
  const id = String(formData.get("id") ?? "").trim();
  const slug = slugify(String(formData.get("slug") ?? ""));
  const label = String(formData.get("label") ?? "").trim();
  const coverRaw = String(formData.get("coverImageUrl") ?? "").trim();
  const coverImageUrl = coverRaw.length > 0 ? coverRaw : null;
  if (!id || !slug || !label) return;
  try {
    await prisma.quizSection.update({
      where: { id },
      data: { slug, label, coverImageUrl },
    });
  } catch {
    return;
  }
  revalidatePath("/quiz-sections");
  revalidatePath("/", "layout");
}

export async function deleteQuizSection(formData: FormData) {
  await requireSession();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;
  const count = await prisma.quiz.count({ where: { sectionId: id } });
  if (count > 0) return;
  await prisma.quizSection.delete({ where: { id } });
  revalidatePath("/quiz-sections");
  revalidatePath("/", "layout");
  redirect("/quiz-sections");
}
