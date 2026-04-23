import React, { useState, useEffect, useCallback } from 'react';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

function StatusBadge({ status }) {
  const map = {
    Pending:     'badge-pending',
    Shortlisted: 'badge-shortlisted',
    Selected:    'badge-selected',
    Rejected:    'badge-rejected',
  };
  return <span className={`badge ${map[status] || 'badge-pending'}`}>{status}</span>;
}

function JobCard({ job, onApply, applying }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <h3 style={{ marginBottom: '0.2rem' }}>{job.title}</h3>
          <p style={{ color: 'var(--primary-light)', fontWeight: 600, fontSize: '0.95rem' }}>{job.company}</p>
        </div>
        <span className="badge badge-active">Active</span>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
        <span>📍 {job.location}</span>
        {job.salary && <span>💰 {job.salary}</span>}
        <span>⏰ {job.deadline}</span>
      </div>

      {job.skills && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
          {job.skills.split(',').map(s => (
            <span key={s.trim()} style={{
              background: 'rgba(99,102,241,0.12)', color: 'var(--primary-light)',
              border: '1px solid rgba(99,102,241,0.2)', borderRadius: '6px',
              padding: '0.15rem 0.6rem', fontSize: '0.75rem', fontWeight: 600,
            }}>{s.trim()}</span>
          ))}
        </div>
      )}

      {expanded && (
        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.7 }}>{job.description}</p>
      )}

      <div style={{ display: 'flex', gap: '0.75rem', marginTop: 'auto' }}>
        <button className="btn btn-secondary btn-sm" onClick={() => setExpanded(e => !e)}>
          {expanded ? 'Hide Details' : 'View Details'}
        </button>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => onApply(job.id)}
          disabled={applying === job.id}
        >
          {applying === job.id ? 'Applying…' : '⚡ Apply Now'}
        </button>
      </div>
    </div>
  );
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const [tab, setTab]         = useState('jobs');
  const [jobs, setJobs]       = useState([]);
  const [apps, setApps]       = useState([]);
  const [search, setSearch]   = useState('');
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [jobsRes, appsRes] = await Promise.all([
        API.get('/jobs'),
        API.get('/applications/my'),
      ]);
      setJobs(jobsRes.data);
      setApps(appsRes.data);
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleApply = async (jobId) => {
    setApplying(jobId);
    try {
      await API.post(`/applications/${jobId}`);
      toast.success('Application submitted! 🎉');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Could not apply');
    } finally {
      setApplying(null);
    }
  };

  const appliedJobIds = new Set(apps.map(a => a.job_id));

  const filteredJobs = jobs.filter(j => {
    const q = search.toLowerCase();
    return (
      j.title.toLowerCase().includes(q) ||
      j.company.toLowerCase().includes(q) ||
      (j.skills || '').toLowerCase().includes(q) ||
      j.location.toLowerCase().includes(q)
    );
  });

  return (
    <div className="page">
      <div className="container">
        {/* Header */}
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1>Student Dashboard</h1>
            <p className="text-muted">Welcome back, <strong style={{ color: 'var(--primary-light)' }}>{user?.name}</strong> 👋</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <div className="card" style={{ padding: '0.85rem 1.25rem', textAlign: 'center', minWidth: '90px' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary-light)' }}>{jobs.length}</div>
              <div className="text-muted" style={{ fontSize: '0.75rem' }}>Open Jobs</div>
            </div>
            <div className="card" style={{ padding: '0.85rem 1.25rem', textAlign: 'center', minWidth: '90px' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--success)' }}>{apps.length}</div>
              <div className="text-muted" style={{ fontSize: '0.75rem' }}>Applied</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs">
          <button className={`tab ${tab === 'jobs' ? 'active' : ''}`} onClick={() => setTab('jobs')}>💼 Browse Jobs</button>
          <button className={`tab ${tab === 'apps' ? 'active' : ''}`} onClick={() => setTab('apps')}>📋 My Applications</button>
        </div>

        {loading ? (
          <div className="spinner" />
        ) : tab === 'jobs' ? (
          <>
            {/* Search */}
            <div style={{ marginBottom: '1.5rem' }}>
              <input
                className="form-control"
                placeholder="🔍  Search by job title, company, skills, or location…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ maxWidth: '480px' }}
              />
            </div>
            {filteredJobs.length === 0 ? (
              <div className="empty-state">
                <div style={{ fontSize: '3rem' }}>🔍</div>
                <p>No jobs match your search.</p>
              </div>
            ) : (
              <div className="grid grid-2">
                {filteredJobs.map(job => (
                  <div key={job.id} style={{ position: 'relative' }}>
                    {appliedJobIds.has(job.id) && (
                      <div style={{
                        position: 'absolute', top: '1rem', right: '1rem', zIndex: 1,
                      }}>
                        <span className="badge badge-selected" style={{ fontSize: '0.7rem' }}>✓ Applied</span>
                      </div>
                    )}
                    <JobCard
                      job={job}
                      onApply={handleApply}
                      applying={applying}
                    />
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          /* My Applications */
          apps.length === 0 ? (
            <div className="empty-state">
              <div style={{ fontSize: '3rem' }}>📭</div>
              <p>You haven't applied to any jobs yet.</p>
              <button className="btn btn-primary mt-2" onClick={() => setTab('jobs')}>Browse Jobs</button>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Job Title</th>
                    <th>Company</th>
                    <th>Location</th>
                    <th>Applied On</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {apps.map((app, i) => (
                    <tr key={app.id}>
                      <td style={{ color: 'var(--text-muted)' }}>{i + 1}</td>
                      <td style={{ fontWeight: 600 }}>{app.job?.title || '—'}</td>
                      <td style={{ color: 'var(--primary-light)' }}>{app.job?.company || '—'}</td>
                      <td className="text-muted">{app.job?.location || '—'}</td>
                      <td className="text-muted">{new Date(app.applied_at).toLocaleDateString()}</td>
                      <td><StatusBadge status={app.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>
    </div>
  );
}
