import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { createClient } from "@supabase/supabase-js";

// Supabase client initialization (Node-safe)
const getSupabase = () => {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!url || !key) return null;
    
    return createClient(url, key);
  } catch (err) {
    console.error("Supabase init failed", err);
    return null;
  }
};

const supabase = getSupabase();

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  debug: process.env.NODE_ENV === "development",
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account }) {
      // Sync user to Supabase on Google Login
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
  },
});
