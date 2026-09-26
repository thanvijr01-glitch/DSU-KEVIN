import React, { useContext, useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './HeroSection.css';
import { ArrowDownRight, ArrowUpRight, CheckCircle2, Cpu, GitBranch, Sparkles, Play } from 'lucide-react';
import api from '../services/api';

const HeroSection = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [activeNode, setActiveNode] = useState(0);
  const [nodes, setNodes] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get('/users');
        if (response.data && response.data.success && response.data.data.users.length > 0) {
          const fetchedUsers = response.data.data.users.slice(0, 3).map((u, i) => {
            const initials = u.name ? u.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'ST';
            return {
              id: i,
              name: u.name || 'Student',
              role: u.skills && u.skills.length > 0 ? u.skills.slice(0, 2).join(' / ') : 'Campus Talent',
              match: Math.floor(Math.random() * (98 - 85 + 1) + 85) + '%',
              initials,
              evidence: u.github?.username ? `Verified GitHub · ${u.github.username}` : 'Verified Talent',
              orbitClass: `orbit-node-${i + 1}`
            };
          });
          
          // Pad with dummy data if less than 3 users
          const fallbackData = [
             { id: 0, name: "Arjun Mehta", role: "Python / PyTorch", match: "91%", initials: "AM", evidence: "14 repos · 32 commits", orbitClass: "orbit-node-1" },
             { id: 1, name: "Ananya Sharma", role: "Computer Vision · OpenCV", match: "94%", initials: "AS", evidence: "Verified GitHub · Top Match", orbitClass: "orbit-node-2" },
             { id: 2, name: "Rohan V.", role: "Embedded Systems / Rust", match: "88%", initials: "RV", evidence: "Firmware · Hardware AI", orbitClass: "orbit-node-3" }
          ];

          while (fetchedUsers.length < 3) {
            fetchedUsers.push(fallbackData[fetchedUsers.length]);
          }
          setNodes(fetchedUsers);
        } else {
          // Use default dummy data if API fails or returns no users
          setNodes([
            { id: 0, name: "Arjun Mehta", role: "Python / PyTorch", match: "91%", initials: "AM", evidence: "14 repos · 32 commits", orbitClass: "orbit-node-1" },
            { id: 1, name: "Ananya Sharma", role: "Computer Vision · OpenCV", match: "94%", initials: "AS", evidence: "Verified GitHub · Top Match", orbitClass: "orbit-node-2" },
            { id: 2, name: "Rohan V.", role: "Embedded Systems / Rust", match: "88%", initials: "RV", evidence: "Firmware · Hardware AI", orbitClass: "orbit-node-3" }
          ]);
        }
      } catch (err) {
        setNodes([
          { id: 0, name: "Arjun Mehta", role: "Python / PyTorch", match: "91%", initials: "AM", evidence: "14 repos · 32 commits", orbitClass: "orbit-node-1" },
          { id: 1, name: "Ananya Sharma", role: "Computer Vision · OpenCV", match: "94%", initials: "AS", evidence: "Verified GitHub · Top Match", orbitClass: "orbit-node-2" },
          { id: 2, name: "Rohan V.", role: "Embedded Systems / Rust", match: "88%", initials: "RV", evidence: "Firmware · Hardware AI", orbitClass: "orbit-node-3" }
        ]);
      }
    };
    fetchUsers();
  }, []);

  return (
    <section className="hero">
      <div className="hero-container flex items-center justify-between">
        <div className="hero-left reveal-on-scroll is-visible">
          <div className="hero-eyebrow mono text-orange uppercase flex items-center">
            <span className="dot pulse"></span> CAMPUS-ONLY · SKILL EXCHANGE / 001
          </div>
          
          <h1 className="hero-headline">
            <span className="block text-black">YOUR CAMPUS</span>
            <span className="block text-black">HAS THE</span>
            <span className="block text-black">TALENT.</span>
            <span className="block text-orange italic">KEVIN FINDS</span>
            <span className="block text-orange italic">THE MISSING</span>
            <span className="block text-orange italic">PIECE.</span>
          </h1>
          
          <p className="hero-subtext">
            Build high-performance teams around what your project strictly needs — backed by verified GitHub evidence, not guesswork.
          </p>
          
          <div className="hero-actions flex items-center gap-4">
            <button className="cta-button" onClick={() => navigate(user ? '/teams?create=true' : '/login')}>
              Build a team <ArrowUpRight size={16} />
            </button>
            <Link to="/talent" className="secondary-link flex items-center">
              Explore talent <ArrowDownRight size={16} />
            </Link>

            <div className="hero-play-button-wrapper flex items-center gap-2" style={{ cursor: 'pointer', marginLeft: '1rem' }} onClick={() => navigate('/talent')}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', transition: 'all 0.2s ease', border: '1px solid #333' }}>
                <Play size={20} fill="#fff" style={{ marginLeft: '4px' }} />
              </div>
            </div>
          </div>

          <div className="hero-stats-row flex items-center">
            <div className="stat-pill">
              <span className="mono text-orange bold">98%</span>
              <span className="text-gray">Verification Accuracy</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-pill">
              <span className="mono text-black bold">0s</span>
              <span className="text-gray">Manual Search Time</span>
            </div>
          </div>
        </div>
        
        <div className="hero-right reveal-on-scroll is-visible stagger-2">
          <div className="visualization-container">
            <div className="vis-header flex justify-between items-center mono">
              <span className="text-orange flex items-center gap-2">
                <span className="dot pulse"></span> MATCH FOUND · {nodes[activeNode]?.match || '90%'} CONFIDENCE
              </span>
              <span className="text-gray flex items-center gap-1">
                <GitBranch size={12} /> SYNTHESIS ACTIVE
              </span>
            </div>
            
            <div className="vis-body">
               {/* Background Grid */}
               <div className="grid-overlay"></div>

               {/* SVG Orbital Path Rings Centered at 50%, 44% */}
               <svg className="orbital-svg-tracks">
                 <circle cx="50%" cy="44%" r="115" className="orbit-track track-1" />
                 <circle cx="50%" cy="44%" r="165" className="orbit-track track-2" />
                 <circle cx="50%" cy="44%" r="215" className="orbit-track track-3" />
               </svg>

               {/* STATIONARY CENTER PROJECT CARD (ORION-X) */}
               <div className="mock-card main-project-card stationary-center">
                  <div className="flex items-center justify-between">
                    <div className="mock-card-title flex items-center gap-1">
                      <Cpu size={12} className="text-orange" /> TARGET PROJECT
                    </div>
                    <span className="badge-tag">RECRUITING</span>
                  </div>
                  <div className="mock-card-name">ORION-X</div>
                  <div className="mono text-gray project-desc">AUTONOMOUS ROVER AI</div>
                  <div className="required-skills-preview flex gap-1">
                    <span className="mini-chip">Computer Vision</span>
                    <span className="mini-chip">PyTorch</span>
                  </div>
               </div>

               {/* REVOLVING / ORBITING CANDIDATE NODES */}
               {nodes.map((node) => {
                 const isSelected = activeNode === node.id;
                 return (
                   <div 
                     key={node.id}
                     className={`candidate-node orbiting-node ${node.orbitClass} ${isSelected ? 'selected' : ''}`}
                     onClick={() => setActiveNode(node.id)}
                   >
                     <div className="flex items-center gap-2">
                       <div className="avatar-circle">
                         {node.initials}
                       </div>
                       <div>
                         <div className="node-name flex items-center gap-1">
                           {node.name}
                           {isSelected && <CheckCircle2 size={12} className="text-orange" />}
                         </div>
                         <div className="mono node-role">{node.role}</div>
                       </div>
                       <span className="node-score mono">{node.match}</span>
                     </div>
                   </div>
                 );
               })}

               {/* Active Evidence Bar at Bottom with clean margin */}
               <div className="node-detail-floating glass-panel">
                 <div className="flex items-center justify-between">
                   <span className="mono text-orange flex items-center gap-1 text-xs">
                     <Sparkles size={12} /> VERIFIED EVIDENCE
                   </span>
                   <span className="mono text-gray text-xs">{nodes[activeNode]?.evidence}</span>
                 </div>
               </div>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
