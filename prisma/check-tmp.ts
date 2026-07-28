import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import ws from "ws";
import { PrismaClient } from "../src/generated/prisma/client";

neonConfig.webSocketConstructor = ws;

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
const db = new PrismaClient({ adapter });

async function main() {
  const user = await db.user.findUnique({ where: { id: "cms31fmtr00018lui1fibcxae" } });
  console.log(JSON.stringify(user, null, 2));

  const allUsers = await db.user.findMany({
    select: { id: true, name: true, email: true, role: true, isActive: true },
  });
  console.log(JSON.stringify(allUsers, null, 2));
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
