import { CheckCircle2, XCircle } from "lucide-react";
import { KEYWORD_DELAY_MS } from "./hooks/useScoreAnimation";
import styles from "./ResumeAnalyzer.module.css";

interface KeywordsListProps {
  matchingKeywords: string[];
  missingKeywords: string[];
  animPhase: number;
}

export default function KeywordsList({
  matchingKeywords,
  missingKeywords,
  animPhase,
}: KeywordsListProps) {
  return (
    <div
      className={`${styles.keywords} ${animPhase >= 2 ? styles.visible : styles.hidden}`}
    >
      <div className={styles.keywordCol}>
        <h4>
          <CheckCircle2 size={14} className={styles.successIcon} />
          Matching Keywords
        </h4>
        <div className={styles.keywordList}>
          {matchingKeywords.map((kw, i) => (
            <span
              key={i}
              className={`${styles.keywordMatch} ${animPhase >= 2 ? styles.fadeInUp : ""}`}
              style={{ animationDelay: `${i * KEYWORD_DELAY_MS}ms` }}
            >
              {kw}
            </span>
          ))}
          {matchingKeywords.length === 0 && (
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
          {missingKeywords.map((kw, i) => (
            <span
              key={i}
              className={`${styles.keywordMissing} ${animPhase >= 2 ? styles.fadeInUp : ""}`}
              style={{
                animationDelay: `${(matchingKeywords.length + i) * KEYWORD_DELAY_MS}ms`,
              }}
            >
              {kw}
            </span>
          ))}
          {missingKeywords.length === 0 && (
            <span className={styles.empty}>None</span>
          )}
        </div>
      </div>
    </div>
  );
}
