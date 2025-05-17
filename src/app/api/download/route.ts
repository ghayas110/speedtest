import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const size = 5 * 1024 * 1024; // 5MB
  const buffer = Buffer.alloc(size, 0);

  return new Response(buffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Length': size.toString(),
      'Content-Disposition': 'attachment; filename="dummy5mb.bin"',
    },
  });
}