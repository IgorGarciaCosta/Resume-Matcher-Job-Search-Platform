import { RING_RADIUS, RING_CIRCUMFERENCE } from "./hooks/useScoreAnimation";
import styles from "./ResumeAnalyzer.module.css";

interface ScoreRingProps {
  displayScore: number;
  ringOffset: number;
  scoreColor: string;
}

export default function ScoreRing({
  displayScore,
  ringOffset,
  scoreColor,
}: ScoreRingProps) {
  return (
    <div className={styles.scoreCard}>
      <div className={styles.scoreRingWrapper}>
        <svg
          className={styles.scoreSvg}
          width="120"
          height="120"
          viewBox="0 0 100 100"
        >
          <circle
            cx="50"
            cy="50"
            r={RING_RADIUS}
            fill="none"
            stroke="var(--bg-hover)"
            strokeWidth="6"
          />
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
          <span className={styles.scoreNumber} style={{ color: scoreColor }}>
            {displayScore}
          </span>
          <span className={styles.scoreLabel}>Match</span>
        </div>
      </div>
    </div>
  );
}
