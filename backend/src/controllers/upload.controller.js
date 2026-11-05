import multer from "multer";
import prisma from "../config/prisma.js";
import asyncHandler from "../utils/asyncHandler.js";
import { httpError } from "../utils/helpers.js";

const MAX_BYTES = 3 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export const uploadMiddleware = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_BYTES, files: 1 },
  fileFilter(req, file, callback) {
    if (ALLOWED.has(file.mimetype)) {
      callback(null, true);
    } else {
      callback(httpError(400, "Only JPEG, PNG, WebP or GIF photos are allowed"));
    }
  },
}).single("image");

function publicBaseUrl(req) {
  const proto = req.headers["x-forwarded-proto"] || req.protocol || "https";
  const host = req.headers["x-forwarded-host"] || req.get("host");
  return `${proto}://${host}`;
}

async function storeInBlob(file) {
  const { put } = await import("@vercel/blob");
  const extension = file.mimetype.split("/")[1].replace("jpeg", "jpg");

  const blob = await put(`loco/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extension}`, file.buffer, {
    access: "public",
    contentType: file.mimetype,
    addRandomSuffix: false,
  });

  return blob.url;
}

export const uploadImage = asyncHandler(async (req, res) => {
  const file = req.file;

  if (!file) {
    throw httpError(400, "Choose a photo to upload");
  }

  const useBlob = Boolean(process.env.BLOB_READ_WRITE_TOKEN);
  let url = null;

  if (useBlob) {
    url = await storeInBlob(file);
  }

  const image = await prisma.image.create({
    data: {
      mimeType: file.mimetype,
      size: file.size,
      data: useBlob ? null : file.buffer,
      url,
      ownerId: req.user.id,
    },
    select: { id: true, url: true, size: true, mimeType: true },
  });

  const finalUrl = image.url || `${publicBaseUrl(req)}/api/images/${image.id}`;

  return res.status(201).json({
    success: true,
    message: "Photo uploaded",
    image: { ...image, url: finalUrl },
    url: finalUrl,
  });
});

export const serveImage = asyncHandler(async (req, res) => {
  const image = await prisma.image.findUnique({
    where: { id: req.params.id },
  });

  if (!image) {
    throw httpError(404, "Image not found");
  }

  if (image.url) {
    return res.redirect(302, image.url);
  }

  res.set({
    "Content-Type": image.mimeType,
    "Content-Length": image.size,
    "Cache-Control": "public, max-age=31536000, immutable",
    "Cross-Origin-Resource-Policy": "cross-origin",
  });

  return res.status(200).send(Buffer.from(image.data));
});
