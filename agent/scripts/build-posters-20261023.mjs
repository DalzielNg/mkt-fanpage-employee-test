import sharp from 'sharp';
import fs from 'node:fs/promises';

const root = '/Users/user/Documents/My Job/Privacy Project/Fanpage Content/MKT-Fanpage';
const day = `${root}/outputs/2026-10-23`; // unused, kept for a stable task namespace
const sourceRoot = `${root}/outputs/source-research/2026-10-23`;
const posterRoot = `${root}/outputs/posters/2026-10-23`;
const refPath = '/Users/user/.codex/skills/cohort-tin-tuc-va-thoi-su/assets/poster-reference.png';
await fs.mkdir(posterRoot, { recursive: true });

const W = 1250;
const H = 1250;
const TOP_H = 748;
const PANEL_TOP = 748;

function svgMask(width, height, direction, stops) {
  const gradient = direction === 'vertical'
    ? `<linearGradient id="g" x1="0" y1="0" x2="0" y2="1">${stops.map(([offset, color]) => `<stop offset="${offset}%" stop-color="${color}"/>`).join('')}</linearGradient>`
    : `<linearGradient id="g" x1="0" y1="0" x2="1" y2="0">${stops.map(([offset, color]) => `<stop offset="${offset}%" stop-color="${color}"/>`).join('')}</linearGradient>`;
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><defs>${gradient}</defs><rect width="100%" height="100%" fill="url(#g)"/></svg>`);
}

async function maskedImage(path, direction, stops) {
  const image = await sharp(path).resize(W, TOP_H, { fit: 'cover', position: 'centre' }).png().toBuffer();
  const mask = svgMask(W, TOP_H, direction, stops);
  return sharp(image).joinChannel(mask).png().toBuffer();
}

async function compositeVertical(paths, output) {
  const base = await maskedImage(paths[0], 'vertical', [[0, '#fff'], [53, '#fff'], [66, '#000'], [100, '#000']]);
  const layers = [base];
  for (let i = 1; i < paths.length; i++) {
    const start = 48 + (i - 1) * 22;
    const end = start + 16;
    layers.push(await maskedImage(paths[i], 'vertical', [[0, '#000'], [start, '#000'], [end, '#fff'], [100, '#fff']]));
  }
  await sharp({ create: { width: W, height: TOP_H, channels: 4, background: '#f4f4f4' } }).composite(layers.map(input => ({ input }))).png().toFile(output);
}

async function compositeHorizontal(paths, output) {
  const base = await maskedImage(paths[0], 'horizontal', [[0, '#fff'], [40, '#fff'], [55, '#000'], [100, '#000']]);
  const layers = [base];
  for (let i = 1; i < paths.length; i++) {
    const start = 42 + (i - 1) * 25;
    const end = start + 13;
    layers.push(await maskedImage(paths[i], 'horizontal', [[0, '#000'], [start, '#000'], [end, '#fff'], [100, '#fff']]));
  }
  await sharp({ create: { width: W, height: TOP_H, channels: 4, background: '#f4f4f4' } }).composite(layers.map(input => ({ input }))).png().toFile(output);
}

function estimateWidth(text, fontSize) {
  let units = 0;
  for (const ch of text) units += ch === ' ' ? 0.33 : /[.,:;!?]/.test(ch) ? 0.28 : 0.59;
  return units * fontSize;
}

function wrapHeadline(text, fontSize = 42, maxWidth = 900) {
  const words = text.split(/\s+/);
  const lines = [];
  let line = '';
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (line && estimateWidth(candidate, fontSize) > maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function headlineSvg(headline) {
  const fontSize = 36;
  const lineHeight = 46;
  const lines = wrapHeadline(headline, fontSize);
  const startY = 930;
  const text = lines.map((line, i) => `<text x="62" y="${startY + i * lineHeight}" font-family="Arial, Helvetica, sans-serif" font-size="${fontSize}px" font-weight="900" fill="#111111">${line.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')}</text>`).join('');
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><rect x="0" y="748" width="1250" height="32" fill="#ffffff"/><rect x="48" y="885" width="1158" height="270" fill="#ffffff"/>${text}</svg>`);
}

async function makePoster(source, headline, output) {
  const panel = await sharp(refPath).extract({ left: 0, top: PANEL_TOP, width: W, height: H - PANEL_TOP }).png().toBuffer();
  const logoCrop = sharp(refPath).extract({ left: 0, top: PANEL_TOP, width: 370, height: 140 });
  const { data: logoData, info: logoInfo } = await logoCrop.raw().toBuffer({ resolveWithObject: true });
  const logoRgba = Buffer.alloc(logoInfo.width * logoInfo.height * 4);
  for (let y = 0; y < logoInfo.height; y++) {
    for (let x = 0; x < logoInfo.width; x++) {
      const si = (y * logoInfo.width + x) * logoInfo.channels;
      const di = (y * logoInfo.width + x) * 4;
      const r = logoData[si], g = logoData[si + 1], b = logoData[si + 2];
      logoRgba[di] = r; logoRgba[di + 1] = g; logoRgba[di + 2] = b;
      const nearWhite = Math.min(r, g, b) > 180;
      const logoRed = r > 130 && r > g * 1.45 && r > b * 1.2;
      const logoBlue = b > 100 && b > r * 1.15 && b > g * 0.9;
      logoRgba[di + 3] = nearWhite || logoRed || logoBlue ? 255 : 0;
    }
  }
  const logo = await sharp(logoRgba, { raw: { width: logoInfo.width, height: logoInfo.height, channels: 4 } }).png().toBuffer();
  const top = await sharp(source).resize(W, TOP_H, { fit: 'cover', position: 'centre' }).png().toBuffer();
  const whiteStrip = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="32"><rect width="100%" height="100%" fill="#ffffff"/></svg>`);
  await sharp({ create: { width: W, height: H, channels: 4, background: '#ffffff' } })
    .composite([
      { input: top, left: 0, top: 0 },
      { input: panel, left: 0, top: PANEL_TOP },
      { input: whiteStrip, left: 0, top: PANEL_TOP },
      { input: headlineSvg(headline), left: 0, top: 0 },
      { input: logo, left: 0, top: PANEL_TOP }
    ])
    .png()
    .toFile(output);
}

const jobs = [
  {
    id: '076',
    headline: 'CÂY PHƯỢNG BẬT GỐC, ĐÈ CHẾT NGƯỜI ĐÀN ÔNG 45 TUỔI Ở TP.HCM',
    images: [`${sourceRoot}/SRC-20261023-076/source-image-01.jpg`, `${sourceRoot}/SRC-20261023-076/source-image-02.jpg`],
    mode: 'vertical'
  },
  {
    id: '078',
    headline: '4 BẤT ĐỘNG SẢN LIÊN QUAN TRƯƠNG MỸ LAN ĐƯỢC ĐẤU GIÁ, GIÁ KHỞI ĐIỂM HƠN 375 TỶ',
    images: [`${sourceRoot}/SRC-20261023-078/source-image-01.jpeg`, `${sourceRoot}/SRC-20261023-078/source-image-02.jpeg`, `${sourceRoot}/SRC-20261023-078/source-image-03.jpeg`],
    mode: 'horizontal'
  },
  {
    id: '079',
    headline: 'NAM SINH BỊ BẮT KHẨN CẤP SAU VỤ LAO LÊN BỤC GIẢNG ĐÁNH CÔ GIÁO',
    images: [`${sourceRoot}/SRC-20261023-079/source-image-01.jpg`, `${sourceRoot}/SRC-20261023-079/source-image-02.jpg`],
    mode: 'horizontal'
  },
  {
    id: '080',
    headline: 'CÔ GÁI NÙNG TỐT NGHIỆP THỦ KHOA HỌC VIỆN AN NINH NHÂN DÂN',
    images: [`${sourceRoot}/SRC-20261023-080/source-image-01.jpg`, `${sourceRoot}/SRC-20261023-080/source-image-02.jpg`],
    mode: 'horizontal'
  }
];

for (const job of jobs) {
  const merged = `${posterRoot}/merged-source-${job.id}.png`;
  if (job.mode === 'vertical') await compositeVertical(job.images, merged);
  else await compositeHorizontal(job.images, merged);
  await makePoster(merged, job.headline, `${posterRoot}/poster-${job.id}.png`);
}

await makePoster(`${sourceRoot}/SRC-20261023-077/source-image-02.jpeg`, 'VNEID MỞ KÊNH TRAO ĐỔI GIỮA TỔ DÂN PHỐ VÀ CẢNH SÁT KHU VỰC', `${posterRoot}/poster-077.png`);
console.log('built posters 076, 077, 078, 079, 080');
