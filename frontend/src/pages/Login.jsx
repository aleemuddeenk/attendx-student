import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import api from '../services/api';

export default function Login() {
  const [regNo, setRegNo] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Pre-fill saved regNo on mount
  useEffect(() => {
    const saved = localStorage.getItem('rememberedRegNo');
    if (saved) {
      setRegNo(saved);
      setRememberMe(true);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/api/auth/login', { regNo, password });
      localStorage.setItem('token', res.data.accessToken);
      if (rememberMe) {
        localStorage.setItem('rememberedRegNo', regNo);
      } else {
        localStorage.removeItem('rememberedRegNo');
      }
      navigate('/scanner');
    } catch (err) {
      alert(err.response?.data || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Welcome Back" subtitle="Login to your ATTENDX account.">
      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <img src="/logo.png" alt="RIT Logo" style={{ maxWidth: '280px', height: 'auto' }} />
      </div>

      <form onSubmit={handleLogin}>
        <Input
          label="Registration Number"
          placeholder="e.g. 2117250010001"
          value={regNo}
          onChange={(e) => setRegNo(e.target.value)}
          required
        />
        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {/* Remember Me + Forgot Password */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.25rem',
          fontSize: '0.875rem',
        }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: 'var(--color-text)' }}>
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              style={{ width: '16px', height: '16px', accentColor: 'var(--color-primary-blue)', cursor: 'pointer' }}
            />
            Remember me
          </label>
          <Link to="/forgot-password" style={{ fontWeight: 500, color: 'var(--color-primary-blue)' }}>
            Forgot Password?
          </Link>
        </div>

        <Button type="submit" disabled={loading}>
          {loading ? 'Logging in…' : 'Login'}
        </Button>
      </form>

      <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--color-text-light)' }}>
        Don't have an account?{' '}
        <Link to="/register" style={{ fontWeight: 600 }}>Register</Link>
      </p>
    </Card>
  );
}
