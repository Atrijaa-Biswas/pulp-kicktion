"use client";
import { useState, useEffect } from "react";
import { Eye } from "lucide-react";

export default function A11yToggle() {
  const [a11yMode, setA11yMode] = useState(false);

  useEffect(() => {
    const savedMode = localStorage.getItem("a11y-mode") === "true";
    setA11yMode(savedMode);
    if (savedMode) document.body.classList.add("a11y-mode");
  }, []);

  const toggleMode = () => {
    const newMode = !a11yMode;
    setA11yMode(newMode);
    localStorage.setItem("a11y-mode", String(newMode));
    if (newMode) {
      document.body.classList.add("a11y-mode");
    } else {
      document.body.classList.remove("a11y-mode");
    }
  };

  return (
    <button
      onClick={toggleMode}
      className="fixed bottom-4 right-4 z-50 p-3 bg-vintage-green text-vintage-cream rounded-full shadow-lg border-2 border-vintage-cream hover:scale-105 transition-transform"
      aria-label="Toggle Accessibility Mode"
      title="Toggle Accessibility Mode"
    >
      <Eye className="w-6 h-6" />
    </button>
  );
}
