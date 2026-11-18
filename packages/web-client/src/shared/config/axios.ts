import axios from "axios";

import { tokenManager } from "~/shared/libs/auth/tokenManager";

import type { AuthSessionDTO } from "~/shared/api/types";

export const axiosInstance = axios.create({ baseURL: "/api" });
let refreshRequest: Promise<AuthSessionDTO> | null = null;

export function refreshSession(refreshToken: string): Promise<AuthSessionDTO> {
  if (!refreshRequest) {
    refreshRequest = axios
      .post<{ data: AuthSessionDTO }>("/api/auth/refresh", { refreshToken })
      .then(({ data }) => {
        const session = data.data;

        if (!session?.accessToken || !session?.refreshToken) {
          throw new Error("Invalid refresh response");
        }

        if (tokenManager.getRefreshToken() !== refreshToken) {
          throw new Error("Session changed during refresh");
        }

        tokenManager.setTokens(session.accessToken, session.refreshToken);

        return session;
      })
      .finally(() => {
        refreshRequest = null;
      });
  }
  return refreshRequest;
}

function expireSession() {
  tokenManager.clearTokens();

  const redirect = window.location.pathname + window.location.search;

  window.location.replace("/signin?redirect=" + encodeURIComponent(redirect));
}

axiosInstance.interceptors.request.use((config) => {
  const accessToken = tokenManager.getAccessToken();
  if (accessToken) config.headers.Authorization = "Bearer " + accessToken;
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config as (typeof error.config & { _isRetry?: boolean }) | undefined;
    if (
      error.response?.status !== 401 ||
      !original ||
      original._isRetry ||
      original.url?.startsWith("/auth/")
    ) {
      return Promise.reject(error);
    }

    const refreshToken = tokenManager.getRefreshToken();
    if (!refreshToken) {
      expireSession();
      return Promise.reject(error);
    }

    original._isRetry = true;
    try {
      const session = await refreshSession(refreshToken);
      original.headers.Authorization = "Bearer " + session.accessToken;
      return axiosInstance(original);
    } catch (refreshError) {
      if (axios.isAxiosError(refreshError) && refreshError.response?.status === 401)
        expireSession();
      return Promise.reject(refreshError);
    }
  },
);
