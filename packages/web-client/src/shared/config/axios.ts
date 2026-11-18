import axios from "axios";
import { tokenManager } from "~/shared/utils";

export const axiosInstance = axios.create({
  baseURL: "/api",
});

axiosInstance.interceptors.request.use((config) => {
  const accessToken = tokenManager.getAccessToken();

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as
      | (typeof error.config & { _isRetry?: boolean })
      | undefined;

    if (error.response?.status === 401 && originalRequest && !originalRequest._isRetry) {
      originalRequest._isRetry = true;

      const refreshToken = tokenManager.getRefreshToken();
      if (!refreshToken) {
        tokenManager.clearTokens();
        return Promise.reject(error);
      }

      try {
        const response = await axios.post("/api/auth/refresh", {
          refreshToken,
        });

        const session = response.data?.data;
        if (!session?.accessToken || !session?.refreshToken) {
          throw new Error("Invalid refresh response");
        }

        tokenManager.setTokens(session.accessToken, session.refreshToken);
        originalRequest.headers.Authorization = `Bearer ${session.accessToken}`;

        return axiosInstance(originalRequest);
      } catch (refreshError) {
        tokenManager.clearTokens();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);
