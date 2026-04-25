import styles from "./ResumeAnalyzer.module.css";

export default function AiErrorCard() {
  return (
    <div className={styles.aiError}>
      <svg
        className={styles.aiErrorIllustration}
        width="80"
        height="80"
        viewBox="0 0 80 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
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
        <path
          d="M30 52 Q40 46 50 52"
          stroke="var(--text-muted)"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
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
  );
}
