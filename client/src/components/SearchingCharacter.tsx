import styles from "./SearchingCharacter.module.css";

export default function SearchingCharacter() {
  return (
    <svg
      className={styles.scene}
      viewBox="0 0 280 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <filter id="searchGlow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Slow rotating orbital rings */}
      <circle cx="140" cy="108" r="85" stroke="var(--accent)" strokeWidth="0.5" opacity="0.07" strokeDasharray="4 8">
        <animateTransform attributeName="transform" type="rotate" values="0 140 108;360 140 108" dur="30s" repeatCount="indefinite" />
      </circle>
      <circle cx="140" cy="108" r="62" stroke="var(--accent)" strokeWidth="0.5" opacity="0.05" strokeDasharray="3 6">
        <animateTransform attributeName="transform" type="rotate" values="360 140 108;0 140 108" dur="24s" repeatCount="indefinite" />
      </circle>

      {/* Card 1 — top left, drifting on bezier path */}
      <g opacity="0.85">
        <animateMotion path="M0,0 C5,-12 14,-12 16,0 C18,12 5,12 0,0" dur="4.2s" repeatCount="indefinite" />
        <rect x="22" y="30" width="52" height="64" rx="7" fill="var(--accent-muted)" stroke="var(--accent)" strokeWidth="1" />
        <line x1="30" y1="44" x2="66" y2="44" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" opacity="0.45" />
        <line x1="30" y1="53" x2="58" y2="53" stroke="var(--accent)" strokeWidth="1.3" strokeLinecap="round" opacity="0.2" />
        <line x1="30" y1="60" x2="63" y2="60" stroke="var(--accent)" strokeWidth="1.3" strokeLinecap="round" opacity="0.2" />
        <line x1="30" y1="67" x2="50" y2="67" stroke="var(--accent)" strokeWidth="1.3" strokeLinecap="round" opacity="0.2" />
        <line x1="30" y1="74" x2="56" y2="74" stroke="var(--accent)" strokeWidth="1.3" strokeLinecap="round" opacity="0.2" />
        {/* scan line sweeping down card */}
        <rect x="24" y="42" width="48" height="3" rx="1.5" fill="var(--accent)" opacity="0">
          <animate attributeName="y" values="42;88;42" dur="2.4s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0;0.5;0.5;0" keyTimes="0;0.1;0.9;1" dur="2.4s" repeatCount="indefinite" />
        </rect>
      </g>

      {/* Card 2 — top right */}
      <g opacity="0.8">
        <animateMotion path="M0,0 C-6,-10 -14,-5 -12,4 C-8,13 3,8 0,0" dur="4.7s" repeatCount="indefinite" />
        <rect x="198" y="22" width="52" height="64" rx="7" fill="var(--accent-muted)" stroke="var(--accent)" strokeWidth="1" />
        <line x1="206" y1="36" x2="242" y2="36" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" opacity="0.45" />
        <line x1="206" y1="45" x2="234" y2="45" stroke="var(--accent)" strokeWidth="1.3" strokeLinecap="round" opacity="0.2" />
        <line x1="206" y1="52" x2="238" y2="52" stroke="var(--accent)" strokeWidth="1.3" strokeLinecap="round" opacity="0.2" />
        <line x1="206" y1="59" x2="226" y2="59" stroke="var(--accent)" strokeWidth="1.3" strokeLinecap="round" opacity="0.2" />
        <line x1="206" y1="66" x2="232" y2="66" stroke="var(--accent)" strokeWidth="1.3" strokeLinecap="round" opacity="0.2" />
        <rect x="200" y="34" width="48" height="3" rx="1.5" fill="var(--accent)" opacity="0">
          <animate attributeName="y" values="34;80;34" dur="2.8s" begin="0.4s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0;0.5;0.5;0" keyTimes="0;0.1;0.9;1" dur="2.8s" begin="0.4s" repeatCount="indefinite" />
        </rect>
      </g>

      {/* Card 3 — bottom left */}
      <g opacity="0.75">
        <animateMotion path="M0,0 C7,-7 12,2 8,9 C3,15 -5,6 0,0" dur="4s" repeatCount="indefinite" />
        <rect x="12" y="124" width="48" height="58" rx="7" fill="var(--accent-muted)" stroke="var(--accent)" strokeWidth="1" />
        <line x1="20" y1="138" x2="52" y2="138" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" opacity="0.45" />
        <line x1="20" y1="146" x2="46" y2="146" stroke="var(--accent)" strokeWidth="1.3" strokeLinecap="round" opacity="0.2" />
        <line x1="20" y1="153" x2="50" y2="153" stroke="var(--accent)" strokeWidth="1.3" strokeLinecap="round" opacity="0.2" />
        <line x1="20" y1="160" x2="42" y2="160" stroke="var(--accent)" strokeWidth="1.3" strokeLinecap="round" opacity="0.2" />
        <rect x="14" y="136" width="44" height="3" rx="1.5" fill="var(--accent)" opacity="0">
          <animate attributeName="y" values="136;176;136" dur="2.2s" begin="0.8s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0;0.5;0.5;0" keyTimes="0;0.1;0.9;1" dur="2.2s" begin="0.8s" repeatCount="indefinite" />
        </rect>
      </g>

      {/* Magnifying glass — smooth bezier path drift */}
      <g filter="url(#searchGlow)">
        <animateMotion
          path="M0,0 C-18,-22 10,-28 22,-12 C30,0 22,22 6,24 C-12,26 -28,8 0,0"
          dur="6s"
          repeatCount="indefinite"
        />
        {/* Lens */}
        <circle cx="150" cy="95" r="26" stroke="var(--accent)" strokeWidth="3.5" fill="none" />
        <circle cx="150" cy="95" r="24" fill="var(--accent)" opacity="0.06">
          <animate attributeName="opacity" values="0.04;0.12;0.04" dur="2.5s" repeatCount="indefinite" />
        </circle>
        {/* Handle */}
        <line x1="170" y1="114" x2="190" y2="134" stroke="var(--text-muted)" strokeWidth="5.5" strokeLinecap="round" />
        {/* Shine arc */}
        <path d="M138 82 Q144 77 152 82" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none">
          <animate attributeName="opacity" values="0.15;0.45;0.15" dur="2s" repeatCount="indefinite" />
        </path>
      </g>

      {/* Sparkle diamonds — staggered pop */}
      <g transform="translate(92, 35)">
        <path d="M0,-5.5 L3.5,0 L0,5.5 L-3.5,0 Z" fill="var(--accent)">
          <animate attributeName="opacity" values="0;0.75;0" dur="2.2s" repeatCount="indefinite" />
          <animateTransform attributeName="transform" type="scale" values="0.3;1.2;0.3" dur="2.2s" repeatCount="indefinite" />
        </path>
      </g>
      <g transform="translate(210, 110)">
        <path d="M0,-4.5 L3,0 L0,4.5 L-3,0 Z" fill="var(--accent)">
          <animate attributeName="opacity" values="0;0.65;0" dur="1.9s" begin="0.6s" repeatCount="indefinite" />
          <animateTransform attributeName="transform" type="scale" values="0.3;1.1;0.3" dur="1.9s" begin="0.6s" repeatCount="indefinite" />
        </path>
      </g>
      <g transform="translate(125, 175)">
        <path d="M0,-4 L2.5,0 L0,4 L-2.5,0 Z" fill="var(--accent)">
          <animate attributeName="opacity" values="0;0.55;0" dur="2.4s" begin="1.2s" repeatCount="indefinite" />
          <animateTransform attributeName="transform" type="scale" values="0.3;1;0.3" dur="2.4s" begin="1.2s" repeatCount="indefinite" />
        </path>
      </g>
      <g transform="translate(248, 155)">
        <path d="M0,-4 L2.5,0 L0,4 L-2.5,0 Z" fill="var(--accent)">
          <animate attributeName="opacity" values="0;0.6;0" dur="2s" begin="0.3s" repeatCount="indefinite" />
          <animateTransform attributeName="transform" type="scale" values="0.4;1;0.4" dur="2s" begin="0.3s" repeatCount="indefinite" />
        </path>
      </g>

      {/* Ambient floating dots */}
      <circle cx="60" cy="108" r="2.5" fill="var(--accent)">
        <animate attributeName="opacity" values="0.15;0.5;0.15" dur="3.5s" begin="0.5s" repeatCount="indefinite" />
      </circle>
      <circle cx="265" cy="180" r="2" fill="var(--accent)">
        <animate attributeName="opacity" values="0.1;0.45;0.1" dur="3s" begin="1s" repeatCount="indefinite" />
      </circle>
      <circle cx="160" cy="195" r="2" fill="var(--accent)">
        <animate attributeName="opacity" values="0.1;0.4;0.1" dur="2.8s" begin="1.5s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}
