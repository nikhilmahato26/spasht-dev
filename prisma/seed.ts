import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import bcrypt from "bcryptjs";
import ws from "ws";
import { PrismaClient } from "../src/generated/prisma/client";

neonConfig.webSocketConstructor = ws;

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
const db = new PrismaClient({ adapter });

async function main() {
  const adminPassword = await bcrypt.hash("changeme123", 10);
  const memberPassword = await bcrypt.hash("changeme123", 10);

  const admin = await db.user.upsert({
    where: { email: "admin@spasht.dev" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@spasht.dev",
      passwordHash: adminPassword,
      role: "ADMIN",
      type: "DEV",
    },
  });

  const rahul = await db.user.upsert({
    where: { email: "rahul@spasht.dev" },
    update: {},
    create: {
      name: "Rahul",
      email: "rahul@spasht.dev",
      passwordHash: memberPassword,
      role: "MEMBER",
      type: "DEV",
    },
  });

  const priya = await db.user.upsert({
    where: { email: "priya@spasht.dev" },
    update: {},
    create: {
      name: "Priya",
      email: "priya@spasht.dev",
      passwordHash: memberPassword,
      role: "MEMBER",
      type: "MARKETING",
    },
  });

  const categories = [
    { name: "Website", color: "#39568F" },
    { name: "Dashboard", color: "#6B5490" },
    { name: "Web App", color: "#0F6E5F" },
    { name: "E-commerce", color: "#B9832A" },
  ];

  for (const category of categories) {
    await db.category.upsert({
      where: { name: category.name },
      update: {},
      create: category,
    });
  }

  console.log("Seeded:", { admin: admin.email, members: [rahul.email, priya.email] });
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
