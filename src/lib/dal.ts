import { cache } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export const getSession = cache(async () => auth());

// JWT sessions aren't re-checked against the DB by NextAuth itself, so a
// user deleted or deactivated after signing in would otherwise keep a
// working session until the token expires. Verify on every request instead.
export const requireUser = cache(async () => {
  const session = await getSession();
  if (!session?.user) redirect("/login");

  const dbUser = await db.user.findUnique({ where: { id: session.user.id } });
  if (!dbUser || !dbUser.isActive) redirect("/login");

  return {
    id: dbUser.id,
    name: dbUser.name,
    email: dbUser.email,
    role: dbUser.role,
    type: dbUser.type,
  };
});

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "ADMIN") redirect("/");
  return user;
}
