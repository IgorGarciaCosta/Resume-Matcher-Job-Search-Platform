import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { UserPlus } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import styles from "./AuthPage.module.css";

/** Account creation page with name/email/password form and OAuth buttons. Redirects to / on success. */
export default function SignupPage() {
  const { register, loginWithGoogle, loginWithLinkedIn } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(email, password, fullName);
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className={styles.authPage}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className={styles.card}>
        <h1 className={styles.title}>
          <UserPlus
            size={22}
            style={{ verticalAlign: "middle", marginRight: 8 }}
          />
          Create Account
        </h1>
        <p className={styles.subtitle}>Get started with Resume Matcher.</p>

        {error && <div className={styles.error}>{error}</div>}

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="fullName">
              Full Name
            </label>
            <input
              id="fullName"
              type="text"
              className={styles.input}
              placeholder="John Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              minLength={2}
              autoComplete="name"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              className={styles.input}
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              className={styles.input}
              placeholder="Min 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
            />
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? "Creating account…" : "Create Account"}
          </button>
        </form>

        <div className={styles.divider}>or continue with</div>

        <div className={styles.oauthButtons}>
          <button
            type="button"
            className={styles.oauthBtn}
            onClick={loginWithGoogle}
          >
            Google
          </button>
          <button
            type="button"
            className={styles.oauthBtn}
            onClick={loginWithLinkedIn}
          >
            LinkedIn
          </button>
        </div>

        <p className={styles.footerText}>
          Already have an account?{" "}
          <Link to="/login" className={styles.footerLink}>
            Sign In
          </Link>
        </p>
      </div>
    </motion.div>
  );
}
