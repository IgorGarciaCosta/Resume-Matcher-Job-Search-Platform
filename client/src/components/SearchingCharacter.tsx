import styles from "./SearchingCharacter.module.css";

export default function SearchingCharacter() {
  return (
    <svg
      className={styles.scene}
      viewBox="0 0 240 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Floating job cards */}
      <g className={`${styles.card} ${styles.card1}`}>
        <rect
          x="16"
          y="28"
          width="48"
          height="60"
          rx="6"
          fill="var(--accent-muted)"
          stroke="var(--accent)"
          strokeWidth="1.2"
        />
        <line
          x1="24"
          y1="42"
          x2="56"
          y2="42"
          stroke="var(--accent)"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.5"
        />
        <line
          x1="24"
          y1="50"
          x2="50"
          y2="50"
          stroke="var(--accent)"
          strokeWidth="1.4"
          strokeLinecap="round"
          opacity="0.3"
        />
        <line
          x1="24"
          y1="57"
          x2="53"
          y2="57"
          stroke="var(--accent)"
          strokeWidth="1.4"
          strokeLinecap="round"
          opacity="0.3"
        />
        <line
          x1="24"
          y1="64"
          x2="44"
          y2="64"
          stroke="var(--accent)"
          strokeWidth="1.4"
          strokeLinecap="round"
          opacity="0.3"
        />
        <rect
          className={`${styles.scanLine} ${styles.scanLine1}`}
          x="22"
          y="40"
          width="34"
          height="2.5"
          rx="1.2"
          fill="var(--accent)"
          opacity="0.5"
        />
      </g>

      <g className={`${styles.card} ${styles.card2}`}>
        <rect
          x="178"
          y="18"
          width="48"
          height="60"
          rx="6"
          fill="var(--accent-muted)"
          stroke="var(--accent)"
          strokeWidth="1.2"
        />
        <line
          x1="186"
          y1="32"
          x2="218"
          y2="32"
          stroke="var(--accent)"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.5"
        />
        <line
          x1="186"
          y1="40"
          x2="212"
          y2="40"
          stroke="var(--accent)"
          strokeWidth="1.4"
          strokeLinecap="round"
          opacity="0.3"
        />
        <line
          x1="186"
          y1="47"
          x2="215"
          y2="47"
          stroke="var(--accent)"
          strokeWidth="1.4"
          strokeLinecap="round"
          opacity="0.3"
        />
        <line
          x1="186"
          y1="54"
          x2="205"
          y2="54"
          stroke="var(--accent)"
          strokeWidth="1.4"
          strokeLinecap="round"
          opacity="0.3"
        />
        <rect
          className={`${styles.scanLine} ${styles.scanLine2}`}
          x="184"
          y="30"
          width="34"
          height="2.5"
          rx="1.2"
          fill="var(--accent)"
          opacity="0.5"
        />
      </g>

      <g className={`${styles.card} ${styles.card3}`}>
        <rect
          x="6"
          y="115"
          width="42"
          height="52"
          rx="6"
          fill="var(--accent-muted)"
          stroke="var(--accent)"
          strokeWidth="1.2"
        />
        <line
          x1="14"
          y1="128"
          x2="40"
          y2="128"
          stroke="var(--accent)"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.5"
        />
        <line
          x1="14"
          y1="135"
          x2="36"
          y2="135"
          stroke="var(--accent)"
          strokeWidth="1.4"
          strokeLinecap="round"
          opacity="0.3"
        />
        <line
          x1="14"
          y1="142"
          x2="38"
          y2="142"
          stroke="var(--accent)"
          strokeWidth="1.4"
          strokeLinecap="round"
          opacity="0.3"
        />
        <rect
          className={`${styles.scanLine} ${styles.scanLine3}`}
          x="12"
          y="126"
          width="30"
          height="2.5"
          rx="1.2"
          fill="var(--accent)"
          opacity="0.5"
        />
      </g>

      {/* Decorative dots */}
      <circle
        className={`${styles.dot} ${styles.dot1}`}
        cx="80"
        cy="20"
        r="3"
        fill="var(--accent)"
        opacity="0.4"
      />
      <circle
        className={`${styles.dot} ${styles.dot2}`}
        cx="168"
        cy="90"
        r="2.5"
        fill="var(--accent)"
        opacity="0.35"
      />
      <circle
        className={`${styles.dot} ${styles.dot3}`}
        cx="210"
        cy="120"
        r="3"
        fill="var(--accent)"
        opacity="0.4"
      />
      <circle
        className={`${styles.dot} ${styles.dot4}`}
        cx="60"
        cy="100"
        r="2.5"
        fill="var(--accent)"
        opacity="0.35"
      />

      {/* Character */}
      <g className={styles.body}>
        {/* Shadow */}
        <ellipse
          cx="120"
          cy="188"
          rx="30"
          ry="5"
          fill="var(--text-muted)"
          opacity="0.12"
        />

        {/* Legs */}
        <line
          x1="112"
          y1="152"
          x2="108"
          y2="176"
          stroke="var(--text-secondary)"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <line
          x1="128"
          y1="152"
          x2="132"
          y2="176"
          stroke="var(--text-secondary)"
          strokeWidth="4"
          strokeLinecap="round"
        />

        {/* Shoes */}
        <ellipse cx="106" cy="178" rx="7" ry="3.5" fill="var(--accent)" />
        <ellipse cx="134" cy="178" rx="7" ry="3.5" fill="var(--accent)" />

        {/* Torso */}
        <rect
          x="104"
          y="112"
          width="34"
          height="44"
          rx="12"
          fill="var(--accent)"
        />

        {/* Left arm (down) */}
        <line
          x1="104"
          y1="122"
          x2="88"
          y2="144"
          stroke="var(--text-secondary)"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <circle cx="88" cy="145" r="4" fill="var(--text-secondary)" />

        {/* Head */}
        <circle cx="121" cy="96" r="22" fill="var(--text-secondary)" />

        {/* Eyes */}
        <circle cx="114" cy="93" r="2.5" fill="var(--bg-card)" />
        <circle cx="128" cy="93" r="2.5" fill="var(--bg-card)" />

        {/* Smile */}
        <path
          d="M113 102 Q121 107 129 102"
          stroke="var(--bg-card)"
          strokeWidth="1.8"
          fill="none"
          strokeLinecap="round"
        />

        {/* Hair */}
        <path
          d="M99 90 Q99 74 121 71 Q143 74 143 90"
          fill="var(--text-primary)"
          opacity="0.65"
        />
      </g>

      {/* Right arm + magnifier (animated separately) */}
      <g className={styles.magnifier}>
        {/* Arm */}
        <line
          x1="138"
          y1="122"
          x2="156"
          y2="104"
          stroke="var(--text-secondary)"
          strokeWidth="4"
          strokeLinecap="round"
        />

        {/* Handle */}
        <line
          x1="156"
          y1="104"
          x2="164"
          y2="94"
          stroke="var(--text-muted)"
          strokeWidth="4.5"
          strokeLinecap="round"
        />

        {/* Glass ring */}
        <circle
          cx="172"
          cy="84"
          r="16"
          stroke="var(--accent)"
          strokeWidth="3"
          fill="none"
        />
        <circle
          cx="172"
          cy="84"
          r="13"
          fill="var(--accent-muted)"
          opacity="0.25"
        />

        {/* Shine */}
        <path
          className={styles.glassShine}
          d="M164 76 Q168 73 172 76"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
          opacity="0.35"
        />
      </g>
    </svg>
  );
}
