export const cookieUtils = {
  getToken: (): string | undefined => {
    const cookies = document.cookie.split(';');
    const tokenCookie = cookies.find(cookie => 
      cookie.trim().startsWith('token=')
    );
    return tokenCookie ? tokenCookie.split('=')[1] : undefined;
  },

  setToken: (token: string): void => {
    document.cookie = `token=${token}; path=/; secure; samesite=strict`;
  },

  removeToken: (): void => {
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  }
};