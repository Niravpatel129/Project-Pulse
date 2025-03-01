// Cookie utility functions for authentication

/**
 * Sets a cookie with the given name, value, and options
 */
export function setCookie(name: string, value: string, days = 7): void {
  if (typeof document === 'undefined') return;

  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);

  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
}

/**
 * Gets a cookie by name
 */
export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;

  const nameEQ = `${name}=`;
  const ca = document.cookie.split(';');

  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }

  return null;
}

/**
 * Removes a cookie by name
 */
export function removeCookie(name: string): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
}

/**
 * Parses a JSON cookie value safely
 */
export function parseJSONCookie<T>(cookieName: string, defaultValue: T): T {
  try {
    const cookieValue = getCookie(cookieName);
    if (!cookieValue) return defaultValue;

    return JSON.parse(cookieValue) as T;
  } catch (error) {
    console.error(`Error parsing cookie ${cookieName}:`, error);
    return defaultValue;
  }
}

/**
 * Sets a JSON value in a cookie
 */
export function setJSONCookie(name: string, value: any, days = 7): void {
  try {
    const jsonValue = JSON.stringify(value);
    setCookie(name, jsonValue, days);
  } catch (error) {
    console.error(`Error setting JSON cookie ${name}:`, error);
  }
}
