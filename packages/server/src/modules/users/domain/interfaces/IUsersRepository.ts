import type { IUser, IUserAuth } from "./IUser.js";

export type CreateUserProps = {
  login: string;
  passwordHash: string;
};

export interface IUsersRepository {
  createUser(data: CreateUserProps): Promise<IUser | null>;
  getUserById(userId: string): Promise<IUser | null>;
  findByLogin(login: string): Promise<IUser | null>;
  findAuthByLogin(login: string): Promise<IUserAuth | null>;
}
