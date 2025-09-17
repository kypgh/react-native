import AuthManager from "./authManager";
import { httpClient, API_ENDPOINTS } from "../apiConfig";
import {
  LoginCredentials,
  RegisterData,
  AuthResponse,
  User,
  ApiResponse,
  ClientProfile,
} from "../../types/api";
import { AuthTokens, AuthManagerEvents } from "../../types/auth";
import {
  getAuthErrorMessage,
  validateLoginCredentials,
  validateRegistrationData,
} from "../../utils/authErrorHandler";

/**
 * Authentication Service
 * Handles login, registration, and user authentication using AuthManager
 */
class AuthService {
  private static instance: AuthService;
  private authManager: AuthManager;
  private currentUser: User | null = null;

  private constructor() {
    this.authManager = AuthManager.getInstance();
    this.setupEventListeners();
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * Convert ClientProfile to User for backward compatibility
   */
  private convertClientProfileToUser(client: ClientProfile): User {
    return {
      id: client._id,
      email: client.email,
      firstName: client.firstName,
      lastName: client.lastName,
      profilePhoto: client.profilePhoto,
      phoneNumber: client.phone,
      createdAt: client.createdAt,
      updatedAt: client.updatedAt,
    };
  }

  private setupEventListeners(): void {
    // Listen for token expiry to clear user data
    this.authManager.addEventListener(AuthManagerEvents.TOKEN_EXPIRED, () => {
      this.currentUser = null;
    });

    // Listen for tokens being cleared to clear user data
    this.authManager.addEventListener(AuthManagerEvents.TOKENS_CLEARED, () => {
      this.currentUser = null;
    });

    // Listen for authentication failures to clear user data
    this.authManager.addEventListener(
      AuthManagerEvents.AUTHENTICATION_FAILED,
      () => {
        this.currentUser = null;
      }
    );
  }

  /**
   * Login user with credentials
   */
  public async login(
    credentials: LoginCredentials
  ): Promise<ApiResponse<User>> {
    try {
      if (__DEV__) {
        console.log("🔐 Attempting login for:", credentials.email);
      }

      // Validate credentials client-side
      const validationError = validateLoginCredentials(credentials);
      if (validationError) {
        return {
          success: false,
          data: {} as User,
          error: {
            type: "VALIDATION_ERROR" as any,
            message: validationError,
          },
        };
      }

      const response: ApiResponse<AuthResponse> = await httpClient.post(
        API_ENDPOINTS.AUTH.LOGIN,
        credentials
      );

      if (!response.success || !response.data) {
        // Handle specific authentication errors with user-friendly messages
        const errorMessage = response.error
          ? getAuthErrorMessage(response.error)
          : "Login failed. Please check your credentials.";

        return {
          success: false,
          data: {} as User,
          error: {
            type: response.error?.type || ("AUTHENTICATION_ERROR" as any),
            message: errorMessage,
            code: response.error?.code,
            statusCode: response.error?.statusCode,
          },
        };
      }

      // Store tokens using AuthManager
      const tokens: AuthTokens = {
        accessToken: response.data.tokens.accessToken,
        refreshToken: response.data.tokens.refreshToken,
        expiresIn: response.data.tokens.expiresIn,
      };

      await this.authManager.storeTokens(tokens);
      
      // Convert ClientProfile to User
      const user = this.convertClientProfileToUser(response.data.client);
      this.currentUser = user;

      if (__DEV__) {
        console.log("✅ Login successful for:", response.data.client.email);
      }

      return {
        success: true,
        data: user,
      };
    } catch (error) {
      console.error("❌ Login failed:", error);

      // Handle network and other errors
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Login failed. Please try again.";

      return {
        success: false,
        data: {} as User,
        error: {
          type: "NETWORK_ERROR" as any,
          message: errorMessage,
        },
      };
    }
  }

  /**
   * Register new user
   */
  public async register(userData: RegisterData): Promise<ApiResponse<User>> {
    try {
      if (__DEV__) {
        console.log("📝 Attempting registration for:", userData.email);
      }

      // Validate registration data client-side
      const validationError = validateRegistrationData(userData);
      if (validationError) {
        return {
          success: false,
          data: {} as User,
          error: {
            type: "VALIDATION_ERROR" as any,
            message: validationError,
          },
        };
      }

      const response: ApiResponse<AuthResponse> = await httpClient.post(
        API_ENDPOINTS.AUTH.REGISTER,
        userData
      );

      if (!response.success || !response.data) {
        // Handle specific registration errors with user-friendly messages
        const errorMessage = response.error
          ? getAuthErrorMessage(response.error)
          : "Registration failed. Please check your information.";

        return {
          success: false,
          data: {} as User,
          error: {
            type: response.error?.type || ("VALIDATION_ERROR" as any),
            message: errorMessage,
            code: response.error?.code,
            statusCode: response.error?.statusCode,
            details: response.error?.details,
          },
        };
      }

      // Store tokens using AuthManager
      const tokens: AuthTokens = {
        accessToken: response.data.tokens.accessToken,
        refreshToken: response.data.tokens.refreshToken,
        expiresIn: response.data.tokens.expiresIn,
      };

      await this.authManager.storeTokens(tokens);
      
      // Convert ClientProfile to User
      const user = this.convertClientProfileToUser(response.data.client);
      this.currentUser = user;

      if (__DEV__) {
        console.log(
          "✅ Registration successful for:",
          response.data.client.email
        );
      }

      return {
        success: true,
        data: user,
      };
    } catch (error) {
      console.error("❌ Registration failed:", error);

      // Handle network and other errors
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Registration failed. Please try again.";

      return {
        success: false,
        data: {} as User,
        error: {
          type: "NETWORK_ERROR" as any,
          message: errorMessage,
        },
      };
    }
  }

  /**
   * Logout user
   */
  public async logout(): Promise<void> {
    try {
      if (__DEV__) {
        console.log("🚪 Logging out user");
      }

      // Optionally call logout endpoint
      try {
        await httpClient.post(API_ENDPOINTS.AUTH.LOGOUT);
      } catch (error) {
        // Ignore logout endpoint errors, still clear local tokens
        console.warn("⚠️ Logout endpoint failed, but clearing local tokens");
      }

      // Clear tokens and user data
      await this.authManager.clearTokens();
      this.currentUser = null;

      if (__DEV__) {
        console.log("✅ Logout successful");
      }
    } catch (error) {
      console.error("❌ Logout failed:", error);
      throw error;
    }
  }

  /**
   * Get current user
   */
  public getCurrentUser(): User | null {
    return this.currentUser;
  }

  /**
   * Check if user is authenticated
   */
  public async isAuthenticated(): Promise<boolean> {
    try {
      const isAuth = await this.authManager.isAuthenticated();

      // If we have a valid token but no user data, fetch user profile
      if (isAuth && !this.currentUser) {
        await this.fetchUserProfile();
      }

      return isAuth;
    } catch (error) {
      console.error("❌ Failed to check authentication:", error);
      return false;
    }
  }

  /**
   * Fetch user profile from API
   */
  public async fetchUserProfile(): Promise<User | null> {
    try {
      const response: ApiResponse<User> = await httpClient.get(
        API_ENDPOINTS.AUTH.PROFILE
      );

      if (response.success && response.data) {
        this.currentUser = response.data;
        return response.data;
      }

      return null;
    } catch (error) {
      console.error("❌ Failed to fetch user profile:", error);
      return null;
    }
  }

  /**
   * Get access token (with automatic refresh)
   */
  public async getAccessToken(): Promise<string | null> {
    return await this.authManager.getAccessToken();
  }

  /**
   * Force token refresh
   */
  public async refreshToken(): Promise<string | null> {
    return await this.authManager.refreshAccessToken();
  }

  /**
   * Get token information for debugging
   */
  public async getTokenInfo() {
    return await this.authManager.getTokenInfo();
  }

  /**
   * Initialize authentication on app start
   */
  public async initialize(): Promise<boolean> {
    try {
      if (__DEV__) {
        console.log("🚀 Initializing authentication...");
      }

      const isAuthenticated = await this.isAuthenticated();

      if (isAuthenticated) {
        if (__DEV__) {
          console.log("✅ User is authenticated");
        }
        return true;
      } else {
        if (__DEV__) {
          console.log("❌ User is not authenticated");
        }
        return false;
      }
    } catch (error) {
      console.error("❌ Authentication initialization failed:", error);
      return false;
    }
  }

  /**
   * Add event listener for auth events
   */
  public addEventListener<T extends AuthManagerEvents>(
    event: T,
    listener: (data: any) => void
  ): void {
    this.authManager.addEventListener(event, listener);
  }

  /**
   * Remove event listener for auth events
   */
  public removeEventListener<T extends AuthManagerEvents>(
    event: T,
    listener: (data: any) => void
  ): void {
    this.authManager.removeEventListener(event, listener);
  }
}

export default AuthService;
