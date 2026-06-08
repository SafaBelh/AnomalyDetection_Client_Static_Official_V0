import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { setToken, getToken, clearToken, setUser, getUser, getToken as getStoredToken, getUser as getStoredUser } from "@/utils/api";
import { USERS_TABLE } from "@/store/staticData";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUserState] = useState(getStoredUser);
  const [token, setTokenState] = useState(getStoredToken);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Static auth: always use fake users from staticData.js
  const login = useCallback(async (username, password) => {
    setLoading(true);
    setError("");
    try {
      const demoUser = USERS_TABLE.find((u) => u.username === username && u.password === password);
      if (!demoUser) {
        throw new Error("Invalid credentials");
      }
      const tokenStr = `mock-token-${demoUser.username}`;
      setToken(tokenStr);
      setTokenState(tokenStr);
      const userData = {
        id: demoUser.id,
        name: demoUser.name,
        username: demoUser.username,
        roles: demoUser.roles,
        isEngineAdmin: demoUser.isEngineAdmin,
        isTenant: demoUser.roles.includes("TENANT"),
        tenantId: demoUser.isEngineAdmin ? null : demoUser.id,
        tenantName: demoUser.name,
      };
      setUser(userData);
      setUserState(userData);
      if (!userData.isEngineAdmin && userData.tenantId) {
        import("@/store/db").then((dbModule) => {
          dbModule.setActiveTenant(userData.tenantId, userData.tenantName);
        });
      } else if (userData.isEngineAdmin) {
        import("@/store/db").then((dbModule) => {
          dbModule.setActiveTenant(null, null);
        });
      }
      return userData;
    } catch (err) {
      const msg = err.message || "Erreur de connexion";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const loginSSO = useCallback(async (externalToken, connectorName) => {
    setLoading(true);
    setError("");
    try {
      const simulatedToken = `mock-sso-token-${externalToken.slice(0, 8)}`;
      setToken(simulatedToken);
      setTokenState(simulatedToken);
      const userData = {
        isSSO: true,
        name: connectorName,
        roles: [],
      };
      setUser(userData);
      setUserState(userData);
      return userData;
    } catch (err) {
      const msg = err.message || "Erreur d'authentification SSO";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setTokenState(null);
    setUserState(null);
  }, []);

  const value = {
    user,
    token,
    loading,
    error,
    isAuthenticated: !!token,
    isEngineAdmin: user?.isEngineAdmin || false,
    isTenant: user?.isTenant || false,
    isSSO: user?.isSSO || false,
    login,
    loginSSO,
    logout,
    clearError: () => setError(""),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
