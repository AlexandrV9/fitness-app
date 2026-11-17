/** Пользователь с таким логином уже существует. */
export class UserAlreadyExistsException extends Error {
  constructor(login?: string) {
    super(login ? `USER_ALREADY_EXISTS:${login}` : "USER_ALREADY_EXISTS");
    this.name = new.target.name;
  }
}
