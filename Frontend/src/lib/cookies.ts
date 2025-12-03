export const cookieUtils = {
  getToken: (): string | null => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; token=`);
    if (parts.length === 2) {
      return parts.pop()?.split(';').shift() || null;
    }
    return null;
  },

  setToken: (token: string): void => {
    const maxAge = 24 * 60 * 60; // 24 hours in seconds
    document.cookie = `token=${token}; path=/; max-age=${maxAge}; samesite=lax`;
  },

  removeToken: (): void => {
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; samesite=lax';
  }
};