// Server only: read a stored MP4 / MOV's duration from its "moov/mvhd" box without loading the file
// (no ffprobe on the server). Returns null when the box cannot be found; callers then skip the check.
import { open, type FileHandle } from "node:fs/promises";

async function readAt(fh: FileHandle, offset: number, length: number): Promise<Buffer | null> {
  const buf = Buffer.alloc(length);
  const { bytesRead } = await fh.read(buf, 0, length, offset);
  return bytesRead === length ? buf : null;
}

/** Walk sibling boxes in [start, end) and return the payload range of the first one named `type`. */
async function findBox(fh: FileHandle, start: number, end: number, type: string): Promise<{ start: number; end: number } | null> {
  let pos = start;
  for (let i = 0; i < 10_000 && pos + 8 <= end; i += 1) {
    const head = await readAt(fh, pos, 8);
    if (!head) return null;
    let size = head.readUInt32BE(0);
    const name = head.toString("latin1", 4, 8);
    let headerLen = 8;
    if (size === 1) {
      const big = await readAt(fh, pos + 8, 8);
      if (!big) return null;
      size = Number(big.readBigUInt64BE(0));
      headerLen = 16;
    } else if (size === 0) {
      size = end - pos;
    }
    if (size < headerLen) return null;
    if (name === type) return { start: pos + headerLen, end: Math.min(pos + size, end) };
    pos += size;
  }
  return null;
}

/** Duration in seconds parsed from the mvhd box of an MP4 / MOV file. */
export async function probeVideoDurationSec(filePath: string): Promise<number | null> {
  let fh: FileHandle | null = null;
  try {
    fh = await open(filePath, "r");
    const { size } = await fh.stat();
    const moov = await findBox(fh, 0, size, "moov");
    if (!moov) return null;
    const mvhd = await findBox(fh, moov.start, moov.end, "mvhd");
    if (!mvhd) return null;
    const body = await readAt(fh, mvhd.start, Math.min(32, mvhd.end - mvhd.start));
    if (!body || body.length < 20) return null;
    const version = body[0];
    let timescale: number;
    let duration: number;
    if (version === 1) {
      if (body.length < 32) return null;
      timescale = body.readUInt32BE(20);
      duration = Number(body.readBigUInt64BE(24));
    } else {
      timescale = body.readUInt32BE(12);
      duration = body.readUInt32BE(16);
    }
    if (!timescale || !Number.isFinite(duration) || duration <= 0) return null;
    return duration / timescale;
  } catch {
    return null;
  } finally {
    await fh?.close().catch(() => undefined);
  }
}
