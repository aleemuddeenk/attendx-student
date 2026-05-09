import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import api from '../services/api';

export default function Scanner() {
  const navigate = useNavigate();
  const qrRef = useRef(null);        // holds Html5Qrcode instance
  const startedRef = useRef(false);  // prevents double-start in Strict Mode
  const [statusMsg, setStatusMsg] = useState('Point the camera at the QR code.');
  const [scanning, setScanning] = useState(true);

  // Called once the #qr-reader div is mounted in the DOM
  const startScanner = async () => {
    if (startedRef.current) return;
    startedRef.current = true;

    const qr = new Html5Qrcode('qr-reader');
    qrRef.current = qr;

    try {
      await qr.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        async (decodedText) => {
          try { await qr.stop(); } catch (_) {}
          setScanning(false);
          setStatusMsg('QR scanned! Logging attendance…');
          try {
            await api.post('/attendance/scan', { qrData: decodedText });
            navigate('/confirmation', { state: { text: decodedText } });
          } catch (err) {
            alert(err.response?.data || 'Failed to log attendance. Check connection or try again.');
            navigate('/login');
          }
        },
        () => {} // ignore per-frame failures
      );
    } catch (err) {
      console.error('Camera start error:', err);
      setStatusMsg('Camera error — please allow camera access and reload.');
      setScanning(false);
    }
  };

  useEffect(() => {
    // Tiny defer ensures the DOM div is fully painted before Html5Qrcode accesses it
    const timer = setTimeout(() => { startScanner(); }, 100);

    return () => {
      clearTimeout(timer);
      if (qrRef.current) {
        qrRef.current.stop().catch(() => {});
        qrRef.current = null;
      }
      startedRef.current = false;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLogout = async () => {
    if (qrRef.current) {
      try { await qrRef.current.stop(); } catch (_) {}
      qrRef.current = null;
    }
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div style={{ width: '100%', maxWidth: '500px', margin: '0 auto' }}>
      <Card title="Scan Attendance QR" subtitle="Position the QR code inside the frame.">

        {/* Logo */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
          <img
            src="/tree-logo.png"
            alt="RIT Logo"
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              objectFit: 'cover',
              boxShadow: 'var(--shadow-md)',
            }}
          />
        </div>

        {/* ── Single camera view ── */}
        <div
          id="qr-reader"
          style={{
            width: '100%',
            borderRadius: '10px',
            overflow: 'hidden',
            border: '2px solid var(--color-primary-blue)',
            minHeight: '260px',
            background: '#000',
          }}
        />

        {/* Status text */}
        <p style={{
          textAlign: 'center',
          marginTop: '0.75rem',
          fontSize: '0.88rem',
          color: scanning ? 'var(--color-text-light)' : 'var(--color-success)',
          fontWeight: 500,
          minHeight: '1.3rem',
        }}>
          {statusMsg}
        </p>

        {/* Logout / Cancel */}
        <div style={{ marginTop: '1.25rem' }}>
          <Button variant="secondary" onClick={handleLogout}>
            {scanning ? 'Stop Scanning / Logout' : 'Back to Login'}
          </Button>
        </div>

        {/*
          Suppress the extra UI panels html5-qrcode injects into #qr-reader
          (scan/stop buttons, file-upload section, status spans).
          We only want the raw <video> feed.
        */}
        <style>{`
          #qr-reader > img,
          #qr-reader__status_span,
          #qr-reader__dashboard,
          #qr-reader__header_message,
          #qr-reader__filescan_input,
          #qr-reader button {
            display: none !important;
          }
          #qr-reader video {
            width: 100% !important;
            height: auto !important;
            display: block !important;
          }
        `}</style>
      </Card>
    </div>
  );
}
