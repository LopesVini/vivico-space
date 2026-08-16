"use client";
/* Remote editorial artwork intentionally uses its original providers. */
/* eslint-disable @next/next/no-img-element */

import { type CSSProperties, useEffect, useState } from "react";
import { SiGithub, SiInstagram, SiLetterboxd, SiLinkedin } from "react-icons/si";
import EntryGate from "./components/entry/EntryGate";
import Gallery from "./components/Gallery";
import SystemLog from "./components/overlays/SystemLog";
import Terminal from "./components/overlays/Terminal";
import CommandPalette from "./components/CommandPalette";
import ZenMode from "./components/ZenMode";
import type { Lang } from "./lib/i18n";
import { trackAnonymous } from "./lib/telemetry";

type Page = "about" | "gallery" | "terminal" | "changelog";

const birthDate = new Date("2006-03-16T00:00:00-03:00").getTime();
const tropicalYearMs = 365.2425 * 86400000;

const copy = {
  en: {
    status: "online · bh, br", system: "2026", age: "AGE", years: "YEARS",
    location: "Belo Horizonte",
    lede: "This is a small index of what I make, what I return to, and where I am now. More logbook than portfolio.",
    projects: "Projects / Work", selected: "SELECTED", project1: "VEBRAM", project2: "Prossigo",
    note1: "If you are an architect, call me on Instagram.", note2: "SDR, closer, support.",
    things: "Suggestions", incomplete: "THREE LINKS", read: "READ", listen: "LISTEN", watch: "WATCH",
    video: "Matsuoka Shuzo — NEVER GIVE UP!!", open: "OPEN ↗",
    local: "LOCAL TIME", back: "BACK TO TOP ↑", gallery: "GALLERY", terminal: "TERMINAL", changelog: "SYSTEM LOG",
  },
  pt: {
    status: "online · bh, br", system: "2026", age: "IDADE", years: "ANOS",
    location: "Belo Horizonte",
    lede: "Este é um pequeno índice do que eu faço, ao que retorno e de onde estou agora. Mais registro do que portfólio.",
    projects: "Projetos / Trampo", selected: "SELECIONADOS", project1: "VEBRAM", project2: "Prossigo",
    note1: "Se você for arquiteto, me chama no Insta.", note2: "SDR, closer, suporte.",
    things: "Sugestões", incomplete: "TRÊS LINKS", read: "LER", listen: "OUVIR", watch: "ASSISTIR",
    video: "Matsuoka Shuzo — NEVER GIVE UP!!", open: "ABRIR ↗",
    local: "HORA LOCAL", back: "VOLTAR AO TOPO ↑", gallery: "GALERIA", terminal: "TERMINAL", changelog: "SYSTEM LOG",
  },
};



export default function Home() {
  const [age, setAge] = useState<number | null>(null);
  const [lang, setLang] = useState<Lang>("pt");
  const [page, setPage] = useState<Page>("about");
  const [entered, setEntered] = useState(false);
  const [zenMode, setZenMode] = useState(false);
  const t = copy[lang];

  useEffect(() => {
    const update = () => setAge((Date.now() - birthDate) / tropicalYearMs);
    update();
    const timer = window.setInterval(update, 40);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang === "pt" ? "pt-BR" : "en";
    window.localStorage.setItem("vl-lang", lang);
  }, [lang]);

  useEffect(() => { trackAnonymous("arrival"); }, []);

  const navigate = (next: Page) => {
    if (next === "gallery") trackAnonymous("opened_gallery");
    if (next === "terminal") trackAnonymous("opened_terminal");
    setPage(next); window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!entered) return <EntryGate lang={lang} setLang={setLang} onEnter={() => setEntered(true)} />;

  if (zenMode) return (
    <>
      <ZenMode lang={lang} onExit={() => setZenMode(false)} />
      <CommandPalette lang={lang} onNavigate={navigate} onToggleZen={() => setZenMode(!zenMode)} />
    </>
  );

  return (
    <main className={page === "about" ? "siteMain homeMode" : "siteMain"}>
      <CommandPalette lang={lang} onNavigate={navigate} onToggleZen={() => setZenMode(!zenMode)} />
      <header className="topbar" aria-label={lang === "pt" ? "Navegação do site" : "Site navigation"}>
        <button className="wordmark" onClick={() => navigate("about")}>VIVICO</button>
        <nav className="systemNav">
          <button className={page === "changelog" ? "activePage" : ""} onClick={() => navigate("changelog")}>{t.changelog}</button>
          <button className={page === "gallery" ? "activePage" : ""} onClick={() => navigate("gallery")}>{t.gallery}</button>
          <button className={`terminalLink ${page === "terminal" ? "activePage" : ""}`} onClick={() => navigate("terminal")}>{t.terminal}_</button>
          <button className="langSwitch" onClick={() => setLang(lang === "pt" ? "en" : "pt")} aria-label={lang === "pt" ? "Switch to English" : "Mudar para português"}>
            <span className={lang === "pt" ? "active" : ""}>PT</span>/<span className={lang === "en" ? "active" : ""}>EN</span>
          </button>
          <button className="langSwitch" onClick={() => setZenMode(true)} aria-label="Zen Mode">
            CSS OFF
          </button>
        </nav>
        <div className="status"><span className="statusDot" /> {t.status}</div>
      </header>

      {page === "about" ? <div id="top" className="shell homeSurface">
        <section className="intro" aria-labelledby="name">
          <p className="eyebrow">{t.system}</p>
          <h1 id="name">Vinícius (Vivico)</h1>
          <div className="facts">
            <div className="fact"><span className="label">{t.age}</span><span className="value age">{age ? age.toFixed(8) : "20.00000000"}<small> {t.years}</small></span></div>
            <div className="fact"><span className="value">{t.location}</span></div>
            <div className="fact"><span className="label">{t.local}</span><span className="value age"><LocalTime /></span></div>
          </div>
          <p className="lede">{t.lede}</p>
        </section>

        <nav className="socialDock" aria-label={lang === "pt" ? "Links externos" : "External links"}>
          <a href="https://github.com/LopesVini" target="_blank" rel="noreferrer" aria-label="GitHub"><SiGithub aria-hidden="true" /></a>
          <a href="https://www.linkedin.com/in/vin%C3%ADcius-lacerda-405a72396" target="_blank" rel="noreferrer" aria-label="LinkedIn"><SiLinkedin aria-hidden="true" /></a>
          <a href="https://instagram.com/vllc.hub" target="_blank" rel="noreferrer" aria-label="Instagram"><SiInstagram aria-hidden="true" /></a>
          <a href="https://letterboxd.com/lacerdavinicius/" target="_blank" rel="noreferrer" aria-label="Letterboxd"><SiLetterboxd aria-hidden="true" /></a>
        </nav>

        <section className="section" aria-labelledby="projects-title">
          <div className="sectionHead"><h2 id="projects-title">{t.projects}</h2><span>{t.selected}</span></div>
          <div className="rows">
            <a className="projectRow" href="https://vebram.com" target="_blank" rel="noreferrer"><span className="rowIndex">01</span><span className="rowMain"><strong>{t.project1}</strong><em>{t.note1}</em></span><span className="arrow">↗</span></a>
            <a className="projectRow" href="https://prossigo.com" target="_blank" rel="noreferrer"><span className="rowIndex">02</span><span className="rowMain"><strong>{t.project2}</strong><em>{t.note2}</em></span><span className="arrow">↗</span></a>
          </div>
        </section>

        <section className="section" aria-labelledby="things-title">
          <div className="sectionHead"><h2 id="things-title">{t.things}</h2><span>{t.incomplete}</span></div>
          <div className="thingsGrid">
            <a className="thing ready" href="https://bitcoin.org/bitcoin.pdf" target="_blank" rel="noreferrer"><span className="thingCode">{t.read}</span><strong>Bitcoin: White Paper</strong><span>Satoshi Nakamoto · 2008</span><span className="thingArrow">{t.open}</span></a>
            <MusicSuggestion lang={lang} listen={t.listen} open={t.open} />
            <a className="thing mediaThing" href="https://www.youtube.com/watch?v=KxGRhd_iWuE" target="_blank" rel="noreferrer"><span className="thingCode">{t.watch}</span><img src="https://i.ytimg.com/vi/KxGRhd_iWuE/hqdefault.jpg" alt="Miniatura do vídeo Matsuoka Shuzo — NEVER GIVE UP!!" /><strong>{t.video}</strong><span>YouTube</span><span className="thingArrow">{t.open}</span></a>
          </div>
        </section>

        <section className="accessStrip" aria-label={lang === "pt" ? "Funcionalidades interativas" : "Interactive features"}>
          <button onClick={() => navigate("changelog")}><span>01</span><strong>{t.changelog}</strong><em>{lang === "pt" ? "histórico de versões" : "version history"}</em></button>
          <button onClick={() => navigate("terminal")}><span>02</span><strong>{t.terminal}_</strong><em>{lang === "pt" ? "entre no VL/OS" : "enter VL/OS"}</em></button>
        </section>

        <div className="cmdHint"><span>{lang === "pt" ? "Dica: pressione" : "Hint: press"}</span> <kbd>Cmd</kbd> + <kbd>K</kbd></div>

        <footer><span>VINÍCIUS LACERDA</span><a href="#top">{t.back}</a></footer>
      </div>
        : <div className="pageShell">{page === "gallery" && <Gallery lang={lang} />}{page === "terminal" && <Terminal lang={lang} onNavigate={navigate} />}{page === "changelog" && <SystemLog lang={lang} />}</div>}
    </main>
  );
}

const backgroundNotes = [
  { pt: "∫ e⁻ˣ² dx = √π", en: "∫ e⁻ˣ² dx = √π", x: 7, y: 22, rotate: -7, start: -.1, end: .24, speed: .55, kind: "formula" },
  { pt: "ACESSE O TERMINAL_", en: "OPEN THE TERMINAL_", x: 68, y: 74, rotate: 3, start: .02, end: .38, speed: .9, kind: "prompt" },
  { pt: "STAR TREK > STAR WARS", en: "STAR TREK > STAR WARS", x: 52, y: 29, rotate: -2, start: .15, end: .5, speed: .45, kind: "verdict" },
  { pt: "lim curiosidade → ∞", en: "lim curiosity → ∞", x: 8, y: 66, rotate: 5, start: .27, end: .62, speed: .75, kind: "formula" },
  { pt: "404 ≠ FIM", en: "404 ≠ END", x: 76, y: 18, rotate: 8, start: .4, end: .72, speed: .65, kind: "prompt" },
  { pt: "1 PESSOA / 1 FOTO", en: "1 PERSON / 1 PHOTO", x: 17, y: 36, rotate: -3, start: .54, end: .86, speed: .5, kind: "verdict" },
  { pt: "F = G m₁m₂ / r²", en: "F = G m₁m₂ / r²", x: 67, y: 61, rotate: -6, start: .62, end: 1.05, speed: .8, kind: "formula" },
  { pt: "NÃO É UM PORTFÓLIO", en: "NOT A PORTFOLIO", x: 33, y: 82, rotate: 2, start: .73, end: 1.05, speed: .42, kind: "prompt" },
];

function BackgroundField({ lang }: { lang: Lang }) {
  const [motion, setMotion] = useState({ scroll: 0, x: 0, y: 0 });
  useEffect(() => {
    let frame = 0;
    const updateScroll = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
        setMotion((current) => ({ ...current, scroll: Math.min(1, window.scrollY / max) }));
      });
    };
    const updatePointer = (event: PointerEvent) => {
      const x = (event.clientX / window.innerWidth - .5) * 18;
      const y = (event.clientY / window.innerHeight - .5) * 18;
      setMotion((current) => ({ ...current, x, y }));
    };
    updateScroll();
    window.addEventListener("scroll", updateScroll, { passive: true });
    window.addEventListener("pointermove", updatePointer, { passive: true });
    return () => { window.cancelAnimationFrame(frame); window.removeEventListener("scroll", updateScroll); window.removeEventListener("pointermove", updatePointer); };
  }, []);

  return <div className="backgroundField" aria-hidden="true">
    <div className="paperTexture" />
    <div className="backgroundProgress"><span style={{ transform: `scaleX(${motion.scroll})` }} /></div>
    {backgroundNotes.map((note, index) => {
      const fadeIn = Math.max(0, Math.min(1, (motion.scroll - note.start) / .09));
      const fadeOut = Math.max(0, Math.min(1, (note.end - motion.scroll) / .09));
      const opacity = fadeOut * .46;
      const drift = (motion.scroll - note.start) * note.speed * 95;
      const style = {
        left: `${note.x}%`, top: `${note.y}%`, opacity,
        clipPath: `inset(-12px ${(1 - fadeIn) * 100}% -12px -12px)`,
        transform: `translate3d(${motion.x * note.speed}px, ${motion.y * note.speed - drift}px, 0) rotate(${note.rotate}deg)`,
        animationDelay: `${index * -0.37}s`,
      } as CSSProperties;
      return <span className={`backgroundNote ${note.kind}`} style={style} key={index}>{lang === "pt" ? note.pt : note.en}</span>;
    })}
    <span className="backgroundCross crossOne">+</span><span className="backgroundCross crossTwo">×</span>
  </div>;
}

const musicSuggestion = { title: "doom", artist: "Steve Lacy", href: "https://open.spotify.com/track/3kKPZFQse4LtbnMRhnAlEO", image: "https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e024ea9ba86cd9506a004bab042" };

function MusicSuggestion({ lang, listen, open }: { lang: Lang; listen: string; open: string }) {
  const music = musicSuggestion;
  return <a className="thing mediaThing" href={music.href} target="_blank" rel="noreferrer" aria-label={`${open}: ${music.title}, ${music.artist}`}>
    <span className="thingCode">{listen}</span>
    <img src={music.image} alt={`${lang === "pt" ? "Capa de" : "Cover of"} ${music.title}, ${music.artist}`} />
    <strong>{music.title}</strong><span>{music.artist}</span><span className="thingArrow">{open}</span>
  </a>;
}

function LocalTime() {
  const [time, setTime] = useState("--:--:--");
  useEffect(() => {
    const update = () => setTime(new Intl.DateTimeFormat("en-GB", { timeZone: "America/Sao_Paulo", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }).format(new Date()));
    update(); const timer = window.setInterval(update, 1000); return () => window.clearInterval(timer);
  }, []);
  return <>{time}</>;
}
