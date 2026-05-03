import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import api from '../services/api';

export default function Login() {
  const [regNo, setRegNo] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', { regNo, password });
      localStorage.setItem('token', res.data.accessToken);
      navigate('/scanner');
    } catch (err) {
      alert(err.response?.data || "Login failed check credentials");
    }
  };

  return (
    <Card title="Welcome Back" subtitle="Login to your ATTENDX account.">
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <img src="/logo.png" alt="RIT Logo" style={{ maxWidth: '280px', height: 'auto' }} />
      </div>
      <form onSubmit={handleLogin}>
        <Input 
          label="Registration Number" 
          placeholder="e.g. STU12345"
          value={regNo}
          onChange={(e) => setRegNo(e.target.value)}
          required
        />
        <Input 
          label="Password" 
          type="password"
          placeholder="********"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <div style={{ marginTop: '1.5rem' }}>
          <Button type="submit">Login</Button>
        </div>
      </form>
      <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem' }}>
        <p>
          <Link to="/forgot-password" style={{ fontWeight: 500 }}>Forgot Password?</Link>
        </p>
        <p style={{ marginTop: '0.75rem', color: 'var(--color-text-light)' }}>
          Don't have an account? <Link to="/register" style={{ fontWeight: 600 }}>Register</Link>
        </p>
      </div>
    </Card>
  );
}
