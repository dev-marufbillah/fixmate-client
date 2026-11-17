"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setDark(document.documentElement.getAttribute("data-theme") === "fixmate-dark");
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    const theme = next ? "fixmate-dark" : "fixmate";
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem("fixmate-theme", theme);
    } catch {
      /* ignore */
    }
  };

  return (
    <button
      type="button"
      aria-label="Toggle dark mode"
      onClick={toggle}
      className={`btn btn-ghost btn-circle btn-sm ${className}`}
    >
      {mounted && dark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
