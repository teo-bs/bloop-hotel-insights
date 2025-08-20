import { supabase } from "@/integrations/supabase/client";

// Admin email addresses that have access to admin features
const ADMIN_EMAILS = ['admin@padu.com', 'founder@padu.com'];

/**
 * Check if the current user is an admin
 */
export async function isAdmin(): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.email ? ADMIN_EMAILS.includes(user.email) : false;
  } catch {
    return false;
  }
}

/**
 * Check if an email is an admin email
 */
export function isAdminEmail(email: string): boolean {
  return ADMIN_EMAILS.includes(email);
}