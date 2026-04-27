import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

/**
 * Landing page after an OAuth redirect. Waits for AuthContext to resolve the
 * session cookie, then redirects to / (success) or /login (failure).
 */
export default function OAuthCallbackPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      navigate(user ? "/" : "/login?error=external_login_failed");
    }
  }, [loading, user, navigate]);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "40vh",
      }}
    >
      <p style={{ color: "var(--text-secondary)" }}>Completing sign in…</p>
    </div>
  );
}
