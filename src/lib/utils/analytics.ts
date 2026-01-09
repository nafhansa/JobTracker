/**
 * Generate or retrieve session ID from localStorage
 * Session ID persists across page reloads but resets after 24 hours
 */
export const getOrCreateSessionId = (): string => {
  if (typeof window === "undefined") return "";

  const SESSION_KEY = "jobtracker_session_id";
  const SESSION_TIMESTAMP_KEY = "jobtracker_session_timestamp";
  const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  try {
    const existingSessionId = localStorage.getItem(SESSION_KEY);
    const sessionTimestamp = localStorage.getItem(SESSION_TIMESTAMP_KEY);

    // Check if session is still valid (within 24 hours)
    if (existingSessionId && sessionTimestamp) {
      const timestamp = parseInt(sessionTimestamp, 10);
      const now = Date.now();
      
      if (now - timestamp < SESSION_DURATION) {
        return existingSessionId;
      }
    }

    // Generate new session ID
    const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    localStorage.setItem(SESSION_KEY, newSessionId);
    localStorage.setItem(SESSION_TIMESTAMP_KEY, Date.now().toString());
    
    return newSessionId;
  } catch (error) {
    // Fallback if localStorage is not available
    console.error("Error accessing localStorage:", error);
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }
};

/**
 * Get device info for analytics
 */
export const getDeviceInfo = () => {
  if (typeof window === "undefined") {
    return {
      userAgent: "",
      screenWidth: 0,
      screenHeight: 0,
      language: "",
    };
  }

  return {
    userAgent: navigator.userAgent,
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    language: navigator.language,
  };
};
