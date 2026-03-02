import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: "tech" },
      update: {},
      create: {
        slug: "tech",
        name: "Tech",
        description: "Latest in technology and innovation",
        color: "#3B82F6",
      },
    }),
    prisma.category.upsert({
      where: { slug: "culture" },
      update: {},
      create: {
        slug: "culture",
        name: "Culture",
        description: "Pop culture, memes, and trends",
        color: "#EC4899",
      },
    }),
    prisma.category.upsert({
      where: { slug: "lifestyle" },
      update: {},
      create: {
        slug: "lifestyle",
        name: "Lifestyle",
        description: "Life hacks and wellness",
        color: "#10B981",
      },
    }),
    prisma.category.upsert({
      where: { slug: "news" },
      update: {},
      create: {
        slug: "news",
        name: "News",
        description: "Breaking news and updates",
        color: "#F59E0B",
      },
    }),
  ]);

  // Create sample sources
  const sources = await Promise.all([
    prisma.source.upsert({
      where: { feedUrl: "https://techcrunch.com/feed/" },
      update: {},
      create: {
        name: "TechCrunch",
        url: "https://techcrunch.com",
        feedUrl: "https://techcrunch.com/feed/",
        type: "RSS",
        favicon: "https://techcrunch.com/favicon.ico",
        isActive: true,
      },
    }),
    prisma.source.upsert({
      where: { feedUrl: "https://theverge.com/rss/index.xml" },
      update: {},
      create: {
        name: "The Verge",
        url: "https://theverge.com",
        feedUrl: "https://theverge.com/rss/index.xml",
        type: "RSS",
        favicon: "https://theverge.com/favicon.ico",
        isActive: true,
      },
    }),
  ]);

  // Create admin user (password: admin123)
  const passwordHash = await hash("admin123", 12);
  await prisma.adminUser.upsert({
    where: { email: "buzznnews@gmail.com" },
    update: {},
    create: {
      email: "buzznnews@gmail.com",
      passwordHash,
      name: "Admin User",
      role: "admin",
      isActive: true,
    },
  });

  // Create sample tags
  const tags = await Promise.all([
    prisma.tag.upsert({
      where: { slug: "ai" },
      update: {},
      create: { slug: "ai", name: "AI" },
    }),
    prisma.tag.upsert({
      where: { slug: "startups" },
      update: {},
      create: { slug: "startups", name: "Startups" },
    }),
    prisma.tag.upsert({
      where: { slug: "trending" },
      update: {},
      create: { slug: "trending", name: "Trending" },
    }),
  ]);

  // Create sample published post
  const samplePost = await prisma.post.upsert({
    where: { slug: "welcome-to-genz-news" },
    update: {},
    create: {
      slug: "welcome-to-genz-news",
      title: "Welcome to Gen Z News",
      seoTitle: "Welcome to Gen Z News - Your Daily Dose of What Matters",
      summary:
        "We're building the news platform for the next generation. No fluff, no bias—just the stories that actually matter.",
      content: `
        <p>Hey! 👋 Welcome to Gen Z News—your go-to spot for news that actually hits different.</p>
        <p>We're tired of the same old headlines. So we built something new: a platform that speaks your language, 
        cuts through the noise, and gives you the real tea on what's happening in the world.</p>
        <h2>What makes us different?</h2>
        <ul>
          <li><strong>AI-powered summaries</strong> – Get to the point in seconds</li>
          <li><strong>No paywalls</strong> – Quality news should be free</li>
          <li><strong>Multiple perspectives</strong> – We don't do echo chambers</li>
        </ul>
        <p>Stay tuned. We're just getting started. 🚀</p>
      `,
      status: "PUBLISHED",
      publishedAt: new Date(),
      viewCount: 42,
      trendingScore: 0.85,
      metaDescription:
        "Gen Z News - Your daily dose of news that matters. AI-powered summaries, no paywalls, multiple perspectives.",
      categoryId: categories[0].id,
      sourceId: sources[0].id,
    },
  });

  // Link tags to sample post
  await prisma.postTag.upsert({
    where: {
      postId_tagId: {
        postId: samplePost.id,
        tagId: tags[0].id,
      },
    },
    update: {},
    create: {
      postId: samplePost.id,
      tagId: tags[0].id,
    },
  });

  console.log("✅ Seed completed successfully!");
  console.log(`   - ${categories.length} categories`);
  console.log(`   - ${sources.length} sources`);
  console.log(`   - ${tags.length} tags`);
  console.log(`   - 1 admin user (buzznnews@gmail.com / admin123)`);
  console.log(`   - 1 sample post`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
