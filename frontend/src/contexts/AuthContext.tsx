import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  User as FirebaseUser, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { api } from '../lib/api';
import { socketManager } from '../lib/socket';
import { toast } from 'sonner';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  hostelBlock?: string;
  rating?: number;
  isAdmin?: boolean;
  isEmailVerified: boolean;
  createdAt?: string;
}

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (email: string, password: string, name: string, hostelBlock: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (data: Partial<User>) => Promise<void>;
  getIdToken: () => Promise<string | null>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Validate university email
  const isValidUniversityEmail = (email: string): boolean => {
    return email.endsWith('.edu') || email.includes('university') || email.includes('college');
  };

  // Convert Firebase user to our User interface
  const mapFirebaseUserToUser = async (firebaseUser: FirebaseUser): Promise<User | null> => {
    try {
      // Try to get additional user data from our backend
      const response = await api.users.getProfile();
      const backendUser = response.data;
      
      return {
        id: firebaseUser.uid,
        email: firebaseUser.email!,
        name: backendUser.name || firebaseUser.displayName || 'Anonymous',
        avatar: backendUser.avatar || firebaseUser.photoURL || undefined,
        hostelBlock: backendUser.hostelBlock,
        rating: backendUser.rating || 5.0,
        isAdmin: backendUser.isAdmin || false,
        isEmailVerified: firebaseUser.emailVerified,
        createdAt: backendUser.createdAt,
      };
    } catch (error) {
      console.error('Error fetching user profile:', error);
      // Fallback to Firebase user data only
      return {
        id: firebaseUser.uid,
        email: firebaseUser.email!,
        name: firebaseUser.displayName || 'Anonymous',
        avatar: firebaseUser.photoURL || undefined,
        isEmailVerified: firebaseUser.emailVerified,
        rating: 5.0,
        isAdmin: false,
      };
    }
  };

  // Login function
  const login = async (email: string, password: string): Promise<void> => {
    if (!isValidUniversityEmail(email)) {
      throw new Error('Please use a valid university email address');
    }

    try {
      setLoading(true);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      if (!userCredential.user.emailVerified) {
        toast.warning('Please verify your email address before continuing');
      }

      // Connect to socket after successful login
      setTimeout(() => {
        socketManager.connect().catch(console.error);
      }, 1000);

      toast.success('Successfully logged in!');
    } catch (error: any) {
      console.error('Login error:', error);
      let message = 'Login failed';
      
      switch (error.code) {
        case 'auth/user-not-found':
          message = 'No account found with this email';
          break;
        case 'auth/wrong-password':
          message = 'Invalid password';
          break;
        case 'auth/invalid-email':
          message = 'Invalid email format';
          break;
        case 'auth/user-disabled':
          message = 'Account has been disabled';
          break;
        case 'auth/too-many-requests':
          message = 'Too many failed attempts. Try again later';
          break;
        default:
          message = error.message || 'Login failed';
      }
      
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  // Google login
  const loginWithGoogle = async (): Promise<void> => {
    try {
      setLoading(true);
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(auth, provider);

      // Ensure profile exists in backend
      try {
        await api.users.updateProfile({
          name: cred.user.displayName || 'Google User',
          avatar: cred.user.photoURL || undefined,
        });
      } catch (e) {
        // ignore profile update errors, user will still be logged in
        console.warn('Profile update after Google sign-in failed:', e);
      }

      toast.success('Signed in with Google');
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      let message = 'Google sign-in failed';
      if (error.code === 'auth/popup-closed-by-user') message = 'Popup closed before completing sign in';
      if (error.code === 'auth/cancelled-popup-request') message = 'Cancelled popup sign-in';
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (
    email: string, 
    password: string, 
    name: string, 
    hostelBlock: string
  ): Promise<void> => {
    if (!isValidUniversityEmail(email)) {
      throw new Error('Please use a valid university email address');
    }

    try {
      setLoading(true);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update Firebase profile
      await updateProfile(userCredential.user, {
        displayName: name,
      });

      // Send email verification
      await sendEmailVerification(userCredential.user);

      // Create user profile in our backend
      try {
        await api.users.updateProfile({
          name,
          hostelBlock,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=200&background=random`,
        });
      } catch (backendError) {
        console.error('Error creating backend profile:', backendError);
        // Continue anyway as Firebase user was created successfully
      }

      toast.success('Account created! Please verify your email to continue.');
    } catch (error: any) {
      console.error('Registration error:', error);
      let message = 'Registration failed';
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          message = 'An account with this email already exists';
          break;
        case 'auth/invalid-email':
          message = 'Invalid email format';
          break;
        case 'auth/operation-not-allowed':
          message = 'Email/password registration is not enabled';
          break;
        case 'auth/weak-password':
          message = 'Password should be at least 6 characters';
          break;
        default:
          message = error.message || 'Registration failed';
      }
      
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      socketManager.disconnect();
      await signOut(auth);
      setUser(null);
      setFirebaseUser(null);
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Logout failed');
    }
  };

  // Update user profile
  const updateUserProfile = async (data: Partial<User>): Promise<void> => {
    if (!firebaseUser) throw new Error('No user logged in');

    try {
      // Update Firebase profile if name or avatar changed
      if (data.name || data.avatar) {
        await updateProfile(firebaseUser, {
          displayName: data.name,
          photoURL: data.avatar,
        });
      }

      // Update backend profile
      await api.users.updateProfile(data);
      
      // Refresh user data
      await refreshUser();
      
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('Failed to update profile');
      throw error;
    }
  };

  // Get Firebase ID token
  const getIdToken = async (): Promise<string | null> => {
    if (!firebaseUser) return null;
    
    try {
      return await firebaseUser.getIdToken();
    } catch (error) {
      console.error('Error getting ID token:', error);
      return null;
    }
  };

  // Refresh user data
  const refreshUser = async (): Promise<void> => {
    if (!firebaseUser) return;
    
    try {
      const userData = await mapFirebaseUserToUser(firebaseUser);
      setUser(userData);
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  };

  // Listen for authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      
      if (firebaseUser) {
        setFirebaseUser(firebaseUser);
        
        try {
          const userData = await mapFirebaseUserToUser(firebaseUser);
          setUser(userData);
          
          // Connect to socket
          socketManager.connect().catch(console.error);
        } catch (error) {
          console.error('Error setting up user:', error);
          setUser(null);
        }
      } else {
        setFirebaseUser(null);
        setUser(null);
        socketManager.disconnect();
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value: AuthContextType = {
    user,
    firebaseUser,
    loading,
    login,
    loginWithGoogle,
    register,
    logout,
    updateUserProfile,
    getIdToken,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};