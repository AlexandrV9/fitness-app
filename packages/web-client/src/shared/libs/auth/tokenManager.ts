import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from "~/shared/constants";

export const tokenManager = {
  getAccessToken: () => {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },
  setAccessToken: (token: string) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  },
  removeAccessToken: () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
  },
  getRefreshToken: () => {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },
  setRefreshToken: (token: string) => {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  },
  removeRefreshToken: () => {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
  setTokens: (accessToken: string, refreshToken: string) => {
    tokenManager.setAccessToken(accessToken);
    tokenManager.setRefreshToken(refreshToken);
  },
  clearTokens: () => {
    tokenManager.removeAccessToken();
    tokenManager.removeRefreshToken();
  },
};
