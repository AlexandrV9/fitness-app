import bcrypt from "bcrypt";
import { scrypt, timingSafeEqual } from "node:crypto";

import { BCRYPT_MAX_PASSWORD_BYTES } from "../domain/passwordLimits.js";

import type { IPasswordHasher } from "../domain/interfaces/IPasswordHasher.js";

const BCRYPT_ROUNDS = 12;

async function verifyLegacyScrypt(password: string, hash: string): Promise<boolean> {
  const match = /^scrypt\$32768\$8\$3\$([0-9a-f]{32})\$([0-9a-f]{128})$/.exec(hash);
  if (!match) return false;

  const salt = Buffer.from(match[1], "hex");
  const expected = Buffer.from(match[2], "hex");
  const options = { cost: 32768, blockSize: 8, parallelization: 3, maxmem: 64 * 1024 * 1024 };
  const key = await new Promise<Buffer>((resolve, reject) => {
    scrypt(password, salt, expected.length, options, (error, derivedKey) => {
      if (error) reject(error);
      else resolve(derivedKey);
    });
  });

  return timingSafeEqual(key, expected);
}

export class BcryptPasswordHasher implements IPasswordHasher {
  async hash(password: string): Promise<string> {
    if (Buffer.byteLength(password, "utf8") > BCRYPT_MAX_PASSWORD_BYTES) {
      throw new RangeError("Password exceeds bcrypt's 72-byte limit");
    }
    return bcrypt.hash(password, BCRYPT_ROUNDS);
  }

  async verify(password: string, hash: string): Promise<boolean> {
    if (hash.startsWith("scrypt$")) {
      return verifyLegacyScrypt(password, hash);
    }
    if (Buffer.byteLength(password, "utf8") > BCRYPT_MAX_PASSWORD_BYTES) {
      return false;
    }
    return bcrypt.compare(password, hash);
  }
}
