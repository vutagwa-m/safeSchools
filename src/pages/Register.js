import React, { useState } from 'react';
import { signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase/config';
import { useNavigate, Link } from 'react-router-dom';
import { getDoc, doc, setDoc } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import '../styles/Login.css';
import googleIcon from "../assets/Google.jpeg";
import phoneIcon from "../assets/phone.jpeg";
import { Box, Typography } from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';

const Register = () => {
  const navigate = useNavigate();
  const db = getFirestore();
  const [role, setRole] = useState('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [school, setSchool] = useState('');
  const [employmentType, setEmploymentType] = useState('full');
  const [employmentNumber, setEmploymentNumber] = useState('');
  const [county, setCounty] = useState('');
  const [position, setPosition] = useState('counselor');
  const [placeOfWork, setPlaceOfWork] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);

  const handleRegistrationSuccess = async (user) => {
    const userData = {
      uid: user.uid,
      email: user.email,
      phoneNumber: user.phoneNumber || phoneNumber,
      fullName,
      role,
      createdAt: new Date()
    };

    if (role === 'student') {
      userData.school = school;
    } else if (role === 'admin') {
      userData.employmentType = employmentType;
      userData.employmentNumber = employmentNumber;
      userData.county = county;
    } else if (role === 'support') {
      userData.position = position;
      userData.placeOfWork = placeOfWork;
      userData.isRegistered = isRegistered;
    }

    await setDoc(doc(db, 'users', user.uid), userData);
    navigate('/login');
  };

  const handleGoogleSignup = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      await handleRegistrationSuccess(result.user);
    } catch (error) {
      console.error('Google Signup Error:', error);
    }
  };

  const handleEmailSignup = async (e) => {
    e.preventDefault();
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await handleRegistrationSuccess(result.user);
    } catch (error) {
      console.error('Email Signup Error:', error);
    }
  };

  const handlePhoneSignup = async () => {
    const recaptchaVerifier = new RecaptchaVerifier('recaptcha-container', {
      size: 'invisible',
      callback: () => {}
    }, auth);

    try {
      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
      const verificationCode = prompt('Enter verification code');
      const result = await confirmationResult.confirm(verificationCode);
      await handleRegistrationSuccess(result.user);
    } catch (error) {
      console.error('Phone Signup Error:', error);
    }
  };

  const renderRoleFields = () => {
    switch (role) {
      case 'student':
        return (
          <>
            <input type="text" placeholder="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <input type="tel" placeholder="Phone Number" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required />
            <input type="text" placeholder="School" value={school} onChange={(e) => setSchool(e.target.value)} required />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </>
        );
      case 'admin':
        return (
          <>
            <input type="text" placeholder="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <input type="tel" placeholder="Phone Number" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required />
            <select value={employmentType} onChange={(e) => setEmploymentType(e.target.value)} required>
              <option value="full">Full Time</option>
              <option value="part">Part Time</option>
              <option value="temporary">Temporary</option>
              <option value="volunteer">Volunteer</option>
            </select>
            <input type="text" placeholder="Employment Number" value={employmentNumber} onChange={(e) => setEmploymentNumber(e.target.value)} required />
            <input type="text" placeholder="County" value={county} onChange={(e) => setCounty(e.target.value)} required />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </>
        );
      case 'support':
        return (
          <>
            <input type="text" placeholder="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <input type="tel" placeholder="Phone Number" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required />
            <select value={position} onChange={(e) => setPosition(e.target.value)} required>
              <option value="counselor">Counselor</option>
              <option value="therapist">Therapist</option>
              <option value="social_worker">Social Worker</option>
              <option value="other">Other</option>
            </select>
            <input type="text" placeholder="Place of Work" value={placeOfWork} onChange={(e) => setPlaceOfWork(e.target.value)} required />
            <input type="text" placeholder="Employment Number" value={employmentNumber} onChange={(e) => setEmploymentNumber(e.target.value)} required />
            <div className="radio-group">
              <label>
                <input type="radio" name="registered" checked={isRegistered} onChange={() => setIsRegistered(true)} />
                Registered
              </label>
              <label>
                <input type="radio" name="registered" checked={!isRegistered} onChange={() => setIsRegistered(false)} />
                Not Registered
              </label>
            </div>
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="register-container">
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
        <SchoolIcon sx={{ color: '#ff9800', fontSize: 40, mr: 1 }} />
        <Typography variant="h4" sx={{ color: '#2e7d32', fontWeight: 'bold' }}>
          Safe<Box component="span" sx={{ color: '#ff9800' }}>Schools</Box>
        </Typography>
      </Box>
      
      <Typography variant="h5" sx={{ textAlign: 'center', mb: 3, color: '#2e7d32' }}>
        Registration Portal
      </Typography>

      <div className="role-selection">
        <label>
          <input type="radio" name="role" value="student" checked={role === 'student'} onChange={() => setRole('student')} />
          Student
        </label>
        <label>
          <input type="radio" name="role" value="admin" checked={role === 'admin'} onChange={() => setRole('admin')} />
          Admin
        </label>
        <label>
          <input type="radio" name="role" value="support" checked={role === 'support'} onChange={() => setRole('support')} />
          Support
        </label>
      </div>

      <form onSubmit={handleEmailSignup} className="register-form">
        {renderRoleFields()}
        <button type="submit">Register with Email</button>
      </form>

      <div className="social-register">
        <button onClick={handleGoogleSignup} className="google-btn">
          <img src={googleIcon} alt="Google" />
          Register with Google
        </button>
        <div className="phone-register">
          <input type="tel" placeholder="Phone Number" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
          <button onClick={handlePhoneSignup} className="phone-btn">
            <img src={phoneIcon} alt="Phone" />
            Register with Phone
          </button>
        </div>
      </div>

      <div id="recaptcha-container"></div>
      
      <p>
        Already have an account? <Link to="/login">Login here</Link>
      </p>
    </div>
  );
};

export default Register;