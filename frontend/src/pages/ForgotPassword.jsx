import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import api from '../services/api';

// ── Step indicators ────────────────────────────────────────────────────────
function Steps({ current }) {
  const steps = ['Email', 'OTP', 'Done'];
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.75rem', gap: 0 }}>
      {steps.map((label, i) => {
        const idx = i + 1;
        const active = idx === current;
        const done = idx < current;
        return (
          <React.Fragment key={label}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: '0.85rem',
                background: done ? '#10B981' : active ? '#1D4ED8' : '#E2E8F0',
                color: done || active ? '#fff' : '#94A3B8',
                transition: 'all 0.3s',
              }}>
                {done ? '✓' : idx}
              </div>
              <span style={{ fontSize: '0.7rem', fontWeight: 600, color: active ? '#1D4ED8' : done ? '#10B981' : '#94A3B8' }}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div style={{ flex: 1, height: '2px', background: done ? '#10B981' : '#E2E8F0', margin: '0 6px', marginBottom: '16px', transition: 'background 0.3s' }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ── OTP Input boxes ────────────────────────────────────────────────────────
function OtpBoxes({ otp, setOtp }) {
  const refs = Array.from({ length: 6 }, () => useRef(null));

  const handleChange = (val, idx) => {
    if (!/^\d?$/.test(val)) return;
    const arr = otp.split('');
    arr[idx] = val;
    setOtp(arr.join(''));
    if (val && idx < 5) refs[idx + 1].current?.focus();
  };

  const handleKeyDown = (e, idx) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      refs[idx - 1].current?.focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    setOtp(pasted.padEnd(6, ''));
    refs[Math.min(pasted.length, 5)].current?.focus();
    e.preventDefault();
  };

  return (
    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', margin: '1.5rem 0' }}>
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={refs[i]}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={otp[i] || ''}
          onChange={(e) => handleChange(e.target.value, i)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          onPaste={handlePaste}
          style={{
            width: '44px', height: '52px',
            textAlign: 'center', fontSize: '1.4rem', fontWeight: 700,
            border: `2px solid ${otp[i] ? '#1D4ED8' : '#CBD5E1'}`,
            borderRadius: '10px', outline: 'none',
            background: otp[i] ? '#EFF6FF' : '#F8FAFC',
            color: '#0A192F',
            transition: 'all 0.2s',
            fontFamily: 'monospace',
          }}
        />
      ))}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────
export default function ForgotPassword() {
  const [step, setStep] = useState(1);          // 1=email, 2=otp, 3=done
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const navigate = useNavigate();

  // ── Step 1: Send OTP ──────────────────────────────────────────────────
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    try {
      await api.post('/api/auth/forgot-password', { email });
      setStep(2);
      startResendCooldown();
    } catch (err) {
      if (!err.response) {
        setErrorMsg('Cannot connect to server. Make sure the backend is running.');
      } else {
        setErrorMsg(err.response?.data || 'No account found with that email.');
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Verify OTP + Set new password ────────────────────────────
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (otp.length < 6) { setErrorMsg('Please enter the full 6-digit OTP.'); return; }
    if (newPassword !== confirmPassword) { setErrorMsg('Passwords do not match.'); return; }
    if (newPassword.length < 6) { setErrorMsg('Password must be at least 6 characters.'); return; }
    setLoading(true);
    try {
      await api.post('/api/auth/verify-otp', { email, otp, newPassword });
      setStep(3);
    } catch (err) {
      if (!err.response) {
        setErrorMsg('Cannot connect to server.');
      } else {
        setErrorMsg(err.response?.data || 'Invalid or expired OTP. Try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Resend OTP cooldown (60s) ─────────────────────────────────────────
  const startResendCooldown = () => {
    setResendCooldown(60);
    const t = setInterval(() => {
      setResendCooldown((s) => { if (s <= 1) { clearInterval(t); return 0; } return s - 1; });
    }, 1000);
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setErrorMsg('');
    setLoading(true);
    setOtp('');
    try {
      await api.post('/api/auth/forgot-password', { email });
      startResendCooldown();
    } catch (err) {
      setErrorMsg(err.response?.data || 'Failed to resend OTP.');
    } finally {
      setLoading(false);
    }
  };

  // ── Error banner ──────────────────────────────────────────────────────
  const ErrorBanner = () => errorMsg ? (
    <div style={{
      background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px',
      padding: '0.75rem 1rem', color: '#DC2626', fontSize: '0.875rem',
      marginBottom: '1rem', fontWeight: 500,
    }}>
      ⚠️ {errorMsg}
    </div>
  ) : null;

  return (
    <Card title="Reset Password" subtitle="">
      <Steps current={step} />

      {/* ── STEP 1: Email ───────────────────────────────────────────────── */}
      {step === 1 && (
        <form onSubmit={handleSendOtp}>
          <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: '60px', height: '60px', borderRadius: '50%', background: '#EFF6FF',
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1D4ED8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2"/>
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
              </svg>
            </div>
            <p style={{ marginTop: '0.75rem', color: '#64748B', fontSize: '0.875rem' }}>
              Enter your registered email and we'll send a <strong>6-digit OTP</strong>.
            </p>
          </div>

          <ErrorBanner />

          <Input
            label="Email Address"
            type="email"
            placeholder="student@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <div style={{ marginTop: '0.5rem' }}>
            <Button type="submit" disabled={loading}>
              {loading ? 'Sending OTP…' : 'Send OTP →'}
            </Button>
          </div>
        </form>
      )}

      {/* ── STEP 2: Enter OTP + New Password ────────────────────────────── */}
      {step === 2 && (
        <form onSubmit={handleVerifyOtp}>
          <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: '60px', height: '60px', borderRadius: '50%', background: '#EFF6FF',
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1D4ED8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            <p style={{ marginTop: '0.75rem', color: '#64748B', fontSize: '0.875rem', lineHeight: 1.5 }}>
              OTP sent to <strong style={{ color: '#1D4ED8' }}>{email}</strong>.<br />
              <span style={{ fontSize: '0.8rem' }}>Check your inbox (and spam folder).</span>
            </p>
          </div>

          <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1E293B', display: 'block', textAlign: 'center' }}>
            Enter 6-Digit OTP
          </label>
          <OtpBoxes otp={otp} setOtp={setOtp} />

          {/* Resend OTP */}
          <div style={{ textAlign: 'center', marginBottom: '1rem', fontSize: '0.85rem' }}>
            {resendCooldown > 0 ? (
              <span style={{ color: '#94A3B8' }}>Resend OTP in <strong>{resendCooldown}s</strong></span>
            ) : (
              <button type="button" onClick={handleResend} disabled={loading}
                style={{ background: 'none', border: 'none', color: '#1D4ED8', fontWeight: 600, cursor: 'pointer', padding: 0, fontSize: '0.85rem' }}>
                Resend OTP
              </button>
            )}
          </div>

          <Input
            label="New Password"
            type="password"
            placeholder="Min. 6 characters"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <Input
            label="Confirm New Password"
            type="password"
            placeholder="Re-enter password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <ErrorBanner />

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem' }}>
            <button type="button" onClick={() => { setStep(1); setOtp(''); setErrorMsg(''); }}
              style={{ flex: 1, padding: '0.875rem', borderRadius: '8px', border: '1px solid #CBD5E1', background: '#F8FAFC', color: '#64748B', fontWeight: 600, cursor: 'pointer', fontSize: '0.95rem' }}>
              ← Back
            </button>
            <div style={{ flex: 2 }}>
              <Button type="submit" disabled={loading || otp.length < 6}>
                {loading ? 'Verifying…' : 'Reset Password'}
              </Button>
            </div>
          </div>
        </form>
      )}

      {/* ── STEP 3: Success ──────────────────────────────────────────────── */}
      {step === 3 && (
        <div style={{ textAlign: 'center', padding: '0.5rem 0 1rem' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: '72px', height: '72px', borderRadius: '50%', background: '#D1FAE5',
            marginBottom: '1.25rem', animation: 'popIn 0.4s ease',
          }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0A192F', marginBottom: '0.5rem' }}>
            Password Reset!
          </h3>
          <p style={{ color: '#64748B', fontSize: '0.9rem', marginBottom: '1.75rem' }}>
            Your password has been updated successfully.<br />You can now login with your new password.
          </p>
          <Button onClick={() => navigate('/login')}>Go to Login →</Button>
        </div>
      )}

      {step !== 3 && (
        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem' }}>
          <Link to="/login" style={{ fontWeight: 600 }}>← Back to Login</Link>
        </div>
      )}

      <style>{`
        @keyframes popIn {
          0%   { transform: scale(0.5); opacity: 0; }
          70%  { transform: scale(1.15); opacity: 1; }
          100% { transform: scale(1); }
        }
      `}</style>
    </Card>
  );
}
