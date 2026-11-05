import prisma from "../config/prisma.js";
import { verifyToken } from "../utils/token.js";

// Attaches req.user when a valid session exists, but never blocks the request.
export default async function optionalAuth(req, res, next) {
  try {
    const cookieToken = req.cookies?.loco_token;
    const header = req.headers.authorization;
    const bearerToken = header?.startsWith("Bearer ")
      ? header.substring(7)
      : null;
    const token = cookieToken || bearerToken;

    if (!token) {
      return next();
    }

    const payload = verifyToken(token);

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, name: true, role: true, active: true },
    });

    if (user?.active) {
      req.user = user;
    }
  } catch {
    // Invalid or expired token: continue as a guest.
  }

  return next();
}
