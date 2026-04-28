import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  BookmarkCheck,
  FileText,
  Trash2,
  ChevronDown,
  ChevronUp,
  Loader2,
  AlertCircle,
  Lightbulb,
  CheckCircle,
  XCircle,
  Inbox,
} from "lucide-react";
import {
  getSavedAnalyses,
  deleteSavedAnalysis,
  type SavedAnalysis,
} from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import styles from "./SavedAnalysesPage.module.css";

export default function SavedAnalysesPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [analyses, setAnalyses] = useState<SavedAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    fetchAnalyses();
  }, [isAuthenticated, authLoading]);

  const fetchAnalyses = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getSavedAnalyses();
      setAnalyses(data);
    } catch {
      setError("Failed to load saved analyses");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteSavedAnalysis(id);
      setAnalyses((prev) => prev.filter((a) => a.id !== id));
      setConfirmDeleteId(null);
      if (expandedId === id) setExpandedId(null);
    } catch {
      setError("Failed to delete analysis");
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
    setConfirmDeleteId(null);
  };

  const scoreColor = (score: number) =>
    score >= 75
      ? "var(--success)"
      : score >= 50
        ? "var(--warning)"
        : "var(--danger)";

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  if (!authLoading && !isAuthenticated) {
    return (
      <section className={styles.section}>
        <div className={styles.emptyState}>
          <BookmarkCheck size={40} className={styles.emptyIcon} />
          <p>
            <Link to="/login">Log in</Link> to view your saved analyses.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.section}>
      <div className={styles.headerRow}>
        <div className={styles.header}>
          <BookmarkCheck size={22} className={styles.headerIcon} />
          <h2>Saved Analyses</h2>
        </div>
        <Link to="/analyzer" className={styles.backLink}>
          <FileText size={16} />
          Analyzer
        </Link>
      </div>
      <p className={styles.subtitle}>
        Review your previous resume-job match analyses
      </p>

      {error && (
        <div className={styles.error}>
          <AlertCircle size={14} /> {error}
        </div>
      )}

      {loading && (
        <div className={styles.loadingState}>
          <Loader2 size={24} className={styles.spin} />
          <span>Loading saved analyses...</span>
        </div>
      )}

      {!loading && analyses.length === 0 && (
        <div className={styles.emptyState}>
          <Inbox size={40} className={styles.emptyIcon} />
          <p>No saved analyses yet.</p>
          <p>
            Run an analysis in the{" "}
            <Link to="/analyzer">Resume Analyzer</Link> and save the results!
          </p>
        </div>
      )}

      {!loading && analyses.length > 0 && (
        <div className={styles.cardList}>
          {analyses.map((a) => (
            <div key={a.id}>
              <div
                className={`${styles.card} ${expandedId === a.id ? styles.cardExpanded : ""}`}
                onClick={() => toggleExpand(a.id)}
              >
                <div
                  className={styles.miniScore}
                  style={{
                    color: scoreColor(a.score),
                    borderColor: scoreColor(a.score),
                  }}
                >
                  {a.score}
                </div>

                <div className={styles.cardInfo}>
                  <div className={styles.cardTitle}>{a.resumeFileName}</div>
                  <div className={styles.cardSource}>
                    {a.jobSource.startsWith("http")
                      ? a.jobSource
                      : a.jobSource.slice(0, 80) +
                        (a.jobSource.length > 80 ? "..." : "")}
                  </div>
                  <div className={styles.cardDate}>
                    {formatDate(a.analyzedAt)}
                  </div>
                </div>

                <div className={styles.cardActions}>
                  <button
                    className={`${styles.iconButton} ${styles.deleteButton}`}
                    title="Delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      setConfirmDeleteId(
                        confirmDeleteId === a.id ? null : a.id,
                      );
                    }}
                  >
                    <Trash2 size={15} />
                  </button>
                  <button className={styles.iconButton} title="Expand">
                    {expandedId === a.id ? (
                      <ChevronUp size={15} />
                    ) : (
                      <ChevronDown size={15} />
                    )}
                  </button>
                </div>
              </div>

              {confirmDeleteId === a.id && (
                <div className={styles.confirmOverlay}>
                  <span className={styles.confirmText}>Delete this analysis?</span>
                  <button
                    className={`${styles.confirmBtn} ${styles.confirmYes}`}
                    onClick={() => handleDelete(a.id)}
                  >
                    Delete
                  </button>
                  <button
                    className={`${styles.confirmBtn} ${styles.confirmNo}`}
                    onClick={() => setConfirmDeleteId(null)}
                  >
                    Cancel
                  </button>
                </div>
              )}

              {expandedId === a.id && (
                <div className={styles.details}>
                  <div className={styles.keywords}>
                    <div className={styles.keywordCol}>
                      <h4>
                        <CheckCircle size={14} className={styles.successIcon} />
                        Matching Keywords
                      </h4>
                      <div className={styles.keywordList}>
                        {a.matchingKeywords.length > 0 ? (
                          a.matchingKeywords.map((kw) => (
                            <span key={kw} className={styles.keywordMatch}>
                              {kw}
                            </span>
                          ))
                        ) : (
                          <span className={styles.empty}>None</span>
                        )}
                      </div>
                    </div>
                    <div className={styles.keywordCol}>
                      <h4>
                        <XCircle size={14} className={styles.dangerIcon} />
                        Missing Keywords
                      </h4>
                      <div className={styles.keywordList}>
                        {a.missingKeywords.length > 0 ? (
                          a.missingKeywords.map((kw) => (
                            <span key={kw} className={styles.keywordMissing}>
                              {kw}
                            </span>
                          ))
                        ) : (
                          <span className={styles.empty}>None</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {a.improvementSuggestions && (
                    <div className={styles.suggestions}>
                      <h4>
                        <Lightbulb size={14} className={styles.warningIcon} />
                        Improvement Suggestions
                      </h4>
                      <p>{a.improvementSuggestions}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
