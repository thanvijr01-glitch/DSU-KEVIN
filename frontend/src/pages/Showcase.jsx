import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../services/api';
import { Link } from 'react-router-dom';

const Showcase = () => {
  const [teams, setTeams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchShowcaseTeams = async () => {
      try {
        const response = await api.get('/teams?status=showcase');
        if (response.data.success) {
          setTeams(response.data.data);
        }
      } catch (err) {
        setError('Failed to load showcase projects.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchShowcaseTeams();
  }, []);

  return (
    <div className="home" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <div className="container" style={{ flex: 1, padding: '4rem 2rem', maxWidth: 1200, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h2 className="serif text-black" style={{ fontSize: '48px', margin: '0 0 1rem 0' }}>
            Project Showcase 🏆
          </h2>
          <p className="text-gray" style={{ fontSize: '18px', margin: 0, maxWidth: 600, marginInline: 'auto' }}>
            Explore completed hackathon projects built by teams on KEVIN. Get inspired and see what's possible when great minds collaborate!
          </p>
        </div>

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>Loading showcase...</div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#DC2626' }}>{error}</div>
        ) : teams.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#6B7280', background: '#F9FAFB', borderRadius: '12px', border: '1px dashed #D1D5DB' }}>
            <h3 style={{ fontSize: '20px', color: '#374151', margin: '0 0 0.5rem 0' }}>No projects showcased yet!</h3>
            <p style={{ margin: 0 }}>Finish a hackathon and publish your team's project to be the first.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem' }}>
            {teams.map(team => (
              <div key={team._id} style={{ 
                background: 'white', borderRadius: '16px', border: '1px solid #E5E7EB', 
                padding: '2rem', display: 'flex', flexDirection: 'column',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <h3 style={{ margin: 0, fontSize: '24px', fontWeight: '800', color: '#111827' }}>
                    <Link to={`/teams/${team._id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                      {team.name}
                    </Link>
                  </h3>
                  <span style={{ fontSize: '12px', background: '#FEF3C7', color: '#D97706', padding: '4px 8px', borderRadius: '99px', fontWeight: 'bold' }}>
                    Completed
                  </span>
                </div>
                
                <p style={{ color: '#4B5563', fontSize: '15px', lineHeight: '1.6', flex: 1, marginBottom: '1.5rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {team.description || team.theme}
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '2rem' }}>
                  {team.members.map(member => (
                    <span key={member.user?._id} style={{ fontSize: '12px', background: '#F3F4F6', color: '#374151', padding: '4px 10px', borderRadius: '99px' }}>
                      {member.user?.name}
                    </span>
                  ))}
                </div>

                {team.projectLink && (
                  <a 
                    href={team.projectLink} 
                    target="_blank" 
                    rel="noreferrer" 
                    style={{ 
                      display: 'block', textAlign: 'center', background: '#111827', color: 'white', 
                      padding: '0.75rem', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', fontSize: '14px' 
                    }}
                  >
                    🚀 View Project
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Showcase;
