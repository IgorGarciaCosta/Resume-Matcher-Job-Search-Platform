import { Outlet, Link, useLocation } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export default function Layout() {
  const location = useLocation();

  return (
    <div className="app">
      <nav className="navbar">
        <Link to="/" className="logo">
          <Sparkles size={20} className="logoIcon" />
          Resume Matcher
          <span className="navTag">AI</span>
        </Link>
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
        Resume Matcher &mdash; AI-powered job search &amp; resume analysis
      </footer>
    </div>
  );
}
