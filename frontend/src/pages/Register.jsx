import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import api from '../services/api';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [regNo, setRegNo] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords don't match!");
      return;
    }
    try {
      await api.post('/auth/register', { name, email, regNo, password });
      alert("Account created successfully. Please login.");
      navigate('/login');
    } catch (err) {
      alert(err.response?.data || "Registration failed");
    }
  };

  return (
    <Card title="Register" subtitle="Create your new ATTENDX student account.">
      <form onSubmit={handleRegister}>
        <Input 
          label="Full Name" 
          placeholder="John Doe"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <Input 
          label="Email Address" 
          type="email"
          placeholder="student@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input 
          label="Registration Number" 
          placeholder="e.g. STU12345"
          value={regNo}
          onChange={(e) => setRegNo(e.target.value)}
          required
        />
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Input 
            label="Password" 
            type="password"
            placeholder="********"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Input 
            label="Confirm Password" 
            type="password"
            placeholder="********"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        <div style={{ marginTop: '0.5rem' }}>
          <Button type="submit">Create Account</Button>
        </div>
      </form>
      <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--color-text-light)' }}>
        <p>
          Already have an account? <Link to="/login" style={{ fontWeight: 600 }}>Login here</Link>
        </p>
      </div>
    </Card>
  );
}
