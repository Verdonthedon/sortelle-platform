import { auth, currentUser } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase";

/**
 * Gets the authenticated user from Supabase, creating them if they don't exist.
 * This handles the case where the Clerk webhook hasn't synced the user yet.
 */
export async function getAuthenticatedUser() {
  const { userId } = await auth();
  if (!userId) return null;

  // Try to find existing user
  const { data: existingUser, error: findError } = await supabaseAdmin
    .from("users")
    .select("id")
    .eq("clerk_id", userId)
    .single();

  if (existingUser) return existingUser;

  // Log Supabase errors for debugging (not "no rows" which is expected)
  if (findError && findError.code !== "PGRST116") {
    console.error("Supabase lookup error:", findError.message, findError.code);
  }

  // User doesn't exist in Supabase — create from Clerk data
  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const email = clerkUser.emailAddresses[0]?.emailAddress || "";
  const name = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || null;

  const { data: newUser, error: insertError } = await supabaseAdmin
    .from("users")
    .insert({
      clerk_id: userId,
      email,
      name,
      avatar_url: clerkUser.imageUrl || null,
    })
    .select("id")
    .single();

  if (insertError) {
    console.error("Supabase insert error:", insertError.message, insertError.code);
    return null;
  }

  return newUser;
}
