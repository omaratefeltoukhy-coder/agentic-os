import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { loginSchema } from "@/lib/validations/auth";
import { authConfig } from "@/lib/auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email.toLowerCase() },
        });
        if (!user || !user.passwordHash) return null;

        const valid = await verifyPassword(parsed.data.password, user.passwordHash);
        if (!valid) return null;

        if (user.isSuspended) throw new Error("ACCOUNT_SUSPENDED");
        if (!user.emailVerified) throw new Error("EMAIL_NOT_VERIFIED");

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user, trigger }) {
      if (user?.id) {
        token.id = user.id;
      }

      if (user || trigger === "update") {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { roles: true, activeRole: true, hasSelectedRole: true, locale: true },
        });
        if (dbUser) {
          token.roles = dbUser.roles;
          token.activeRole = dbUser.activeRole;
          token.hasSelectedRole = dbUser.hasSelectedRole;
          token.locale = dbUser.locale;
        }
      }

      return token;
    },
  },
  events: {
    async createUser({ user }) {
      if (!user.id) return;
      // Google sign-ups are pre-verified and pick Owner/Caregiver on
      // /onboarding/role right after their first login.
      await prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date(), hasSelectedRole: false },
      });
    },
  },
});
