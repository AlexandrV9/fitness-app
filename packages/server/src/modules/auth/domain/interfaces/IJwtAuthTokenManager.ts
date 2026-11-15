import type { AuthJWTPayload } from "./IAuthJWTPayload.js";

export type AuthUserPayload = {
  id: string;
  login: string;
  name: string;
};

export type GenerateTokensResponse = {
  accessToken: string;
  refreshToken: string;
};

export type VerifyAccessTokenResponse =
  | {
      success: true;
      payload: AuthJWTPayload;
    }
  | {
      success: false;
      payload: null;
    };

export type VerifyRefreshTokenResponse =
  | {
      success: true;
      payload: AuthJWTPayload;
    }
  | {
      success: false;
      payload: null;
    };

type PlainObject = Record<string, unknown>;

export interface IJwtAuthTokenManager {
  /**
   * Генерирует accessToken
   */
  generateAccessToken<TData extends PlainObject>(
    payload: TData,
  ): Promise<string>;
  /**
   * Генерирует refreshToken
   */
  generateRefreshToken<TData extends PlainObject>(
    payload: TData,
  ): Promise<string>;
  /**
   * Генерирует accessToken + refreshToken
   */
  generateTokens(user: AuthUserPayload): Promise<GenerateTokensResponse>;
  /**
   * Проверить accessToken на валидность
   */
  verifyAccessToken(accessToken: string): Promise<VerifyAccessTokenResponse>;
  /**
   * Проверить refreshToken на валидность
   */
  verifyRefreshToken(refreshToken: string): Promise<VerifyRefreshTokenResponse>;
  /**
   * Извлечь token из заголовка запроса
   */
  extractTokenFromAuthHeader(authHeader: string): string | null;
}
