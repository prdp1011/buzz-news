import { prisma } from "database";

export async function getTrendingTags(limit = 12) {
  const tags = await prisma.tag.findMany({
    take: limit,
    orderBy: { name: "asc" },
  });
  return tags;
}
