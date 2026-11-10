import nodemailer from "nodemailer";

function hasSmtpConfiguration() {
  return Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASSWORD
  );
}

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
}

export async function sendPasswordResetEmail({
  recipientEmail,
  recipientName,
  resetUrl,
}) {
  if (!hasSmtpConfiguration()) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "SMTP is not configured. Set SMTP_HOST, SMTP_USER and SMTP_PASSWORD."
      );
    }

    console.log("");
    console.log("========== LOCO RESET LINK ==========");
    console.log(`User: ${recipientName}`);
    console.log(`Email: ${recipientEmail}`);
    console.log(`Reset URL: ${resetUrl}`);
    console.log("============================================");
    console.log("");

    return {
      delivered: false,
      developmentMode: true,
    };
  }

  const transporter = createTransporter();

  await transporter.sendMail({
    from: {
      name:
        process.env.SMTP_FROM_NAME ||
        "LOCO",
      address:
        process.env.SMTP_FROM_EMAIL ||
        process.env.SMTP_USER,
    },
    to: recipientEmail,
    subject: "Reset your LOCO password",
    text: [
      `Hello ${recipientName},`,
      "",
      "A request was received to reset your LOCO password.",
      "",
      `Open this link to choose a new password: ${resetUrl}`,
      "",
      "The link expires in 30 minutes.",
      "If you did not request this change, you can ignore this email.",
    ].join("\n"),
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#0a1a3f">
        <div style="background:#0b2a6f;padding:24px;border-radius:16px 16px 0 0">
          <h1 style="color:#ffffff;margin:0">LOCO</h1>
        </div>

        <div style="padding:28px;border:1px solid #f3ded6;border-top:0">
          <h2 style="color:#0b2a6f">Reset your password</h2>

          <p>Hello ${recipientName},</p>

          <p>
            A request was received to reset your LOCO password.
          </p>

          <p style="margin:28px 0">
            <a
              href="${resetUrl}"
              style="display:inline-block;background:#1e7ff5;color:#ffffff;text-decoration:none;font-weight:bold;padding:14px 28px;border-radius:999px"
            >
              Reset password
            </a>
          </p>

          <p style="font-size:13px;color:#6b6b6b">
            If the button does not work, copy this link into your browser:<br />
            <a href="${resetUrl}" style="color:#0b2a6f">${resetUrl}</a>
          </p>

          <p>This link expires in 30 minutes.</p>

          <p>
            If you did not request this change, you can safely ignore this email.
          </p>
        </div>
      </div>
    `,
  });

  return {
    delivered: true,
    developmentMode: false,
  };
}