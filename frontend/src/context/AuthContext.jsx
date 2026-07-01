import { createContext, useEffect, useState } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      if (!user) {
        const fallbackUser = { loggedIn: true };
        try {
          localStorage.setItem("user", JSON.stringify(fallbackUser));
        } catch (e) {}
        setUser(fallbackUser);
      }
      setLoading(false);
    } else {
      setUser(null);
      try {
        localStorage.removeItem("user");
      } catch (e) {}
      setLoading(false);
    }
  }, [token, user]);

  const login = (jwtToken, userData = null) => {
    try {
      localStorage.setItem("token", jwtToken);
      if (userData) {
        localStorage.setItem("user", JSON.stringify(userData));
      } else {
        localStorage.setItem("user", JSON.stringify({ loggedIn: true }));
      }
    } catch (e) {}
    
    setToken(jwtToken);
    if (userData) {
      setUser(userData);
    } else {
      setUser({ loggedIn: true });
    }
  };

  const logout = () => {
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    } catch (e) {}
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        loading,
        isAuthenticated: !!user && !!token,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};