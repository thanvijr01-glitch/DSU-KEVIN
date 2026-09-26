import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const About = () => {
  return (
    <div className="home" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      
      <div className="container" style={{ flex: 1, padding: '4rem 2rem', maxWidth: '800px', margin: '0 auto' }}>
        <h2 className="serif text-black" style={{ fontSize: '48px', marginBottom: '2rem' }}>About K.E.V.I.N.</h2>
        
        <div style={{ marginBottom: '3rem' }}>
          <h4 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 0.5rem 0' }}>
            Knowledge Enhanced Virtual Intelligence Network <span style={{ fontSize: '14px', background: '#FEE2E2', color: '#991B1B', padding: '0.2rem 0.75rem', borderRadius: '4px', verticalAlign: 'middle', marginLeft: '0.5rem' }}>v1.0</span>
          </h4>
        </div>

        <div style={{ marginBottom: '3rem' }}>
          <h3 className="mono uppercase text-orange" style={{ marginBottom: '1rem', letterSpacing: '1px' }}>Executive Overview & Vision</h3>
          <p style={{ fontSize: '16px', color: '#374151', lineHeight: '1.8', marginBottom: '1rem' }}>
            <strong>KEVIN</strong> is a campus-first skill exchange, peer-learning, and smart team-formation platform designed specifically for college students and hackathon participants. It is built upon three foundational pillars that current platforms miss:
          </p>
          <ul style={{ listStyleType: 'disc', paddingLeft: '1.5rem', fontSize: '16px', color: '#374151', lineHeight: '1.8' }}>
            <li style={{ marginBottom: '0.5rem' }}><strong>Proximity-Based Trust & Real-World Accountability:</strong> College-email verification anchors every account to a real campus identity, eliminating anonymous ghosting, fake accounts, and low-trust interactions.</li>
            <li style={{ marginBottom: '0.5rem' }}><strong>Zero Cold-Start Friction via GitHub Forensics:</strong> Instead of asking students to fill out long, untrustworthy self-assessment forms, KEVIN automatically analyzes their GitHub coding activity to construct an objective, empirically verified skill profile upon onboarding.</li>
            <li><strong>Incentive-Driven Peer Economy:</strong> A structured credit economy rewards students who spend time teaching peers and enables them to spend earned credits to learn skills from senior or specialized developers.</li>
          </ul>
        </div>

        <div style={{ marginBottom: '3rem', background: 'var(--bg-white)', padding: '2rem', borderLeft: '4px solid var(--accent-orange)', borderRadius: '0 8px 8px 0', boxShadow: 'var(--shadow-sm)' }}>
          <h3 className="serif" style={{ fontSize: '20px', marginBottom: '1rem' }}>🌟 The Flagship Feature</h3>
          <p style={{ fontSize: '16px', color: '#374151', lineHeight: '1.8', margin: 0 }}>
            <strong>AI-Driven Contextual Team Matcher:</strong> It reads a hackathon's problem statement or theme, uses LLM reasoning to map the project into requisite technical roles (e.g., Computer Vision, Deep Learning, Backend, Frontend), computes the current team's skill gaps, and retrieves and ranks verified candidates who fill those precise missing competencies.
          </p>
        </div>

        <div style={{ marginBottom: '3rem' }}>
          <h3 className="mono uppercase text-orange" style={{ marginBottom: '1rem', letterSpacing: '1px' }}>The Core Problem</h3>
          <p style={{ fontSize: '16px', color: '#374151', lineHeight: '1.8' }}>
            Most existing hackathon team-finders rely on naive keyword matching: <em>Candidate writes "Machine Learning" on profile ⟹ Platform marks them as ML Expert.</em> This leads to mismatched teams, missing critical skills, and team breakdown during 36-hour hackathons. KEVIN fixes this by looking at actual code contributions rather than just resume buzzwords.
          </p>
        </div>

        <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', padding: '2.5rem', borderRadius: '8px' }}>
          <h3 className="mono uppercase text-gray" style={{ marginBottom: '1.5rem', letterSpacing: '1px' }}>Development Team (Innovate365)</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '6px', border: '1px solid #E5E7EB', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div style={{ width: '60px', height: '60px', background: 'var(--accent-orange)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 'bold', margin: '0 auto 1rem' }}>
                T
              </div>
              <h4 style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 0.25rem 0' }}>Thanvi JR</h4>
              <p className="text-gray" style={{ fontSize: '13px', margin: 0 }}>AI & Backend Architecture</p>
            </div>
            
            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '6px', border: '1px solid #E5E7EB', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div style={{ width: '60px', height: '60px', background: 'var(--accent-orange)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 'bold', margin: '0 auto 1rem' }}>
                R
              </div>
              <h4 style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 0.25rem 0' }}>Rajath K</h4>
              <p className="text-gray" style={{ fontSize: '13px', margin: 0 }}>Database & GitHub Integration</p>
            </div>
            
            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '6px', border: '1px solid #E5E7EB', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div style={{ width: '60px', height: '60px', background: 'var(--accent-orange)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 'bold', margin: '0 auto 1rem' }}>
                G
              </div>
              <h4 style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 0.25rem 0' }}>Gahan</h4>
              <p className="text-gray" style={{ fontSize: '13px', margin: 0 }}>Core Backend & Matching Logic</p>
            </div>
          </div>
          
          <div style={{ marginTop: '2.5rem', textAlign: 'center' }}>
            <p className="mono text-gray" style={{ fontSize: '12px' }}>Built with ❤️ for DSU DEVHACK 3.0 at Sahyadri College of Engineering & Management.</p>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default About;
