import React from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithGoogle } from '../firebase';
import { addUser } from '../firebaseFunctions';
import '../styles/LoginPage.css'; // Import the CSS file
import SlButton from '@shoelace-style/shoelace/dist/react/button';
import SlIcon from '@shoelace-style/shoelace/dist/react/icon';

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
      <SlButton size="large" onClick={handleLogin} variant="default"> 
            <SlIcon slot="suffix" name="google" style={{ color: 'red' }}></SlIcon>
            Login with Google 
      </SlButton>
    </div>
  );
};

export default LoginPage;
