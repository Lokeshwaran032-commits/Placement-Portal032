import React, { useState, useEffect, useCallback } from 'react';
import API from '../api/axios';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = ['Pending', 'Shortlisted', 'Rejected', 'Selected'];

// ── Job Form ──────────────────────────────────────────────────────────────────
function JobForm({ initial, onSave, onCancel }) {
  const empty = { title: '', company: '', description: '', location: '', salary: '', deadline: '', skills: '' };
  const [form, setForm]     = useState(initial || empty);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const validate = () => {
    const e = {};
    ['title','company','description','location','deadline'].forEach(k => {
      if (!form[k]?.trim()) e[k] = 'Required';
    });
    return e;
  };

  const handle = e => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
    setErrors(p => ({ ...p, [e.target.name]: '' }));
  };

  const submit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    try {
      await onSave(form);
    } finally {
      setSaving(false);
    }
  };

  const fields = [
    { name: 'title',       label: 'Job Title',    type: 'text',   placeholder: 'Software Engineer' },
    { name: 'company',     label: 'Company',      type: 'text',   placeholder: 'Google' },
    { name: 'location',    label: 'Location',     type: 'text',   placeholder: 'Bangalore / Remote' },
    { name: 'salary',      label: 'Salary (CTC)', type: 'text',   placeholder: '12 LPA' },
    { name: 'deadline',    label: 'Deadline',     type: 'date',   placeholder: '' },
    { name: 'skills',      label: 'Required Skills (comma-separated)', type: 'text', placeholder: 'Python, React, SQL' },
  ];

  return (
    <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.1rem' }}>
        {fields.map(f => (
          <div key={f.name} className="form-group" style={f.name === 'skills' ? { gridColumn: '1 / -1' } : {}}>
            <label>{f.label}</label>
            <input name={f.name} type={f.type} className="form-control" placeholder={f.placeholder} value={form[f.name] || ''} onChange={handle} />
            {errors[f.name] && <span className="form-error">{errors[f.name]}</span>}
          </div>
        ))}
      </div>
      <div className="form-group">
        <label>Job Description</label>
        <textarea name="description" className="form-control" rows={4} placeholder="Describe the role, responsibilities, and requirements…" value={form.description || ''} onChange={handle} style={{ resize: 'vertical' }} />
        {errors.description && <span className="form-error">{errors.description}</span>}
      </div>
      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
        <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : initial ? 'Update Job' : 'Post Job'}</button>
      </div>
    </form>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [tab, setTab]             = useState('jobs');
  const [jobs, setJobs]           = useState([]);
  const [apps, setApps]           = useState([]);
  const [students, setStudents]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [editJob, setEditJob]     = useState(null);
  const [filterJob, setFilterJob] = useState('');

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [j, a, s] = await Promise.all([
        API.get('/admin/jobs'),
        API.get('/admin/applications'),
        API.get('/admin/students'),
      ]);
      setJobs(j.data);
      setApps(a.data);
      setStudents(s.data);
    } catch {
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handlePostJob = async (form) => {
    try {
      await API.post('/admin/jobs', form);
      toast.success('Job posted successfully! 🎉');
      setShowForm(false);
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to post job');
      throw err;
    }
  };

  const handleUpdateJob = async (form) => {
    try {
      await API.put(`/admin/jobs/${editJob.id}`, form);
      toast.success('Job updated!');
      setEditJob(null);
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to update job');
      throw err;
    }
  };

  const handleDeleteJob = async (id) => {
    if (!window.confirm('Deactivate this job posting?')) return;
    try {
      await API.delete(`/admin/jobs/${id}`);
      toast.success('Job deactivated');
      fetchAll();
    } catch {
      toast.error('Failed to delete job');
    }
  };

  const handleRemoveStudent = async (id) => {
    if (!window.confirm('Are you sure you want to remove this student? All their applications will also be deleted.')) return;
    try {
      await API.delete(`/admin/students/${id}`);
      toast.success('Student removed successfully');
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to remove student');
    }
  };


  const handleStatusChange = async (appId, status) => {
    try {
      await API.patch(`/admin/applications/${appId}`, { status });
      toast.success(`Status updated to ${status}`);
      setApps(prev => prev.map(a => a.id === appId ? { ...a, status } : a));
    } catch {
      toast.error('Failed to update status');
    }
  };

  const filteredApps = filterJob
    ? apps.filter(a => String(a.job_id) === filterJob)
    : apps;

  const statsData = [
    { label: 'Total Jobs',         value: jobs.length,                            color: 'var(--primary-light)' },
    { label: 'Active Jobs',        value: jobs.filter(j => j.is_active).length,   color: 'var(--success)' },
    { label: 'Applications',       value: apps.length,                            color: 'var(--secondary)' },
    { label: 'Students Registered',value: students.length,                        color: 'var(--warning)' },
  ];

  return (
    <div className="page">
      <div className="container">
        {/* Header */}
        <div className="page-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1>Admin Dashboard</h1>
              <p className="text-muted">Manage jobs, applications, and students</p>
            </div>
            {tab === 'jobs' && !showForm && !editJob && (
              <button className="btn btn-primary" onClick={() => setShowForm(true)}>+ Post New Job</button>
            )}
          </div>

          {/* Stats Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: '1rem', marginTop: '1.5rem' }}>
            {statsData.map(s => (
              <div key={s.label} className="card" style={{ padding: '1rem', textAlign: 'center' }}>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: s.color }}>{s.value}</div>
                <div className="text-muted" style={{ fontSize: '0.78rem' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs">
          <button className={`tab ${tab === 'jobs' ? 'active' : ''}`} onClick={() => { setTab('jobs'); setShowForm(false); setEditJob(null); }}>💼 Jobs</button>
          <button className={`tab ${tab === 'apps' ? 'active' : ''}`} onClick={() => setTab('apps')}>📋 Applications</button>
          <button className={`tab ${tab === 'students' ? 'active' : ''}`} onClick={() => setTab('students')}>👨‍🎓 Students</button>
        </div>

        {loading ? (
          <div className="spinner" />
        ) : (
          <>
            {/* ── Jobs Tab ── */}
            {tab === 'jobs' && (
              <>
                {(showForm || editJob) && (
                  <div className="card" style={{ marginBottom: '2rem' }}>
                    <h3 style={{ marginBottom: '1.5rem' }}>{editJob ? '✏️ Edit Job' : '📝 Post New Job'}</h3>
                    <JobForm
                      initial={editJob}
                      onSave={editJob ? handleUpdateJob : handlePostJob}
                      onCancel={() => { setShowForm(false); setEditJob(null); }}
                    />
                  </div>
                )}
                {jobs.length === 0 ? (
                  <div className="empty-state">
                    <div style={{ fontSize: '3rem' }}>📭</div>
                    <p>No jobs posted yet.</p>
                    <button className="btn btn-primary mt-2" onClick={() => setShowForm(true)}>Post First Job</button>
                  </div>
                ) : (
                  <div className="table-wrapper">
                    <table>
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Title</th>
                          <th>Company</th>
                          <th>Location</th>
                          <th>Deadline</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {jobs.map((job, i) => (
                          <tr key={job.id}>
                            <td style={{ color: 'var(--text-muted)' }}>{i + 1}</td>
                            <td style={{ fontWeight: 600 }}>{job.title}</td>
                            <td style={{ color: 'var(--primary-light)' }}>{job.company}</td>
                            <td className="text-muted">{job.location}</td>
                            <td className="text-muted">{job.deadline}</td>
                            <td>
                              <span className={`badge ${job.is_active ? 'badge-active' : 'badge-inactive'}`}>
                                {job.is_active ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button className="btn btn-secondary btn-sm" onClick={() => { setEditJob(job); setShowForm(false); }}>Edit</button>
                                <button className="btn btn-danger btn-sm" onClick={() => handleDeleteJob(job.id)}>Delete</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}

            {/* ── Applications Tab ── */}
            {tab === 'apps' && (
              <>
                <div style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Filter by Job:</label>
                  <select className="form-control" style={{ maxWidth: '260px' }} value={filterJob} onChange={e => setFilterJob(e.target.value)}>
                    <option value="">All Jobs</option>
                    {jobs.map(j => <option key={j.id} value={j.id}>{j.title} — {j.company}</option>)}
                  </select>
                  <span className="text-muted" style={{ fontSize: '0.85rem' }}>{filteredApps.length} records</span>
                </div>
                {filteredApps.length === 0 ? (
                  <div className="empty-state">
                    <div style={{ fontSize: '3rem' }}>📭</div>
                    <p>No applications found.</p>
                  </div>
                ) : (
                  <div className="table-wrapper">
                    <table>
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Student</th>
                          <th>Email</th>
                          <th>Job</th>
                          <th>Company</th>
                          <th>Applied On</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredApps.map((app, i) => (
                          <tr key={app.id}>
                            <td style={{ color: 'var(--text-muted)' }}>{i + 1}</td>
                            <td style={{ fontWeight: 600 }}>{app.student?.name || '—'}</td>
                            <td className="text-muted" style={{ fontSize: '0.82rem' }}>{app.student?.email || '—'}</td>
                            <td>{app.job?.title || '—'}</td>
                            <td style={{ color: 'var(--primary-light)' }}>{app.job?.company || '—'}</td>
                            <td className="text-muted">{new Date(app.applied_at).toLocaleDateString()}</td>
                            <td>
                              <select
                                className="form-control"
                                style={{ padding: '0.3rem 0.6rem', fontSize: '0.82rem', width: 'auto', minWidth: '130px' }}
                                value={app.status}
                                onChange={e => handleStatusChange(app.id, e.target.value)}
                              >
                                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}

            {/* ── Students Tab ── */}
            {tab === 'students' && (
              students.length === 0 ? (
                <div className="empty-state">
                  <div style={{ fontSize: '3rem' }}>👥</div>
                  <p>No students registered yet.</p>
                </div>
              ) : (
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>College</th>
                        <th>Branch</th>
                        <th>CGPA</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((s, i) => (
                        <tr key={s.id}>
                          <td style={{ color: 'var(--text-muted)' }}>{i + 1}</td>
                          <td style={{ fontWeight: 600 }}>{s.name}</td>
                          <td className="text-muted" style={{ fontSize: '0.85rem' }}>{s.email}</td>
                          <td className="text-muted">{s.college || '—'}</td>
                          <td className="text-muted">{s.branch || '—'}</td>
                          <td>
                            {s.cgpa != null ? (
                              <span style={{
                                fontWeight: 700,
                                color: s.cgpa >= 8 ? 'var(--success)' : s.cgpa >= 6 ? 'var(--warning)' : 'var(--danger)',
                              }}>{s.cgpa.toFixed(2)}</span>
                            ) : '—'}
                          </td>
                          <td>
                            <button className="btn btn-danger btn-sm" onClick={() => handleRemoveStudent(s.id)}>Remove</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            )}
          </>
        )}
      </div>
    </div>
  );
}
