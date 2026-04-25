import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, FileSearch } from "lucide-react";
import styles from "./HomePage.module.css";

const cards = [
  {
    to: "/search",
    icon: Search,
    title: "Job Search",
    description:
      "Search thousands of jobs across multiple platforms and find the perfect opportunity for you.",
    accent: "var(--accent)",
    accentMuted: "var(--accent-muted)",
  },
  {
    to: "/analyzer",
    icon: FileSearch,
    title: "Resume Analyzer",
    description:
      "Upload your resume and a job description to get an AI-powered compatibility score and tips.",
    accent: "var(--success)",
    accentMuted: "var(--success-muted)",
  },
];

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.6,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

export default function HomePage() {
  return (
    <div className={styles.home}>
      {/* Welcome section */}
      <motion.div
        className={styles.welcome}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <h1 className={styles.title}>
          Welcome to <span className={styles.highlight}>Resume Matcher</span>
        </h1>
        <p className={styles.subtitle}>
          Your AI-powered companion for job searching and resume optimization.
        </p>
      </motion.div>

      {/* Mode cards */}
      <motion.div
        className={styles.cards}
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {cards.map((card) => (
          <motion.div key={card.to} variants={cardVariants}>
            <Link to={card.to} className={styles.card}>
              <div
                className={styles.iconWrapper}
                style={{ background: card.accentMuted, color: card.accent }}
              >
                <card.icon size={28} />
              </div>
              <h2 className={styles.cardTitle}>{card.title}</h2>
              <p className={styles.cardDescription}>{card.description}</p>
              <span className={styles.cardCta} style={{ color: card.accent }}>
                Get started &rarr;
              </span>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
