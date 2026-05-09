import { createContext, useContext, useState, useEffect } from 'react';
import { login as loginApi, signup as signupApi, getMe } from '../services/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('ektaara_token');
    if (token) {
      getMe()
        .then(({ data }) => {
          setUser(data.data.user);
        })
        .catch(() => {
          localStorage.removeItem('ektaara_token');
          localStorage.removeItem('ektaara_user');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (credentials) => {
    const { data } = await loginApi(credentials);
    localStorage.setItem('ektaara_token', data.data.token);
    localStorage.setItem('ektaara_user', JSON.stringify(data.data.user));
    setUser(data.data.user);
    return data;
  };

  const signup = async (credentials) => {
    const { data } = await signupApi(credentials);
    localStorage.setItem('ektaara_token', data.data.token);
    localStorage.setItem('ektaara_user', JSON.stringify(data.data.user));
    setUser(data.data.user);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('ektaara_token');
    localStorage.removeItem('ektaara_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
