import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabaseUrl, supabasePublishableKey } from "../config";

/**
 * Creates a Supabase client that reads auth from the request cookies.
 * Use this in API routes and server components to verify the logged-in user.
 *
 * The anon/publishable key is used so the client respects the user's session
 * (not service role). For privileged DB operations, create a separate client
 * with the service role key.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabasePublishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // setAll can fail when called from a Server Component (read-only).
          // Safe to ignore when we only need to read the session.
        }
      },
    },
  });
}
