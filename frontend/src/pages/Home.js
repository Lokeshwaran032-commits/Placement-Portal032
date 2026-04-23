import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const stats = [
  { label: 'Students Placed', value: '2,400+' },
  { label: 'Partner Companies', value: '180+' },
  { label: 'Active Jobs',      value: '350+' },
  { label: 'Success Rate',     value: '94%'  },
];

const features = [
  { icon: '🏢', title: 'Top Companies',    desc: 'Connect with industry-leading companies hiring fresh talent across all domains.' },
  { icon: '⚡', title: 'Instant Apply',    desc: 'One-click applications with real-time status tracking from Pending to Selected.' },
  { icon: '🎯', title: 'Smart Matching',   desc: 'Jobs matched to your skills, branch, and CGPA for the best opportunities.' },
  { icon: '📊', title: 'Admin Dashboard',  desc: 'Full management panel for recruiters to post jobs and manage applications.' },
];

export default function Home() {
  const { user } = useAuth();

  return (
    <div>
      {/* ── Hero ── */}
      <section style={{
        minHeight: 'calc(100vh - 64px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'radial-gradient(ellipse at 60% 40%, rgba(99,102,241,0.15) 0%, transparent 60%), radial-gradient(ellipse at 20% 80%, rgba(14,165,233,0.1) 0%, transparent 50%)',
        padding: '4rem 1.5rem',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: '720px' }}>
          <span style={{
            display: 'inline-block',
            background: 'rgba(99,102,241,0.15)',
            border: '1px solid rgba(99,102,241,0.3)',
            borderRadius: '999px',
            padding: '0.35rem 1rem',
            fontSize: '0.8rem',
            fontWeight: 700,
            color: 'var(--primary-light)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            marginBottom: '1.5rem',
          }}>
            🚀 Campus Placement Platform
          </span>
          <h1 style={{ marginBottom: '1.25rem', letterSpacing: '-0.02em' }}>
            Your Career Starts{' '}
            <span className="gradient-text">Here & Now</span>
          </h1>
          <p style={{ fontSize: '1.15rem', color: 'var(--text-muted)', marginBottom: '2.5rem', lineHeight: 1.75 }}>
            The all-in-one placement portal that connects ambitious students with top-tier companies.
            Apply, track, and get placed — all in one place.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            {user ? (
              <Link to={user.role === 'admin' ? '/admin-dashboard' : '/student-dashboard'}>
                <button className="btn btn-primary btn-lg">Go to Dashboard →</button>
              </Link>
            ) : (
              <>
                <Link to="/register"><button className="btn btn-primary btn-lg">Get Started Free</button></Link>
                <Link to="/login"><button className="btn btn-secondary btn-lg">Sign In</button></Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section style={{ background: 'var(--surface)', padding: '3rem 1.5rem', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '2rem', textAlign: 'center' }}>
            {stats.map(s => (
              <div key={s.label}>
                <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--primary-light)' }}>{s.value}</div>
                <div className="text-muted mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section style={{ padding: '5rem 1.5rem' }}>
        <div className="container">
          <div className="text-center" style={{ marginBottom: '3rem' }}>
            <h2>Everything you need to <span className="gradient-text">land your dream job</span></h2>
            <p className="text-muted mt-1">Powerful tools for students and admins alike</p>
          </div>
          <div className="grid grid-2">
            {features.map(f => (
              <div key={f.title} className="card" style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '2rem', flexShrink: 0 }}>{f.icon}</span>
                <div>
                  <h3 style={{ marginBottom: '0.4rem' }}>{f.title}</h3>
                  <p className="text-muted" style={{ fontSize: '0.9rem' }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      {!user && (
        <section style={{
          background: 'linear-gradient(135deg,rgba(99,102,241,0.12),rgba(14,165,233,0.08))',
          border: '1px solid var(--border)',
          margin: '0 1.5rem 4rem',
          borderRadius: 'var(--radius-lg)',
          padding: '3.5rem 2rem',
          textAlign: 'center',
        }}>
          <h2 style={{ marginBottom: '1rem' }}>Ready to get placed?</h2>
          <p className="text-muted" style={{ marginBottom: '2rem' }}>Join thousands of students already on the platform.</p>
          <Link to="/register">
            <button className="btn btn-primary btn-lg">Create Free Account</button>
          </Link>
        </section>
      )}
    </div>
  );
}
