import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { auth } from '../lib/firebase';

export type UserRole = 'ADMIN' | 'OPERATOR';

interface AuthContextType {
  user: User | null;
  role: UserRole;
  loading: boolean;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string) => Promise<void>;
  quickDemoLogin: (role: 'admin' | 'operator') => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
  setError: (err: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const DEMO_ADMIN = {
  email: 'admin@japara.id',
  password: 'PasswordAdmin123!',
  name: 'Kepala Operasional JAPARA',
  role: 'ADMIN' as UserRole,
};

export const DEMO_OPERATOR = {
  email: 'operator@japara.id',
  password: 'PasswordOperator123!',
  name: 'Petugas Lapangan & Gate JAPARA',
  role: 'OPERATOR' as UserRole,
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const getRole = (email?: string | null): UserRole => {
    if (!email) return 'OPERATOR';
    if (email.toLowerCase().includes('admin') || email.toLowerCase().includes('wisnu')) {
      return 'ADMIN';
    }
    return 'OPERATOR';
  };

  const loginWithEmail = async (email: string, pass: string) => {
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), pass);
    } catch (err: unknown) {
      const fbErr = err as { code?: string; message?: string };
      // If user not found, try to auto-create if it's the demo account
      if (
        (fbErr.code === 'auth/user-not-found' || fbErr.code === 'auth/invalid-credential') &&
        (email === DEMO_ADMIN.email || email === DEMO_OPERATOR.email)
      ) {
        try {
          await createUserWithEmailAndPassword(auth, email.trim(), pass);
          return;
        } catch (createErr: unknown) {
          const cErr = createErr as Error;
          setError(cErr.message || 'Gagal mendaftarkan user demo.');
          throw createErr;
        }
      }

      let errorMsg = 'Gagal masuk. Periksa email dan password.';
      if (fbErr.code === 'auth/invalid-email') errorMsg = 'Format email tidak valid.';
      if (fbErr.code === 'auth/user-disabled') errorMsg = 'Akun ini dinonaktifkan.';
      if (fbErr.code === 'auth/invalid-credential') errorMsg = 'Email atau password salah.';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const registerWithEmail = async (email: string, pass: string) => {
    setError(null);
    try {
      await createUserWithEmailAndPassword(auth, email.trim(), pass);
    } catch (err: unknown) {
      const fbErr = err as { code?: string; message?: string };
      let errorMsg = 'Gagal membuat akun.';
      if (fbErr.code === 'auth/email-already-in-use') errorMsg = 'Email ini sudah terdaftar.';
      if (fbErr.code === 'auth/weak-password') errorMsg = 'Password minimal 6 karakter.';
      if (fbErr.code === 'auth/invalid-email') errorMsg = 'Format email tidak valid.';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const quickDemoLogin = async (type: 'admin' | 'operator') => {
    setError(null);
    const target = type === 'admin' ? DEMO_ADMIN : DEMO_OPERATOR;
    try {
      await signInWithEmailAndPassword(auth, target.email, target.password);
    } catch {
      // Auto-create demo account on first run
      try {
        await createUserWithEmailAndPassword(auth, target.email, target.password);
      } catch (e: unknown) {
        const err = e as Error;
        setError(err.message || 'Gagal login demo.');
        throw e;
      }
    }
  };

  const logout = async () => {
    setError(null);
    await signOut(auth);
  };

  const role = getRole(user?.email);

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        loading,
        loginWithEmail,
        registerWithEmail,
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
