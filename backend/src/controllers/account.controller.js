import bcrypt from "bcryptjs";
import {
  createHash,
  randomBytes,
} from "node:crypto";
import prisma from "../config/prisma.js";
import { sendPasswordResetEmail } from "../services/email.service.js";
import asyncHandler from "../utils/asyncHandler.js";
import { clearAuthenticationCookie } from "../utils/token.js";

const publicUserFields = {
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
};

function hashResetToken(token) {
  return createHash("sha256")
    .update(token)
    .digest("hex");
}

export const updateProfile = asyncHandler(
  async (req, res) => {
    const { name, phone } = req.validated.body;
    const normalizedPhone = phone || null;

    if (normalizedPhone) {
      const phoneOwner =
        await prisma.user.findFirst({
          where: {
            phone: normalizedPhone,
            NOT: {
              id: req.user.id,
            },
          },
        });

      if (phoneOwner) {
        return res.status(409).json({
          success: false,
          message:
            "This telephone number is already connected to another account",
        });
      }
    }

    const user = await prisma.user.update({
      where: {
        id: req.user.id,
      },
      data: {
        name,
        phone: normalizedPhone,
      },
      select: publicUserFields,
    });

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user,
    });
  }
);

export const changePassword = asyncHandler(
  async (req, res) => {
    const {
      currentPassword,
      newPassword,
    } = req.validated.body;

    const user = await prisma.user.findUnique({
      where: {
        id: req.user.id,
      },
    });

    const currentPasswordMatches =
      await bcrypt.compare(
        currentPassword,
        user.passwordHash
      );

    if (!currentPasswordMatches) {
      return res.status(400).json({
        success: false,
        message: "The current password is incorrect",
      });
    }

    const passwordHash = await bcrypt.hash(
      newPassword,
      12
    );

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        passwordHash,
        resetTokenHash: null,
        resetTokenExpiresAt: null,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  }
);

export const forgotPassword = asyncHandler(
  async (req, res) => {
    const { email } = req.validated.body;

    const genericResponse = {
      success: true,
      message:
        "If an account exists for that email address, password-reset instructions have been prepared.",
    };

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user || !user.active) {
      return res.status(200).json(
        genericResponse
      );
    }

    const resetToken = randomBytes(32).toString(
      "hex"
    );

    const resetTokenHash =
      hashResetToken(resetToken);

    const resetTokenExpiresAt = new Date(
      Date.now() + 30 * 60 * 1000
    );

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        resetTokenHash,
        resetTokenExpiresAt,
      },
    });

    const frontendUrl =
      process.env.FRONTEND_URL ||
      process.env.CLIENT_URL ||
      "http://localhost:5173";

    const resetUrl =
      `${frontendUrl}/reset-password?token=` +
      encodeURIComponent(resetToken);

    try {
      await sendPasswordResetEmail({
        recipientEmail: user.email,
        recipientName: user.name,
        resetUrl,
      });
    } catch (emailError) {
      console.error(
        "Password-reset email failed:",
        emailError
      );

      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          resetTokenHash: null,
          resetTokenExpiresAt: null,
        },
      });

      return res.status(503).json({
        success: false,
        message:
          "Password-reset email could not be prepared. Please try again later.",
      });
    }

    return res.status(200).json(
      genericResponse
    );
  }
);

export const resetPassword = asyncHandler(
  async (req, res) => {
    const { token, password } =
      req.validated.body;

    const resetTokenHash =
      hashResetToken(token);

    const user = await prisma.user.findFirst({
      where: {
        resetTokenHash,
        resetTokenExpiresAt: {
          gt: new Date(),
        },
        active: true,
      },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message:
          "The password-reset link is invalid or has expired",
      });
    }

    const passwordHash = await bcrypt.hash(
      password,
      12
    );

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        passwordHash,
        resetTokenHash: null,
        resetTokenExpiresAt: null,
      },
    });

    clearAuthenticationCookie(res);

    return res.status(200).json({
      success: true,
      message:
        "Password reset successfully. You can now log in.",
    });
  }
);