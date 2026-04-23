import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import toast from 'react-hot-toast';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', email: '', password: '', college: '', branch: '', cgpa: '',
  });
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name.trim())    e.name    = 'Full name is required';
    if (!form.email.trim())   e.email   = 'Email is required';
    if (form.password.length < 6) e.password = 'Password must be at least 6 characters';
    if (form.cgpa && (isNaN(form.cgpa) || form.cgpa < 0 || form.cgpa > 10))
      e.cgpa = 'CGPA must be between 0 and 10';
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
      const payload = { ...form, cgpa: form.cgpa ? parseFloat(form.cgpa) : null };
      await API.post('/auth/register', payload);
      toast.success('Account created! Please sign in. 🎉');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { name: 'name',     label: 'Full Name',  type: 'text',   placeholder: 'John Doe' },
    { name: 'email',    label: 'Email',      type: 'email',  placeholder: 'you@example.com' },
    { name: 'password', label: 'Password',   type: 'password', placeholder: 'Min 6 characters' },
    { name: 'college',  label: 'College',    type: 'text',   placeholder: 'IIT Madras' },
    { name: 'branch',   label: 'Branch',     type: 'text',   placeholder: 'Computer Science' },
    { name: 'cgpa',     label: 'CGPA',       type: 'number', placeholder: '8.5' },
  ];

  return (
    <div style={{
      minHeight: 'calc(100vh - 64px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '2rem 1rem',
      background: 'radial-gradient(ellipse at 50% 20%, rgba(14,165,233,0.1) 0%, transparent 60%)',
    }}>
      <div style={{ width: '100%', maxWidth: '500px' }}>
        <div className="card">
          <div className="text-center" style={{ marginBottom: '2rem' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🎓</div>
            <h2>Create Account</h2>
            <p className="text-muted mt-1">Start your placement journey</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.1rem' }}>
              {fields.slice(0, 2).map(f => (
                <div key={f.name} className="form-group" style={{ gridColumn: f.name === 'name' ? '1' : '2' }}>
                  <label>{f.label}</label>
                  <input name={f.name} type={f.type} className="form-control" placeholder={f.placeholder} value={form[f.name]} onChange={handleChange} />
                  {errors[f.name] && <span className="form-error">{errors[f.name]}</span>}
                </div>
              ))}
            </div>

            {fields.slice(2).map(f => (
              <div key={f.name} className="form-group">
                <label>{f.label}</label>
                <input
                  name={f.name} type={f.type}
                  step={f.name === 'cgpa' ? '0.01' : undefined}
                  min={f.name === 'cgpa' ? '0' : undefined}
                  max={f.name === 'cgpa' ? '10' : undefined}
                  className="form-control"
                  placeholder={f.placeholder}
                  value={form[f.name]}
                  onChange={handleChange}
                />
                {errors[f.name] && <span className="form-error">{errors[f.name]}</span>}
              </div>
            ))}

            <button type="submit" className="btn btn-primary w-full" disabled={loading} style={{ marginTop: '0.5rem' }}>
              {loading ? 'Creating account…' : 'Create Account →'}
            </button>
          </form>

          <p className="text-center text-muted mt-2" style={{ fontSize: '0.9rem' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--primary-light)', fontWeight: 600 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
