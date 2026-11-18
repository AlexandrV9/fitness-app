import axios from "axios";
import { authService } from "~/shared/api";
import { ApiError } from "~/shared/config";
import { tokenManager } from "~/shared/utils";
import { authActions, useAuthStore } from "./useAuthStore";

class AuthManager {
  async checkAuth(): Promise<boolean> {
    try {
      authActions.setStatus("PENDING");

      const accessToken = tokenManager.getAccessToken();
      const refreshToken = tokenManager.getRefreshToken();

      if (!accessToken && !refreshToken) {
        authActions.setStatus("UNAUTHENTICATED");
        return false;
      }

      if (!accessToken && refreshToken) {
        const refreshed = await this.refreshSession(refreshToken);
        if (!refreshed) {
          authActions.setStatus("UNAUTHENTICATED");
          return false;
        }
      }

      const response = await authService.getCurrentUser();

      if (!response.success) {
        tokenManager.clearTokens();
        authActions.setStatus("UNAUTHENTICATED");
        return false;
      }

      authActions.setUser(response.data);
      authActions.setStatus("AUTHENTICATED");
      return true;
    } catch {
      tokenManager.clearTokens();
      authActions.setStatus("UNAUTHENTICATED");
      return false;
    }
  }

  async signIn(credentials: { login: string; password: string }) {
    try {
      authActions.setStatus("PENDING");

      const response = await authService.signIn(credentials);

      if (!response.success) {
        authActions.setStatus("UNAUTHENTICATED");
        return response;
      }

      this.applySession(response.data);
      return response;
    } catch (error) {
      authActions.setStatus("UNAUTHENTICATED");
      throw this.toApiError(error);
    }
  }

  async signUp(credentials: { login: string; password: string }) {
    try {
      authActions.setStatus("PENDING");

      const response = await authService.signUp(credentials);

      if (!response.success) {
        authActions.setStatus("UNAUTHENTICATED");
        return response;
      }

      this.applySession(response.data);
      return response;
    } catch (error) {
      authActions.setStatus("UNAUTHENTICATED");
      throw this.toApiError(error);
    }
  }

  async signOut() {
    const currentStatus = useAuthStore.getState().status;
    const refreshToken = tokenManager.getRefreshToken();

    try {
      authActions.setStatus("PENDING");

      if (refreshToken) {
        await authService.logout(refreshToken);
      }

      tokenManager.clearTokens();
      authActions.setUser(null);
      authActions.setStatus("UNAUTHENTICATED");
    } catch (error) {
      console.error(error);
      authActions.setStatus(currentStatus);
    }
  }

  private applySession(session: {
    accessToken: string;
    refreshToken: string;
    user: { id: string; login: string };
  }) {
    tokenManager.setTokens(session.accessToken, session.refreshToken);
    authActions.setUser(session.user);
    authActions.setStatus("AUTHENTICATED");
  }

  private async refreshSession(refreshToken: string) {
    try {
      const response = await authService.refresh(refreshToken);
      if (!response.success) {
        tokenManager.clearTokens();
        return false;
      }

      this.applySession(response.data);
      return true;
    } catch {
      tokenManager.clearTokens();
      return false;
    }
  }

  private toApiError(error: unknown) {
    if (error instanceof ApiError) {
      return error;
    }

    if (axios.isAxiosError(error)) {
      return ApiError.fromResponse({
        message: error.response?.data?.message ?? error.message,
        code: error.response?.status,
        data: error.response?.data?.data,
      });
    }

    return ApiError.fromResponse({ message: "Unknown error" });
  }
}

export const authManager = new AuthManager();
