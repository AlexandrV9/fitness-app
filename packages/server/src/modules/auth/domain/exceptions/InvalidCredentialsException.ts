/** Неверный логин или пароль. */
export class InvalidCredentialsException extends Error {
  constructor() {
    super("INVALID_CREDENTIALS");
    this.name = new.target.name;
  }
}
