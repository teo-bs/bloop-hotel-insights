/**
 * Domain detection utilities for separating landing and app domains
 */

/**
 * Checks if we're on the app subdomain (e.g., app.padu.com, app.localhost:3000)
 */
export function isAppSubdomain(): boolean {
  const hostname = window.location.hostname;
  return hostname.startsWith('app.') || hostname === 'localhost' || hostname === '127.0.0.1';
}

/**
 * Gets the appropriate domain for the app subdomain
 */
export function getAppDomain(): string {
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  const port = window.location.port;
  
  // In development, use localhost
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return `${protocol}//${hostname}${port ? `:${port}` : ''}`;
  }
  
  // In production, use app subdomain
  if (hostname.startsWith('app.')) {
    return `${protocol}//${hostname}`;
  }
  
  // Convert root domain to app subdomain
  return `${protocol}//app.${hostname}`;
}

/**
 * Gets the root domain (without app subdomain)
 */
export function getRootDomain(): string {
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  const port = window.location.port;
  
  // In development, use localhost
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return `${protocol}//${hostname}${port ? `:${port}` : ''}`;
  }
  
  // Remove app subdomain if present
  const rootHostname = hostname.startsWith('app.') ? hostname.slice(4) : hostname;
  return `${protocol}//${rootHostname}`;
}

/**
 * Redirects to the app subdomain with the given path
 */
export function redirectToApp(path: string = '/dashboard'): void {
  const appDomain = getAppDomain();
  window.location.href = `${appDomain}${path}`;
}

/**
 * Redirects to the root domain with the given path
 */
export function redirectToRoot(path: string = '/'): void {
  const rootDomain = getRootDomain();
  window.location.href = `${rootDomain}${path}`;
}