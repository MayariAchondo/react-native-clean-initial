import { router } from 'expo-router';
import { useState } from 'react';

const VALID_EMAIL = 'admin@cashi.com';
const VALID_PASSWORD = '123456';

export function useLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleEmailChange = (text: string) => {
    setEmail(text);
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
  };

  const handleLogin = () => {
    if (email !== VALID_EMAIL && password !== VALID_PASSWORD) {
      setError('Credenciales incorrectas');
      return;
    }

    setError('');
    router.replace('/(tabs)/categories');
  };

  return {
    email,
    password,
    error,
    handleEmailChange,
    handlePasswordChange,
    handleLogin,
  };
}
