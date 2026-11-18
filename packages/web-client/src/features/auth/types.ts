import type { AuthUserDTO } from "~/shared/api";

export type AuthStatus =
  | "IDLE"
  | "PENDING"
  | "AUTHENTICATED"
  | "UNAUTHENTICATED";

export type AuthUser = AuthUserDTO;
