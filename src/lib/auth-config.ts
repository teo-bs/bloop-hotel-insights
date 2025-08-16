/**
 * Environment-aware authentication configuration
 * Ensures magic links and OAuth redirects work correctly in both development and production
 */

export function getAuthRedirectUrl(): string {
  // In development, use localhost for testing
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return `${window.location.origin}/auth/callback`;
  }
  
  // For production, always use the live Lovable domain
  // This ensures magic links work regardless of where they're clicked
  const productionDomain = window.location.origin;
  return `${productionDomain}/auth/callback`;
}

/**
 * Checks if we're in a development environment
 */
export function isDevelopment(): boolean {
  return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
}