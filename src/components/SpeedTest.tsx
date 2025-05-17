'use client';

import { useState, useEffect } from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

export default function SpeedTest() {
  const [downloadSpeed, setDownloadSpeed] = useState<number | null>(null);
  const [uploadSpeed, setUploadSpeed] = useState<number | null>(null);
  const [ping, setPing] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('speedTestHistory');
    if (stored) setHistory(JSON.parse(stored));
  }, []);

  const saveResult = (ping: number, download: number, upload: number) => {
    const newResult = {
      timestamp: new Date().toLocaleString(),
      ping,
      download,
      upload,
    };
    const updatedHistory = [newResult, ...history].slice(0, 5); // Limit to 5 entries
    setHistory(updatedHistory);
    localStorage.setItem('speedTestHistory', JSON.stringify(updatedHistory));
  };

  const testSpeed = async () => {
    setLoading(true);
    setDownloadSpeed(null);
    setUploadSpeed(null);
    setPing(null);

    try {
      // Ping Test (Cloudflare)
      const startPing = performance.now();
      await fetch('https://www.cloudflare.com/cdn-cgi/trace');
      const endPing = performance.now();
      const pingValue = Number((endPing - startPing).toFixed(2));
      setPing(pingValue);

      // Download Speed Test (parallel)
      const downloadSize = 20 * 1024 * 1024 * 8; // 20MB in bits
      const parallel = 4;
      const downloadStart = performance.now();
      await Promise.all(
        Array.from({ length: parallel }).map(() => fetch('/api/download').then(r => r.blob()))
      );
      const downloadEnd = performance.now();
      const duration = (downloadEnd - downloadStart) / 1000;
      const totalBits = downloadSize * parallel;
      const downloadValue = Number((totalBits / duration / 1024 / 1024).toFixed(2));
      setDownloadSpeed(downloadValue);

      // Upload Speed Test
      const uploadSize = 10 * 1024 * 1024; // 10MB
      const uploadStart = performance.now();
      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: new Blob([new ArrayBuffer(uploadSize)]),
      });
      if (!uploadResponse.ok) throw new Error('Upload failed');
      const uploadEnd = performance.now();
      const uploadDuration = (uploadEnd - uploadStart) / 1000;
      const uploadBits = uploadSize * 8;
      const uploadValue = Number((uploadBits / uploadDuration / 1024 / 1024).toFixed(2));
      setUploadSpeed(uploadValue);

      saveResult(pingValue, downloadValue, uploadValue);
    } catch (error) {
      setPing(null);
      setDownloadSpeed(null);
      setUploadSpeed(null);
      alert('Speed test failed. Please try again.');
    }

    setLoading(false);
  };

  const renderGauge = (label: string, value: number | null, max: number, unit: string) => (
    <div className="w-32">
      <CircularProgressbar
        value={value || 0}
        maxValue={max}
        text={value !== null ? `${value} ${unit}` : '...'}
        styles={buildStyles({
          textSize: '12px',
          pathColor: '#000',
          textColor: '#333',
          trailColor: '#eee',
        })}
      />
      <p className="text-sm text-center mt-1">{label}</p>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg mt-10 text-center">
      <h2 className="text-2xl font-bold mb-4">Internet Speed Analyzer</h2>
      <button
        onClick={testSpeed}
        className="bg-black text-white py-2 px-6 rounded hover:bg-gray-800 transition"
        disabled={loading}
      >
        {loading ? 'Testing...' : 'Start Test'}
      </button>

      {loading && <p className="mt-4 text-sm text-gray-500">Running speed test...</p>}

      <div className="flex justify-around mt-6 space-x-4">
        {renderGauge('Ping', ping, 300, 'ms')}
        {renderGauge('Download', downloadSpeed, 100, 'Mbps')}
        {renderGauge('Upload', uploadSpeed, 100, 'Mbps')}
      </div>

      <div className="mt-8 text-left">
        <h3 className="text-lg font-semibold mb-2">Test History</h3>
        {history.length === 0 ? (
          <p className="text-gray-500">No tests run yet.</p>
        ) : (
          <ul className="text-sm space-y-2">
            {history.map((item, idx) => (
              <li key={idx} className="border p-2 rounded bg-gray-50">
                <strong>{item.timestamp}</strong> — 🕒 {item.ping}ms ↓ {item.download}Mbps ↑ {item.upload}Mbps
              </li>
            ))}
          </ul>
        )}

        {history.length > 0 && (
          <button
            className="mt-4 text-sm text-red-500 underline"
            onClick={() => {
              setHistory([]);
              localStorage.removeItem('speedTestHistory');
            }}
          >
            Clear History
          </button>
        )}
      </div>
    </div>
  );
}
