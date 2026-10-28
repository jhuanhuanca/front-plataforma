import { deflateSync } from 'node:zlib'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

function crc32(buffer) {
  let crc = ~0
  for (const byte of buffer) {
    crc ^= byte
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1))
    }
  }
  return ~crc >>> 0
}

function chunk(type, data) {
  const name = Buffer.from(type)
  const length = Buffer.alloc(4)
  length.writeUInt32BE(data.length)
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(Buffer.concat([name, data])))
  return Buffer.concat([length, name, data, crc])
}

function icon(size) {
  const raw = Buffer.alloc((size * 4 + 1) * size)
  for (let y = 0; y < size; y += 1) {
    const row = y * (size * 4 + 1)
    raw[row] = 0
    const ny = y / size
    for (let x = 0; x < size; x += 1) {
      const nx = x / size
      const bar =
        (ny > 0.34 && ny < 0.42) || (ny > 0.48 && ny < 0.56) || (ny > 0.62 && ny < 0.7)
      const mark = bar && nx > 0.24 && nx < 0.76
      const color = mark ? [255, 255, 255] : [0x0b, 0x63, 0xf6]
      const offset = row + 1 + x * 4
      raw[offset] = color[0]
      raw[offset + 1] = color[1]
      raw[offset + 2] = color[2]
      raw[offset + 3] = 255
    }
  }

  const header = Buffer.alloc(13)
  header.writeUInt32BE(size, 0)
  header.writeUInt32BE(size, 4)
  header[8] = 8
  header[9] = 6
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  return Buffer.concat([
    signature,
    chunk('IHDR', header),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

const directory = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'icons')
mkdirSync(directory, { recursive: true })
writeFileSync(join(directory, 'icon-192.png'), icon(192))
writeFileSync(join(directory, 'icon-512.png'), icon(512))
