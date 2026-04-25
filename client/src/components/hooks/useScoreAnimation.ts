import { useState, useRef, useEffect, useCallback } from "react";

const RING_RADIUS = 44;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;
const SCORE_ANIM_DURATION = 2000;
const KEYWORD_DELAY_MS = 60;

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

interface ScoreAnimationResult {
  animPhase: 0 | 1 | 2 | 3;
  displayScore: number;
  ringOffset: number;
  resetAnim: () => void;
}

export { RING_RADIUS, RING_CIRCUMFERENCE, KEYWORD_DELAY_MS };

export function useScoreAnimation(
  score: number | null,
  matchingCount: number,
  missingCount: number,
): ScoreAnimationResult {
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

  useEffect(() => {
    if (score === null) return;

    resetAnim();

    const kickoff = requestAnimationFrame(() => {
      setAnimPhase(1);
      const targetOffset = RING_CIRCUMFERENCE * (1 - score / 100);

      requestAnimationFrame(() => setRingOffset(targetOffset));

      const start = performance.now();
      const step = (now: number) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / SCORE_ANIM_DURATION, 1);
        const eased = easeOutCubic(progress);
        setDisplayScore(Math.round(eased * score));
        if (progress < 1) {
          animFrameRef.current = requestAnimationFrame(step);
        }
      };
      animFrameRef.current = requestAnimationFrame(step);
    });

    const t1 = setTimeout(() => setAnimPhase(2), SCORE_ANIM_DURATION + 100);

    const totalKeywords = matchingCount + missingCount;
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
  }, [score, matchingCount, missingCount, resetAnim]);

  return { animPhase, displayScore, ringOffset, resetAnim };
}
