/**
 * Environment-aware authentication configuration
 * Ensures magic links and OAuth redirects work correctly in both development and production
 * Always redirects to the app subdomain for authentication
 */

import { getAppDomain } from "@/utils/domain";

export function getAuthRedirectUrl(): string {
  // Always use the app subdomain for auth callbacks
  const appDomain = getAppDomain();
  return `${appDomain}/auth/callback`;
}

/**
 * Checks if we're in a development environment
 */
export function isDevelopment(): boolean {
  return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
}