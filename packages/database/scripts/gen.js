#!/usr/bin/env node
// Ensure DATABASE_URL and DIRECT_URL exist for prisma generate (build-time, no DB connection needed)
const placeholder = "postgresql://placeholder:placeholder@localhost:5432/placeholder";
if (!process.env.DATABASE_URL) process.env.DATABASE_URL = placeholder;
if (!process.env.DIRECT_URL) process.env.DIRECT_URL = placeholder;
require("child_process").execSync("prisma generate", {
  stdio: "inherit",
  cwd: __dirname + "/..",
});
