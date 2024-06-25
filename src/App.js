import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import LoginPage from './components/LoginPage';
import AdminDashboard from './components/AdminDashboard';
import UserDashboard from './components/UserDashboard';
import MCQAttempt from './components/MCQAttempt';
import ResultsPage from './components/ResultsPage';
import Header from './components/Header'; // Import the Header component
import './styles/common.css'; // Import common styles
import './App.css'; // Import the App layout styles
import '@shoelace-style/shoelace/dist/themes/light.css';
import { setBasePath } from '@shoelace-style/shoelace/dist/utilities/base-path';

setBasePath('https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.15.1/cdn/');

const AppContent = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
      if (user) {
        if (window.location.pathname === '/login') {
          if (user.email === 'anilarya280@gmail.com') {
            navigate('/admin');
          } else {
            navigate('/user');
          }
        }
      } else {
        navigate('/login');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="app-content">
      <Header user={user} />
      <div className="main-content"> {/* Ensure this div takes up the remaining height */}
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin" element={user && user.email === 'anilarya280@gmail.com' ? <AdminDashboard /> : <Navigate to="/login" />} />
          <Route path="/user" element={user && user.email !== 'anilarya280@gmail.com' ? <UserDashboard /> : <Navigate to="/login" />} />
          <Route path="/results" element={user && user.email === 'anilarya280@gmail.com' ? <ResultsPage /> : <Navigate to="/login" />} />
          <Route path="/mcq/:id" element={user ? <MCQAttempt /> : <Navigate to="/login" />} />
          <Route path="/" element={<Navigate to={user ? (user.email === 'anilarya280@gmail.com' ? '/admin' : '/user') : '/login'} />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </div>
    </div>
  );
};

const App = () => (
  <Router>
    <AppContent />
  </Router>
);

export default App;
