import { useState, useEffect, useRef } from "react";

const MESSAGES = [
  "Analyzing your resume with AI",
  "Tightening a few screws",
  "Searching the best encyclopedias",
  "Calling in my analysts",
  "Wrapping up the brainstorm",
  "Cross-referencing keywords",
  "Reading between the lines",
  "Consulting the career gurus",
  "Polishing the magnifying glass",
  "Comparing notes with the experts",
  "Crunching the numbers",
  "Connecting the dots",
  "Brewing some insights",
  "Dusting off the thesaurus",
  "Fine-tuning the results",
];

/**
 * Returns a randomly-rotating message that changes every `intervalMs` milliseconds.
 * Resets to a new random pick whenever `active` transitions to `true`.
 */
export function useRotatingMessage(active: boolean, intervalMs = 5000): string {
  const pick = () => MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
  const [message, setMessage] = useState(pick);
  const prev = useRef(message);

  useEffect(() => {
    if (!active) return;
    setMessage(pick());

    const id = setInterval(() => {
      let next: string;
      do {
        next = pick();
      } while (next === prev.current && MESSAGES.length > 1);
      prev.current = next;
      setMessage(next);
    }, intervalMs);

    return () => clearInterval(id);
  }, [active, intervalMs]);

  return message;
}
