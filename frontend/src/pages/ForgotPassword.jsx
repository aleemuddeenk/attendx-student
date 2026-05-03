import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import api from '../services/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/forgot-password', { email });
      setIsSubmitted(true);
    } catch (err) {
      alert(err.response?.data || "Email not found or error occurred.");
    }
  };

  return (
    <Card title="Reset Password" subtitle="We'll send a reset code to your registered email.">
      {!isSubmitted ? (
        <form onSubmit={handleSubmit}>
          <Input 
            label="Email Address" 
            type="email"
            placeholder="student@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <div style={{ marginTop: '1.5rem' }}>
            <Button type="submit">Send Reset Link</Button>
          </div>
        </form>
      ) : (
        <div style={{ textAlign: 'center', padding: '1rem 0' }}>
          <p style={{ color: 'var(--color-success)', fontWeight: 500, fontSize: '1.1rem' }}>
            Verification code sent!
          </p>
          <p style={{ color: 'var(--color-text-light)', marginTop: '0.5rem', fontSize: '0.9rem' }}>
            Check your inbox and follow the instructions to reset your password.
          </p>
          <div style={{ marginTop: '1.5rem' }}>
             <Button variant="secondary" onClick={() => setIsSubmitted(false)}>Try another email</Button>
          </div>
        </div>
      )}
      
      <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem' }}>
        <Link to="/login" style={{ fontWeight: 600 }}>Back to Login</Link>
      </div>
    </Card>
  );
}
