import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic'; // For large uploads

export async function POST(req: NextRequest) {
  // Just read the body to simulate upload
  await req.arrayBuffer();
  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}