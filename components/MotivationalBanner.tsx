"use client";

import { useEffect, useState } from "react";

const PHRASES = [
  "Keep going.",
  "You're doing great.",
  "You've got this.",
  "One step closer.",
  "Rejection is redirection.",
  "Every no gets you closer to a yes.",
  "Small steps still move you forward.",
  "You're building something — stay patient.",
  "The right fit is out there.",
  "Progress isn't always visible. Keep applying.",
  "Today's effort is tomorrow's offer.",
  "You showed up today. That counts.",
  "Momentum beats perfection.",
  "Your next opportunity might be one application away.",
];

export default function MotivationalBanner() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  // Picking a random starting phrase has to happen after mount, not during
  // initial render — Math.random() would return a different value on the
  // server render vs. the client render, causing a hydration mismatch.
  useEffect(() => {
    setIndex(Math.floor(Math.random() * PHRASES.length));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((i) => (i + 1) % PHRASES.length);
        setVisible(true);
      }, 300);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="border-b border-line bg-paper">
      <div className="max-w-4xl mx-auto px-6 py-2">
        <p
          className={`font-mono text-xs text-muted text-center transition-opacity duration-300 ${
            visible ? "opacity-100" : "opacity-0"
          }`}
        >
          {PHRASES[index]}
        </p>
      </div>
    </div>
  );
}
