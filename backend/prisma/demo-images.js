// Fetches demo photos from Wikimedia Commons (free, no API key) and stores
// them in LOCO's own Image table so the site never depends on a third-party
// image host at runtime. Falls back to a branded SVG placeholder.

const USER_AGENT = "LOCO-demo-seed/1.0 (https://github.com/GitegoFaycal/martbaobab)";
const IMAGE_WIDTH = 800;
const MAX_BYTES = 2.5 * 1024 * 1024;

export function publicApiBase() {
  if (process.env.PUBLIC_API_URL) {
    return process.env.PUBLIC_API_URL.replace(/\/$/, "");
  }

  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}/api`;
  }

  return `http://localhost:${process.env.PORT || 5000}/api`;
}

export function isStoredImage(url) {
  return typeof url === "string" && url.includes("/api/images/");
}

async function fetchWithTimeout(url, ms = 25000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);

  try {
    return await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": USER_AGENT, Accept: "*/*" },
      redirect: "follow",
    });
  } finally {
    clearTimeout(timer);
  }
}

// Returns { buffer, mime } for the first bitmap photo matching the query.
export async function fetchCommonsPhoto(query) {
  const params = new URLSearchParams({
    action: "query",
    generator: "search",
    gsrsearch: `filetype:bitmap ${query}`,
    gsrnamespace: "6",
    gsrlimit: "6",
    prop: "imageinfo",
    iiprop: "url|mime|size",
    iiurlwidth: String(IMAGE_WIDTH),
    format: "json",
  });

  const search = await fetchWithTimeout(`https://commons.wikimedia.org/w/api.php?${params}`);

  if (!search.ok) {
    throw new Error(`Commons search failed (${search.status})`);
  }

  const data = await search.json();
  const pages = Object.values(data.query?.pages || {}).sort((a, b) => a.index - b.index);

  const candidate = pages
    .map((page) => page.imageinfo?.[0])
    .find(
      (info) =>
        info &&
        /^image\/(jpeg|png|webp)$/.test(info.mime) &&
        info.width >= 400 &&
        info.thumburl
    );

  if (!candidate) {
    throw new Error(`No photo found for "${query}"`);
  }

  const image = await fetchWithTimeout(candidate.thumburl);

  if (!image.ok) {
    throw new Error(`Photo download failed (${image.status})`);
  }

  const buffer = Buffer.from(await image.arrayBuffer());
  const mime = image.headers.get("content-type")?.split(";")[0] || candidate.mime;

  if (!buffer.length || buffer.length > MAX_BYTES || !mime.startsWith("image/")) {
    throw new Error(`Unusable photo for "${query}"`);
  }

  return { buffer, mime };
}

// Illustrated avatar for a demo person (DiceBear, free, deterministic per name).
export async function fetchAvatar(name) {
  const params = new URLSearchParams({
    seed: name,
    size: "256",
    backgroundColor: "fff8ef,ffe3c9,d9f7ee",
    radius: "50",
    skinColor: "763900,9e5622",
    hairColor: "0e0e0e,562306,6a4e35",
  });

  const response = await fetchWithTimeout(`https://api.dicebear.com/9.x/adventurer/png?${params}`);

  if (!response.ok) {
    throw new Error(`Avatar service failed (${response.status})`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  const mime = response.headers.get("content-type")?.split(";")[0] || "image/png";

  if (!buffer.length || !mime.startsWith("image/")) {
    throw new Error("Avatar service returned no image");
  }

  return { buffer, mime };
}

function escapeXml(value) {
  return String(value).replace(/[<>&"']/g, (char) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&apos;" }[char]));
}

// Branded placeholder with the item name, used when no photo could be fetched.
export function placeholderSvg(title, accent = "#f36b21") {
  const words = String(title).split(/\s+/);
  const lines = [];
  let line = "";

  for (const word of words) {
    if ((line + " " + word).trim().length > 22) {
      lines.push(line.trim());
      line = word;
    } else {
      line = `${line} ${word}`;
    }
  }
  if (line.trim()) lines.push(line.trim());

  const text = lines
    .slice(0, 3)
    .map((item, index) => `<text x="400" y="${300 + index * 44 - (Math.min(lines.length, 3) - 1) * 22}" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="34" font-weight="700" fill="#7a0019">${escapeXml(item)}</text>`)
    .join("");

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600"><rect width="800" height="600" fill="#fff8ef"/><circle cx="700" cy="90" r="140" fill="${accent}" opacity="0.18"/><circle cx="90" cy="540" r="160" fill="#19d3a2" opacity="0.16"/><rect x="40" y="40" width="720" height="520" rx="36" fill="none" stroke="${accent}" stroke-width="3" opacity="0.5"/>${text}<text x="400" y="530" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="18" font-weight="600" fill="#f36b21">LOCO · demo photo</text></svg>`;

  return { buffer: Buffer.from(svg, "utf8"), mime: "image/svg+xml" };
}

export async function storeImage(prisma, { buffer, mime }, ownerId = null) {
  const image = await prisma.image.create({
    data: { mimeType: mime, size: buffer.length, data: buffer, ownerId },
    select: { id: true },
  });

  return `${publicApiBase()}/images/${image.id}`;
}

// Fetches a photo for the query (placeholder on failure) and stores it.
export async function provideImage(prisma, query, title, ownerId = null) {
  let photo;

  try {
    photo = await fetchCommonsPhoto(query);
  } catch (error) {
    console.warn(`  photo fallback for "${title}": ${error.message}`);
    photo = placeholderSvg(title);
  }

  return storeImage(prisma, photo, ownerId);
}

// Runs `worker` over `items` with limited parallelism.
export async function mapLimit(items, limit, worker) {
  const results = new Array(items.length);
  let index = 0;

  async function run() {
    while (index < items.length) {
      const current = index;
      index += 1;
      results[current] = await worker(items[current], current);
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, run));
  return results;
}
