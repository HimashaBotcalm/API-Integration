// Utility to check if authentication cookie exists
export const hasAuthCookie = (): boolean => {
  return document.cookie.split(';').some(cookie => 
    cookie.trim().startsWith('token=')
  )
}

// Utility to monitor cookie changes
export const createCookieMonitor = (callback: () => void): (() => void) => {
  let lastCookieString = document.cookie
  
  const checkCookies = () => {
    const currentCookieString = document.cookie
    const hadToken = lastCookieString.includes('token=')
    const hasToken = currentCookieString.includes('token=')
    
    // If we had a token but now we don't, trigger callback
    if (hadToken && !hasToken) {
      callback()
    }
    
    lastCookieString = currentCookieString
  }
  
  // Check every second
  const interval = setInterval(checkCookies, 1000)
  
  // Return cleanup function
  return () => clearInterval(interval)
}