import { JwtAuthTokenManager } from "../infrastructure/JwtAuthTokenManager.js";
import { createAuthMiddleware } from "./createAuthMiddleware.js";

export const authenticate = createAuthMiddleware(new JwtAuthTokenManager());
