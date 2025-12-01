import React, { createContext, useContext, useState } from "react";

//creates an empty context to store auth info.
export const AuthContext = createContext(null);

//wraps the whole app and provides auth state to all children.
export function AuthProvider({ children }) {
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
        setAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
