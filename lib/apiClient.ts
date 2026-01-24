import axios from "axios";
import { apiBaseUrl } from "./config";

const apiClient = axios.create({
  baseURL: apiBaseUrl,
});

apiClient.interceptors.request.use((config) => {
  // Check if we're in the browser before accessing localStorage/cookies
  if (typeof window !== 'undefined') {
    let token = null;
    
    // First, try to get token from localStorage (auth_session)
    const sessionData = localStorage.getItem("auth_session");
    if (sessionData) {
      try {
        const session = JSON.parse(sessionData);
        if (session?.token) {
          token = session.token;
        }
      } catch (error) {
        console.error('Failed to parse auth session:', error);
      }
    }
    
    // If no token from localStorage, try cookies
    if (!token) {
      // Get token from cookies (fallback)
      const cookies = document.cookie.split(';');
      const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('token='));
      if (tokenCookie) {
        token = tokenCookie.split('=')[1];
      }
    }
    
    // Set authorization header if token is found
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

export default apiClient;
