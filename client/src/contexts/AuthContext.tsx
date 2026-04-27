import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import {
  login as apiLogin,
  register as apiRegister,
  logout as apiLogout,
  getMe,
  getExternalLoginUrl,
  type User,
} from "../services/api";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    fullName: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
  loginWithGoogle: () => void;
  loginWithLinkedIn: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

/**
 * Provides authentication state and actions to the entire app.
 * On mount, checks for an existing JWT cookie via getMe() to auto-restore the session.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      const me = await getMe();
      setUser(me);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email: string, password: string) => {
    const res = await apiLogin({ email, password });
    setUser(res.user);
  };

  const register = async (
    email: string,
    password: string,
    fullName: string,
  ) => {
    const res = await apiRegister({ email, password, fullName });
    setUser(res.user);
  };

  const logout = async () => {
    await apiLogout();
    setUser(null);
  };

  const loginWithGoogle = () => {
    window.location.href = getExternalLoginUrl("Google");
  };

  const loginWithLinkedIn = () => {
    window.location.href = getExternalLoginUrl("LinkedIn");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        loginWithGoogle,
        loginWithLinkedIn,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/** Hook to access auth state (user, loading, isAuthenticated) and actions (login, register, logout, OAuth). */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
