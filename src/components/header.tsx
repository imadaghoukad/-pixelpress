"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Shrink, Moon, Sun, ShieldCheck, ArrowUpRight } from "lucide-react";
import { Button, Tooltip } from "./ui/primitives";
import { en } from "@/lib/i18n";
import { cn } from "@/lib/utils";
export function Header({
  active,
  onNavigate,
}: {
  active?: "compress" | "resize";
  onNavigate?: (tab: "compress" | "resize") => void;
}) {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = localStorage.getItem("pixelpress-theme");
    } catch {
      /* Preferences are optional when browser storage is unavailable. */
    }
    const isDark = saved
      ? saved === "dark"
      : matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.classList.toggle("dark", isDark);
    const frame = requestAnimationFrame(() => setDark(isDark));
    return () => cancelAnimationFrame(frame);
  }, []);
  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("pixelpress-theme", next ? "dark" : "light");
    } catch {
      /* Preferences are optional when browser storage is unavailable. */
    }
  };
  return (
    <header className="site-header">
      <div className="header-inner">
        <Link className="wordmark" href="/" aria-label={en.brand}>
          <span className="brand-icon">
            <Shrink size={22} strokeWidth={2.4} />
          </span>
          {en.brand}
          <span className="brand-dot">.</span>
        </Link>
        <nav aria-label={en.settings} className="main-nav">
          {(["compress", "resize"] as const).map((tab) => (
            <Link
              href={`/${tab}-image/`}
              key={tab}
              className={cn("nav-link", active === tab && "active")}
              aria-current={active === tab ? "page" : undefined}
              onClick={
                onNavigate
                  ? (e) => {
                      e.preventDefault();
                      onNavigate(tab);
                    }
                  : undefined
              }
            >
              {en[tab]}
            </Link>
          ))}
        </nav>
        <div className="header-actions">
          <span className="local-indicator">
            <span />
            {en.localShort}
          </span>
          <Tooltip text={en.theme}>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label={en.theme}
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </Button>
          </Tooltip>
        </div>
      </div>
    </header>
  );
}
export function Footer() {
  return (
    <footer className="site-footer">
      <div>
        <span className="footer-logo">{en.brand}.</span>
        <span>{en.footer}</span>
      </div>
      <div>
        <span>{en.footerFormats}</span>
        <Link href="/privacy/">
          {en.privacy}
          <ArrowUpRight size={13} />
        </Link>
      </div>
    </footer>
  );
}
export function PrivacyNote() {
  return (
    <div className="privacy-note">
      <ShieldCheck size={16} />
      <span>{en.local}</span>
      <span className="privacy-note-separator">·</span>
      <Link href="/privacy/">
        {en.privacy}
        <ArrowUpRight size={12} />
      </Link>
    </div>
  );
}
