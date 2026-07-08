import { writeFileSync, mkdirSync } from "fs";
import { deflateSync } from "zlib";

function createPNG(width, height, r, g, b, a = 255) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  function chunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const typeB = Buffer.from(type);
    const crcData = Buffer.concat([typeB, data]);
    let crc = 0xffffffff;
    for (const byte of crcData) {
      crc ^= byte;
      for (let i = 0; i < 8; i++) {
        crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
      }
    }
    const crcB = Buffer.alloc(4);
    crcB.writeUInt32BE(~crc >>> 0);
    return Buffer.concat([len, typeB, data, crcB]);
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  const raw = Buffer.alloc(height * (1 + width * 4));
  for (let y = 0; y < height; y++) {
    const rowStart = y * (1 + width * 4);
    raw[rowStart] = 0; // filter none
    for (let x = 0; x < width; x++) {
      const px = rowStart + 1 + x * 4;
      raw[px] = r;
      raw[px + 1] = g;
      raw[px + 2] = b;
      raw[px + 3] = a;
    }
  }

  const compressed = deflateSync(raw);
  return Buffer.concat([
    signature,
    chunk("IHDR", ihdr),
    chunk("IDAT", compressed),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

mkdirSync("public/icons", { recursive: true });

const blue = { r: 37, g: 99, b: 235 };
const white = { r: 255, g: 255, b: 255 };

// Blue icon
writeFileSync("public/icons/icon-192x192.png", createPNG(192, 192, blue.r, blue.g, blue.b));
writeFileSync("public/icons/icon-512x512.png", createPNG(512, 512, blue.r, blue.g, blue.b));

// White icon for maskable
writeFileSync("public/icons/icon-192x192-maskable.png", createPNG(192, 192, white.r, white.g, white.b));
writeFileSync("public/icons/icon-512x512-maskable.png", createPNG(512, 512, white.r, white.g, white.b));

console.log("Icons generated successfully");
