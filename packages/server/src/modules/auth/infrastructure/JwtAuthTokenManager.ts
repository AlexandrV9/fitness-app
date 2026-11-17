import { decode, sign, verify } from "hono/jwt";
import { randomUUID } from "node:crypto";

import { config } from "../../../config/index.js";

import type { AuthJWTPayload } from "../domain/interfaces/IAuthJWTPayload.js";
import type {
  AuthUserPayload,
  IJwtAuthTokenManager,
  VerifyAccessTokenResponse,
  VerifyRefreshTokenResponse,
} from "../domain/interfaces/IJwtAuthTokenManager.js";

/**
 * Реализация JWT access/refresh токенов.
 */
export class JwtAuthTokenManager implements IJwtAuthTokenManager {
  async generateTokens(
    user: AuthUserPayload,
    sessionId: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const [accessToken, refreshToken] = await Promise.all([
      this.generateAccessToken(user),
      this.generateRefreshToken(user, sessionId),
    ]);

    return { accessToken, refreshToken };
  }

  /**
   * Функция генерации access токена
   */
  generateAccessToken<TData extends Record<string, unknown>>(payload: TData) {
    const { expInSec, secret } = config.auth.accessToken;
    return this.generateToken(payload, expInSec, secret);
  }

  /**
   * Функция генерации refresh токена
   */
  generateRefreshToken<TData extends Record<string, unknown>>(payload: TData, sessionId: string) {
    const { expInSec, secret } = config.auth.refreshToken;
    return this.generateToken(payload, expInSec, secret, sessionId);
  }

  /**
   * Функция проверки валидности access токена
   */
  async verifyAccessToken(token: string): Promise<VerifyAccessTokenResponse> {
    try {
      const data = (await verify(token, config.auth.accessToken.secret, "HS256")) as AuthJWTPayload;

      return {
        success: true,
        payload: data,
      };
    } catch {
      return {
        success: false,
        payload: null,
      };
    }
  }

  /**
   * Функция проверки валидности refresh токена
   */
  async verifyRefreshToken(token: string): Promise<VerifyRefreshTokenResponse> {
    try {
      const data = (await verify(
        token,
        config.auth.refreshToken.secret,
        "HS256",
      )) as AuthJWTPayload;

      return {
        success: true,
        payload: data,
      };
    } catch {
      return {
        success: false,
        payload: null,
      };
    }
  }

  /**
   * Функция получения токена из заголовка запроса
   */
  extractTokenFromAuthHeader = (authHeader: string) => {
    if (!authHeader) return null;

    const parts = authHeader.split(" ");

    if (parts.length === 2 && parts[0] === "Bearer") {
      return parts[1];
    }

    return null;
  };

  /**
   * Функция-хэлпэр для декодирования токена
   */
  decodeToken = (token: string) => {
    return decode(token);
  };

  /**
   * Функция-хэлпэр для генерации токена
   */
  private generateToken<TData extends Record<string, unknown>>(
    payload: TData,
    expInSec: number,
    secret: string,
    sessionId?: string,
  ) {
    return sign(
      {
        data: payload,
        jti: randomUUID(),
        ...(sessionId === undefined ? {} : { sid: sessionId }),
        exp: this.getTokenExpiration(expInSec),
      },
      secret,
    );
  }

  /**
   * Функция-хэлпэр для генерации срока жизни токена
   */
  private getTokenExpiration = (expiresInSeconds: number) => {
    return Math.floor(Date.now() / 1000) + expiresInSeconds;
  };
}
