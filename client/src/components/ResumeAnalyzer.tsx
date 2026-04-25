import { useState, useRef, useEffect, useCallback } from "react";
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
import {
  analyzeResume,
  AiServiceError,
  type MatchResult,
} from "../services/api";
import styles from "./ResumeAnalyzer.module.css";

const RING_RADIUS = 44;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;
const SCORE_ANIM_DURATION = 2000;
const KEYWORD_DELAY_MS = 60;

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

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

  // Animation state
  const [animPhase, setAnimPhase] = useState<0 | 1 | 2 | 3>(0);
  const [displayScore, setDisplayScore] = useState(0);
  const [ringOffset, setRingOffset] = useState(RING_CIRCUMFERENCE);
  const animFrameRef = useRef<number>(0);

  const resetAnim = useCallback(() => {
    setAnimPhase(0);
    setDisplayScore(0);
    setRingOffset(RING_CIRCUMFERENCE);
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
  }, []);

  // Start score animation when result arrives
  useEffect(() => {
    if (!result) return;

    resetAnim();

    // Small delay to allow CSS transition setup
    const kickoff = requestAnimationFrame(() => {
      setAnimPhase(1);
      const targetOffset = RING_CIRCUMFERENCE * (1 - result.score / 100);

      // Trigger ring CSS transition
      requestAnimationFrame(() => setRingOffset(targetOffset));

      // Animate number counter
      const start = performance.now();
      const step = (now: number) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / SCORE_ANIM_DURATION, 1);
        const eased = easeOutCubic(progress);
        setDisplayScore(Math.round(eased * result.score));
        if (progress < 1) {
          animFrameRef.current = requestAnimationFrame(step);
        }
      };
      animFrameRef.current = requestAnimationFrame(step);
    });

    // Phase 2 (keywords) after score animation completes
    const t1 = setTimeout(() => setAnimPhase(2), SCORE_ANIM_DURATION + 100);

    // Phase 3 (suggestions) after keywords have staggered in
    const totalKeywords =
      result.matchingKeywords.length + result.missingKeywords.length;
    const keywordsTime = Math.max(totalKeywords * KEYWORD_DELAY_MS, 300) + 400;
    const t2 = setTimeout(
      () => setAnimPhase(3),
      SCORE_ANIM_DURATION + 100 + keywordsTime,
    );

    return () => {
      cancelAnimationFrame(kickoff);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [result, resetAnim]);

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
      {error && isAiError && (
        <div className={styles.aiError}>
          <svg
            className={styles.aiErrorIllustration}
            width="80"
            height="80"
            viewBox="0 0 80 80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Robot head */}
            <rect
              x="18"
              y="24"
              width="44"
              height="36"
              rx="8"
              fill="var(--bg-input)"
              stroke="var(--text-muted)"
              strokeWidth="2"
            />
            {/* Antenna */}
            <line
              x1="40"
              y1="24"
              x2="40"
              y2="14"
              stroke="var(--text-muted)"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <circle cx="40" cy="12" r="3" fill="var(--warning)" />
            {/* Left eye — X */}
            <line
              x1="28"
              y1="36"
              x2="34"
              y2="42"
              stroke="var(--danger)"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <line
              x1="34"
              y1="36"
              x2="28"
              y2="42"
              stroke="var(--danger)"
              strokeWidth="2"
              strokeLinecap="round"
            />
            {/* Right eye — X */}
            <line
              x1="46"
              y1="36"
              x2="52"
              y2="42"
              stroke="var(--danger)"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <line
              x1="52"
              y1="36"
              x2="46"
              y2="42"
              stroke="var(--danger)"
              strokeWidth="2"
              strokeLinecap="round"
            />
            {/* Sad mouth */}
            <path
              d="M30 52 Q40 46 50 52"
              stroke="var(--text-muted)"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
            />
            {/* Ears */}
            <rect
              x="12"
              y="34"
              width="6"
              height="12"
              rx="2"
              fill="var(--bg-input)"
              stroke="var(--text-muted)"
              strokeWidth="1.5"
            />
            <rect
              x="62"
              y="34"
              width="6"
              height="12"
              rx="2"
              fill="var(--bg-input)"
              stroke="var(--text-muted)"
              strokeWidth="1.5"
            />
            {/* Bolt / lightning */}
            <path
              d="M64 8 L58 18 L62 18 L56 28"
              stroke="var(--warning)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
          <p className={styles.aiErrorMessage}>
            Oops! Our AI service is temporarily unavailable.
          </p>
          <p className={styles.aiErrorHint}>
            Please try again in a few moments. The analysis engine will be back
            shortly.
          </p>
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
          {/* Animated SVG score ring */}
          <div className={styles.scoreCard}>
            <div className={styles.scoreRingWrapper}>
              <svg
                className={styles.scoreSvg}
                width="120"
                height="120"
                viewBox="0 0 100 100"
              >
                {/* Track (background circle) */}
                <circle
                  cx="50"
                  cy="50"
                  r={RING_RADIUS}
                  fill="none"
                  stroke="var(--bg-hover)"
                  strokeWidth="6"
                />
                {/* Progress arc */}
                <circle
                  cx="50"
                  cy="50"
                  r={RING_RADIUS}
                  fill="none"
                  stroke={scoreColor}
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={RING_CIRCUMFERENCE}
                  strokeDashoffset={ringOffset}
                  className={styles.scoreArc}
                  transform="rotate(-90 50 50)"
                />
              </svg>
              <div className={styles.scoreOverlay}>
                <span
                  className={styles.scoreNumber}
                  style={{ color: scoreColor }}
                >
                  {displayScore}
                </span>
                <span className={styles.scoreLabel}>Match</span>
              </div>
            </div>
          </div>

          {/* Keywords — staggered fade-in */}
          <div
            className={`${styles.keywords} ${animPhase >= 2 ? styles.visible : styles.hidden}`}
          >
            <div className={styles.keywordCol}>
              <h4>
                <CheckCircle2 size={14} className={styles.successIcon} />
                Matching Keywords
              </h4>
              <div className={styles.keywordList}>
                {result.matchingKeywords.map((kw, i) => (
                  <span
                    key={i}
                    className={`${styles.keywordMatch} ${animPhase >= 2 ? styles.fadeInUp : ""}`}
                    style={{ animationDelay: `${i * KEYWORD_DELAY_MS}ms` }}
                  >
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
                  <span
                    key={i}
                    className={`${styles.keywordMissing} ${animPhase >= 2 ? styles.fadeInUp : ""}`}
                    style={{
                      animationDelay: `${(result.matchingKeywords.length + i) * KEYWORD_DELAY_MS}ms`,
                    }}
                  >
                    {kw}
                  </span>
                ))}
                {result.missingKeywords.length === 0 && (
                  <span className={styles.empty}>None</span>
                )}
              </div>
            </div>
          </div>

          {/* Suggestions — fade in last */}
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
