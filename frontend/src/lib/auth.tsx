import {
  createContext,
  startTransition,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { clearStoredAuth, getStoredAuth, setStoredAuth } from "./api";
import type { AuthResponse, Membership } from "../types/api";

type AuthContextValue = {
  auth: AuthResponse | null;
  login: (state: AuthResponse) => void;
  setAuthState: (state: AuthResponse) => void;
  logout: () => void;
  activeMembership: Membership | null;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthResponse | null>(() => getStoredAuth());

  const activeMembership =
    auth?.memberships.find((membership) => membership.organizationId === auth.activeOrganizationId) ?? null;

  const value = useMemo<AuthContextValue>(
    () => ({
      auth,
      activeMembership,
      login: (state) => {
        setStoredAuth(state);
        startTransition(() => setAuth(state));
      },
      setAuthState: (state) => {
        setStoredAuth(state);
        startTransition(() => setAuth(state));
      },
      logout: () => {
        clearStoredAuth();
        startTransition(() => setAuth(null));
      },
    }),
    [activeMembership, auth],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
