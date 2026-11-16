import { UserNotFoundException } from "../../../domain/exceptions/UserNotFoundException.js";

import type { IUser } from "../../../domain/interfaces/IUser.js";
import type { IUsersRepository } from "../../../domain/interfaces/IUsersRepository.js";

export class GetUserUseCase {
  constructor(private readonly usersRepository: IUsersRepository) {}

  async execute(userId: string): Promise<IUser> {
    const user = await this.usersRepository.getUserById(userId);

    if (!user) {
      throw new UserNotFoundException();
    }

    return user;
  }
}
