import HttpClient, { HttpClientConfig } from "./httpClient";
import { Platform } from "react-native";

// Get the appropriate base URL for development
const getDevBaseURL = (): string => {
  if (__DEV__) {
    // For Android emulator, use 10.0.2.2 instead of localhost
    if (Platform.OS === "android") {
      return "http://192.168.1.222:3000/api";
    }
    // For iOS simulator and Expo Go, localhost should work
    return "http://192.168.1.222:3000/api";
  }
  return "https://api.yourdomain.com/api";
};

// API Configuration
export const API_CONFIG: HttpClientConfig = {
  baseURL: getDevBaseURL(),
  timeout: 10000, // 10 seconds
  retryAttempts: 3,
};

// Log the API configuration in development
if (__DEV__) {
  console.log("🔧 API Configuration:", {
    platform: Platform.OS,
    baseURL: API_CONFIG.baseURL,
  });
}

// Debug helper function
export const debugConnection = async (): Promise<void> => {
  if (!__DEV__) return;

  console.log("🔍 Testing API connection...");
  console.log("📱 Platform:", Platform.OS);
  console.log("🌐 Base URL:", API_CONFIG.baseURL);

  try {
    // Test basic connectivity first
    const baseUrl = API_CONFIG.baseURL.replace("/api", "");
    console.log("🔗 Testing base URL:", baseUrl);

    const response = await fetch(`${baseUrl}/health`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    console.log("✅ Connection test response:", response.status);

    if (response.ok) {
      const data = await response.text();
      console.log("📄 Response data:", data);
    }
  } catch (error) {
    console.log("❌ Connection test failed:", error);
    console.log("💡 Troubleshooting tips:");
    console.log("   1. Check if server is running on port 3000");
    console.log("   2. Verify IP address is correct");
    console.log("   3. Ensure both devices are on same network");
    console.log("   4. Check firewall settings");
    console.log(
      "   5. Try accessing http://192.168.1.222:3000 in your phone browser"
    );
  }
};

// Quick rate limit test
export const testRateLimit = async (): Promise<void> => {
  if (!__DEV__) return;

  console.log("🧪 Testing rate limit status...");

  try {
    const response = await fetch(
      `${API_CONFIG.baseURL}/client/discovery/sessions?limit=1`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );

    if (response.status === 429) {
      console.log("⚠️ Rate limit still active");
    } else {
      console.log("✅ Rate limit cleared, status:", response.status);
    }
  } catch (error) {
    console.log("❌ Rate limit test failed:", error);
  }
};

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: "/auth/client/login",
    REGISTER: "/auth/client/register",
    REFRESH: "/auth/client/refresh",
    LOGOUT: "/auth/client/logout",
    PROFILE: "/client/profile",
  },

  // Discovery
  DISCOVERY: {
    BRANDS: "/discovery/brands",
    CLASSES: "/discovery/classes",
    SESSIONS: "/discovery/sessions",
    SEARCH: "/discovery/search",
  },

  // Subscriptions
  SUBSCRIPTIONS: {
    PLANS: "/subscriptions/plans",
    USER_SUBSCRIPTIONS: "/subscriptions/user",
    PURCHASE: "/subscriptions/purchase",
    CANCEL: "/subscriptions/cancel",
  },

  // Credits
  CREDITS: {
    BALANCE: "/credits/balance",
    PURCHASE: "/credits/purchase",
    HISTORY: "/credits/history",
  },

  // Profile
  PROFILE: {
    GET: "/profile",
    UPDATE: "/profile",
    UPLOAD_PHOTO: "/profile/photo",
    PREFERENCES: "/profile/preferences",
  },

  // Payments
  PAYMENTS: {
    CREATE_INTENT: "/payments/create-intent",
    CONFIRM: "/payments/confirm",
    HISTORY: "/payments/history",
  },

  // Bookings
  BOOKINGS: {
    LIST: "/bookings",
    CREATE: "/bookings",
    CANCEL: "/bookings/cancel",
    HISTORY: "/bookings/history",
  },
} as const;

// Create and export the HTTP client instance
export const httpClient = new HttpClient(API_CONFIG);

// Export default instance
export default httpClient;
