import { useState } from "react";
import { Link, useLocation, useOutlet } from "react-router-dom";
import {
  Sparkles,
  Code,
  Heart,
  LogIn,
  LogOut,
  User,
  Search,
  FileText,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import "../App.css";

/**
 * Captures the outlet content at mount time so it stays frozen
 * during AnimatePresence exit animations instead of switching
 * to the new route's content immediately.
 */
function FrozenOutlet() {
  const outlet = useOutlet();
  const [frozen] = useState(outlet);
  return frozen;
}

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

        <div className="navActions">
          <div className="navLinks">
            <Link
              to="/search"
              className={`navLink ${location.pathname === "/search" ? "navLinkActive" : ""}`}
            >
              <Search size={14} />
              Job Search
            </Link>
            <Link
              to="/analyzer"
              className={`navLink ${location.pathname === "/analyzer" ? "navLinkActive" : ""}`}
            >
              <FileText size={14} />
              Analyzer
            </Link>
          </div>

          {isAuthenticated ? (
            <>
              <span className="navUser">
                <User size={14} />
                {user?.fullName}
              </span>
              <button onClick={logout} className="navBtnOutline">
                <LogOut size={13} />
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="navBtnPrimary">
              <LogIn size={13} />
              Sign In
            </Link>
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
          >
            <FrozenOutlet />
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="footer">
        <div className="footerContent">
          <div className="footerNav">
            <Link to="/search" className="footerNavLink">
              Job Search
            </Link>
            <Link to="/analyzer" className="footerNavLink">
              Analyzer
            </Link>
            {isAuthenticated && (
              <Link to="/saved-analyses" className="footerNavLink">
                Saved
              </Link>
            )}
          </div>
          <div className="footerBrand">
            <Sparkles size={14} className="footerIcon" />
            <span>Resume Matcher</span>
          </div>
          <div className="footerBottom">
            <span className="footerMade">
              Made with <Heart size={12} className="footerHeart" /> using React
              &amp; .NET
            </span>
            <a
              href="https://github.com/IgorGarciaCosta/Resume-Matcher-Job-Search-Platform"
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
