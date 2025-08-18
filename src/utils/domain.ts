/**
 * Domain detection utilities for separating landing and app domains
 */

/**
 * Checks if we're on the app subdomain (e.g., app.getpadu.com, app.localhost:3000)
 */
export function isAppSubdomain(): boolean {
  const hostname = window.location.hostname;
  // Handle Lovable preview URLs
  if (hostname.includes('lovableproject.com')) {
    return true; // Treat all Lovable URLs as app subdomain
  }
  return hostname.startsWith('app.') || hostname === 'localhost' || hostname === '127.0.0.1';
}

/**
 * Gets the appropriate domain for the app subdomain
 */
export function getAppDomain(): string {
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  const port = window.location.port;
  
  // Handle Lovable preview URLs - stay on same domain
  if (hostname.includes('lovableproject.com')) {
    return `${protocol}//${hostname}${port ? `:${port}` : ''}`;
  }
  
  // In development, use localhost
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return `${protocol}//${hostname}${port ? `:${port}` : ''}`;
  }
  
  // In production, use app.getpadu.com
  if (hostname.startsWith('app.')) {
    return `${protocol}//${hostname}`;
  }
  
  // Convert getpadu.com to app.getpadu.com
  if (hostname === 'getpadu.com' || hostname.endsWith('.getpadu.com')) {
    return `${protocol}//app.getpadu.com`;
  }
  
  // Fallback: add app subdomain
  return `${protocol}//app.${hostname}`;
}

/**
 * Gets the root domain (without app subdomain)
 */
export function getRootDomain(): string {
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  const port = window.location.port;
  
  // Handle Lovable preview URLs - stay on same domain
  if (hostname.includes('lovableproject.com')) {
    return `${protocol}//${hostname}${port ? `:${port}` : ''}`;
  }
  
  // In development, use localhost
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return `${protocol}//${hostname}${port ? `:${port}` : ''}`;
  }
  
  // For app.getpadu.com, return getpadu.com
  if (hostname === 'app.getpadu.com') {
    return `${protocol}//getpadu.com`;
  }
  
  // Remove app subdomain if present
  const rootHostname = hostname.startsWith('app.') ? hostname.slice(4) : hostname;
  return `${protocol}//${rootHostname}`;
}

/**
 * Redirects to the app subdomain with the given path
 */
export function redirectToApp(path: string = '/dashboard'): void {
  const hostname = window.location.hostname;
  
  // In Lovable environment, don't redirect - just navigate
  if (hostname.includes('lovableproject.com')) {
    window.location.href = path;
    return;
  }
  
  const appDomain = getAppDomain();
  window.location.href = `${appDomain}${path}`;
}

/**
 * Redirects to the root domain with the given path
 */
export function redirectToRoot(path: string = '/'): void {
  const hostname = window.location.hostname;
  
  // In Lovable environment, don't redirect - just navigate
  if (hostname.includes('lovableproject.com')) {
    window.location.href = path;
    return;
  }
  
  const rootDomain = getRootDomain();
  window.location.href = `${rootDomain}${path}`;
}