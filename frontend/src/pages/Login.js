import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const { login } = useAuth();
  const navigate   = useNavigate();
  const [form, setForm]       = useState({ email: '', password: '' });
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.email)    e.email    = 'Email is required';
    if (!form.password) e.password = 'Password is required';
    return e;
  };

  const handleChange = (e) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
    setErrors(p => ({ ...p, [e.target.name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      const res = await API.post('/auth/login', form);
      login(res.data);
      toast.success(`Welcome back, ${res.data.name}! 🎉`);
      navigate(res.data.role === 'admin' ? '/admin-dashboard' : '/student-dashboard');
    } catch (err) {
      if (err.response?.status === 401) {
        toast.error('Invalid email or password. Please try again.');
      } else if (err.response?.data?.detail) {
        toast.error(err.response.data.detail);
      } else if (!err.response) {
        toast.error('Cannot connect to server. Make sure the backend is running.');
      } else {
        toast.error('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 64px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '2rem 1rem',
      background: 'radial-gradient(ellipse at 50% 30%, rgba(99,102,241,0.12) 0%, transparent 60%)',
    }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        <div className="card">
          <div className="text-center" style={{ marginBottom: '2rem' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🔐</div>
            <h2>Welcome back</h2>
            <p className="text-muted mt-1">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-group">
              <label>Email Address</label>
              <input
                name="email" type="email"
                className="form-control"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
              />
              {errors.email && <span className="form-error">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                name="password" type="password"
                className="form-control"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
              />
              {errors.password && <span className="form-error">{errors.password}</span>}
            </div>

            <button type="submit" className="btn btn-primary w-full" disabled={loading} style={{ marginTop: '0.5rem' }}>
              {loading ? 'Signing in…' : 'Sign In →'}
            </button>
          </form>

          <p className="text-center text-muted mt-2" style={{ fontSize: '0.9rem' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--primary-light)', fontWeight: 600 }}>Register</Link>
          </p>

          {/* Demo hint */}
          <div style={{
            marginTop: '1.5rem',
            padding: '0.85rem',
            background: 'rgba(99,102,241,0.08)',
            borderRadius: 'var(--radius)',
            border: '1px solid rgba(99,102,241,0.2)',
            fontSize: '0.8rem',
            color: 'var(--text-muted)',
          }}>
            <strong style={{ color: 'var(--primary-light)' }}>Demo Admin:</strong> admin@portal.com / admin123
          </div>
        </div>
      </div>
    </div>
  );
}
