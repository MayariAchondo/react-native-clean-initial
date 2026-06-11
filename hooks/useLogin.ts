import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export function useLogin() {
  const { login, error: authError, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEmailChange = (text: string) => {
    setEmail(text);
    setError('');
    clearError();
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    setError('');
    clearError();
  };

  const handleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al iniciar sesión';
      if (message === 'UNAUTHORIZED') {
        setError('Credenciales incorrectas');
      } else if (message.includes('validation')) {
        setError('Email y contraseña son requeridos');
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    email,
    password,
    error: error || authError,
    loading,
    handleEmailChange,
    handlePasswordChange,
    handleLogin,
  };
}
