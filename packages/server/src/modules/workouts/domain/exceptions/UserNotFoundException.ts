import { WorkoutException } from "./WorkoutException.js";

/** Пользователь не найден. */
export class UserNotFoundException extends WorkoutException {
  constructor() {
    super("USER_NOT_FOUND");
  }
}
