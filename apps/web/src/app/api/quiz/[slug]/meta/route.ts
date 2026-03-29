import { NextResponse } from "next/server";
import { dbGetQuizMeta } from "@/server/quiz-queries";

type Props = { params: Promise<{ slug: string }> };

export async function GET(_req: Request, { params }: Props) {
  const { slug } = await params;
  const meta = await dbGetQuizMeta(slug);
  if (!meta) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(meta);
}
