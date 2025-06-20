#!/usr/bin/env node

const { execSync } = require("child_process");

const args = process.argv.slice(2).join(" ");
try {
  const result = execSync(`vercel ${args}`, { stdio: "inherit" });
} catch (error) {
  console.error("Error running vercel:", error.message);
  process.exit(1);
}
