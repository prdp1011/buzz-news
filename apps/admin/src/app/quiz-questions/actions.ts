"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "database";
import { getSession } from "@/lib/auth";

async function requireSession() {
  const s = await getSession();
  if (!s) redirect("/login");
}

function parseOptions(formData: FormData): { text: string; isCorrect: boolean }[] {
  const out: { text: string; isCorrect: boolean }[] = [];
  const correctRaw = String(formData.get("correctOption") ?? "0");
  const correctIdx = Math.min(3, Math.max(0, parseInt(correctRaw, 10) || 0));
  for (let i = 0; i < 4; i++) {
    const text = String(formData.get(`option_${i}`) ?? "").trim();
    out.push({ text, isCorrect: i === correctIdx });
  }
  return out;
}

export async function createQuizQuestion(formData: FormData) {
  await requireSession();
  const quizId = String(formData.get("quizId") ?? "").trim();
  const text = String(formData.get("text") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const orderRaw = String(formData.get("order") ?? "").trim();
  if (!quizId || !text) return;

  const options = parseOptions(formData);
  if (options.some((o) => !o.text)) return;

  let order: number;
  if (orderRaw !== "" && Number.isFinite(Number(orderRaw))) {
    order = Number(orderRaw);
  } else {
    const maxOrder = await prisma.quizQuestion.aggregate({
      where: { quizId },
      _max: { order: true },
    });
    order = (maxOrder._max.order ?? -1) + 1;
  }

  await prisma.$transaction(async (tx) => {
    const q = await tx.quizQuestion.create({
      data: { quizId, order, text, description },
    });
    await tx.quizOption.createMany({
      data: options.map((o, i) => ({
        questionId: q.id,
        order: i,
        text: o.text,
        isCorrect: o.isCorrect,
      })),
    });
  });

  revalidatePath("/quiz-questions");
  revalidatePath("/", "layout");
  redirect("/quiz-questions");
}

export async function updateQuizQuestion(formData: FormData) {
  await requireSession();
  const id = String(formData.get("id") ?? "").trim();
  const quizId = String(formData.get("quizId") ?? "").trim();
  const text = String(formData.get("text") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const orderRaw = String(formData.get("order") ?? "").trim();
  if (!id || !quizId || !text) return;

  const options = parseOptions(formData);
  if (options.some((o) => !o.text)) return;

  if (orderRaw === "" || !Number.isFinite(Number(orderRaw))) return;
  const order = Number(orderRaw);

  await prisma.$transaction(async (tx) => {
    await tx.quizQuestion.update({
      where: { id },
      data: { quizId, text, description, order },
    });
    await tx.quizOption.deleteMany({ where: { questionId: id } });
    await tx.quizOption.createMany({
      data: options.map((o, i) => ({
        questionId: id,
        order: i,
        text: o.text,
        isCorrect: o.isCorrect,
      })),
    });
  });

  revalidatePath("/quiz-questions");
  revalidatePath("/", "layout");
  redirect("/quiz-questions");
}

export async function deleteQuizQuestion(formData: FormData) {
  await requireSession();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;
  await prisma.quizQuestion.delete({ where: { id } });
  revalidatePath("/quiz-questions");
  revalidatePath("/", "layout");
  redirect("/quiz-questions");
}
