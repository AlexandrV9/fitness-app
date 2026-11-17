/** Пользователь не найден. */
export class UserNotFoundException extends Error {
  constructor() {
    super("USER_NOT_FOUND");
    this.name = new.target.name;
  }
}
