import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './AuthPages.css';
import { Sparkles, ArrowRight } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    college: '',
    studentId: ''
  });
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { registerAndSync, loginWithProvider } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setIsSubmitting(true);
    try {
      await registerAndSync(formData);
      setMessage('Registration successful! Please check your email to verify your account before logging in.');
      setFormData({
        name: '',
        email: '',
        password: '',
        college: '',
        studentId: ''
      });
    } catch (err) {
      setError(err.message || 'Registration failed');
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
      setError(err.message || `${providerName} registration failed`);
    }
  };

  return (
    <div className="auth-container flex items-center justify-center">
      <div className="auth-card">
        <div className="auth-brand-badge">
          <div className="logo-box">K</div>
          <span className="mono uppercase text-gray" style={{ fontSize: '11px', letterSpacing: '1px', fontWeight: '700' }}>
            CAMPUS SYNTHESIS
          </span>
        </div>

        <h2 className="serif text-black auth-title">Join KEVIN.</h2>
        
        {error && <div className="auth-error">{error}</div>}
        {message && <div style={{ background: '#ECFDF5', color: '#047857', padding: '0.85rem', fontSize: '13px', border: '1px solid #A7F3D0', borderRadius: '4px', marginBottom: '1.25rem', textAlign: 'center', fontWeight: '500' }}>{message}</div>}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <input type="text" name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} required className="auth-input" />
          <input type="email" name="email" placeholder="College Email (.edu.in or .ac.in)" value={formData.email} onChange={handleChange} required className="auth-input" />
          <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required className="auth-input" />
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <input type="text" name="college" placeholder="College Name" value={formData.college} onChange={handleChange} required className="auth-input" />
            <input type="text" name="studentId" placeholder="Student ID" value={formData.studentId} onChange={handleChange} required className="auth-input" />
          </div>

          <button type="submit" className="cta-button" style={{ width: '100%', justifyContent: 'center', height: '44px', marginTop: '0.5rem' }} disabled={isSubmitting}>
            {isSubmitting ? 'Registering Account...' : <>Create Account <ArrowRight size={16} /></>}
          </button>
        </form>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
          <button onClick={() => handleProviderLogin('google')} className="auth-input" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', cursor: 'pointer', background: '#fff', color: '#333' }}>
            <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Sign up with Google
          </button>
        </div>

        <p className="auth-footer text-gray">
          Already have an account? <Link to="/login" className="text-orange">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
