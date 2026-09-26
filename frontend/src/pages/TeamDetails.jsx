import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../services/api';

// ─── Score ring helpers ───────────────────────────────────────────────────────
function ScoreRing({ score, size = 56, stroke = 5 }) {
  const r = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 70 ? '#22c55e' : score >= 40 ? '#f59e0b' : '#ef4444';
  return (
    <svg width={size} height={size} style={{ flexShrink: 0 }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e5e7eb" strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: 'stroke-dashoffset 0.6s ease' }}
      />
      <text x="50%" y="50%" textAnchor="middle" dy="0.35em"
        style={{ fontSize: size * 0.22, fontWeight: 700, fill: color, fontFamily: 'inherit' }}>
        {Math.round(score)}
      </text>
    </svg>
  );
}

// ─── Evidence badge ───────────────────────────────────────────────────────────
function EvidenceBadge({ level }) {
  const cfg = {
    strong:   { emoji: '🟢', label: 'Strong',   bg: '#dcfce7', color: '#166534' },
    moderate: { emoji: '🟡', label: 'Moderate', bg: '#fef9c3', color: '#854d0e' },
    weak:     { emoji: '🔴', label: 'Weak',     bg: '#fee2e2', color: '#991b1b' },
  };
  const { emoji, label, bg, color } = cfg[level] || cfg.moderate;
  return (
    <span style={{ background: bg, color, fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 99, letterSpacing: 0.3 }}>
      {emoji} {label} Evidence
    </span>
  );
}

// ─── Candidate card ───────────────────────────────────────────────────────────
function CandidateCard({ candidate, rank, onInvite }) {
  const [expanded, setExpanded] = useState(false);
  const forks = candidate.authenticityBreakdown?.forkedRepositories || 0;
  const originals = candidate.authenticityBreakdown?.originalRepositories || 0;
  const avgContrib = candidate.authenticityBreakdown?.averagePersonalContribution || 0;

  return (
    <div style={{
      border: '1px solid #e5e7eb', borderRadius: 12, padding: '1.25rem 1.5rem',
      background: '#fff', display: 'flex', flexDirection: 'column', gap: '0.75rem',
      boxShadow: '0 1px 4px rgba(0,0,0,0.06)', transition: 'box-shadow 0.2s',
    }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.10)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)'}
    >
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* Rank bubble */}
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          background: rank === 1 ? '#fbbf24' : rank === 2 ? '#94a3b8' : rank === 3 ? '#cd7c2f' : '#e5e7eb',
          color: rank <= 3 ? '#fff' : '#374151', display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontWeight: 800, fontSize: 13, flexShrink: 0
        }}>
          #{rank}
        </div>

        <ScoreRing score={candidate.finalScore} />

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 700, fontSize: 16, color: '#111' }}>{candidate.name}</span>
            <EvidenceBadge level={candidate.evidenceLevel} />
          </div>
          <div style={{ color: '#6b7280', fontSize: 13, marginTop: 2 }}>{candidate.college}</div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
          <button
            onClick={() => setExpanded(v => !v)}
            style={{ padding: '6px 14px', border: '1px solid #d1d5db', borderRadius: 6, background: '#f9fafb', cursor: 'pointer', fontSize: 13, color: '#374151' }}
          >
            {expanded ? 'Hide' : 'Details'}
          </button>
          <button
            onClick={() => onInvite(candidate)}
            disabled={candidate.inviteStatus === 'loading' || candidate.inviteStatus === 'done' || candidate.inviteStatus === 'already'}
            style={{ padding: '6px 14px', border: 'none', borderRadius: 6, background: candidate.inviteStatus === 'done' ? '#10b981' : candidate.inviteStatus === 'already' ? '#d1d5db' : 'var(--accent-orange, #f97316)', cursor: (candidate.inviteStatus === 'loading' || candidate.inviteStatus === 'done' || candidate.inviteStatus === 'already') ? 'default' : 'pointer', fontSize: 13, color: candidate.inviteStatus === 'already' ? '#6b7280' : '#fff', fontWeight: 600 }}
          >
            {candidate.inviteStatus === 'loading' ? 'Inviting...' : candidate.inviteStatus === 'done' ? 'Invited ✓' : candidate.inviteStatus === 'already' ? 'Already in team' : 'Invite'}
          </button>
        </div>
      </div>
      
      {candidate.inviteError && (
        <div style={{ fontSize: 12, color: '#ef4444', marginTop: 4 }}>
          {candidate.inviteError}
        </div>
      )}

      {/* Score breakdown bar row */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        {[
          { label: 'Skill Match', val: candidate.skillMatch, color: '#6366f1' },
          { label: 'GitHub Evidence', val: candidate.githubEvidence, color: '#0ea5e9' },
          { label: 'Project Relevance', val: candidate.projectRelevance, color: '#22c55e' },
        ].map(({ label, val, color }) => (
          <div key={label} style={{ flex: '1 1 120px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#6b7280', marginBottom: 3 }}>
              <span>{label}</span><span style={{ fontWeight: 600, color }}>{Math.round(val)}%</span>
            </div>
            <div style={{ height: 5, background: '#f3f4f6', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ width: `${Math.min(val, 100)}%`, height: '100%', background: color, borderRadius: 99, transition: 'width 0.6s ease' }} />
            </div>
          </div>
        ))}
      </div>

      {/* Authenticity summary */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <span style={{ fontSize: 12, color: '#374151', background: '#f3f4f6', padding: '3px 10px', borderRadius: 99 }}>
          🗂 {originals} original repo{originals !== 1 ? 's' : ''}
        </span>
        {forks > 0 && (
          <span style={{ fontSize: 12, color: '#92400e', background: '#fef3c7', padding: '3px 10px', borderRadius: 99 }}>
            ⚠️ {forks} forked repo{forks !== 1 ? 's' : ''} — score reduced
          </span>
        )}
        {avgContrib > 0 && (
          <span style={{ fontSize: 12, color: '#374151', background: '#f3f4f6', padding: '3px 10px', borderRadius: 99 }}>
            ✍️ Avg {avgContrib}% personal contribution
          </span>
        )}
      </div>

      {/* Matched / missing skills chips */}
      {(candidate.matchedSkills?.length > 0 || candidate.missingSkills?.length > 0) && (
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {candidate.matchedSkills?.map(s => (
            <span key={s.name} style={{ fontSize: 11, fontWeight: 600, background: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: 99 }}>
              ✓ {s.name}
            </span>
          ))}
          {candidate.missingSkills?.map(s => (
            <span key={s} style={{ fontSize: 11, fontWeight: 600, background: '#f3f4f6', color: '#9ca3af', padding: '2px 8px', borderRadius: 99 }}>
              ✗ {s}
            </span>
          ))}
        </div>
      )}

      {expanded && (
        <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: '0.75rem', marginTop: '0.25rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <p style={{ margin: 0, fontWeight: 600, fontSize: 13, color: '#374151' }}>Why KEVIN matched this candidate:</p>
          {(candidate.reasons || [candidate.whyMatched]).map((r, i) => (
            <p key={i} style={{ margin: 0, fontSize: 13, color: '#6b7280', lineHeight: 1.5 }}>• {r}</p>
          ))}
          
          {candidate.githubRepositories && candidate.githubRepositories.length > 0 && (
            <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px dashed #e5e7eb' }}>
              <p style={{ margin: '0 0 0.5rem 0', fontWeight: 600, fontSize: 13, color: '#374151' }}>Public GitHub Repositories:</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                {candidate.githubRepositories.slice(0, 4).map((repo, idx) => (
                  <a key={idx} href={repo.url} target="_blank" rel="noreferrer" style={{ fontSize: 12, padding: '0.5rem', border: '1px solid #e5e7eb', borderRadius: '4px', textDecoration: 'none', color: '#1f2937', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <span style={{ fontWeight: 600, color: 'var(--accent-orange, #f97316)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{repo.repository}</span>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#6b7280' }}>
                      <span>{repo.language || 'Mixed'}</span>
                      <span>⭐ {repo.stars || 0}</span>
                    </div>
                  </a>
                ))}
              </div>
              {candidate.githubRepositories.length > 4 && (
                 <p style={{ fontSize: 11, color: '#6b7280', margin: '0.25rem 0 0 0', textAlign: 'right' }}>+{candidate.githubRepositories.length - 4} more</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
const TeamDetails = () => {
  const { id } = useParams();
  const { user, loading } = useContext(AuthContext);
  const [team, setTeam] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isAddingGuest, setIsAddingGuest] = useState(false);
  const [guestForm, setGuestForm] = useState({ name: '', role: '', githubUrl: '' });
  const [guestError, setGuestError] = useState('');
  const [removeGuestError, setRemoveGuestError] = useState('');

  // ── Recommendations state ──────────────────────────────────────────────────
  const [recState, setRecState] = useState('idle'); // idle | loading | done | error
  const [recResult, setRecResult] = useState(null);
  const [recError, setRecError] = useState('');
  const [inviteStatus, setInviteStatus] = useState({}); // { [candidateId]: 'loading' | 'done' | 'error' | 'already' }
  const [inviteErrors, setInviteErrors] = useState({});
  const [descOverride, setDescOverride] = useState('');
  const [showDescInput, setShowDescInput] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user) { navigate('/login'); return; }

    const fetchTeam = async () => {
      try {
        const response = await api.get(`/teams/${id}`);
        if (response.data.success) {
          setTeam(response.data.data);
          setDescOverride(response.data.data.description || '');
        }
      } catch (err) {
        setError('Failed to load team details.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchTeam();
  }, [id, user, loading, navigate]);

  const handleAddGuest = async (e) => {
    e.preventDefault();
    if (!guestForm.name.trim()) return;
    setGuestError('');
    try {
      const response = await api.post(`/teams/${id}/guests`, guestForm);
      if (response.data.success) {
        setTeam(response.data.data);
        setIsAddingGuest(false);
        setGuestForm({ name: '', role: '', githubUrl: '' });
      }
    } catch (err) {
      setGuestError(err.response?.data?.error?.message || 'Failed to add guest member');
    }
  };

  const handleRemoveGuest = async (guestId) => {
    if (!window.confirm('Remove this guest member?')) return;
    setRemoveGuestError('');
    try {
      const response = await api.delete(`/teams/${id}/guests/${guestId}`);
      if (response.data.success) setTeam(response.data.data);
    } catch (err) {
      setRemoveGuestError(guestId);
      setTimeout(() => setRemoveGuestError(''), 4000);
    }
  };

  const handleDeleteTeam = async () => {
    setIsDeleting(true);
    try {
      const response = await api.delete(`/teams/${id}`);
      if (response.data.success) {
        navigate('/teams');
      }
    } catch (err) {
      setIsDeleting(false);
      setShowConfirmDelete(false);
      setError(err.response?.data?.error?.message || 'Failed to delete team');
    }
  };

  // ── Recommendation trigger ─────────────────────────────────────────────────
  const handleFindTeammates = async () => {
    const descToUse = (descOverride || team?.description || '').trim();
    if (!descToUse) {
      setShowDescInput(true);
      return;
    }
    setRecState('loading');
    setRecResult(null);
    setRecError('');
    try {
      const res = await api.post('/matching/analyze-project', {
        projectDescription: descToUse,
        teamId: id,
      });
      if (res.data.success) {
        setRecResult(res.data);
        setRecState('done');
      } else {
        throw new Error(res.data.message || 'Unknown error');
      }
    } catch (err) {
      setRecError(err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to get recommendations');
      setRecState('error');
    }
  };

  const handleInvite = async (candidate) => {
    setInviteStatus(prev => ({ ...prev, [candidate.id]: 'loading' }));
    setInviteErrors(prev => ({ ...prev, [candidate.id]: '' }));
    
    try {
      const response = await api.post(`/teams/${id}/members`, {
        userId: candidate.id,
        role: 'Member'
      });
      
      if (response.data.success) {
        setInviteStatus(prev => ({ ...prev, [candidate.id]: 'done' }));
        setTeam(response.data.data); // Update team to show new member immediately
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error?.message || err.response?.data?.message || 'Failed to invite candidate';
      
      if (errorMsg.includes('already a member')) {
        setInviteStatus(prev => ({ ...prev, [candidate.id]: 'already' }));
      } else {
        setInviteStatus(prev => ({ ...prev, [candidate.id]: 'error' }));
        setInviteErrors(prev => ({ ...prev, [candidate.id]: errorMsg }));
      }
    }
  };

  if (loading || isLoading) return <div style={{ padding: '2rem' }}>Loading team details...</div>;

  if (error || !team) return (
    <div className="home" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <div className="container" style={{ flex: 1, padding: '4rem 2rem' }}>
        <h2 style={{ color: '#991B1B' }}>{error || 'Team not found'}</h2>
        <button onClick={() => navigate('/teams')} className="cta-button" style={{ marginTop: '1rem' }}>Back to Teams</button>
      </div>
      <Footer />
    </div>
  );

  const isOwner = team.owner?._id === user._id;
  const topCandidates = recResult?.candidates?.slice(0, 10) || [];

  return (
    <div className="home" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <div className="container" style={{ flex: 1, padding: '4rem 2rem', maxWidth: 900, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
        <button onClick={() => navigate('/teams')} style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }}>
          ← Back to Teams
        </button>

        {/* ── Team info card ──────────────────────────────────────────────── */}
        <div className="dashboard-card" style={{ border: '1px solid var(--border-light)', padding: '3rem', background: 'var(--bg-white)', borderRadius: 12, marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
            <div>
              <h2 className="serif text-black" style={{ fontSize: '40px', margin: '0 0 0.5rem 0' }}>{team.name}</h2>
              <p className="text-gray" style={{ fontSize: '18px', margin: 0 }}>{team.theme || 'No theme specified'}</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ fontSize: '12px', textTransform: 'uppercase', background: team.status === 'forming' ? '#D1FAE5' : '#FEF3C7', color: team.status === 'forming' ? '#065F46' : '#92400E', padding: '0.4rem 1rem', borderRadius: '4px', fontWeight: 'bold' }}>
                {team.status}
              </span>
              {isOwner && !showConfirmDelete && (
                <button 
                  onClick={() => setShowConfirmDelete(true)}
                  style={{ padding: '0.4rem 1rem', fontSize: '12px', background: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', textTransform: 'uppercase' }}
                >
                  Delete Team
                </button>
              )}
              {isOwner && showConfirmDelete && (
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: '#991b1b', fontWeight: 'bold' }}>Are you sure?</span>
                  <button 
                    onClick={handleDeleteTeam}
                    disabled={isDeleting}
                    style={{ padding: '0.4rem 1rem', fontSize: '12px', background: '#991b1b', color: '#fff', border: 'none', borderRadius: '4px', cursor: isDeleting ? 'default' : 'pointer', fontWeight: 'bold', textTransform: 'uppercase' }}
                  >
                    {isDeleting ? 'Deleting...' : 'Yes, Delete'}
                  </button>
                  <button 
                    onClick={() => setShowConfirmDelete(false)}
                    disabled={isDeleting}
                    style={{ padding: '0.4rem 1rem', fontSize: '12px', background: '#e5e7eb', color: '#374151', border: 'none', borderRadius: '4px', cursor: isDeleting ? 'default' : 'pointer', fontWeight: 'bold', textTransform: 'uppercase' }}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          <div style={{ marginBottom: '3rem' }}>
            <h3 style={{ fontSize: '14px', textTransform: 'uppercase', color: '#6B7280', letterSpacing: '1px', marginBottom: '1rem' }}>Description</h3>
            <p className="text-gray" style={{ fontSize: '16px', lineHeight: '1.6' }}>
              {team.description || 'No description provided.'}
            </p>
          </div>

          <div style={{ marginBottom: '3rem' }}>
            <h3 style={{ fontSize: '14px', textTransform: 'uppercase', color: '#6B7280', letterSpacing: '1px', marginBottom: '1rem' }}>Team Lead</h3>
            <div style={{ padding: '1rem', background: '#F9FAFB', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
              <p style={{ fontWeight: 'bold', fontSize: '18px', margin: '0 0 0.25rem 0' }}>{team.owner?.name}</p>
              <p className="text-gray" style={{ fontSize: '14px', margin: 0 }}>{team.owner?.college}</p>
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '14px', textTransform: 'uppercase', color: '#6B7280', letterSpacing: '1px', margin: 0 }}>
                Members ({ (team.members?.length || 0) + (team.guestMembers?.length || 0) } / {team.maxMembers || 4})
              </h3>
              {isOwner && team.status !== 'closed' && (
                <button onClick={() => setIsAddingGuest(!isAddingGuest)} className="cta-button" style={{ padding: '0.5rem 1rem', fontSize: '12px' }}>
                  {isAddingGuest ? 'Cancel' : 'Add Guest'}
                </button>
              )}
            </div>

            {isAddingGuest && (
              <form onSubmit={handleAddGuest} style={{ background: '#F9FAFB', padding: '1.5rem', borderRadius: '8px', border: '1px solid #E5E7EB', marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h4 style={{ margin: 0 }}>Add Guest Member</h4>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <input required type="text" placeholder="Name *" value={guestForm.name} onChange={e => setGuestForm({ ...guestForm, name: e.target.value })} style={{ flex: 1, padding: '0.75rem', border: '1px solid #E5E7EB', borderRadius: '4px' }} />
                  <input type="text" placeholder="Role (e.g. Frontend)" value={guestForm.role} onChange={e => setGuestForm({ ...guestForm, role: e.target.value })} style={{ flex: 1, padding: '0.75rem', border: '1px solid #E5E7EB', borderRadius: '4px' }} />
                </div>
                <input type="url" placeholder="GitHub URL (optional)" value={guestForm.githubUrl} onChange={e => setGuestForm({ ...guestForm, githubUrl: e.target.value })} style={{ width: '100%', padding: '0.75rem', border: '1px solid #E5E7EB', borderRadius: '4px' }} />
                {guestError && <p style={{ color: '#991B1B', margin: 0, fontSize: '12px' }}>{guestError}</p>}
                <button type="submit" className="cta-button" style={{ alignSelf: 'flex-start' }}>Save Guest</button>
              </form>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {team.members?.filter(m => m.user).map(member => (
                <div key={member.user._id} style={{ padding: '1rem', background: '#F9FAFB', borderRadius: '8px', border: '1px solid #E5E7EB', position: 'relative' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <p style={{ fontWeight: 'bold', margin: 0 }}>{member.user.name}</p>
                    {member.status === 'pending' && (
                      <span style={{ fontSize: '10px', background: '#FEF3C7', color: '#92400E', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>PENDING INVITE</span>
                    )}
                  </div>
                  <p className="text-gray" style={{ fontSize: '12px', margin: 0 }}>Role: {member.role}</p>
                </div>
              ))}

              {team.guestMembers?.map(guest => (
                <div key={guest._id} style={{ padding: '1rem', background: '#FFFBEB', borderRadius: '8px', border: '1px solid #FDE68A', position: 'relative' }}>
                  {isOwner && (
                    <button onClick={() => handleRemoveGuest(guest._id)} style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', color: '#D97706', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <p style={{ fontWeight: 'bold', margin: 0, color: '#92400E' }}>{guest.name} <span style={{ fontSize: '10px', background: '#FEF3C7', padding: '2px 6px', borderRadius: '4px' }}>GUEST</span></p>
                  </div>
                  <p className="text-gray" style={{ fontSize: '12px', margin: '0 0 0.5rem 0', color: '#B45309' }}>Role: {guest.role}</p>
                  {guest.githubUrl && (
                    <a href={guest.githubUrl} target="_blank" rel="noreferrer" style={{ fontSize: '12px', color: '#D97706', textDecoration: 'none' }}>🔗 GitHub Profile</a>
                  )}
                  {removeGuestError === guest._id && (
                    <div style={{ fontSize: '11px', color: '#991B1B', marginTop: '0.5rem', background: '#FEE2E2', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>
                      Failed to remove guest member.
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* ── AI Teammate Recommendations panel ───────────────────────────── */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {isOwner && (
          <div style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: '2rem', background: '#fafafa' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 0.3rem 0', color: '#111' }}>
                  🤖 AI Teammate Recommendations
                </h3>
                <p style={{ margin: 0, fontSize: 14, color: '#6b7280' }}>
                  KEVIN analyzes your team description with Gemini AI, extracts required skills, then ranks all registered users — penalizing forked repos and low-contribution GitHub profiles.
                </p>
              </div>
              {recState !== 'loading' && (
                <button
                  id="find-teammates-btn"
                  onClick={handleFindTeammates}
                  className="cta-button"
                  style={{ flexShrink: 0, background: '#111', border: 'none' }}
                >
                  {recState === 'done' ? '🔄 Re-run' : '✨ Find Teammates'}
                </button>
              )}
            </div>

            {/* Optional description override */}
            {(showDescInput || !team.description) && recState === 'idle' && (
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#374151' }}>
                  {team.description ? 'Override description for matching:' : 'Enter a project description to match against:'}
                </label>
                <textarea
                  value={descOverride}
                  onChange={e => setDescOverride(e.target.value)}
                  rows={3}
                  placeholder="e.g. We are building a healthcare app using React frontend, Node.js backend, and Python ML model for disease prediction."
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: 8, resize: 'vertical', fontSize: 14, boxSizing: 'border-box' }}
                />
              </div>
            )}

            {/* Loading */}
            {recState === 'loading' && (
              <div style={{ textAlign: 'center', padding: '3rem 0' }}>
                <div style={{ fontSize: 36, marginBottom: '1rem', animation: 'spin 1s linear infinite', display: 'inline-block' }}>⚙️</div>
                <p style={{ color: '#6b7280', fontSize: 15 }}>
                  Gemini AI is analyzing your project description and scoring all candidates…<br />
                  <span style={{ fontSize: 13 }}>This may take 10–30 seconds depending on the number of users.</span>
                </p>
              </div>
            )}

            {/* Error */}
            {recState === 'error' && (
              <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 8, padding: '1rem', color: '#991b1b', fontSize: 14 }}>
                ❌ {recError}
              </div>
            )}

            {/* Results */}
            {recState === 'done' && recResult && (
              <div>
                {/* Project skill extraction summary */}
                <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 8, padding: '1rem 1.25rem', marginBottom: '1.5rem' }}>
                  <p style={{ margin: '0 0 0.5rem 0', fontWeight: 700, fontSize: 14, color: '#0369a1' }}>
                    📋 Skills extracted from project description:
                  </p>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {(recResult.project?.requiredSkills || []).map(s => (
                      <span key={s.name} style={{ fontSize: 12, background: '#0ea5e9', color: '#fff', fontWeight: 600, padding: '3px 10px', borderRadius: 99 }}>
                        {s.name} <span style={{ opacity: 0.8 }}>(imp: {s.importance}/10)</span>
                      </span>
                    ))}
                  </div>
                  {(recResult.teamAnalysis?.skillGaps?.length > 0) && (
                    <p style={{ margin: '0.75rem 0 0 0', fontSize: 13, color: '#0369a1' }}>
                      <strong>Skill gaps</strong> (missing from current team):{' '}
                      {recResult.teamAnalysis.skillGaps.map(g => g.name).join(', ')}
                    </p>
                  )}
                </div>

                {/* Candidate count */}
                <p style={{ fontSize: 14, color: '#6b7280', marginBottom: '1rem' }}>
                  Showing top <strong>{topCandidates.length}</strong> of <strong>{recResult.candidates?.length}</strong> candidates, ranked by final match score (60% skill match + 25% GitHub evidence + 15% project relevance).
                </p>

                {topCandidates.length === 0 ? (
                  <p style={{ color: '#6b7280', fontSize: 14 }}>No candidates found. Make sure other users have registered and synced their GitHub profiles.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {topCandidates.map(c => {
                      const cWithInvite = {
                        ...c,
                        inviteStatus: inviteStatus[c.id],
                        inviteError: inviteErrors[c.id]
                      };
                      return <CandidateCard key={c.id} candidate={cWithInvite} rank={c.rank} onInvite={handleInvite} />;
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Idle hint */}
            {recState === 'idle' && (team.description || descOverride) && (
              <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '1rem', marginTop: '0.5rem' }}>
                <p style={{ fontSize: 13, color: '#9ca3af', margin: 0 }}>
                  💡 Click <strong>"✨ Find Teammates"</strong> to let KEVIN analyze your project description and recommend the best-fit candidates from the platform.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>

      <Footer />
    </div>
  );
};

export default TeamDetails;
