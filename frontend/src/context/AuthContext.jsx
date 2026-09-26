import React, { createContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  sendEmailVerification, 
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  signInWithPopup
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sync Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Only load user profile if their email is verified
        if (firebaseUser.emailVerified) {
          try {
            // Get fresh token
            const token = await firebaseUser.getIdToken();
            localStorage.setItem('token', token); // Store for axios interceptor
            
            // Fetch backend profile
            const response = await api.get('/auth/me');
            setUser(response.data.data.user);
          } catch (err) {
            console.error("Failed to fetch user profile", err);
            if (err.response && err.response.status === 404) {
              try {
                // Self-heal orphaned Firebase user
                await firebaseUser.delete();
              } catch (delErr) {
                console.error("Failed to delete orphaned user", delErr);
              }
            }
            setUser(null);
          }
        } else {
          setUser(null); // Wait for verification
        }
      } else {
        localStorage.removeItem('token');
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      if (!userCredential.user.emailVerified) {
        await firebaseSignOut(auth);
        throw new Error('Please verify your email before logging in.');
      }
      
      const token = await userCredential.user.getIdToken();
      localStorage.setItem('token', token);
      
      const response = await api.get('/auth/me').catch(async (err) => {
        if (err.response && err.response.status === 404) {
          await userCredential.user.delete();
          throw new Error("User account incomplete. Please register again.");
        }
        throw err;
      });
      setUser(response.data.data.user);
      return response.data.data.user;
    } catch (error) {
      if (error.code === 'auth/invalid-credential') {
        throw new Error('Invalid email or password');
      }
      throw new Error(error.message || 'Login failed');
    }
  };

  const loginWithProvider = async (providerName) => {
    try {
      const provider = googleProvider;
      const userCredential = await signInWithPopup(auth, provider);
      const token = await userCredential.user.getIdToken();
      localStorage.setItem('token', token);

      let response;
      try {
        response = await api.get('/auth/me');
      } catch (err) {
        if (err.response && err.response.status === 404) {
          response = await api.post('/auth/sync', { 
            name: userCredential.user.displayName || userCredential.user.email.split('@')[0] 
          });
        } else {
          throw err;
        }
      }

      setUser(response.data.data.user);
      return response.data.data.user;
    } catch (error) {
      console.error(`${providerName} login error`, error);
      throw new Error(error.message || `${providerName} login failed`);
    }
  };

  const registerAndSync = async (userData) => {
    try {
      // 1. Create user in Firebase
      const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
      
      // 2. Send verification email
      await sendEmailVerification(userCredential.user);

      // 3. Sync user data to backend immediately
      const token = await userCredential.user.getIdToken();
      localStorage.setItem('token', token); // Temporarily store so api call works
      
      try {
        await api.post('/auth/sync', userData);
      } catch (syncError) {
        // Rollback Firebase user if backend sync fails
        await userCredential.user.delete();
        throw syncError;
      }
      
      // Clear token since they can't login until verified
      localStorage.removeItem('token'); 
      // Sign them out of Firebase too so they must re-login
      await firebaseSignOut(auth);

      return true;
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('An account with this email already exists');
      }
      throw new Error(error.response?.data?.error?.message || error.message || 'Registration failed');
    }
  };

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
      localStorage.removeItem('token');
      setUser(null);
    } catch (error) {
      console.error("Logout error", error);
    }
  };

  const refreshUser = async () => {
    try {
      const response = await api.get('/auth/me');
      setUser(response.data.data.user);
      return response.data.data.user;
    } catch (err) {
      console.error("Failed to refresh user profile", err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, loginWithProvider, registerAndSync, logout, refreshUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
