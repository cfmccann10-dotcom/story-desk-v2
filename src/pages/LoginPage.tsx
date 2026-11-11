import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';

export default function LoginPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'signup') {
        // Check if email is approved in staff_members
        const { data: staffMember } = await supabase
          .from('staff_members')
          .select('role, approved')
          .eq('email', email)
          .single();

        if (!staffMember || !staffMember.approved) {
          setError('You do not have permission to access this platform.');
          setLoading(false);
          return;
        }

        // Sign up the user
        const { data: authData, error: signupError } = await supabase.auth.signUp({
          email,
          password,
        });
        if (signupError) throw signupError;

        // Create profile with role from staff_members (optional - skip if RLS blocks it)
        if (authData.user) {
          await supabase
            .from('profiles')
            .insert({
              id: authData.user.id,
              email: authData.user.email,
              role: staffMember.role,
            })
            .then()
            .catch(() => {
              // RLS may block this, but that's okay - profile is optional
            });
        }

        setError('Check your email to confirm your account');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f1f0ed',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 24px',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '420px',
        background: '#fff',
        borderRadius: '34px',
        padding: '48px 40px',
        boxShadow: '0 4px 20px rgba(23,24,26,.07)',
        display: 'flex',
        flexDirection: 'column',
        gap: '28px',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-.02em' }}>
            Story Desk
          </div>
          <div style={{ fontSize: '15px', color: '#8b8b88' }}>
            Middlesex University Dubai · PR story management
          </div>
        </div>

        <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '14px', fontWeight: 600, color: '#42433f' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              style={{
                padding: '14px 16px',
                borderRadius: '12px',
                border: '1px solid #e0dfd9',
                fontSize: '15px',
                background: '#faf9f7',
                fontFamily: 'inherit',
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '14px', fontWeight: 600, color: '#42433f' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{
                padding: '14px 16px',
                borderRadius: '12px',
                border: '1px solid #e0dfd9',
                fontSize: '15px',
                background: '#faf9f7',
                fontFamily: 'inherit',
              }}
            />
          </div>

          {error && (
            <div style={{
              background: error.includes('Check your email') ? 'oklch(0.95 0.05 120)' : 'oklch(0.96 0.045 60)',
              color: error.includes('Check your email') ? 'oklch(0.42 0.11 120)' : 'oklch(0.42 0.11 55)',
              borderRadius: '12px',
              padding: '12px 14px',
              fontSize: '14px',
              lineHeight: '1.4',
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '18px 28px',
              borderRadius: '999px',
              background: 'oklch(0.52 0.23 277)',
              color: '#fff',
              fontSize: '16px',
              fontWeight: 600,
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 10px 24px oklch(0.52 0.23 277 / .28)',
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? 'Loading...' : mode === 'signin' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          <div style={{ flex: 1, height: '1px', background: '#e0dfd9' }} />
          <div style={{ fontSize: '14px', color: '#8b8b88' }}>or</div>
          <div style={{ flex: 1, height: '1px', background: '#e0dfd9' }} />
        </div>

        <button
          onClick={() => {
            setMode(mode === 'signin' ? 'signup' : 'signin');
            setError('');
          }}
          style={{
            padding: '14px 28px',
            borderRadius: '999px',
            background: '#f1f0ed',
            color: '#42433f',
            fontSize: '16px',
            fontWeight: 600,
            border: 'none',
            cursor: 'pointer',
          }}
        >
          {mode === 'signin' ? 'Create new account' : 'Sign in instead'}
        </button>

        <div style={{
          fontSize: '13px',
          color: '#8b8b88',
          lineHeight: '1.5',
          textAlign: 'center',
        }}>
          {mode === 'signin'
            ? 'Enter your email and password to access Story Desk'
            : 'Create an account with your email to submit stories'
          }
        </div>
      </div>
    </div>
  );
}
