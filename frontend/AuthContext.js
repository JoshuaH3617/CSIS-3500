import React, { createContext, useState, useContext } from "react";

// create global auth context
export const AuthContext = createContext();

// wrapper provider so all screens can access auth
export function AuthProvider({ children }) {

  // global auth state values
  const [auth, setAuth] = useState({
    username: null,
    fullName: null,
    token: null,
  });

  return (
    <AuthContext.Provider
      value={{
        username: auth.username,
        fullName: auth.fullName,
        token: auth.token,
        setAuth, // allow updates
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// custom hook so components can use auth context easily
export function useAuth() {
  return useContext(AuthContext);
}
