import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { createClient } from "@supabase/supabase-js";

const getSupabase = () => {
  try {
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  } catch (err) {
    console.error("Supabase init failed", err);
    return null;
  }
};
const supabase = getSupabase();

const isDev = process.env.NODE_ENV === "development";

export const { handlers, auth, signIn, signOut } = NextAuth({
  debug: true,
  providers: [
    // Dev-mode bypass: works without real Google OAuth credentials
    ...(isDev
      ? [
          CredentialsProvider({
            id: "dev-login",
            name: "Dev Login",
            credentials: {
              email: { label: "Email", type: "email" },
              name: { label: "Name", type: "text" },
            },
            async authorize(credentials) {
              if (!credentials?.email) return null;
              return {
                id: "dev-user-001",
                email: String(credentials.email),
                name: String(credentials.name || "Dev User"),
                image: null,
              };
            },
          }),
        ]
      : []),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "placeholder",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "placeholder",
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email && supabase) {
        try {
          const { data: existingUser } = await supabase
            .from("users")
            .select("id")
            .eq("email", user.email)
            .single();

          if (!existingUser) {
            await supabase.from("users").insert({
              id: user.id,
              email: user.email,
              name: user.name,
              avatar_url: user.image,
              created_at: new Date().toISOString(),
            });
          }
        } catch (error) {
          console.error("Error syncing user to Supabase:", error);
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (account && user) {
        token.userId = user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.userId as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.image = token.picture as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  session: {
    strategy: "jwt",
  },
});
