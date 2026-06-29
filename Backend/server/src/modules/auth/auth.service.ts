import argon2 from "argon2";
import { findUserByEmail } from "./auth.repository";
import { generateToken } from "../../utils/jwt";

export const loginService = async (
  email: string,
  password: string
) => {
  const user = await findUserByEmail(email);

  if (!user) {
    throw new Error("Invalid email or password");
  }

  const match = await argon2.verify(user.password, password);

  if (!match) {
    throw new Error("Invalid email or password");
  }

  const token = generateToken({
    id: user.id,
    role: user.role,
  });

  // ✅ Password remove kar diya
  const { password: _, ...safeUser } = user;

  return {
    user: safeUser,
    token,
  };
};