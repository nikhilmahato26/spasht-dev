import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { authConfig } from "@/auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(db),
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        const email = (credentials?.email as string | undefined)?.trim();
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        const envAdminEmail = process.env.ADMIN_EMAIL?.trim();
        const envAdminPassword = process.env.ADMIN_PASSWORD?.trim();

        const isEnvAdminLogin =
          !!envAdminEmail &&
          !!envAdminPassword &&
          email.toLowerCase() === envAdminEmail.toLowerCase();

        if (isEnvAdminLogin) {
          if (password !== envAdminPassword) {
            return null;
          }

          // Ensure an admin user exists in DB matching env credentials
          let adminUser = await db.user.findUnique({
            where: { email: envAdminEmail },
          });

          const hashed = await bcrypt.hash(envAdminPassword, 10);

          if (!adminUser) {
            // Find existing admin to update or create new
            const existingAdmin = await db.user.findFirst({
              where: { role: "ADMIN" },
              orderBy: { createdAt: "asc" },
            });

            if (existingAdmin) {
              adminUser = await db.user.update({
                where: { id: existingAdmin.id },
                data: {
                  email: envAdminEmail,
                  passwordHash: hashed,
                  role: "ADMIN",
                  isActive: true,
                },
              });
            } else {
              adminUser = await db.user.create({
                data: {
                  name: "Admin",
                  email: envAdminEmail,
                  passwordHash: hashed,
                  role: "ADMIN",
                  type: "DEV",
                  isActive: true,
                },
              });
            }
          } else {
            adminUser = await db.user.update({
              where: { id: adminUser.id },
              data: {
                role: "ADMIN",
                isActive: true,
                passwordHash: hashed,
              },
            });
          }

          return {
            id: adminUser.id,
            name: adminUser.name,
            email: adminUser.email,
            role: adminUser.role,
            type: adminUser.type,
          };
        }

        // Standard user login (team members)
        const user = await db.user.findUnique({ where: { email } });
        if (!user || !user.isActive) return null;

        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          type: user.type,
        };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.type = user.type;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "ADMIN" | "MEMBER";
        session.user.type = token.type as "DEV" | "MARKETING";
      }
      return session;
    },
  },
});
