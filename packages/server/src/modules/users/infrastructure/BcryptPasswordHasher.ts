import bcrypt from "bcrypt";

import type { IPasswordHasher } from "../domain/interfaces/IPasswordHasher.js";

const BCRYPT_ROUNDS = 12;

export class BcryptPasswordHasher implements IPasswordHasher {
  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, BCRYPT_ROUNDS);
  }

  async verify(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
