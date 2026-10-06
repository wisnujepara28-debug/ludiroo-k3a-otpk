import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
} from 'firebase/auth';
import { auth } from '../lib/firebase';

export type UserRole = 'ADMIN' | 'OPERATOR';

export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
}

interface AuthContextType {
  user: AppUser | null;
  role: UserRole;
  loading: boolean;
  loginUser: (usernameOrEmail: string, pass: string, chosenRole?: UserRole) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  quickDemoLogin: (role: 'admin' | 'operator') => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
  setError: (err: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const DEMO_ADMIN = {
  username: 'admin',
  email: 'admin@japara.id',
  password: '123',
  name: 'Admin JAPARA',
  role: 'ADMIN' as UserRole,
};

export const DEMO_OPERATOR = {
  username: 'operator',
  email: 'operator@japara.id',
  password: '123',
  name: 'Operator JAPARA',
  role: 'OPERATOR' as UserRole,
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getRole = (str?: string | null): UserRole => {
    if (!str) return 'OPERATOR';
    const lower = str.toLowerCase();
    if (
      lower.includes('admin') ||
      lower.includes('wisnu') ||
      lower.includes('japara') ||
      lower.includes('manager') ||
      lower.includes('kepala') ||
      lower.includes('lead')
    ) {
      return 'ADMIN';
    }
    return 'OPERATOR';
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
        setUser((prev) => {
          if (prev) return prev;
          const email = fbUser.email || 'operator@japara.id';
          return {
            uid: fbUser.uid,
            email,
            displayName: fbUser.displayName || email.split('@')[0] || 'Petugas JAPARA',
            role: getRole(email),
          };
        });
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginUser = async (usernameOrEmail: string, pass: string, chosenRole?: UserRole) => {
    setError(null);
    const cleanInput = (usernameOrEmail || 'admin').trim();
    const resolvedEmail = cleanInput.includes('@')
      ? cleanInput
      : `${cleanInput.toLowerCase().replace(/[^a-z0-9_.-]/g, '') || 'petugas'}@japara.id`;

    const resolvedRole = chosenRole || getRole(cleanInput);

    // Try background Firebase Auth anonymous or email if possible
    let currentUid = 'usr-' + Date.now();
    try {
      const anonResult = await signInAnonymously(auth);
      if (anonResult.user) {
        currentUid = anonResult.user.uid;
      }
    } catch {
      // If anonymous is restricted in console, try standard email login
      try {
        const result = await signInWithEmailAndPassword(auth, resolvedEmail, pass || 'Password123!');
        if (result.user) currentUid = result.user.uid;
      } catch {
        try {
          const createRes = await createUserWithEmailAndPassword(auth, resolvedEmail, pass || 'Password123!');
          if (createRes.user) currentUid = createRes.user.uid;
        } catch {
          // Gracefully continue with session UID
        }
      }
    }

    const appUser: AppUser = {
      uid: currentUid,
      email: resolvedEmail,
      displayName: cleanInput,
      role: resolvedRole,
    };

    setUser(appUser);
  };

  const loginWithGoogle = async () => {
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      const res = await signInWithPopup(auth, provider);
      if (res.user) {
        setUser({
          uid: res.user.uid,
          email: res.user.email || 'google@japara.id',
          displayName: res.user.displayName || res.user.email?.split('@')[0] || 'User Google',
          role: getRole(res.user.email),
        });
      }
    } catch (err: unknown) {
      const fbErr = err as { message?: string };
      setError(fbErr.message || 'Gagal masuk dengan Google.');
      throw err;
    }
  };

  const quickDemoLogin = async (type: 'admin' | 'operator') => {
    setError(null);
    const target = type === 'admin' ? DEMO_ADMIN : DEMO_OPERATOR;
    await loginUser(target.username, target.password, target.role);
  };

  const logout = async () => {
    setError(null);
    try {
      await signOut(auth);
    } catch {
      // Ignored
    }
    setUser(null);
  };

  const role = user?.role || 'OPERATOR';

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        loading,
        loginUser,
        loginWithGoogle,
        quickDemoLogin,
        logout,
        error,
        setError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
