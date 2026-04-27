import { Outlet, Link, useLocation } from "react-router-dom";
import { Sparkles, Code, Heart, LogIn, LogOut, User } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import "../App.css";

export default function Layout() {
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <div className="app">
      <nav className="navbar">
        <Link to="/" className="logo">
          <div className="logoIconWrapper">
            <Sparkles size={16} />
          </div>
          Resume Matcher
          <span className="navTag">AI</span>
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {isAuthenticated ? (
            <>
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: "0.85rem",
                  color: "var(--text-secondary)",
                }}
              >
                <User size={14} />
                {user?.fullName}
              </span>
              <button
                onClick={logout}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 14px",
                  background: "var(--bg-input)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  color: "var(--text-secondary)",
                  fontSize: "0.8rem",
                  cursor: "pointer",
                  transition: "border-color 0.15s",
                }}
              >
                <LogOut size={13} />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 14px",
                  background: "var(--accent)",
                  borderRadius: 8,
                  color: "#fff",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                <LogIn size={13} />
                Sign In
              </Link>
            </>
          )}
        </div>
      </nav>

      <main className="main">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            style={{ display: "contents" }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="footer">
        <div className="footerContent">
          <div className="footerBrand">
            <Sparkles size={14} className="footerIcon" />
            <span>Resume Matcher</span>
          </div>
          <p className="footerText">
            AI-powered job search &amp; resume analysis
          </p>
          <div className="footerBottom">
            <span className="footerMade">
              Made with <Heart size={12} className="footerHeart" /> using React
              &amp; .NET
            </span>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="footerLink"
            >
              <Code size={14} />
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
