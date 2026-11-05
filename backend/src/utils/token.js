import jwt from "jsonwebtoken";

export const AUTH_COOKIE = "loco_token";

export function generateToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    }
  );
}

export function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

function cookieOptions() {
  const isProduction = process.env.NODE_ENV === "production";

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
  };
}

export function setAuthenticationCookie(res, token) {
  res.cookie(AUTH_COOKIE, token, {
    ...cookieOptions(),
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

export function clearAuthenticationCookie(res) {
  res.clearCookie(AUTH_COOKIE, cookieOptions());
}
