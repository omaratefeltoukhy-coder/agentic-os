import type { NextAuthConfig } from "next-auth";

// Edge-safe config: no Prisma, no bcrypt. Used directly by middleware and
// merged into the full config in auth.ts (which adds the adapter + the
// Credentials provider, both Node-only).
export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days — "stay logged in"
  },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const pathname = request.nextUrl.pathname;

      const protectedPrefixes = ["/dashboard", "/onboarding", "/settings", "/admin", "/bookings"];
      const isProtected = protectedPrefixes.some((p) => pathname.startsWith(p));

      if (isProtected && !isLoggedIn) return false;

      if (isLoggedIn && auth.user.hasSelectedRole === false && !pathname.startsWith("/onboarding/role")) {
        return Response.redirect(new URL("/onboarding/role", request.nextUrl));
      }

      if (pathname.startsWith("/admin") && auth?.user?.activeRole !== "ADMIN") {
        return Response.redirect(new URL("/", request.nextUrl));
      }

      return true;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.roles = (token.roles as string[] | undefined) ?? [];
        session.user.activeRole = token.activeRole as string;
        session.user.hasSelectedRole = token.hasSelectedRole as boolean;
        session.user.locale = (token.locale as string) ?? "en";
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
