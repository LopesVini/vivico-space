"use client";
import { useEffect, useRef, useState } from "react";
import type { Lang } from "../../lib/i18n";

type Page = "about" | "gallery" | "terminal" | "changelog";

type Action = {
  id: string;
  name: { pt: string; en: string };
  icon: string;
  onSelect: () => void;
};

export default function CommandPalette({ lang, onNavigate, onToggleZen }: { lang: Lang, onNavigate: (page: Page) => void, onToggleZen: () => void }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((currentOpen) => {
          if (!currentOpen) {
            setQuery("");
            setSelectedIndex(0);
          }
          return !currentOpen;
        });
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
    }
  }, [open]);

  const actions: Action[] = [
    { id: "zen", name: { pt: "Alternar Modo Zen", en: "Toggle Zen Mode" }, icon: "👁️", onSelect: () => { onToggleZen(); setOpen(false); } },
    { id: "terminal", name: { pt: "Abrir Terminal", en: "Open Terminal" }, icon: "💻", onSelect: () => { onNavigate("terminal"); setOpen(false); } },
    { id: "gallery", name: { pt: "Ver Galeria", en: "View Gallery" }, icon: "📸", onSelect: () => { onNavigate("gallery"); setOpen(false); } },
    { id: "changelog", name: { pt: "Histórico (System Log)", en: "System Log" }, icon: "📝", onSelect: () => { onNavigate("changelog"); setOpen(false); } },
    { id: "github", name: { pt: "GitHub", en: "GitHub" }, icon: "↗️", onSelect: () => { window.open("https://github.com/LopesVini", "_blank"); setOpen(false); } },
  ];

  const filtered = actions.filter((a) => a.name[lang].toLowerCase().includes(query.toLowerCase()));
  const safeIndex = filtered.length > 0 ? selectedIndex % filtered.length : 0;

  const handleQueryChange = (val: string) => {
    setQuery(val);
    setSelectedIndex(0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") { setOpen(false); }
    if (e.key === "ArrowDown") { e.preventDefault(); setSelectedIndex((i) => (i + 1) % filtered.length); }
    if (e.key === "ArrowUp") { e.preventDefault(); setSelectedIndex((i) => (i - 1 + filtered.length) % filtered.length); }
    if (e.key === "Enter" && filtered.length > 0) {
      e.preventDefault();
      filtered[selectedIndex].onSelect();
    }
  };

  if (!open) return null;

  return (
    <div className="commandPaletteOverlay" onClick={() => setOpen(false)}>
      <div className="commandPaletteDialog" onClick={(e) => e.stopPropagation()}>
        <input 
          ref={inputRef}
          value={query} 
          onChange={(e) => handleQueryChange(e.target.value)} 
          onKeyDown={handleKeyDown} 
          placeholder={lang === "pt" ? "Digite um comando... (ex: zen, terminal)" : "Type a command... (e.g., zen, terminal)"}
          autoComplete="off" spellCheck={false}
          aria-label={lang === "pt" ? "Paleta de comandos" : "Command palette"}
        />
        <ul className="commandPaletteList">
          {filtered.length === 0 && <li className="empty">{lang === "pt" ? "Nenhum resultado." : "No results found."}</li>}
          {filtered.map((action, index) => (
            <li 
              key={action.id} 
              className={index === safeIndex ? "selected" : ""}
              onMouseEnter={() => setSelectedIndex(index)}
              onClick={() => action.onSelect()}
            >
              <span className="icon">{action.icon}</span>
              {action.name[lang]}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
