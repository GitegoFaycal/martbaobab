import prisma from "../config/prisma.js";
import { verifyToken } from "../utils/token.js";

export default async function authenticate(req, res, next) {
  try {
    const cookieToken = req.cookies?.martbaobab_token;

    const authorizationHeader = req.headers.authorization;
    const bearerToken = authorizationHeader?.startsWith("Bearer ")
      ? authorizationHeader.substring(7)
      : null;

    const token = cookieToken || bearerToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication is required",
      });
    }

    const payload = verifyToken(token);

    const user = await prisma.user.findUnique({
      where: {
        id: payload.sub,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        avatarUrl: true,
        active: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "The account connected to this token no longer exists",
      });
    }

    if (!user.active) {
      return res.status(403).json({
        success: false,
        message: "This account has been disabled",
      });
    }

    req.user = user;
    next();
  } catch {
    return res.status(401).json({
      success: false,
      message: "The authentication session is invalid or has expired",
    });
  }
}