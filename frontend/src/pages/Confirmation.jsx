import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

export default function Confirmation() {
  const location = useLocation();
  const navigate = useNavigate();
  const scanData = location.state?.text;

  return (
    <Card 
      title="Attendance Marked!" 
      subtitle="Your attendance has been successfully recorded."
    >
      <div style={{ padding: '2rem 1rem', textAlign: 'center', background: '#F0FDF4', borderRadius: '8px', border: '1px solid #BBF7D0' }}>
        <div style={{ fontSize: '3rem', margin: '0 auto 1rem' }}>✅</div>
        <h3 style={{ color: 'var(--color-success)', marginBottom: '0.5rem' }}>Success</h3>
        {scanData && (
          <p style={{ color: 'var(--color-text)', fontSize: '0.9rem', wordBreak: 'break-all' }}>
            Data: <strong>{scanData}</strong>
          </p>
        )}
      </div>
      <div style={{ marginTop: '2rem' }}>
        <Button onClick={() => navigate('/scanner')}>Scan Another</Button>
      </div>
      <div style={{ marginTop: '1rem' }}>
        <Button variant="secondary" onClick={() => navigate('/login')}>Logout</Button>
      </div>
    </Card>
  );
}
