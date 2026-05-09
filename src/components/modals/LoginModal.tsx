// LoginModal.tsx — v2.0 — Upsell mode for guests; link anonymous → real account (chats preserved)
import React, { useState } from 'react';
import {
  signInWithPopup, signInWithEmailAndPassword,
  createUserWithEmailAndPassword, linkWithPopup,
  linkWithCredential, EmailAuthProvider, GoogleAuthProvider,
} from 'firebase/auth';
import { auth, gauth } from '../../firebase';
import { useApp } from '../../context/AppContext';

function friendlyAuthError(code: string): string {
  return ({
    'auth/email-already-in-use':    'This email is already registered. Try signing in instead.',
    'auth/invalid-email':           'Please enter a valid email address.',
    'auth/user-not-found':          'No account found with that email.',
    'auth/wrong-password':          'Incorrect password. Please try again.',
    'auth/invalid-credential':      'Incorrect email or password.',
    'auth/weak-password':           'Password must be at least 6 characters.',
    'auth/too-many-requests':       'Too many attempts. Please wait a moment.',
    'auth/network-request-failed':  'Network error. Check your connection.',
    'auth/popup-closed-by-user':    'Sign-in window was closed. Please try again.',
    'auth/cancelled-popup-request': '',
    'auth/credential-already-in-use': 'This account already exists. Signing you in instead…',
  } as Record<string, string>)[code] ?? 'Authentication failed. Please try again.';
}

interface Props {
  /** Upsell mode: shown to guests at message limit — friendly, not a gate */
  upsell?: boolean;
  visible: boolean;
  onClose?: () => void;
}

export default function LoginModal({ upsell = false, visible, onClose }: Props) {
  const { guestMsgLimit } = useApp();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [agreed,   setAgreed]   = useState(false);
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const disabled = (!agreed && !upsell) || loading;

  // For upsell mode: link anonymous account → real account (same UID, chats preserved)
  // For normal mode: regular sign in / sign up
  const handleGoogle = async () => {
    if (!upsell && !agreed) { setError('Please agree to the terms first.'); return; }
    setLoading(true); setError('');
    try {
      if (upsell && auth.currentUser?.isAnonymous) {
        // Upgrade anonymous → Google (same UID, chats kept)
        await linkWithPopup(auth.currentUser, gauth);
      } else {
        await signInWithPopup(auth, gauth);
      }
    } catch (e: any) {
      if (e.code === 'auth/credential-already-in-use') {
        // Google account already registered — sign in with it
        // (chats from anonymous session will be lost, warn user)
        try {
          await signInWithPopup(auth, gauth);
          setError('');
        } catch (e2: any) { setError(friendlyAuthError(e2.code)); }
      } else {
        setError(friendlyAuthError(e.code));
      }
    } finally { setLoading(false); }
  };

  const handleEmail = async () => {
    if (!upsell && !agreed) { setError('Please agree to the terms first.'); return; }
    if (!email || !password) { setError('Please enter your email and password.'); return; }
    setLoading(true); setError('');
    try {
      if (upsell && auth.currentUser?.isAnonymous) {
        const credential = EmailAuthProvider.credential(email, password);
        await linkWithCredential(auth.currentUser, credential);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (e: any) {
      if (e.code === 'auth/credential-already-in-use') {
        try { await signInWithEmailAndPassword(auth, email, password); }
        catch (e2: any) { setError(friendlyAuthError(e2.code)); }
      } else {
        setError(friendlyAuthError(e.code));
      }
    } finally { setLoading(false); }
  };

  const handleSignup = async () => {
    if (!upsell && !agreed) { setError('Please agree to the terms first.'); return; }
    if (!email) { setError('Please enter your email address.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true); setError('');
    try {
      if (upsell && auth.currentUser?.isAnonymous) {
        const credential = EmailAuthProvider.credential(email, password);
        await linkWithCredential(auth.currentUser, credential);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (e: any) { setError(friendlyAuthError(e.code)); }
    finally { setLoading(false); }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '14px 18px', margin: '6px 0',
    borderRadius: '40px', border: '1px solid var(--border)',
    background: 'var(--glass-3)', color: 'var(--text-1)',
    fontSize: '16px', outline: 'none', display: 'block',
    backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
    fontFamily: 'inherit', transition: 'border-color .2s, background .2s',
    boxSizing: 'border-box',
  };

  const btnPrimary: React.CSSProperties = {
    width: '100%', padding: '14px', margin: '8px 0',
    borderRadius: '40px', border: 'none',
    background: 'var(--send-bg)', color: 'white',
    fontSize: '16px', fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
    boxShadow: '0 4px 16px rgba(0,122,255,0.3)',
    opacity: disabled ? 0.45 : 1, fontFamily: 'inherit',
    transition: 'opacity .15s', boxSizing: 'border-box',
  };

  const btnSecondary: React.CSSProperties = {
    width: '100%', padding: '14px', margin: '8px 0',
    borderRadius: '40px', border: '1px solid var(--border)',
    background: 'var(--glass-2)', color: 'var(--text-1)',
    fontSize: '16px', fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
    opacity: loading ? 0.45 : 1, fontFamily: 'inherit',
    transition: 'opacity .15s, background .15s', boxSizing: 'border-box',
  };

  const GoogleIcon = () => (
    <svg width="18" height="18" viewBox="0 0 48 48">
      <path fill="#4285F4" d="M24 9.5c3.19 0 5.38 1.38 6.62 2.53l4.88-4.76C32.48 4.1 28.58 2 24 2 14.82 2 7.07 7.71 4.04 15.53l5.68 4.41C11.36 13.77 17.18 9.5 24 9.5z"/>
      <path fill="#34A853" d="M46 24.5c0-1.57-.14-2.73-.43-3.91H24v7.38h12.72C36.19 31.31 33.68 34 30.36 35.62l5.52 4.28C40.93 36.08 46 30.86 46 24.5z"/>
      <path fill="#FBBC05" d="M9.72 28.63A14.5 14.5 0 0 1 9.5 24c0-1.61.28-3.17.78-4.62l-5.68-4.41A23.96 23.96 0 0 0 2 24c0 3.87.93 7.53 2.57 10.76l5.15-6.13z"/>
      <path fill="#EA4335" d="M24 46c4.97 0 9.15-1.64 12.21-4.46l-5.52-4.28C28.93 38.68 26.65 39.5 24 39.5c-6.82 0-12.64-4.27-14.28-10.87l-5.15 6.13C7.07 42.29 14.82 46 24 46z"/>
    </svg>
  );

  return (
    <div className={`login-overlay ${visible ? 'show' : ''}`}>
      <div className="login-card">

        {/* ── UPSELL MODE ── */}
        {upsell ? (
          <>
            {/* Friendly icon */}
            <div style={{ fontSize: '40px', marginBottom: '10px' }}>💬</div>
            <h2 style={{
              fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: '22px', marginBottom: '8px',
              color: 'var(--text-1)',
            }}>
              You've used {guestMsgLimit} free messages
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--text-3)', marginBottom: '24px', lineHeight: 1.6 }}>
              Sign in to keep your chat history and continue for free.{' '}
              <strong style={{ color: 'var(--text-2)' }}>We don't share or sell your data.</strong>
            </p>

            {/* Google — most prominent */}
            <button style={btnPrimary} disabled={loading} onClick={handleGoogle}>
              <GoogleIcon />
              Continue with Google
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '8px 0', color: 'var(--text-3)', fontSize: '14px' }}>
              <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
              or use email
              <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
            </div>

            {!isSignUp ? (
              <>
                <input style={inputStyle} type="email"    placeholder="Email"    value={email}    onChange={e => { setEmail(e.target.value); setError(''); }} />
                <input style={inputStyle} type="password" placeholder="Password" value={password} onChange={e => { setPassword(e.target.value); setError(''); }} />
                <button style={btnSecondary} disabled={loading} onClick={handleEmail}>Sign In & Save Chats</button>
                <button style={btnSecondary} disabled={loading} onClick={handleSignup}>Create Account & Save Chats</button>
              </>
            ) : (
              <>
                <input style={inputStyle} type="email"    placeholder="Email"    value={email}    onChange={e => { setEmail(e.target.value); setError(''); }} />
                <input style={inputStyle} type="password" placeholder="Password (min 6 chars)" value={password} onChange={e => { setPassword(e.target.value); setError(''); }} />
                <button style={btnSecondary} disabled={loading} onClick={handleSignup}>Create Account & Save Chats</button>
              </>
            )}

            <span
              onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
              style={{ display: 'inline-block', color: 'var(--accent)', cursor: 'pointer', marginTop: '8px', fontSize: '13px' }}
            >
              {isSignUp ? 'Already have an account? Sign in' : 'New here? Create an account'}
            </span>

            <div style={{ marginTop: '16px', fontSize: '12px', color: 'var(--text-3)', lineHeight: 1.5 }}>
              By continuing you agree to our{' '}
              <a href="https://app-eimemeschat.vercel.app/terms.html" target="_blank" rel="noreferrer">Terms</a>
              {' '}and{' '}
              <a href="https://app-eimemeschat.vercel.app/privacy.html" target="_blank" rel="noreferrer">Privacy Policy</a>
            </div>
          </>
        ) : (
          /* ── NORMAL LOGIN MODE (from settings) ── */
          <>
            <h2 style={{
              fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: '26px', marginBottom: '4px',
              background: 'linear-gradient(135deg, #5e9cff, #c96eff)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>
              EimemesChat AI
            </h2>
            <div style={{ fontSize: '14px', color: 'var(--text-3)', marginBottom: '22px' }}>
              {isSignUp ? 'Create your account to get started' : 'Welcome back, sign in to continue'}
            </div>

            <input style={inputStyle} type="email"    placeholder="Email"    value={email}    onChange={e => { setEmail(e.target.value); setError(''); }} />
            <input style={inputStyle} type="password" placeholder="Password" value={password} onChange={e => { setPassword(e.target.value); setError(''); }} />

            {isSignUp
              ? <button style={btnPrimary} disabled={disabled} onClick={handleSignup}>Create Account</button>
              : <button style={btnPrimary} disabled={disabled} onClick={handleEmail}>Sign In</button>
            }

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '12px 0', color: 'var(--text-3)', fontSize: '14px' }}>
              <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
              or
              <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
            </div>

            <button style={btnSecondary} disabled={disabled} onClick={handleGoogle}>
              <GoogleIcon />
              Continue with Google
            </button>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '9px', margin: '16px 0', textAlign: 'left' }}>
              <input
                type="checkbox" checked={agreed}
                onChange={e => { setAgreed(e.target.checked); setError(''); }}
                style={{ marginTop: '3px', accentColor: 'var(--accent)', flexShrink: 0 }}
              />
              <label style={{ fontSize: '14px', color: 'var(--text-2)', lineHeight: 1.4 }}>
                I agree to the{' '}
                <a href="https://app-eimemeschat.vercel.app/terms.html" target="_blank" rel="noreferrer">Terms</a>
                {' '}and{' '}
                <a href="https://app-eimemeschat.vercel.app/privacy.html" target="_blank" rel="noreferrer">Privacy Policy</a>
              </label>
            </div>

            <span
              onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
              style={{ display: 'inline-block', color: 'var(--accent)', cursor: 'pointer', marginTop: '12px', fontSize: '14px', fontWeight: 500 }}
            >
              {isSignUp ? 'Already have an account? Sign in' : 'New here? Create an account'}
            </span>
          </>
        )}

        {error && <div style={{ color: '#ff6b6b', fontSize: '13.5px', marginTop: '10px', minHeight: '20px' }}>{error}</div>}
      </div>
    </div>
  );
}
    
