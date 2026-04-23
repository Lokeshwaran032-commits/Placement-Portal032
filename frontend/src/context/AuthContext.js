import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role  = localStorage.getItem('role');
    const name  = localStorage.getItem('name');
    if (token && role) setUser({ token, role, name });
    setLoading(false);
  }, []);

  const login = useCallback((data) => {
    localStorage.setItem('token', data.access_token);
    localStorage.setItem('role',  data.role);
    localStorage.setItem('name',  data.name);
    setUser({ token: data.access_token, role: data.role, name: data.name });
  }, []);

  const logout = useCallback(() => {
    localStorage.clear();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
