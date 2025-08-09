
import { supabase } from "./client";

/**
 * Unsafe Supabase client to bypass empty generated types (types.ts is currently empty),
 * allowing us to call .from("table") and .rpc("function") without TS errors.
 * Use ONLY until proper Supabase types are generated.
 */
export const unsafeSupabase = supabase as unknown as any;
