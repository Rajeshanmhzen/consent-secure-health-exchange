import bcrypt from "bcrypt";

const DEFAULT_SALT_ROUNDS = 10;

export async function hashPassword(password: string, saltRounds = DEFAULT_SALT_ROUNDS) {
    return bcrypt.hash(password, saltRounds);
}

export async function comparePassword(password: string, hash: string) {
    return bcrypt.compare(password, hash);
}
