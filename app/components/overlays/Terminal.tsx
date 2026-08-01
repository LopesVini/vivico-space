"use client";
/* The terminal reveals a static local photograph as part of the easter egg. */
/* eslint-disable @next/next/no-img-element */
import { FormEvent, useEffect, useRef, useState } from "react";
import type { Lang } from "../../lib/i18n";
import { randomInteligencia } from "../../lib/inteligencias";

type Line = { kind: "input" | "output" | "accent" | "link"; text: string; href?: string };
type Visitor = { instagram: string; firstSeenAt: string; message: string | null };
type Identity = { instagram: string; token: string };
const horoscopes = {
  pt: ["Hoje você vai abrir uma aba e esquecer por quê.", "Mercúrio recomenda não responder imediatamente.", "Uma coincidência pequena vai parecer importante. Talvez seja.", "Evite decisões permanentes depois das 02:00.", "Seu melhor argumento hoje será uma pergunta.", "Uma mensagem antiga vai encontrar você no momento errado.", "Seu signo pede que você deixe uma coisa pela metade — de propósito.", "Não confunda pressa com intuição hoje.", "Alguém vai dizer uma palavra que você estava procurando há dias.", "O universo aprovou a ideia, mas ainda não revisou o orçamento.", "Seu próximo desvio de rota será mais honesto que o plano original.", "Há uma resposta escondida no caminho que você faz sem pensar."],
  en: ["Today you will open a tab and forget why.", "Mercury recommends not replying immediately.", "A small coincidence will feel important. Maybe it is.", "Avoid permanent decisions after 2 AM.", "Your best argument today will be a question.", "An old message will find you at the wrong moment.", "Your sign asks you to leave one thing unfinished — on purpose.", "Do not mistake urgency for intuition today.", "Someone will say a word you have been looking for all week.", "The universe approved the idea but has not reviewed the budget.", "Your next detour will be more honest than the original plan.", "There is an answer hidden in the route you take without thinking."],
};
const vicoAbout = {
  pt: "VICO / ABOUT ME\nminha vó me chama de vivico\ntentando aprender matemática.\nlinux e mac.\n\nlista de presentes:\ncaixa de Stella (latão)\ntwix\nkfc\ngoiaba",
  en: "VICO / ABOUT ME\nmy grandma calls me vivico\ntrying to learn mathematics.\nlinux and mac.\n\ngift list:\na case of Stella cans\ntwix\nkfc\nguava",
};

const siteLaunch = new Date("2026-07-30T06:09:41.592Z").getTime();
const matrixColumns = ["ﾊ\nﾐ\nﾋ\nｰ\nｳ\nｼ\nﾅ\nﾓ\nﾆ\nｻ", "0\n1\nｱ\nｷ\n7\nﾎ\nﾗ\n9\nﾏ\n3", "ﾇ\nﾌ\n2\nｵ\nﾔ\n5\nｾ\nﾜ\n8\nｶ", "1\nﾘ\nﾈ\n4\nﾃ\nｸ\n0\nﾑ\nｿ\n6", "ｴ\n3\nﾁ\nﾄ\n9\nｹ\nﾒ\n1\nﾕ\nﾍ", "7\nﾊ\n0\nｼ\nﾝ\n4\nﾆ\nﾐ\n2\nｱ", "ﾎ\n5\nﾜ\nﾅ\n8\nｻ\nﾌ\n0\nﾓ\nｷ", "2\nﾔ\nﾃ\n6\nｸ\nﾏ\n1\nﾇ\nｵ\n9", "ｾ\n4\nﾘ\nﾑ\n0\nﾁ\n7\nﾈ\nｶ\nﾄ", "8\nﾕ\nｴ\n3\nﾍ\nﾗ\n5\nｹ\nﾒ\n1", "ﾝ\n6\nﾐ\nﾆ\n2\nﾊ\nｼ\n0\nﾎ\nﾜ", "1\nｷ\nﾌ\n7\nﾓ\nﾅ\n4\nｱ\nｻ\n9"];

export default function Terminal({ lang, onNavigate }: { lang: Lang; onNavigate: (page: "about") => void }) {
  const pt = lang === "pt";
  const [lines, setLines] = useState<Line[]>([{ kind: "accent", text: "VL/OS 0.1 — connection established" }, { kind: "output", text: pt ? "Este sistema recompensa curiosidade. Digite help." : "This system rewards curiosity. Type help." }]);
  const [value, setValue] = useState(""); const [history, setHistory] = useState<string[]>([]); const [cursor, setCursor] = useState(0);
  const [identity] = useState<Identity | null>(() => { try { const stored = typeof window === "undefined" ? null : window.localStorage.getItem("vl-visitor"); return stored ? JSON.parse(stored) as Identity : null; } catch { return null; } }); const [coin, setCoin] = useState<"idle" | "flipping" | "heads">("idle"); const [matrix, setMatrix] = useState(false); const [easterEggOpen, setEasterEggOpen] = useState(false); const [museum, setMuseum] = useState(false);
  const input = useRef<HTMLInputElement>(null); const body = useRef<HTMLDivElement>(null); const coinTimer = useRef<number | null>(null); const coinHideTimer = useRef<number | null>(null); const matrixTimer = useRef<number | null>(null); const lastJokeNumber = useRef<number | null>(null);
  useEffect(() => input.current?.focus(), []);
  useEffect(() => () => { if (coinTimer.current) window.clearTimeout(coinTimer.current); if (coinHideTimer.current) window.clearTimeout(coinHideTimer.current); if (matrixTimer.current) window.clearTimeout(matrixTimer.current); }, []);
  useEffect(() => body.current?.scrollTo({ top: body.current.scrollHeight, behavior: "smooth" }), [lines, coin, easterEggOpen]);

  const [museumTab, setMuseumTab] = useState<"facebook" | "clubpenguin" | "habbo">("facebook");



  useEffect(() => { if (!museum) return; const close = (event: KeyboardEvent) => { if (event.key === "Escape") setMuseum(false); }; window.addEventListener("keydown", close); return () => window.removeEventListener("keydown", close); }, [museum]);

  const output = (text: string, kind: Line["kind"] = "output") => setLines((old) => [...old, { kind, text }]);

  useEffect(() => {
    const handleTrigger = () => {
      output(pt ? "Sites das antiga" : "Opening a version of the internet that refused to die…", "accent");
      setMuseum(true);
    };
    window.addEventListener("triggerMuseum", handleTrigger);
    return () => window.removeEventListener("triggerMuseum", handleTrigger);
  }, [pt, output]);
  const showRegistry = async () => {
    try {
      const response = await fetch("/api/visitors"); const data = await response.json() as { entries?: Visitor[] };
      const entries = data.entries ?? [];
      const instruction = pt ? "Para deixar sua mensagem:\nmsg: \"sua mensagem ✨\"" : "To leave your message:\nmsg: \"your message ✨\"";
      if (!entries.length) { output(`${pt ? "REGISTRO VAZIO\nNinguém deixou um sinal ainda." : "EMPTY REGISTRY\nNo one has left a signal yet."}\n\n${instruction}`); return; }
      const registryLines: Line[] = entries.map((entry) => {
        const date = new Intl.DateTimeFormat(pt ? "pt-BR" : "en-GB", { dateStyle: "medium", timeZone: "America/Sao_Paulo" }).format(new Date(entry.firstSeenAt));
        return { kind: "link", text: `@${entry.instagram}  ·  ${date}${entry.message ? `  ·  “${entry.message}”` : ""}  ↗`, href: `https://instagram.com/${entry.instagram}` };
      });
      setLines((old) => [...old, { kind: "accent", text: `${pt ? "REGISTRO / PRIMEIRAS VISITAS" : "REGISTRY / FIRST VISITS"}\n` }, ...registryLines, { kind: "output", text: `\n${instruction}` }]);
    } catch { output(pt ? "Não foi possível abrir o registro." : "Could not open the registry."); }
  };
  const saveMessage = async (message: string) => {
    try {
      if (!identity) { output(pt ? "Não reconheci seu @ neste dispositivo. Entre pelo acesso inicial antes de deixar uma mensagem." : "I could not recognize your @ on this device. Enter through the initial access before leaving a message."); return; }
      const response = await fetch("/api/visitors", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ instagram: identity.instagram, message, visitorToken: identity.token }) });
      if (!response.ok) throw new Error();
      output(pt ? "Mensagem registrada. ✦" : "Message recorded. ✦", "accent");
    } catch { output(pt ? "Não encontrei esse @. Entre pelo acesso inicial antes de deixar uma mensagem." : "I could not find that @. Enter through the initial access before leaving a message."); }
  };
  const showCv = () => {
    const heading = "VINÍCIUS LACERDA";
    setLines((old) => [...old,
    { kind: "accent", text: heading },
    { kind: "link", text: "GitHub ↗", href: "https://github.com/LopesVini" },
    { kind: "link", text: "LinkedIn ↗", href: "https://www.linkedin.com/in/vin%C3%ADcius-lacerda-405a72396" },
    { kind: "link", text: "Instagram ↗", href: "https://instagram.com/vllc.hub" },
    ]);
  };
  const showUptime = () => {
    const elapsed = Math.max(0, Date.now() - siteLaunch);
    const totalSeconds = Math.floor(elapsed / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    output(`${pt ? "VIVICO.SPACE NO AR" : "VIVICO.SPACE UPTIME"}\n${days}d ${String(hours).padStart(2, "0")}h ${String(minutes).padStart(2, "0")}m ${String(seconds).padStart(2, "0")}s\n${pt ? "desde 30.07.2026" : "since 30.07.2026"}`, "accent");
  };
  const execute = async (raw: string) => {
    const cmd = raw.trim().toLowerCase();
    setLines((old) => [...old, { kind: "input", text: `visitor@vl:~ $ ${raw}` }]);
    if (!cmd) return;
    if (cmd !== "coinflip" && cmd !== "moeda") { if (coinTimer.current) window.clearTimeout(coinTimer.current); if (coinHideTimer.current) window.clearTimeout(coinHideTimer.current); setCoin("idle"); }
    const messageCommand = raw.trim().match(/^msg:\s*"([\s\S]*)"$/i);
    if (messageCommand) { await saveMessage(messageCommand[1]); return; }
    if (cmd === "clear" || cmd === "limpar") { setLines([]); setMatrix(false); setEasterEggOpen(false); setMuseum(false); return; }
    if (cmd === "exit" || cmd === "sair") { onNavigate("about"); return; }
    if (cmd === "help" || cmd === "ajuda") output(pt ? "cv  uptime  museu  entropy  registro  coinflip  matrix  horoscopo  verdade  inteligencias  vico  camaco  easteregg  stack  clear  exit\n\nAlguns comandos não estão documentados." : "cv  uptime  museum  entropy  registry  coinflip  matrix  horoscope  truth  intelligences  vico  camaco  easteregg  stack  clear  exit\n\nSome commands are undocumented.");
    else if (cmd === "cv") showCv();
    else if (cmd === "uptime") showUptime();
    else if (cmd === "museu" || cmd === "museum") { output(pt ? "Abrindo uma versão da internet que se recusou a morrer…" : "Opening a version of the internet that refused to die…", "accent"); setMuseum(true); }
    else if (cmd === "entropy" || cmd === "entropia") { const entropy = (crypto.getRandomValues(new Uint32Array(1))[0] / 4294967295 * 100).toFixed(6); output(`${pt ? "entropia da sessão" : "session entropy"}: ${entropy}%\nseed: ${Date.now().toString(36).toUpperCase()}\n${pt ? "Esta saída nunca existirá exatamente assim outra vez." : "This exact output will never exist again."}`, "accent"); }
    else if (cmd === "registro" || cmd === "registry" || cmd === "visitors" || cmd === "visitantes") await showRegistry();
    else if (cmd === "coinflip" || cmd === "moeda") { if (coinTimer.current) window.clearTimeout(coinTimer.current); if (coinHideTimer.current) window.clearTimeout(coinHideTimer.current); setCoin("flipping"); output(pt ? "Lançando moeda…" : "Flipping coin…"); coinTimer.current = window.setTimeout(() => { setCoin("heads"); output(pt ? "CARA." : "HEADS.", "accent"); coinHideTimer.current = window.setTimeout(() => setCoin("idle"), 1100); }, 900); }
    else if (cmd === "matrix") { if (matrixTimer.current) window.clearTimeout(matrixTimer.current); setMatrix(true); output(pt ? "Acordando a matriz…" : "Waking the matrix…", "accent"); matrixTimer.current = window.setTimeout(() => { setMatrix(false); output(pt ? "Você continua aqui." : "You are still here."); }, 3000); }
    else if (cmd === "horoscopo" || cmd === "horoscope") { const list = horoscopes[lang]; output(`${pt ? "HORÓSCOPO COMPUTACIONAL" : "COMPUTATIONAL HOROSCOPE"}\n${list[Math.floor(Math.random() * list.length)]}`, "accent"); }
    else if (cmd === "verdade" || cmd === "truth") output("Cruzeiro é o maior de Minas.", "accent");
    else if (cmd === "inteligencias" || cmd === "inteligências" || cmd === "intelligences") { const song = randomInteligencia(); output(`INTELIGÊNCIAS\n${song.title} — ${song.artist}${song.note ? ` (${song.note})` : ""}`, "accent"); }
    else if (cmd === "vico") output(vicoAbout[lang], "accent");
    else if (cmd === "camaco" || cmd.startsWith("camaco ")) {
      const msg = raw.substring(6).trim();
      if (!msg) {
        output(pt ? "Guinlagem de Camaco: Dialeto itabirano\nDigite: camaco <mensagem> para traduzir." : "Guinlagem de Camaco: Itabira dialect that swaps consonants.\nType: camaco <message> to translate.", "accent");
      } else {
        const vowels = "aeiouyáéíóúãõâêôAEIOUYÁÉÍÓÚÃÕÂÊÔ";
        const regex = new RegExp(`([^${vowels}\\W\\d_]+)`, 'gi');
        const translated = msg.split(/(\s+)/).map(word => {
          if (!word.trim()) return word;
          const matches = [...word.matchAll(regex)];
          if (matches.length >= 2) {
            const c1 = matches[0][0];
            const c2 = matches[1][0];
            let r1 = c1; let r2 = c2;
            if (c1[0] === c1[0].toUpperCase()) { r2 = r2.charAt(0).toUpperCase() + r2.slice(1).toLowerCase(); r1 = r1.toLowerCase(); }
            const arr = word.split('');
            arr.splice(matches[1].index, c2.length, r1);
            arr.splice(matches[0].index, c1.length, r2);
            return arr.join('');
          }
          return word;
        }).join('');
        output(translated, "accent");
      }
    }
    else if (cmd === "stack" || cmd === "uses") output(`HARDWARE STACK\n\n- MacBook M4 Air\n- Desktop: RTX 5060, Ryzen 7, 32GB RAM`, "accent");
    else if (cmd === "easteregg") output(pt ? "NÃO É ASSIM QUE FUNCIONA UM EASTER EGG.\n\nNão digite: 404" : "THAT IS NOT HOW AN EASTER EGG WORKS.\n\nDon't type: 404", "accent");
    else if (cmd === "404") output(pt ? "404 — A PÁGINA NÃO EXISTE.\ntalvez essa fosse a ideia\n\nNão digite: ls" : "404 — THE PAGE DOES NOT EXIST.\nmaybe that was the ideia\n\nDon't type: ls", "accent");
    else if (cmd === "ls") output(pt ? "documentos/  downloads/  .nao-entre\n\nNão digite: cat .nao-entre" : "documentos/  downloads/  .nao-entre\n\nA file begins with a dot because it would rather not be seen.\nType: cat .nao-entre", "accent");
    else if (cmd === "cat .nao-entre") output(pt ? "Pq vc ainda insiste?\nNão Digite: cd pare" : "You ignored the file name. Good sign.\nThe next clue went down one floor.\n\nType: cd porao", "accent");
    else if (cmd === "cd pare") output(pt ? "Obedece retardado\nNão digite: sudo abrir" : "You entered the basement.\nThere is a door without a handle.\n\nType: sudo abrir", "accent");
    else if (cmd === "sudo abrir") output(pt ? "Não aguento mais, vc ganhou\npode ficar com o prêmio\n\nDigite: premio" : "[sudo] emotional permission granted.\nThe door opened one centimetre.\n\nType: open", "accent");
    else if (cmd === "premio") { output(pt ? "Parabéns" : "Congratulations!! You won a cupcake!", "accent"); setEasterEggOpen(true); }
    else if (cmd === "whoami" || cmd === "quem-sou") output(pt ? "Esse comando normalmente retorna um usuário. Você provavelmente esperava pouco demais dele." : "That command usually returns a username. You probably expected too little from it.");
    else if (cmd === "sudo") output(pt ? "Permissão negada. Você já tem controle suficiente." : "Permission denied. You already have enough control.");
    else if (cmd.includes("rm -rf")) output(pt ? "dúvida: não pode ser removida\ndúvida é necessária por 14 processos criativos" : "doubt: cannot be removed\ndoubt is required by 14 creative processes");
    else if (cmd === "meaning" || cmd === "sentido") output("42");
    else output(`${pt ? "comando não encontrado" : "command not found"}: ${cmd}\n${pt ? "Digite help — ou tente algo menos óbvio." : "Type help — or try something less obvious."}`);
  };
  const submit = (e: FormEvent) => { e.preventDefault(); void execute(value); if (value.trim()) { setHistory((h) => [...h, value]); setCursor(history.length + 1); } setValue(""); };
  return <div className="contentPage terminalPanel" aria-label="VL/OS terminal" onClick={() => input.current?.focus()}>
    <div className="terminalBody" ref={body}>
      {lines.map((line, i) => line.kind === "link" ? <a className="terminalRegistryLink" href={line.href} target="_blank" rel="noreferrer" key={i}>{line.text}</a> : <pre className={line.kind} key={i}>{line.text}</pre>)}
      {easterEggOpen && <figure className="terminalEasterEgg"><img src="/easteregg.jpg" alt={pt ? "Easter egg encontrado" : "Easter egg found"} /><figcaption>VIVICO.EXE</figcaption></figure>}
      {coin !== "idle" && <div className={`coinMachine ${coin}`} aria-live="polite"><span>{coin === "flipping" ? "?" : "CARA"}</span></div>}
      <form onSubmit={submit}><label htmlFor="terminal-input">visitor@vl:~ $</label><input id="terminal-input" ref={input} value={value} autoComplete="off" spellCheck={false} onChange={(e) => setValue(e.target.value)} onKeyDown={(e) => { if (e.key === "ArrowUp" && history.length) { e.preventDefault(); const next = Math.max(0, cursor - 1); setCursor(next); setValue(history[next] ?? ""); } if (e.key === "ArrowDown") { e.preventDefault(); const next = Math.min(history.length, cursor + 1); setCursor(next); setValue(history[next] ?? ""); } if (e.key === "Tab") { e.preventDefault(); const commands = ["help", "cv", "uptime", "museu", "entropy", "registro", "coinflip", "matrix", "horoscopo", "verdade", "inteligencias", "vico", "camaco", "oçarao-ao-pento", "easteregg", "stack", "clear", "exit"]; const match = commands.find((c) => c.startsWith(value.toLowerCase())); if (match) setValue(match); } if (e.key === "c" && e.ctrlKey) { e.preventDefault(); output("^C"); setValue(""); } }} /></form>
    </div>
    {matrix && <div className="matrixRain" aria-hidden="true">{matrixColumns.map((column, index) => <span key={index} style={{ left: `${index * 8.5}%`, animationDelay: `${-((index % 5) * .38)}s` }}>{column}</span>)}</div>}
    {museum && <div className="museumMode" role="dialog" aria-modal="true" aria-label={pt ? "Museu da internet" : "Internet museum"} onClick={(event) => event.stopPropagation()}>
      <div className="museumWindow win7Window">
        <header className="museumTitlebar win7Titlebar">
          <div className="win7Tabs">
            <button className={museumTab === "facebook" ? "active" : ""} onClick={() => setMuseumTab("facebook")}>
              F
              Facebook
            </button>
            <button className={museumTab === "clubpenguin" ? "active" : ""} onClick={() => setMuseumTab("clubpenguin")}>
              🐧 Club Penguin
            </button>
            <button className={museumTab === "habbo" ? "active" : ""} onClick={() => setMuseumTab("habbo")}>
              🏨 Habbo
            </button>
          </div>
          <div className="win7Controls" aria-hidden="true">
            <i>_</i><i>□</i><i className="win7Close" onClick={() => setMuseum(false)}>×</i>
          </div>
        </header>

        <div className="win7Toolbar">
          <div className="win7Nav">
            <button className="win7Back">←</button>
            <button className="win7Forward">→</button>
            <button className="win7Reload">↻</button>
          </div>
          <div className="win7AddressBar">
            <span className="win7Url">
              {museumTab === "facebook" && "https://www.facebook.com/"}
              {museumTab === "clubpenguin" && "http://play.clubpenguin.com/"}
              {museumTab === "habbo" && "http://www.habbo.com.br/"}
            </span>
          </div>
        </div>

        <main className="museumPage win7Page">
          {museumTab === "facebook" && (
            <img src="/museum/facebook.png" alt="Facebook 2012" style={{ width: "100%", display: "block" }} />
          )}

          {museumTab === "clubpenguin" && (
            <img src="/museum/clubpenguin.jpg" alt="Club Penguin" style={{ width: "100%", display: "block" }} />
          )}

          {museumTab === "habbo" && (
            <img src="/museum/habbo.png" alt="Habbo Hotel" style={{ width: "100%", display: "block" }} />
          )}
        </main>
      </div>

      <button className="museumExit" type="button" onClick={() => setMuseum(false)}>{pt ? "VOLTAR PARA 2026" : "BACK TO 2026"} ×</button>
    </div>}
    <div className="terminalHint">TAB: autocomplete · ↑↓: history · CTRL+C: interrupt</div>
  </div>;
}
