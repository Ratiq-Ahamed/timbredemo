import { mkdir, writeFile } from "node:fs/promises";
import sharp from "sharp";
const ids = [
  24023466, 1444442, 265730, 169198, 1024981, 32805940, 1456613, 20609907,
  31046031, 27910023, 2959192, 1043902,
];
await mkdir("public/demo-media", { recursive: true });
for (let i = 0; i < ids.length; i++) {
  const response = await fetch(
    `https://images.pexels.com/photos/${ids[i]}/pexels-photo-${ids[i]}.jpeg?auto=compress&cs=tinysrgb&w=1600`,
  );
  if (!response.ok) throw new Error(`Image ${ids[i]}: ${response.status}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  await sharp(bytes)
    .rotate()
    .resize({ width: 1400, withoutEnlargement: true })
    .webp({ quality: 83 })
    .toFile(`public/demo-media/wedding-${String(i + 1).padStart(2, "0")}.webp`);
  await sharp(bytes)
    .rotate()
    .resize({ width: 480, withoutEnlargement: true })
    .webp({ quality: 78 })
    .toFile(
      `public/demo-media/wedding-${String(i + 1).padStart(2, "0")}-thumb.webp`,
    );
  console.log(
    `Prepared wedding-${String(i + 1).padStart(2, "0")} · Pexels ${ids[i]}`,
  );
}
await writeFile(
  "public/demo-media/ASSETS.md",
  `# Demo photography provenance\n\nDownloaded 24 November 2026 from Pexels. These stock images illustrate fictional records; they are not Timbrel client work and imply no endorsement. No child photographs intentionally sourced.\n\nLicense: https://www.pexels.com/license/ — free use and modification; no implied endorsement or standalone resale. Sample collection download returns a generated filename manifest, not stock originals.\n\n${ids.map((id, i) => `- wedding-${String(i + 1).padStart(2, "0")}.webp and thumbnail: https://www.pexels.com/photo/${id}/ — photographer attribution is provided on the linked source page.`).join("\n")}\n\nProcessed locally with Sharp to WebP. Re-run scripts/prepare-assets.mjs only when refreshing bundled assets.\n`,
);
