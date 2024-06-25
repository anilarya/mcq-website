import React from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithGoogle } from '../firebase';
import { addUser } from '../firebaseFunctions';
import '../styles/LoginPage.css'; // Import the CSS file

const LoginPage = () => {
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const result = await signInWithGoogle();
      const user = result.user;
      await addUser(user);
      if (user.email === 'anilarya280@gmail.com') {
        navigate('/admin');
      } else {
        navigate('/user');
      }
    } catch (error) {
      console.error('Error logging in: ', error);
    }
  };

  return (
    <div className="container login-page">
      <h1>Login</h1>
      <button onClick={handleLogin}>Login with Google</button>
    </div>
  );
};

export default LoginPage;
