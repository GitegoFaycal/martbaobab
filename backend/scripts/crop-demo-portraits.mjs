// Removes the generator's corner watermark by cropping the bottom strip, then
// re-centres each portrait as a 600x600 JPEG. Generated files are 640x640, so
// a 600px square means the file was already processed. Safe to re-run.
import { readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "prisma", "demo-portraits");
const CUT = 48;
const OUT = 600;

for (const file of readdirSync(dir).filter((name) => name.endsWith(".jpg"))) {
  const full = path.join(dir, file);
  const meta = await sharp(full).metadata();

  if (meta.width === OUT && meta.height === OUT) {
    console.log(`${file}: already cropped`);
    continue;
  }

  const side = Math.min(meta.width, meta.height - CUT);
  const buffer = await sharp(full)
    .extract({ left: Math.floor((meta.width - side) / 2), top: 0, width: side, height: side })
    .resize(OUT, OUT)
    .jpeg({ quality: 82, mozjpeg: true })
    .toBuffer();

  await sharp(buffer).toFile(full);
  console.log(`${file}: cropped to ${OUT}x${OUT}, ${buffer.length} bytes`);
}
