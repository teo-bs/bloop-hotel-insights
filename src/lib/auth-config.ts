/**
 * Environment-aware authentication configuration
 * Ensures magic links and OAuth redirects work correctly in both development and production
 * Always redirects to the app subdomain for authentication
 */

import { getAppDomain } from "@/utils/domain";

export function getAuthRedirectUrl(): string {
  const hostname = window.location.hostname;
  
  // In development, use localhost
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return `${window.location.protocol}//${hostname}${window.location.port ? `:${window.location.port}` : ''}/auth/callback`;
  }
  
  // Always redirect to app.getpadu.com for production auth callbacks
  return 'https://app.getpadu.com/auth/callback';
}

/**
 * Checks if we're in a development environment
 */
export function isDevelopment(): boolean {
  return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
}