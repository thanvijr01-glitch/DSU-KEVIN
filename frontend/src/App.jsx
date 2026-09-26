import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import GithubCallback from './pages/GithubCallback';
import TalentDirectory from './pages/TalentDirectory';
import PublicProfile from './pages/PublicProfile';
import Teams from './pages/Teams';
import TeamDetails from './pages/TeamDetails';
import Hackathons from './pages/Hackathons';
import About from './pages/About';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/talent" element={<TalentDirectory />} />
          <Route path="/profile/:id" element={<PublicProfile />} />
          <Route path="/teams" element={<Teams />} />
          <Route path="/teams/:id" element={<TeamDetails />} />
          <Route path="/hackathons" element={<Hackathons />} />
          <Route path="/about" element={<About />} />
          <Route path="/auth/github/callback" element={<GithubCallback />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
