import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import api from '../services/api';

export default function Scanner() {
  const [scanResult, setScanResult] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "reader",
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
        videoConstraints: {
          facingMode: "environment"
        }
      },
      false
    );

    async function onScanSuccess(decodedText) {
      if(scanner) scanner.clear();
      setScanResult(decodedText);
      try {
        await api.post('/attendance/scan', { qrData: decodedText });
        navigate('/confirmation', { state: { text: decodedText } });
      } catch (err) {
        alert(err.response?.data || "Failed to log attendance check server connection or token.");
        navigate('/login');
      }
    }

    function onScanFailure(error) {
      // Ignored for continuous scanning
    }

    scanner.render(onScanSuccess, onScanFailure);

    return () => {
      if(scanner) scanner.clear().catch(e => console.error(e));
    };
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div style={{ width: '100%', maxWidth: '500px', margin: '0 auto' }}>
      <Card title="Scan Attendance QR" subtitle="Position the QR code inside the frame.">
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <img 
            src="/tree-logo.png" 
            alt="RIT Tree Logo" 
            style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', boxShadow: 'var(--shadow-md)' }} 
          />
        </div>
        <div id="reader" style={{ width: '100%', overflow: 'hidden', borderRadius: '8px' }}></div>
        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <Button variant="secondary" onClick={handleLogout}>Logout / Cancel</Button>
        </div>
      </Card>
    </div>
  );
}
