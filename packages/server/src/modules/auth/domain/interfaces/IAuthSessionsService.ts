import type { AuthUserPayload, GenerateTokensResponse } from "./IJwtAuthTokenManager.js";

export type RefreshSessionResponse = GenerateTokensResponse & {
  user: AuthUserPayload;
};

export interface IAuthSessionsService {
  createUserSession(user: AuthUserPayload): Promise<GenerateTokensResponse>;
  refresh(refreshToken: string): Promise<RefreshSessionResponse>;
  logout(refreshToken: string): Promise<void>;
}
