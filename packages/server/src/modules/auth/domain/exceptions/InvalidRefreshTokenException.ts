/** Недействительный или просроченный refresh-токен. */
export class InvalidRefreshTokenException extends Error {
  constructor() {
    super("INVALID_REFRESH_TOKEN");
    this.name = new.target.name;
  }
}
