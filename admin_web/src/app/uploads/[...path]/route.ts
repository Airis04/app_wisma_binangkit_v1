import { readFile } from "node:fs/promises";
import path from "node:path";

// Menyajikan file upload (foto unit, bukti bayar, foto profil) dari disk
// secara dinamis. Diperlukan karena `next start` (produksi) TIDAK menyajikan
// file yang ditambahkan ke folder public SETELAH build. Route ini membaca
// langsung dari folder public/uploads saat request, sehingga file yang
// di-upload tamu/admin tetap tampil di produksi.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UPLOADS_ROOT = path.join(process.cwd(), "public", "uploads");

const CONTENT_TYPES: Record<string, string> = {
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: segments } = await params;

  if (!segments || segments.length === 0) {
    return new Response("Not found", { status: 404 });
  }

  // Gabung segmen path lalu pastikan hasil tetap di dalam UPLOADS_ROOT
  // (mencegah path traversal seperti ../../etc/passwd).
  const filePath = path.join(UPLOADS_ROOT, ...segments);
  if (
    filePath !== UPLOADS_ROOT &&
    !filePath.startsWith(UPLOADS_ROOT + path.sep)
  ) {
    return new Response("Not found", { status: 404 });
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = CONTENT_TYPES[ext];
  if (!contentType) {
    return new Response("Not found", { status: 404 });
  }

  try {
    const file = await readFile(filePath);
    return new Response(new Uint8Array(file), {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
