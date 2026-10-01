import React, { useState, useEffect, useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../services/api';

const Leaderboard = () => {
  const { user, loading } = useContext(AuthContext);
  const [leaders, setLeaders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await api.get('/users/leaderboard');
        if (response.data.success) {
          setLeaders(response.data.data);
        }
      } catch (err) {
        setError('Failed to load leaderboard data.');
      } finally {
        setIsLoading(false);
      }
    };
    if (user) {
      fetchLeaderboard();
    }
  }, [user]);

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;

  return (
    <div className="home" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <div className="container" style={{ flex: 1, padding: '4rem 2rem', maxWidth: 900, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 className="serif text-black" style={{ fontSize: '48px', margin: '0 0 1rem 0' }}>
            Top Hackers
          </h2>
          <p className="text-gray" style={{ fontSize: '18px', margin: 0 }}>
            Global rankings based on Credit Score 💎 and Streaks 🔥
          </p>
        </div>

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>Loading leaderboard...</div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#DC2626' }}>{error}</div>
        ) : leaders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#6B7280' }}>
            No one has earned credit yet. Be the first! Create or join a team!
          </div>
        ) : (
          <div style={{ background: '#FFF', borderRadius: '16px', border: '1px solid #E5E7EB', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', padding: '1rem 1.5rem', background: '#F9FAFB', borderBottom: '1px solid #E5E7EB', fontWeight: 'bold', color: '#374151', textTransform: 'uppercase', fontSize: '12px', letterSpacing: '1px' }}>
              <div style={{ width: '60px', textAlign: 'center' }}>Rank</div>
              <div style={{ flex: 1 }}>Hacker</div>
              <div style={{ width: '120px', textAlign: 'right' }}>Credit 💎</div>
              <div style={{ width: '100px', textAlign: 'right' }}>Streak 🔥</div>
            </div>
            
            {leaders.map((leader, index) => {
              const isMe = user._id === leader._id;
              
              // Top 3 styles
              let rankStyle = { fontWeight: 'bold' };
              if (index === 0) rankStyle = { ...rankStyle, color: '#F59E0B', fontSize: '20px' }; // Gold
              if (index === 1) rankStyle = { ...rankStyle, color: '#9CA3AF', fontSize: '18px' }; // Silver
              if (index === 2) rankStyle = { ...rankStyle, color: '#B45309', fontSize: '18px' }; // Bronze
              
              return (
                <div key={leader._id} style={{ 
                  display: 'flex', padding: '1rem 1.5rem', borderBottom: '1px solid #F3F4F6', 
                  alignItems: 'center', background: isMe ? '#F0FDF4' : 'transparent',
                  transition: 'background 0.2s ease'
                }}>
                  <div style={{ width: '60px', textAlign: 'center', ...rankStyle }}>
                    #{index + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontWeight: 'bold', fontSize: '16px', color: '#111827' }}>
                        {leader.name} {isMe && <span style={{ fontSize: '10px', background: '#22C55E', color: 'white', padding: '2px 6px', borderRadius: '4px', marginLeft: '0.5rem', textTransform: 'uppercase' }}>You</span>}
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '0.25rem' }}>
                      {leader.college}
                    </div>
                  </div>
                  <div style={{ width: '120px', textAlign: 'right', fontWeight: 'bold', color: '#10B981', fontSize: '16px' }}>
                    {leader.creditScore}
                  </div>
                  <div style={{ width: '100px', textAlign: 'right', fontWeight: 'bold', color: '#F97316', fontSize: '16px' }}>
                    {leader.streakCount}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Leaderboard;
