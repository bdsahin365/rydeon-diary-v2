import type { NextAuthConfig } from "next-auth";

export const authConfig = {
    providers: [],
    pages: {
        signIn: "/login",
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = (user as any).role;
            }
            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id as string;
                (session.user as any).role = token.role as string;
            }
            return session;
        },
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isOnAuth = nextUrl.pathname.startsWith("/login") || nextUrl.pathname.startsWith("/signup");
            const isPublic = nextUrl.pathname.startsWith("/api") || nextUrl.pathname.startsWith("/_next") || nextUrl.pathname.includes(".");

            if (isOnAuth) {
                if (isLoggedIn) return Response.redirect(new URL("/", nextUrl));
                return true;
            }

            if (isPublic) return true;

            return isLoggedIn;
        },
    },
    secret: "33dc2570de661420a474cc9e67c8a2a6b264eb5fa9a82337c2e051e539655f6a",
} satisfies NextAuthConfig;
