import { Sparkles } from "lucide-react";
import JobSearch from "./components/JobSearch";
import ResumeAnalyzer from "./components/ResumeAnalyzer";
import "./App.css";

function App() {
  return (
    <div className="app">
      <nav className="navbar">
        <div className="logo">
          <Sparkles size={20} className="logoIcon" />
          Resume Matcher
          <span className="navTag">AI</span>
        </div>
      </nav>

      <main className="main">
        <JobSearch />
        <ResumeAnalyzer />
      </main>

      <footer className="footer">
        Resume Matcher &mdash; AI-powered job search &amp; resume analysis
      </footer>
    </div>
  );
}

export default App;
