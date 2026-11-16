import type { AuthJWTPayload } from "./IAuthJWTPayload.js";

export type AuthUserPayload = {
  id: string;
  login: string;
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
  generateAccessToken<TData extends PlainObject>(payload: TData): Promise<string>;
  generateRefreshToken<TData extends PlainObject>(payload: TData): Promise<string>;
  generateTokens(user: AuthUserPayload): Promise<GenerateTokensResponse>;
  verifyAccessToken(accessToken: string): Promise<VerifyAccessTokenResponse>;
  verifyRefreshToken(refreshToken: string): Promise<VerifyRefreshTokenResponse>;
  extractTokenFromAuthHeader(authHeader: string): string | null;
}
