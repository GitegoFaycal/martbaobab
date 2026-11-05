import bcrypt from "bcryptjs";
import prisma from "../config/prisma.js";
import asyncHandler from "../utils/asyncHandler.js";
import { normalizePhone } from "../constants/rwanda.js";
import {
  clearAuthenticationCookie,
  generateToken,
  setAuthenticationCookie,
} from "../utils/token.js";

export const publicUserFields = {
  id: true,
  name: true,
  email: true,
  phone: true,
  role: true,
  district: true,
  headline: true,
  bio: true,
  skills: true,
  avatarUrl: true,
  active: true,
  emailVerified: true,
  createdAt: true,
  updatedAt: true,
};

export const register = asyncHandler(async (req, res) => {
  const { name, email, phone, district, password, role } = req.validated.body;

  const normalizedPhone = normalizePhone(phone);

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email }, { phone: normalizedPhone }],
    },
  });

  if (existingUser) {
    const conflictField =
      existingUser.email === email ? "email" : "telephone number";

    return res.status(409).json({
      success: false,
      message: `An account with this ${conflictField} already exists`,
    });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      phone: normalizedPhone,
      district,
      passwordHash,
      role,
    },
    select: publicUserFields,
  });

  const token = generateToken(user);
  setAuthenticationCookie(res, token);

  return res.status(201).json({
    success: true,
    message:
      role === "SELLER"
        ? "Seller account created. Set up your shop to start selling."
        : "Welcome to LOCO. Your account is ready.",
    user,
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.validated.body;

  const userWithPassword = await prisma.user.findUnique({
    where: { email },
  });

  if (!userWithPassword) {
    return res.status(401).json({
      success: false,
      message: "Invalid email address or password",
    });
  }

  const passwordMatches = await bcrypt.compare(
    password,
    userWithPassword.passwordHash
  );

  if (!passwordMatches) {
    return res.status(401).json({
      success: false,
      message: "Invalid email address or password",
    });
  }

  if (!userWithPassword.active) {
    return res.status(403).json({
      success: false,
      message: "This account has been disabled",
    });
  }

  const user = await prisma.user.findUnique({
    where: { id: userWithPassword.id },
    select: publicUserFields,
  });

  const token = generateToken(user);
  setAuthenticationCookie(res, token);

  return res.status(200).json({
    success: true,
    message: "Login successful",
    user,
  });
});

export const logout = asyncHandler(async (req, res) => {
  clearAuthenticationCookie(res);

  return res.status(200).json({
    success: true,
    message: "Logout successful",
  });
});

export const getCurrentUser = asyncHandler(async (req, res) => {
  return res.status(200).json({
    success: true,
    user: req.user,
  });
});
