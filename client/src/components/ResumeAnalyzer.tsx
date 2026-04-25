import { useState, useRef } from "react";
import {
  FileText,
  Upload,
  Link2,
  Loader2,
  Lightbulb,
  AlertCircle,
} from "lucide-react";
import {
  analyzeResume,
  AiServiceError,
  type MatchResult,
} from "../services/api";
import { useScoreAnimation } from "./hooks/useScoreAnimation";
import ScoreRing from "./ScoreRing";
import AiErrorCard from "./AiErrorCard";
import KeywordsList from "./KeywordsList";
import LoadingAnimation from "./LoadingAnimation";
import AnalyzingCharacter from "./AnalyzingCharacter";
import styles from "./ResumeAnalyzer.module.css";

export default function ResumeAnalyzer() {
  const [file, setFile] = useState<File | null>(null);
  const [jobUrl, setJobUrl] = useState("");
  const [jobText, setJobText] = useState("");
  const [inputMode, setInputMode] = useState<"url" | "text">("url");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MatchResult | null>(null);
  const [error, setError] = useState("");
  const [isAiError, setIsAiError] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const { animPhase, displayScore, ringOffset, resetAnim } = useScoreAnimation(
    result?.score ?? null,
    result?.matchingKeywords.length ?? 0,
    result?.missingKeywords.length ?? 0,
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Please upload a resume PDF");
      setIsAiError(false);
      return;
    }
    if (!jobUrl && !jobText) {
      setError("Provide a job URL or paste the job description");
      setIsAiError(false);
      return;
    }

    setLoading(true);
    setError("");
    setIsAiError(false);
    setResult(null);
    resetAnim();
    try {
      const res = await analyzeResume({
        resumeFile: file,
        jobUrl: inputMode === "url" ? jobUrl : undefined,
        jobText: inputMode === "text" ? jobText : undefined,
      });
      setResult(res);
    } catch (err) {
      if (err instanceof AiServiceError) {
        setIsAiError(true);
        setError(err.message);
      } else {
        setIsAiError(false);
        setError(err instanceof Error ? err.message : "Analysis failed");
      }
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

      {/* Validation errors — red box */}
      {error && !isAiError && (
        <div className={styles.error}>
          <AlertCircle size={14} /> {error}
        </div>
      )}

      {/* AI/LLM errors — friendly illustrated card */}
      {error && isAiError && <AiErrorCard />}

      {loading && (
        <LoadingAnimation message="Analyzing your resume with AI">
          <AnalyzingCharacter />
        </LoadingAnimation>
      )}

      {result && (
        <div className={styles.result}>
          <ScoreRing
            displayScore={displayScore}
            ringOffset={ringOffset}
            scoreColor={scoreColor}
          />

          <KeywordsList
            matchingKeywords={result.matchingKeywords}
            missingKeywords={result.missingKeywords}
            animPhase={animPhase}
          />

          {result.improvementSuggestions && (
            <div
              className={`${styles.suggestions} ${animPhase >= 3 ? styles.fadeIn : styles.hidden}`}
            >
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
