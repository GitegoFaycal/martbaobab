// Generates photorealistic portraits for the demo accounts (AI-generated, no
// real person) and saves them to prisma/demo-portraits/<key>.jpg.
// The free service allows one image per 45 seconds, so this takes ~12 minutes.
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(here, "..", "prisma", "demo-portraits");
mkdirSync(outDir, { recursive: true });

const PEOPLE = [
  ["jeanne", "Rwandan woman in her forties, shop owner, warm smile, colourful headscarf, standing in her grocery shop"],
  ["eric", "Rwandan man in his early thirties, phone repair technician, friendly, wearing a polo shirt, in a small electronics shop"],
  ["aline", "Rwandan woman in her late thirties, tailor, elegant kitenge dress, in a sewing workshop"],
  ["patrick", "Rwandan man around fifty, builder and hardware supplier, confident, wearing a work shirt, hardware store background"],
  ["grace", "Rwandan woman around forty, farmer, bright smile, outdoors with green hills of Musanze behind her"],
  ["jmv", "Rwandan man in his mid thirties, motorcycle taxi rider, wearing a helmet pushed back, Gisenyi street"],
  ["claudine", "Rwandan woman in her early forties, furniture shop owner, kind expression, in a furniture showroom"],
  ["emmanuel", "Rwandan man in his late twenties, electrician, wearing a blue work shirt, holding a multimeter"],
  ["diane", "Rwandan woman in her mid thirties, nurse, white uniform, gentle smile, hospital corridor"],
  ["kevin", "Rwandan man in his early thirties, factory supervisor, hi-vis vest, production line background"],
  ["olive", "Rwandan woman in her late forties, property caretaker, calm expression, residential gate background"],
  ["yves", "Rwandan man in his late thirties, secondary school teacher, glasses, classroom background"],
  ["sandrine", "Rwandan woman in her late twenties, mobile money agent, yellow kiosk background, cheerful"],
  ["fabrice", "Rwandan man around thirty, driver and gardener, cap, garden background"],
  ["josiane", "Rwandan woman in her mid twenties, house help and cook, apron, bright kitchen"],
  ["innocent", "Rwandan man in his early thirties, mason, dusty work clothes, construction site, proud smile"],
];

const STYLE = "photorealistic head and shoulders portrait photo, natural daylight, looking at camera, sharp focus, 85mm lens, shallow depth of field, high quality, realistic skin";

async function generate(key, description, seed) {
  const prompt = encodeURIComponent(`${description}, ${STYLE}`);
  const url = `https://image.pollinations.ai/prompt/${prompt}?width=640&height=640&nologo=true&seed=${seed}&model=flux`;

  for (let attempt = 1; attempt <= 4; attempt += 1) {
    const response = await fetch(url, { headers: { Accept: "image/jpeg" } });
    const type = response.headers.get("content-type") || "";
    const buffer = Buffer.from(await response.arrayBuffer());

    if (response.ok && type.startsWith("image/") && buffer.length > 20000) {
      return buffer;
    }

    const text = buffer.toString("utf8", 0, 200);
    const wait = /Retry after (\d+)s/.exec(text)?.[1] || 50;
    console.log(`  ${key}: attempt ${attempt} not ready (${response.status}); waiting ${wait}s`);
    await new Promise((resolve) => setTimeout(resolve, (Number(wait) + 2) * 1000));
  }

  throw new Error(`gave up on ${key}`);
}

let index = 0;
for (const [key, description] of PEOPLE) {
  index += 1;
  const file = path.join(outDir, `${key}.jpg`);

  if (existsSync(file)) {
    console.log(`${key}: exists`);
    continue;
  }

  try {
    const buffer = await generate(key, description, 1000 + index);
    writeFileSync(file, buffer);
    console.log(`${key}: saved ${buffer.length} bytes`);
  } catch (error) {
    console.log(`${key}: FAILED ${error.message}`);
  }

  await new Promise((resolve) => setTimeout(resolve, 47000));
}

console.log("done");
