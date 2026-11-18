import { axiosInstance, refreshSession } from "~/shared/config/axios";

import type { ApiResult, AuthSessionDTO, AuthUserDTO } from "./types";

const toResult = <T>(data: T): ApiResult<T> => ({
  success: true,
  data,
});

class AuthService {
  async signIn(credentials: { login: string; password: string }) {
    const response = await axiosInstance.post<{ data: AuthSessionDTO }>(
      "/auth/sign-in",
      credentials,
    );
    return toResult(response.data.data);
  }

  async signUp(credentials: { login: string; password: string }) {
    const response = await axiosInstance.post<{ data: AuthSessionDTO }>(
      "/auth/sign-up",
      credentials,
    );
    return toResult(response.data.data);
  }

  async refresh(refreshToken: string) {
    return toResult(await refreshSession(refreshToken));
  }

  async logout(refreshToken: string) {
    await axiosInstance.post("/auth/logout", { refreshToken });
    return toResult(null);
  }

  async getCurrentUser() {
    const response = await axiosInstance.get<{ data: AuthUserDTO }>("/users/me");
    return toResult(response.data.data);
  }
}

export const authService = new AuthService();
