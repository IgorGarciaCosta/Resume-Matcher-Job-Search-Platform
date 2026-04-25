import styles from "./AnalyzingCharacter.module.css";

export default function AnalyzingCharacter() {
  return (
    <svg
      className={styles.scene}
      viewBox="0 0 280 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <filter id="analyzeGlow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id="scanGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0" />
          <stop offset="50%" stopColor="var(--accent)" stopOpacity="0.7" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Background orbital ring */}
      <circle cx="115" cy="108" r="92" stroke="var(--accent)" strokeWidth="0.5" opacity="0.06" strokeDasharray="5 10">
        <animateTransform attributeName="transform" type="rotate" values="0 115 108;360 115 108" dur="32s" repeatCount="indefinite" />
      </circle>

      {/* Main document — gentle float */}
      <g>
        <animateMotion path="M0,0 C1,-4 2,-4 2,0 C2,4 1,4 0,0" dur="4.5s" repeatCount="indefinite" />

        {/* Shadow */}
        <rect x="76" y="49" width="82" height="112" rx="7" fill="var(--text-muted)" opacity="0.08" />

        {/* Document body */}
        <rect x="73" y="46" width="82" height="112" rx="7" fill="var(--bg-card)" stroke="var(--accent)" strokeWidth="1.3" />

        {/* Header area */}
        <rect x="84" y="58" width="32" height="5" rx="2.5" fill="var(--accent)" opacity="0.5" />
        <rect x="84" y="67" width="22" height="3.5" rx="1.7" fill="var(--accent)" opacity="0.22" />

        {/* Text lines */}
        <line x1="84" y1="82" x2="144" y2="82" stroke="var(--text-muted)" strokeWidth="1.6" strokeLinecap="round" opacity="0.25" />
        <line x1="84" y1="92" x2="138" y2="92" stroke="var(--text-muted)" strokeWidth="1.6" strokeLinecap="round" opacity="0.25" />
        <line x1="84" y1="102" x2="142" y2="102" stroke="var(--text-muted)" strokeWidth="1.6" strokeLinecap="round" opacity="0.25" />
        <line x1="84" y1="112" x2="130" y2="112" stroke="var(--text-muted)" strokeWidth="1.6" strokeLinecap="round" opacity="0.25" />
        <line x1="84" y1="122" x2="140" y2="122" stroke="var(--text-muted)" strokeWidth="1.6" strokeLinecap="round" opacity="0.25" />
        <line x1="84" y1="132" x2="125" y2="132" stroke="var(--text-muted)" strokeWidth="1.6" strokeLinecap="round" opacity="0.25" />
        <line x1="84" y1="142" x2="136" y2="142" stroke="var(--text-muted)" strokeWidth="1.6" strokeLinecap="round" opacity="0.25" />

        {/* Scan beam sweeping down — smooth bezier easing */}
        <rect x="75" y="52" width="78" height="10" rx="3" fill="url(#scanGrad)" filter="url(#analyzeGlow)">
          <animate
            attributeName="y"
            values="48;148;48"
            dur="3s"
            repeatCount="indefinite"
            calcMode="spline"
            keySplines="0.42 0 0.58 1;0.42 0 0.58 1"
            keyTimes="0;0.5;1"
          />
        </rect>

        {/* Highlight lines — glow when scan passes */}
        <line x1="84" y1="82" x2="144" y2="82" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" opacity="0">
          <animate attributeName="opacity" values="0;0.6;0" dur="3s" begin="0.35s" repeatCount="indefinite" />
        </line>
        <line x1="84" y1="102" x2="142" y2="102" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" opacity="0">
          <animate attributeName="opacity" values="0;0.6;0" dur="3s" begin="0.55s" repeatCount="indefinite" />
        </line>
        <line x1="84" y1="122" x2="140" y2="122" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" opacity="0">
          <animate attributeName="opacity" values="0;0.6;0" dur="3s" begin="0.75s" repeatCount="indefinite" />
        </line>
      </g>

      {/* Right side — analysis result nodes appearing */}
      {/* Node 1 */}
      <g>
        <line x1="155" y1="72" x2="185" y2="65" stroke="var(--accent)" strokeWidth="1.2" strokeLinecap="round" opacity="0">
          <animate attributeName="opacity" values="0;0.4;0.4;0" keyTimes="0;0.15;0.8;1" dur="3s" begin="0.5s" repeatCount="indefinite" />
        </line>
        <circle cx="190" cy="63" r="6" fill="var(--accent)" opacity="0">
          <animate attributeName="opacity" values="0;0.7;0.7;0" keyTimes="0;0.15;0.8;1" dur="3s" begin="0.5s" repeatCount="indefinite" />
        </circle>
        <circle cx="190" cy="63" r="6" stroke="var(--accent)" strokeWidth="1" fill="none" opacity="0">
          <animate attributeName="opacity" values="0;0.3;0.3;0" keyTimes="0;0.15;0.8;1" dur="3s" begin="0.5s" repeatCount="indefinite" />
          <animate attributeName="r" values="6;12;6" dur="3s" begin="0.5s" repeatCount="indefinite" />
        </circle>
      </g>

      {/* Node 2 */}
      <g>
        <line x1="155" y1="100" x2="192" y2="105" stroke="var(--accent)" strokeWidth="1.2" strokeLinecap="round" opacity="0">
          <animate attributeName="opacity" values="0;0.4;0.4;0" keyTimes="0;0.15;0.8;1" dur="3s" begin="1s" repeatCount="indefinite" />
        </line>
        <circle cx="198" cy="106" r="5" fill="var(--accent)" opacity="0">
          <animate attributeName="opacity" values="0;0.65;0.65;0" keyTimes="0;0.15;0.8;1" dur="3s" begin="1s" repeatCount="indefinite" />
        </circle>
      </g>

      {/* Node 3 */}
      <g>
        <line x1="155" y1="128" x2="188" y2="142" stroke="var(--accent)" strokeWidth="1.2" strokeLinecap="round" opacity="0">
          <animate attributeName="opacity" values="0;0.4;0.4;0" keyTimes="0;0.15;0.8;1" dur="3s" begin="1.5s" repeatCount="indefinite" />
        </line>
        <circle cx="193" cy="144" r="5.5" fill="var(--accent)" opacity="0">
          <animate attributeName="opacity" values="0;0.6;0.6;0" keyTimes="0;0.15;0.8;1" dur="3s" begin="1.5s" repeatCount="indefinite" />
        </circle>
      </g>

      {/* Dashed connections between nodes */}
      <line x1="190" y1="69" x2="198" y2="101" stroke="var(--accent)" strokeWidth="0.8" strokeDasharray="3 3" opacity="0">
        <animate attributeName="opacity" values="0;0.25;0.25;0" keyTimes="0;0.15;0.85;1" dur="3s" begin="1s" repeatCount="indefinite" />
      </line>
      <line x1="198" y1="111" x2="193" y2="139" stroke="var(--accent)" strokeWidth="0.8" strokeDasharray="3 3" opacity="0">
        <animate attributeName="opacity" values="0;0.25;0.25;0" keyTimes="0;0.15;0.85;1" dur="3s" begin="1.5s" repeatCount="indefinite" />
      </line>

      {/* Checkmark indicator — fades in after analysis */}
      <g opacity="0">
        <animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;0.6;0.7;0.9;1" dur="3s" begin="0.5s" repeatCount="indefinite" />
        <circle cx="225" cy="105" r="15" stroke="var(--accent)" strokeWidth="1.5" fill="var(--accent)" fillOpacity="0.08" />
        <path d="M217 105 L222 110 L233 99" stroke="var(--accent)" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>

      {/* Sparkle diamonds */}
      <g transform="translate(48, 30)">
        <path d="M0,-5.5 L3.5,0 L0,5.5 L-3.5,0 Z" fill="var(--accent)">
          <animate attributeName="opacity" values="0;0.7;0" dur="2.1s" repeatCount="indefinite" />
          <animateTransform attributeName="transform" type="scale" values="0.3;1.2;0.3" dur="2.1s" repeatCount="indefinite" />
        </path>
      </g>
      <g transform="translate(240, 50)">
        <path d="M0,-4.5 L3,0 L0,4.5 L-3,0 Z" fill="var(--accent)">
          <animate attributeName="opacity" values="0;0.6;0" dur="2.3s" begin="0.7s" repeatCount="indefinite" />
          <animateTransform attributeName="transform" type="scale" values="0.4;1;0.4" dur="2.3s" begin="0.7s" repeatCount="indefinite" />
        </path>
      </g>
      <g transform="translate(38, 168)">
        <path d="M0,-4 L2.5,0 L0,4 L-2.5,0 Z" fill="var(--accent)">
          <animate attributeName="opacity" values="0;0.5;0" dur="1.9s" begin="1.3s" repeatCount="indefinite" />
          <animateTransform attributeName="transform" type="scale" values="0.3;1.1;0.3" dur="1.9s" begin="1.3s" repeatCount="indefinite" />
        </path>
      </g>
      <g transform="translate(250, 170)">
        <path d="M0,-3.5 L2,0 L0,3.5 L-2,0 Z" fill="var(--accent)">
          <animate attributeName="opacity" values="0;0.6;0" dur="2.2s" begin="0.4s" repeatCount="indefinite" />
          <animateTransform attributeName="transform" type="scale" values="0.4;1;0.4" dur="2.2s" begin="0.4s" repeatCount="indefinite" />
        </path>
      </g>

      {/* Ambient dots */}
      <circle cx="55" cy="105" r="2.5" fill="var(--accent)">
        <animate attributeName="opacity" values="0.12;0.45;0.12" dur="3.2s" begin="0.8s" repeatCount="indefinite" />
      </circle>
      <circle cx="260" cy="135" r="2" fill="var(--accent)">
        <animate attributeName="opacity" values="0.1;0.4;0.1" dur="2.8s" begin="1.2s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}
