import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { users } from "../db/schema/users.js";
import { generateToken } from "../middleware/auth.middleware.js";

export async function signupUser({ name, email, password }) {
  if (!name || !email || !password) {
    throw new Error("Name, email and password are required");
  }

  const normalizedEmail = email.trim().toLowerCase();

  // Check if user already exists
  const existingUsers = await db
    .select()
    .from(users)
    .where(eq(users.email, normalizedEmail))
    .limit(1);

  if (existingUsers.length > 0) {
    const error = new Error("An account with this email already exists");
    error.statusCode = 409;
    throw error;
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 10);

  // Insert user
  const [createdUser] = await db
    .insert(users)
    .values({
      name: name.trim(),
      email: normalizedEmail,
      password_hash: passwordHash,
      updated_at: new Date(),
    })
    .returning({
      id: users.id,
      name: users.name,
      email: users.email,
      createdAt: users.created_at,
    });

  const token = generateToken({
    userId: createdUser.id,
    email: createdUser.email,
    name: createdUser.name,
  });

  return {
    user: createdUser,
    token,
  };
}

export async function loginUser({ email, password }) {
  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  const normalizedEmail = email.trim().toLowerCase();

  const [existingUser] = await db
    .select()
    .from(users)
    .where(eq(users.email, normalizedEmail))
    .limit(1);

  if (!existingUser) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  const isMatch = await bcrypt.compare(password, existingUser.password_hash);
  if (!isMatch) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  const token = generateToken({
    userId: existingUser.id,
    email: existingUser.email,
    name: existingUser.name,
  });

  return {
    user: {
      id: existingUser.id,
      name: existingUser.name,
      email: existingUser.email,
      createdAt: existingUser.created_at,
    },
    token,
  };
}

export async function getMe(userId) {
  const [existingUser] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      createdAt: users.created_at,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!existingUser) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  return existingUser;
}
