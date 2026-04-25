import styles from "./AnalyzingCharacter.module.css";

export default function AnalyzingCharacter() {
  return (
    <svg
      className={styles.scene}
      viewBox="0 0 240 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Sparkles scattered around */}
      <g className={`${styles.sparkle} ${styles.sparkle1}`}>
        <path d="M42 38 L44.5 32 L47 38 L44.5 44 Z" fill="var(--accent)" />
      </g>
      <g className={`${styles.sparkle} ${styles.sparkle2}`}>
        <path d="M198 42 L200 37 L202 42 L200 47 Z" fill="var(--accent)" />
      </g>
      <g className={`${styles.sparkle} ${styles.sparkle3}`}>
        <path d="M30 130 L32 126 L34 130 L32 134 Z" fill="var(--accent)" />
      </g>
      <g className={`${styles.sparkle} ${styles.sparkle4}`}>
        <path d="M210 120 L212 116 L214 120 L212 124 Z" fill="var(--accent)" />
      </g>
      <g className={`${styles.sparkle} ${styles.sparkle5}`}>
        <path d="M80 18 L82 14 L84 18 L82 22 Z" fill="var(--accent)" />
      </g>

      {/* Thinking dots above head */}
      <circle
        className={`${styles.thinkDot} ${styles.think1}`}
        cx="94"
        cy="50"
        r="3"
        fill="var(--accent)"
      />
      <circle
        className={`${styles.thinkDot} ${styles.think2}`}
        cx="105"
        cy="44"
        r="3.5"
        fill="var(--accent)"
      />
      <circle
        className={`${styles.thinkDot} ${styles.think3}`}
        cx="116"
        cy="50"
        r="3"
        fill="var(--accent)"
      />

      {/* Character group */}
      <g className={styles.body}>
        {/* Shadow on ground */}
        <ellipse
          cx="105"
          cy="188"
          rx="35"
          ry="5"
          fill="var(--text-muted)"
          opacity="0.12"
        />

        {/* ── Desk ── */}
        <rect
          x="55"
          y="152"
          width="100"
          height="8"
          rx="4"
          fill="var(--text-muted)"
          opacity="0.2"
        />
        <line
          x1="68"
          y1="160"
          x2="65"
          y2="186"
          stroke="var(--text-muted)"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.15"
        />
        <line
          x1="142"
          y1="160"
          x2="145"
          y2="186"
          stroke="var(--text-muted)"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.15"
        />

        {/* ── Chair ── */}
        <rect
          x="80"
          y="126"
          width="44"
          height="32"
          rx="8"
          fill="var(--text-muted)"
          opacity="0.1"
        />

        {/* ── Legs (bent, sitting) ── */}
        <line
          x1="94"
          y1="154"
          x2="86"
          y2="168"
          stroke="var(--text-secondary)"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <line
          x1="112"
          y1="154"
          x2="120"
          y2="168"
          stroke="var(--text-secondary)"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <ellipse cx="84" cy="170" rx="6" ry="3.5" fill="var(--accent)" />
        <ellipse cx="122" cy="170" rx="6" ry="3.5" fill="var(--accent)" />

        {/* ── Torso ── */}
        <rect
          x="86"
          y="110"
          width="34"
          height="48"
          rx="12"
          fill="var(--accent)"
        />

        {/* ── Left arm on desk ── */}
        <line
          x1="86"
          y1="122"
          x2="68"
          y2="148"
          stroke="var(--text-secondary)"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <circle cx="68" cy="149" r="4" fill="var(--text-secondary)" />

        {/* ── Head ── */}
        <circle cx="103" cy="92" r="22" fill="var(--text-secondary)" />

        {/* Glasses */}
        <circle
          cx="95"
          cy="90"
          r="7"
          stroke="var(--accent)"
          strokeWidth="1.5"
          fill="none"
        />
        <circle
          cx="111"
          cy="90"
          r="7"
          stroke="var(--accent)"
          strokeWidth="1.5"
          fill="none"
        />
        <line
          x1="102"
          y1="90"
          x2="104"
          y2="90"
          stroke="var(--accent)"
          strokeWidth="1.2"
        />
        <line
          x1="88"
          y1="88"
          x2="84"
          y2="86"
          stroke="var(--accent)"
          strokeWidth="1"
          strokeLinecap="round"
        />
        <line
          x1="118"
          y1="88"
          x2="122"
          y2="86"
          stroke="var(--accent)"
          strokeWidth="1"
          strokeLinecap="round"
        />

        {/* Eyes */}
        <circle cx="95" cy="90" r="2" fill="var(--bg-card)" />
        <circle cx="111" cy="90" r="2" fill="var(--bg-card)" />

        {/* Mouth — concentrating */}
        <line
          x1="99"
          y1="100"
          x2="107"
          y2="100"
          stroke="var(--bg-card)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        {/* Hair */}
        <path
          d="M81 85 Q81 66 103 63 Q125 66 125 85"
          fill="var(--text-primary)"
          opacity="0.65"
        />
      </g>

      {/* ── Right arm + document (tilts independently) ── */}
      <g className={styles.document}>
        {/* Arm */}
        <line
          x1="120"
          y1="122"
          x2="140"
          y2="108"
          stroke="var(--text-secondary)"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <circle cx="140" cy="108" r="4" fill="var(--text-secondary)" />

        {/* Glow behind document */}
        <ellipse
          className={styles.glow}
          cx="160"
          cy="112"
          rx="28"
          ry="34"
          fill="var(--accent)"
          opacity="0.1"
        />

        {/* Document */}
        <rect
          x="140"
          y="78"
          width="42"
          height="56"
          rx="4"
          fill="var(--bg-card)"
          stroke="var(--accent)"
          strokeWidth="1.5"
        />

        {/* Doc header */}
        <line
          x1="147"
          y1="88"
          x2="175"
          y2="88"
          stroke="var(--accent)"
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0.55"
        />

        {/* Doc text lines */}
        <line
          x1="147"
          y1="96"
          x2="172"
          y2="96"
          stroke="var(--text-muted)"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.35"
        />
        <line
          x1="147"
          y1="103"
          x2="168"
          y2="103"
          stroke="var(--text-muted)"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.35"
        />
        <line
          x1="147"
          y1="110"
          x2="174"
          y2="110"
          stroke="var(--text-muted)"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.35"
        />
        <line
          x1="147"
          y1="117"
          x2="164"
          y2="117"
          stroke="var(--text-muted)"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.35"
        />
        <line
          x1="147"
          y1="124"
          x2="170"
          y2="124"
          stroke="var(--text-muted)"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.35"
        />

        {/* AI scan beam */}
        <rect
          className={styles.scanBeam}
          x="142"
          y="84"
          width="38"
          height="3"
          rx="1.5"
          fill="var(--accent)"
          opacity="0.5"
        />
      </g>
    </svg>
  );
}
