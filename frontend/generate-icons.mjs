import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const svg = readFileSync(resolve(__dirname, 'public/icon.svg'));

const sizes = [
  { size: 16,  name: 'favicon-16.png' },
  { size: 32,  name: 'favicon-32.png' },
  { size: 48,  name: 'favicon-48.png' },
  { size: 96,  name: 'icon-96.png' },
  { size: 180, name: 'apple-touch-icon.png' },
  { size: 192, name: 'icon-192.png' },
  { size: 512, name: 'icon-512.png' },
];

for (const { size, name } of sizes) {
  await sharp(svg)
    .resize(size, size)
    .png()
    .toFile(resolve(__dirname, 'public', name));
  console.log(`✅ ${name} (${size}x${size})`);
}

console.log('\n🎉 Ícones gerados com sucesso!');
