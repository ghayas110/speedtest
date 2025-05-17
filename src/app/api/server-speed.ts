import type { NextApiRequest, NextApiResponse } from 'next';
import speedTest from 'speedtest-net';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const result = await speedTest({ acceptLicense: true, acceptGdpr: true });

    const data = {
      ping: result.ping.latency,
      download: (result.download.bandwidth * 8 / 1_000_000).toFixed(2), // Mbps
      upload: (result.upload.bandwidth * 8 / 1_000_000).toFixed(2),
      isp: result.isp,
      server: result.server.name,
    };

    res.status(200).json(data);
  } catch (error: any) {
    res.status(500).json({ error: 'Speedtest failed', details: error.message });
  }
}
