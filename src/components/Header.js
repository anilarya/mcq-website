import React from 'react';
import { auth, signInWithGoogle } from '../firebase';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/Header.css'; // Import the CSS file for header styling

const Header = ({ user }) => {
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Error logging in: ', error);
    }
  };

  const handleLogout = () => {
    auth.signOut().then(() => navigate('/login'));
  };

  return (
    <div className="header">
      <div className="header-content">
        <h1 className="app-name">Yogic Quiz</h1>
        <div className="user-actions">
          {user ? (
            <>
              {user.email === 'anilarya280@gmail.com' && (
                <>
                  <Link to="/admin">Admin Dashboard</Link>
                  <Link to="/results">Results</Link>
                </>
              )}
              <span className="user-details">Hello, {user.email}</span>
             
              <button onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <button onClick={handleLogin}>Login</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;
