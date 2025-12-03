import { useEffect, useRef } from 'react';

export const useCookieMonitor = (onTokenDeleted: () => void) => {
  const tokenRef = useRef<string | null>(null);

  const getCookie = (name: string): string | null => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop()?.split(';').shift() || null;
    }
    return null;
  };

  useEffect(() => {
    tokenRef.current = getCookie('token');

    const checkToken = () => {
      const currentToken = getCookie('token');
      
      if (tokenRef.current && !currentToken) {
        onTokenDeleted();
      }
      
      tokenRef.current = currentToken;
    };

    const interval = setInterval(checkToken, 100);
    return () => clearInterval(interval);
  }, [onTokenDeleted]);
};