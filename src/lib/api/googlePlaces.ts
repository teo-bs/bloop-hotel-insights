
/**
 * Simple helper to call the public Edge Function for Google Places preview.
 * This uses a GET request to the full Supabase Functions URL.
 */
const FUNCTION_URL = "https://hewcaikalseorcmmjark.supabase.co/functions/v1/google-places-preview";

export async function getPlacesPreview(placeId: string) {
  if (!placeId) throw new Error("placeId is required");
  const url = `${FUNCTION_URL}?placeId=${encodeURIComponent(placeId)}`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      // Note: Function is public (verify_jwt=false), no Authorization header required.
    },
  });

  if (!res.ok) {
    // Try to surface upstream error details
    let details: any = undefined;
    try {
      details = await res.json();
    } catch {
      // ignore
    }
    throw new Error(details?.error || `Request failed with status ${res.status}`);
  }

  return res.json();
}
