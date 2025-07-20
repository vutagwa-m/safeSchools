import React, { useState } from 'react';
import { signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase/config';
import { getDoc, doc } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import '../styles/Login.css';
import googleIcon from "../assets/Google.jpeg";
import phoneIcon from "../assets/phone.jpeg";
import { useNavigate, Link } from "react-router-dom";
import { Box, Typography } from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';

const Login = () => {
  const navigate = useNavigate();
  const db = getFirestore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleAuthSuccess = async (user) => {
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    
    if (!userDoc.exists()) {
      console.error('User not found');
      return;
    }

    const userData = userDoc.data();
    
    switch (userData.role) {
      case 'admin':
        navigate('/admin');
        break;
      case 'support':
        navigate('/support');
        break;
      case 'student':
        navigate('/student');
        break;
      default:
        navigate('/');
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      await handleAuthSuccess(result.user);
    } catch (error) {
      console.error('Google Sign-in Error:', error);
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      await handleAuthSuccess(result.user);
    } catch (error) {
      console.error('Email Sign-in Error:', error);
    }
  };

  const handlePhoneLogin = async () => {
    const recaptchaVerifier = new RecaptchaVerifier('recaptcha-container', {
      size: 'invisible',
      callback: () => {}
    }, auth);

    const phoneNumber = prompt('Enter your phone number');
    
    try {
      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
      const verificationCode = prompt('Enter verification code');
      const result = await confirmationResult.confirm(verificationCode);
      await handleAuthSuccess(result.user);
    } catch (error) {
      console.error('Phone Sign-in Error:', error);
    }
  };

  return (
    <div className="login-container">
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
        <SchoolIcon sx={{ color: '#ff9800', fontSize: 40, mr: 1 }} />
        <Typography variant="h4" sx={{ color: '#2e7d32', fontWeight: 'bold' }}>
          Safe<Box component="span" sx={{ color: '#ff9800' }}>Schools</Box>
        </Typography>
      </Box>
      
      <Typography variant="h5" sx={{ textAlign: 'center', mb: 3, color: '#2e7d32' }}>
        Login Portal
      </Typography>
      
      <form onSubmit={handleEmailLogin} className="email-login">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login with Email</button>
      </form>

      <div className="social-login">
        <button onClick={handleGoogleLogin} className="google-btn">
          <img src={googleIcon} alt="Google" />
          Login with Google
        </button>
        <button onClick={handlePhoneLogin} className="phone-btn">
          <img src={phoneIcon} alt="Phone" />
          Login with Phone
        </button>
      </div>

      <div id="recaptcha-container"></div>
      
      <p>
        Don't have an account? <Link to="/register">Register here</Link>
      </p>
    </div>
  );
};

export default Login;