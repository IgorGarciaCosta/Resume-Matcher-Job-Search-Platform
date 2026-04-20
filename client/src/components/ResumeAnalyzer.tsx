import { useState, useRef } from "react";
import {
  FileText,
  Upload,
  Link2,
  Loader2,
  CheckCircle2,
  XCircle,
  Lightbulb,
  AlertCircle,
} from "lucide-react";
import { analyzeResume, type MatchResult } from "../services/api";
import styles from "./ResumeAnalyzer.module.css";

export default function ResumeAnalyzer() {
  const [file, setFile] = useState<File | null>(null);
  const [jobUrl, setJobUrl] = useState("");
  const [jobText, setJobText] = useState("");
  const [inputMode, setInputMode] = useState<"url" | "text">("url");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MatchResult | null>(null);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Please upload a resume PDF");
      return;
    }
    if (!jobUrl && !jobText) {
      setError("Provide a job URL or paste the job description");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await analyzeResume({
        resumeFile: file,
        jobUrl: inputMode === "url" ? jobUrl : undefined,
        jobText: inputMode === "text" ? jobText : undefined,
      });
      setResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  const scoreColor =
    result && result.score >= 75
      ? "var(--success)"
      : result && result.score >= 50
        ? "var(--warning)"
        : "var(--danger)";

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <FileText size={22} className={styles.headerIcon} />
        <h2>Resume Analyzer</h2>
      </div>
      <p className={styles.subtitle}>
        Match your resume against a job description using AI
      </p>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div
          className={styles.dropzone}
          onClick={() => fileRef.current?.click()}
        >
          <input
            ref={fileRef}
            type="file"
            accept=".pdf"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            hidden
          />
          <Upload size={24} className={styles.uploadIcon} />
          {file ? (
            <span className={styles.fileName}>{file.name}</span>
          ) : (
            <span>Click to upload resume (PDF)</span>
          )}
        </div>

        <div className={styles.modeSwitch}>
          <button
            type="button"
            className={`${styles.modeBtn} ${inputMode === "url" ? styles.modeActive : ""}`}
            onClick={() => setInputMode("url")}
          >
            <Link2 size={14} /> Job URL
          </button>
          <button
            type="button"
            className={`${styles.modeBtn} ${inputMode === "text" ? styles.modeActive : ""}`}
            onClick={() => setInputMode("text")}
          >
            <FileText size={14} /> Paste Text
          </button>
        </div>

        {inputMode === "url" ? (
          <div className={styles.inputGroup}>
            <Link2 size={16} className={styles.inputIcon} />
            <input
              type="url"
              placeholder="https://example.com/job-posting"
              value={jobUrl}
              onChange={(e) => setJobUrl(e.target.value)}
              className={styles.input}
            />
          </div>
        ) : (
          <textarea
            placeholder="Paste the job description here..."
            value={jobText}
            onChange={(e) => setJobText(e.target.value)}
            className={styles.textarea}
            rows={6}
          />
        )}

        <button type="submit" className={styles.button} disabled={loading}>
          {loading ? (
            <Loader2 size={16} className={styles.spin} />
          ) : (
            <FileText size={16} />
          )}
          Analyze Match
        </button>
      </form>

      {error && (
        <div className={styles.error}>
          <AlertCircle size={14} /> {error}
        </div>
      )}

      {loading && (
        <div className={styles.loadingState}>
          <Loader2 size={28} className={styles.spin} />
          <span>Analyzing your resume with AI...</span>
        </div>
      )}

      {result && (
        <div className={styles.result}>
          <div className={styles.scoreCard}>
            <div
              className={styles.scoreRing}
              style={{ borderColor: scoreColor }}
            >
              <span
                className={styles.scoreNumber}
                style={{ color: scoreColor }}
              >
                {result.score}
              </span>
              <span className={styles.scoreLabel}>Match</span>
            </div>
          </div>

          <div className={styles.keywords}>
            <div className={styles.keywordCol}>
              <h4>
                <CheckCircle2 size={14} className={styles.successIcon} />
                Matching Keywords
              </h4>
              <div className={styles.keywordList}>
                {result.matchingKeywords.map((kw, i) => (
                  <span key={i} className={styles.keywordMatch}>
                    {kw}
                  </span>
                ))}
                {result.matchingKeywords.length === 0 && (
                  <span className={styles.empty}>None found</span>
                )}
              </div>
            </div>
            <div className={styles.keywordCol}>
              <h4>
                <XCircle size={14} className={styles.dangerIcon} />
                Missing Keywords
              </h4>
              <div className={styles.keywordList}>
                {result.missingKeywords.map((kw, i) => (
                  <span key={i} className={styles.keywordMissing}>
                    {kw}
                  </span>
                ))}
                {result.missingKeywords.length === 0 && (
                  <span className={styles.empty}>None</span>
                )}
              </div>
            </div>
          </div>

          {result.improvementSuggestions && (
            <div className={styles.suggestions}>
              <h4>
                <Lightbulb size={14} className={styles.warningIcon} />
                Improvement Suggestions
              </h4>
              <p>{result.improvementSuggestions}</p>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
