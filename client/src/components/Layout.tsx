import { Outlet, Link, useLocation } from "react-router-dom";
import { Sparkles, Code, Heart } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import "../App.css";

export default function Layout() {
  const location = useLocation();

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
