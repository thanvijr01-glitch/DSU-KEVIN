import React, { useContext, useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Navbar.css';
import { ArrowUpRight, Menu, X, Sparkles } from 'lucide-react';
import { createTopDockController } from '../shaders/animated-top-dock/topDockController';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dockRef = useRef(null);

  useEffect(() => {
    if (dockRef.current) {
      const cleanup = createTopDockController(dockRef.current, () => ({
        proximity: 122,
        spring: 0.19,
        damping: 0.70,
        widthGrowth: 0, /* We don't want the text to stretch left/right */
        heightGrowth: 0, /* We don't want the text to stretch up/down */
        drop: -15, /* Lift up on hover (negative drop moves it up) */
        axis: "x"
      }));
      return cleanup;
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className={`navbar ${scrolled ? 'scrolled glass-panel' : 'border-bottom'}`}>
      <div className="container flex items-center justify-between">
        <div className="navbar-left flex items-center">
          <Link to="/" className="brand-logo-link flex items-center">
            <div className="logo-box">
              <span>K</span>
            </div>
            <span className="brand-name text-black">KEVIN</span>
          </Link>
          <span className="mono uppercase text-gray brand-tagline">
            <Sparkles size={12} className="inline-sparkle text-orange" /> CAMPUS TEAM SYNTHESIS
          </span>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button 
          className="mobile-toggle" 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        <div className={`navbar-right flex items-center ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          <ul ref={dockRef} className="nav-links flex items-center">
            <li data-dock-item style={{ display: 'inline-block' }}>
              <Link 
                to="/hackathons" 
                className={isActive('/hackathons') ? 'active' : ''}
                onClick={() => setMobileMenuOpen(false)}
              >
                Hackathons
              </Link>
            </li>
            <li data-dock-item style={{ display: 'inline-block' }}>
              <Link 
                to="/teams" 
                className={isActive('/teams') ? 'active' : ''}
                onClick={() => setMobileMenuOpen(false)}
              >
                Teams
              </Link>
            </li>
            <li data-dock-item style={{ display: 'inline-block' }}>
              <Link 
                to="/talent" 
                className={isActive('/talent') ? 'active' : ''}
                onClick={() => setMobileMenuOpen(false)}
              >
                Talent
              </Link>
            </li>
            <li data-dock-item style={{ display: 'inline-block' }}>
              <Link 
                to="/about" 
                className={isActive('/about') ? 'active' : ''}
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </Link>
            </li>
            {user ? (
              <>
                <li data-dock-item style={{ display: 'inline-block' }}>
                  <Link 
                    to="/dashboard" 
                    className={isActive('/dashboard') ? 'active' : ''}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                </li>
                <li data-dock-item style={{ display: 'inline-block' }}>
                  <button onClick={handleLogout} className="logout-btn" style={{ padding: '4px 0' }}>
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <li data-dock-item style={{ display: 'inline-block' }}>
                <Link 
                  to="/login" 
                  className={isActive('/login') ? 'active' : ''}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
              </li>
            )}
          </ul>

          <Link 
            to={user ? "/teams?create=true" : "/login"} 
            className="cta-button nav-cta" 
            onClick={() => setMobileMenuOpen(false)}
          >
            Build a team <ArrowUpRight size={16} />
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
