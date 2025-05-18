import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Dynamically import so Webpack ignores it for client bundle
    const speedTest = (await import('speedtest-net')).default;

    const result = await speedTest({
      acceptLicense: true,
      acceptGdpr: true,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
