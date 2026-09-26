import React, { useContext, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../services/api';

const Dashboard = () => {
  const { user, loading, refreshUser } = useContext(AuthContext);
  const [hackathons, setHackathons] = useState([]);
  const [teams, setTeams] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [isResponding, setIsResponding] = useState(false);
  
  const [githubUsername, setGithubUsername] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState('');
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [showConfirmDisconnect, setShowConfirmDisconnect] = useState(false);
  const [disconnectError, setDisconnectError] = useState('');
  
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    bio: '',
    skills: ''
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateStatus, setUpdateStatus] = useState({ type: '', message: '' });
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const hRes = await api.get('/hackathons');
        if (hRes.data.success) {
          setHackathons(hRes.data.data);
        }
        
        const tRes = await api.get('/teams/user/me');
        if (tRes.data.success) {
          setTeams(tRes.data.data.activeTeams);
          setInvitations(tRes.data.data.pendingInvitations);
        }
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
      }
    };
    
    if (user) {
      fetchData();
      setProfileData({
        bio: user.bio || '',
        skills: user.skills ? user.skills.join(', ') : ''
      });
      
      // Check for GitHub OAuth callback
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      if (code) {
        // Clear the code from URL
        window.history.replaceState({}, document.title, window.location.pathname);
        
        setIsSyncing(true);
        api.post('/github/oauth', { code })
          .then(async () => {
            // Refresh user context in place instead of full reload
            await refreshUser();
            setIsSyncing(false);
          })
          .catch(err => {
            setSyncError('GitHub authentication failed.');
            setIsSyncing(false);
          });
      }
    }
  }, [user]);

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;

  const handleConnectGithub = () => {
    // Redirect to GitHub OAuth
    const clientId = 'Ov23liHHStcpxMzLBJtp';
    // Let GitHub use the exact callback URL configured in Developer Settings to avoid mismatch errors
    // prompt=consent forces GitHub to show account selector
    // scope=read:user ensures we only ask for public profile info
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=read:user&prompt=consent`;
  };

  const handleDisconnect = async () => {
    setIsDisconnecting(true);
    setDisconnectError('');
    try {
      await api.delete('/github/disconnect');
      await refreshUser();
      setShowConfirmDisconnect(false);
    } catch (err) {
      setDisconnectError('Failed to disconnect GitHub profile');
    } finally {
      setIsDisconnecting(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    setUpdateStatus({ type: '', message: '' });
    try {
      const skillsArray = profileData.skills.split(',').map(s => s.trim()).filter(s => s);
      await api.put(`/users/${user._id}`, {
        bio: profileData.bio,
        skills: skillsArray
      });
      await refreshUser();
      setIsEditingProfile(false);
      setUpdateStatus({ type: 'success', message: 'Profile updated successfully!' });
      setTimeout(() => setUpdateStatus({ type: '', message: '' }), 3000);
    } catch (err) {
      setUpdateStatus({ type: 'error', message: err.response?.data?.error?.message || 'Failed to update profile' });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleInviteResponse = async (teamId, action) => {
    setIsResponding(true);
    try {
      await api.put(`/teams/${teamId}/invites/respond`, { action });
      // Refresh teams data
      const tRes = await api.get('/teams/user/me');
      if (tRes.data.success) {
        setTeams(tRes.data.data.activeTeams);
        setInvitations(tRes.data.data.pendingInvitations);
      }
    } catch (err) {
      alert(err.response?.data?.error?.message || `Failed to ${action} invite`);
    } finally {
      setIsResponding(false);
    }
  };

  return (
    <div className="home" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      
      <div className="container" style={{ flex: 1, padding: '4rem 2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2 className="serif text-black" style={{ fontSize: '48px', margin: 0 }}>
            Welcome, {user.name}
          </h2>
          <button onClick={() => setIsEditingProfile(true)} className="cta-button" style={{ background: '#F3F4F6', color: '#111827' }}>
            Edit Profile
          </button>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem' }}>
          
          <div className="dashboard-card" style={{ border: '1px solid var(--border-light)', padding: '2rem', background: 'var(--bg-white)', gridColumn: '1 / -1' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h3 className="mono uppercase text-gray" style={{ marginBottom: 0 }}>GitHub Evidence</h3>
              {user.github?.username && !showConfirmDisconnect && (
                <div>
                  <button 
                    onClick={() => setShowConfirmDisconnect(true)}
                    style={{ padding: '0.5rem 1rem', background: '#FEE2E2', color: '#991B1B', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    Disconnect
                  </button>
                </div>
              )}
              {user.github?.username && showConfirmDisconnect && (
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: '#991B1B', fontWeight: 'bold' }}>This will lower your score. Sure?</span>
                  <button 
                    onClick={handleDisconnect} 
                    disabled={isDisconnecting}
                    style={{ padding: '0.5rem 1rem', background: '#991B1B', color: '#fff', border: 'none', borderRadius: '4px', cursor: isDisconnecting ? 'default' : 'pointer', fontWeight: 'bold' }}
                  >
                    {isDisconnecting ? 'Disconnecting...' : 'Yes, Disconnect'}
                  </button>
                  <button 
                    onClick={() => setShowConfirmDisconnect(false)}
                    disabled={isDisconnecting}
                    style={{ padding: '0.5rem 1rem', background: '#E5E7EB', color: '#374151', border: 'none', borderRadius: '4px', cursor: isDisconnecting ? 'default' : 'pointer', fontWeight: 'bold' }}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
            {disconnectError && <p style={{ color: '#991B1B', margin: '0 0 2rem 0', fontSize: '13px' }}>{disconnectError}</p>}
            
            {user.github?.username ? (
              <div>
                <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                  <div style={{ flex: '1 1 200px' }}>
                    <p className="text-gray" style={{ fontSize: '12px', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Username</p>
                    <p style={{ fontSize: '18px', fontWeight: 'bold' }}>{user.github.username}</p>
                  </div>
                  <div style={{ flex: '2 1 400px' }}>
                    <p className="text-gray" style={{ fontSize: '12px', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Verified Skills</p>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {user.skills?.map(skill => (
                        <span key={skill} style={{ background: '#FEE2E2', color: '#991B1B', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '12px', fontWeight: '600' }}>
                          {skill}
                        </span>
                      )) || <span className="text-gray">None yet</span>}
                    </div>
                  </div>
                </div>

                {user.github.repositories && user.github.repositories.length > 0 && (
                  <div>
                    <p className="text-gray" style={{ fontSize: '12px', textTransform: 'uppercase', marginBottom: '1rem' }}>Analyzed Repositories</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                      {user.github.repositories.map((repo, idx) => (
                        <div key={idx} style={{ border: '1px solid #E5E7EB', padding: '1rem', borderRadius: '8px' }}>
                          <a href={repo.url} target="_blank" rel="noreferrer" style={{ fontWeight: 'bold', color: 'var(--accent-orange)', textDecoration: 'none', display: 'block', marginBottom: '0.5rem' }}>
                            {repo.repository}
                          </a>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#6B7280', marginBottom: '0.5rem' }}>
                            <span>{repo.language || 'Mixed'}</span>
                            <span>⭐ {repo.stars}</span>
                          </div>
                          <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                            {repo.topics?.slice(0, 3).map(topic => (
                              <span key={topic} style={{ background: '#F3F4F6', color: '#374151', padding: '0.1rem 0.4rem', borderRadius: '4px', fontSize: '10px' }}>
                                {topic}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <div style={{ marginBottom: '2rem' }}>
                  <p className="text-gray" style={{ fontSize: '12px', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Self-Reported Skills</p>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {user.skills && user.skills.length > 0 ? (
                      user.skills.map(skill => (
                        <span key={skill} style={{ background: '#F3F4F6', color: '#374151', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '12px', fontWeight: '600' }}>
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray">None yet. Click Edit Profile to add skills.</span>
                    )}
                  </div>
                </div>

                <p className="text-gray" style={{ marginBottom: '1rem' }}>You haven't synced your GitHub yet. Connect your account securely to verify your skills.</p>
                
                <button 
                  onClick={handleConnectGithub} 
                  className="cta-button"
                  disabled={isSyncing}
                  style={{ opacity: isSyncing ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  {isSyncing ? 'Authenticating...' : 'Connect with GitHub'}
                </button>
                <p style={{ fontSize: '12px', color: '#6B7280', marginTop: '0.5rem' }}>
                  *Note: It will securely verify the GitHub account currently active in your browser.
                </p>
                {syncError && <p style={{ color: '#991B1B', marginTop: '1rem', fontSize: '14px' }}>{syncError}</p>}
              </div>
            )}
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div className="dashboard-card" style={{ border: '1px solid var(--border-light)', padding: '2rem', background: 'var(--bg-white)' }}>
              <h3 className="mono uppercase text-gray" style={{ marginBottom: '1rem' }}>Pending Invitations</h3>
              {invitations.length > 0 ? (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {invitations.map(team => (
                    <li key={team._id} style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong style={{ fontSize: '18px', display: 'block', marginBottom: '0.25rem' }}>{team.name}</strong>
                        <span className="text-gray" style={{ fontSize: '12px' }}>Invited by {team.owner?.name}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button 
                          onClick={() => handleInviteResponse(team._id, 'accept')}
                          disabled={isResponding}
                          style={{ padding: '0.4rem 1rem', background: '#D1FAE5', color: '#065F46', border: '1px solid #A7F3D0', borderRadius: '4px', cursor: isResponding ? 'default' : 'pointer', fontWeight: 'bold', fontSize: '12px', textTransform: 'uppercase' }}
                        >
                          Accept
                        </button>
                        <button 
                          onClick={() => handleInviteResponse(team._id, 'decline')}
                          disabled={isResponding}
                          style={{ padding: '0.4rem 1rem', background: '#FEE2E2', color: '#991B1B', border: '1px solid #FCA5A5', borderRadius: '4px', cursor: isResponding ? 'default' : 'pointer', fontWeight: 'bold', fontSize: '12px', textTransform: 'uppercase' }}
                        >
                          Decline
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray">No pending invitations.</p>
              )}
            </div>

            <div className="dashboard-card" style={{ border: '1px solid var(--border-light)', padding: '2rem', background: 'var(--bg-white)' }}>
              <h3 className="mono uppercase text-gray" style={{ marginBottom: '1rem' }}>My Teams</h3>
              {teams.length > 0 ? (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {teams.map(team => (
                    <li key={team._id} style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <strong style={{ fontSize: '18px', display: 'block', marginBottom: '0.25rem' }}>{team.name}</strong>
                          <span className="text-gray" style={{ fontSize: '12px' }}>Role: {team.owner && team.owner._id === user._id ? 'Owner' : 'Member'}</span>
                        </div>
                        <a href={`/teams/${team._id}`} style={{ padding: '0.4rem 1rem', background: '#F3F4F6', color: '#374151', textDecoration: 'none', borderRadius: '4px', fontWeight: 'bold', fontSize: '12px', textTransform: 'uppercase' }}>
                          View
                        </a>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray">You are not in any teams.</p>
              )}
            </div>
          </div>
          
        </div>
      </div>

      {isEditingProfile && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', width: '90%', maxWidth: '500px' }}>
            <h2 className="serif text-black" style={{ marginBottom: '1.5rem', fontSize: '24px' }}>Edit Profile</h2>
            <form onSubmit={handleUpdateProfile}>
              <div style={{ marginBottom: '1rem' }}>
                <label className="mono text-gray" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '12px' }}>BIO</label>
                <textarea 
                  value={profileData.bio} 
                  onChange={e => setProfileData({...profileData, bio: e.target.value})}
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #E5E7EB', borderRadius: '4px', minHeight: '100px', fontFamily: 'Inter' }}
                  placeholder="Tell us about yourself..."
                />
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label className="mono text-gray" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '12px' }}>SKILLS (comma separated)</label>
                <input 
                  type="text" 
                  value={profileData.skills} 
                  onChange={e => setProfileData({...profileData, skills: e.target.value})}
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #E5E7EB', borderRadius: '4px', fontFamily: 'Inter' }}
                  placeholder="React, Node.js, Python..."
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setIsEditingProfile(false)} style={{ background: 'none', border: '1px solid #E5E7EB', padding: '0.5rem 1rem', borderRadius: '999px', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" className="cta-button" disabled={isUpdating}>{isUpdating ? 'Saving...' : 'Save Changes'}</button>
              </div>
              {updateStatus.message && (
                <p style={{ marginTop: '1rem', fontSize: '13px', color: updateStatus.type === 'error' ? '#991B1B' : '#065F46', background: updateStatus.type === 'error' ? '#FEE2E2' : '#D1FAE5', padding: '0.5rem', borderRadius: '4px' }}>
                  {updateStatus.message}
                </p>
              )}
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Dashboard;
