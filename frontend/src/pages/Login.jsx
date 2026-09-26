import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './AuthPages.css';
import { Sparkles, ArrowRight, ArrowLeft } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, loginWithProvider } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProviderLogin = async (providerName) => {
    setError(null);
    try {
      await loginWithProvider(providerName);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || `${providerName} login failed`);
    }
  };

  return (
    <div className="auth-container flex items-center justify-center" style={{ position: 'relative' }}>
      <Link 
        to="/" 
        style={{ 
          position: 'absolute', 
          top: '2rem', 
          left: '2rem', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem', 
          color: '#6B7280', 
          textDecoration: 'none',
          fontWeight: '500',
          fontSize: '14px',
          transition: 'color 0.2s ease'
        }}
        onMouseEnter={(e) => e.currentTarget.style.color = '#F97316'}
        onMouseLeave={(e) => e.currentTarget.style.color = '#6B7280'}
      >
        <ArrowLeft size={16} /> Back to Home
      </Link>
      <div className="auth-card">
        <div className="auth-brand-badge">
          <div className="logo-box">K</div>
          <span className="mono uppercase text-gray" style={{ fontSize: '11px', letterSpacing: '1px', fontWeight: '700' }}>
            CAMPUS SYNTHESIS
          </span>
        </div>

        <h2 className="serif text-black auth-title">Welcome back.</h2>
        
        {error && <div className="auth-error">{error}</div>}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '0.4rem' }}>Campus Email</label>
            <input 
              type="email" 
              placeholder="e.g. student@dsu.edu.in" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="auth-input"
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '0.4rem' }}>Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="auth-input"
            />
          </div>

          <button type="submit" className="cta-button" style={{ width: '100%', justifyContent: 'center', height: '44px', marginTop: '0.5rem' }} disabled={isSubmitting}>
            {isSubmitting ? 'Logging in...' : <>Login to Portal <ArrowRight size={16} /></>}
          </button>
        </form>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
          <button onClick={() => handleProviderLogin('google')} className="auth-input" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', cursor: 'pointer', background: '#fff', color: '#333' }}>
            <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Continue with Google
          </button>
        </div>

        <p className="auth-footer text-gray">
          Don't have an account yet? <Link to="/register" className="text-orange">Register here</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
