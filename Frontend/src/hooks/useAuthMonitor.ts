import { useEffect, useRef } from 'react';
import { cookieUtils } from '@/lib/cookies';

export const useAuthMonitor = (onTokenDeleted: () => void) => {
  const tokenRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    const checkToken = () => {
      const currentToken = cookieUtils.getToken();
      
      if (tokenRef.current && !currentToken) {
        onTokenDeleted();
      }
      
      tokenRef.current = currentToken;
    };

    tokenRef.current = cookieUtils.getToken();
    
    const interval = setInterval(checkToken, 1000);
    
    return () => clearInterval(interval);
  }, [onTokenDeleted]);
};