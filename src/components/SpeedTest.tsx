// app/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { Button } from './ui/Button';
import { NEXT_CACHE_TAG_MAX_LENGTH } from 'next/dist/lib/constants';

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [downloadSpeed, setDownloadSpeed] = useState<number | null>(null);
  const [uploadSpeed, setUploadSpeed] = useState<number | null>(null);
  const [ping, setPing] = useState<number | null>(null);

  const handleTest = async () => {
    setLoading(true);
    setResult(null);
    setDownloadSpeed(null);
    setUploadSpeed(null);
    setPing(null);

    try {
      // Ping
      const startPing = performance.now();
      await fetch('https://www.cloudflare.com/cdn-cgi/trace', { mode: 'cors' });
      const endPing = performance.now();
      const pingValue = Number((endPing - startPing).toFixed(2));
      setPing(pingValue);

      // Download
      const downloadStart = performance.now();
      const response = await fetch('/api/download');
      await response.blob();
      const downloadEnd = performance.now();
      const downloadDuration = (downloadEnd - downloadStart) / 1000;
      const bitsLoaded = 5 * 1024 * 1024 * 8;
      const downloadValue = Number((bitsLoaded / downloadDuration / 1024 / 1024).toFixed(2));
      setDownloadSpeed(downloadValue);

      // Upload
      const uploadStart = performance.now();
      await fetch('https://httpbin.org/post', {
        method: 'POST',
        body: new Blob([new ArrayBuffer(2 * 1024 * 1024)]),
      });
      const uploadEnd = performance.now();
      const uploadDuration = (uploadEnd - uploadStart) / 1000;
      const uploadBits = 2 * 1024 * 1024 * 8;
      const uploadValue = Number((uploadBits / uploadDuration / 1024 / 1024).toFixed(2));
      setUploadSpeed(uploadValue);

      setResult({
        ping: { latency: pingValue },
        download: { bandwidth: downloadSpeed ? downloadSpeed * 1e6 / 8 : downloadValue * 1e6 / 8 },
        upload: { bandwidth: uploadSpeed ? uploadSpeed * 1e6 / 8 : uploadValue * 1e6 / 8 },
        server: { name: 'N/A', location: 'N/A' },
        isp: 'N/A',
      });
    } catch (error) {
      setPing(null);
      setDownloadSpeed(null);
      setUploadSpeed(null);
      alert('Speed test failed. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center px-4">
      <h1 className="text-4xl font-bold mb-6">Internet Speed Test</h1>
      <Button onClick={handleTest} disabled={loading} className="mb-6">
        {loading ? 'Testing...' : 'Start Test'}
      </Button>
      {result && (
        <div className="bg-white shadow-xl rounded-xl p-6 w-full max-w-xl">
          {result.error ? (
            <p className="text-red-500">{result.error}</p>
          ) : (
            <>
              <p><strong>Ping:</strong> {result.ping.latency} ms</p>
              <p><strong>Download:</strong> {(result.download.bandwidth * 8 / 1e6).toFixed(2)} Mbps</p>
              <p><strong>Upload:</strong> {(result.upload.bandwidth * 8 / 1e6).toFixed(2)} Mbps</p>
              <p><strong>Server:</strong> {result.server.name}, {result.server.location}</p>
              <p><strong>ISP:</strong> {result.isp}</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
