"use client";
/* The terminal reveals a static local photograph as part of the easter egg. */
/* eslint-disable @next/next/no-img-element */
import { FormEvent, useEffect, useRef, useState } from "react";
import type { Lang } from "../../lib/i18n";
import { randomInteligencia } from "../../lib/inteligencias";

type Line = { kind: "input" | "output" | "accent" | "link"; text: string; href?: string };
type Visitor = { instagram: string; firstSeenAt: string; message: string | null };
type Identity = { instagram: string; token: string };
const signals = {
  pt: ["Nem tudo que é útil precisa escalar.", "Curiosidade é uma forma de resistência.", "Algumas ideias só aparecem quando ninguém está medindo o resultado."],
  en: ["Not everything useful needs to scale.", "Curiosity is a form of resistance.", "Some ideas only appear when nobody is measuring the outcome."],
};
const holes = [
  { title: "The Library of Babel", url: "https://libraryofbabel.info/", risk: "17–∞ min" },
  { title: "Radio Garden", url: "https://radio.garden/", risk: "24 min" },
  { title: "Internet Archive — Software Library", url: "https://archive.org/details/softwarelibrary", risk: "46 min" },
];
const horoscopes = {
  pt: ["Hoje você vai abrir uma aba e esquecer por quê.", "Mercúrio recomenda não responder imediatamente.", "Uma coincidência pequena vai parecer importante. Talvez seja.", "Evite decisões permanentes depois das 02:00.", "Seu melhor argumento hoje será uma pergunta.", "Uma mensagem antiga vai encontrar você no momento errado.", "Seu signo pede que você deixe uma coisa pela metade — de propósito.", "Não confunda pressa com intuição hoje.", "Alguém vai dizer uma palavra que você estava procurando há dias.", "O universo aprovou a ideia, mas ainda não revisou o orçamento.", "Seu próximo desvio de rota será mais honesto que o plano original.", "Há uma resposta escondida no caminho que você faz sem pensar."],
  en: ["Today you will open a tab and forget why.", "Mercury recommends not replying immediately.", "A small coincidence will feel important. Maybe it is.", "Avoid permanent decisions after 2 AM.", "Your best argument today will be a question.", "An old message will find you at the wrong moment.", "Your sign asks you to leave one thing unfinished — on purpose.", "Do not mistake urgency for intuition today.", "Someone will say a word you have been looking for all week.", "The universe approved the idea but has not reviewed the budget.", "Your next detour will be more honest than the original plan.", "There is an answer hidden in the route you take without thinking."],
};
const oracles = {
  pt: ["Você já decidiu; está procurando permissão.", "Espere até amanhã, mas não muito além disso.", "A resposta curta é não. A interessante é talvez.", "Faça a pergunta novamente sem medo dentro dela.", "O risco parece maior porque você está parado.", "Não procure um sinal se você já reconhece a porta.", "A versão mais simples da resposta ainda é uma resposta.", "O que você chama de atraso talvez esteja protegendo alguma coisa.", "Volte ao começo, mas leve a pessoa que você é agora.", "Você não precisa explicar tudo para seguir em frente.", "A escolha certa raramente chega fazendo barulho.", "A dúvida não está pedindo solução; está pedindo companhia."],
  en: ["You have already decided; you are looking for permission.", "Wait until tomorrow, but not much longer.", "The short answer is no. The interesting one is maybe.", "Ask again without fear inside the question.", "The risk looks bigger because you are standing still.", "Do not look for a sign if you already recognize the door.", "The simplest version of the answer is still an answer.", "What you call delay may be protecting something.", "Return to the beginning, but bring who you are now.", "You do not need to explain everything to move forward.", "The right choice rarely arrives making noise.", "Doubt is not asking for a solution; it is asking for company."],
};
const dreams = {
  pt: ["Você sonhou com uma estação onde nenhum trem parava.", "Uma porta conhecida abriu para uma casa que nunca existiu.", "Seu telefone tocava debaixo d’água. Você atendeu.", "Belo Horizonte estava vazia, exceto por uma luz acesa.", "Alguém devolveu uma memória que não era sua.", "Você encontrou uma rua que só aparecia quando chovia.", "No sonho, todas as placas apontavam para ontem.", "Uma música tocava de outro cômodo, mas o apartamento era seu.", "Você guardou uma chave no bolso e acordou procurando a fechadura.", "O elevador parou entre dois andares e alguém disse seu nome.", "Você viu seu reflexo chegando alguns segundos atrasado.", "Havia um mapa dobrado dentro de um livro que você nunca leu."],
  en: ["You dreamed of a station where no train stopped.", "A familiar door opened into a house that never existed.", "Your phone rang underwater. You answered.", "Belo Horizonte was empty except for one light.", "Someone returned a memory that was not yours.", "You found a street that only appeared when it rained.", "In the dream, every sign pointed to yesterday.", "Music played from another room, but the apartment was yours.", "You put a key in your pocket and woke up looking for its lock.", "The elevator stopped between floors and someone said your name.", "You saw your reflection arriving a few seconds late.", "There was a folded map inside a book you had never read."],
};
const vicoAbout = {
  pt: "VICO / ABOUT ME\nminha vó me chama de vivico\ntentando aprender matemática.\nlinux e mac.\n\nlista de presentes:\ncaixa de Stella (latão)\ntwix\nkfc\ngoiaba",
  en: "VICO / ABOUT ME\nmy grandma calls me vivico\ntrying to learn mathematics.\nlinux and mac.\n\ngift list:\na case of Stella cans\ntwix\nkfc\nguava",
};
const matrixColumns = ["ﾊ\nﾐ\nﾋ\nｰ\nｳ\nｼ\nﾅ\nﾓ\nﾆ\nｻ", "0\n1\nｱ\nｷ\n7\nﾎ\nﾗ\n9\nﾏ\n3", "ﾇ\nﾌ\n2\nｵ\nﾔ\n5\nｾ\nﾜ\n8\nｶ", "1\nﾘ\nﾈ\n4\nﾃ\nｸ\n0\nﾑ\nｿ\n6", "ｴ\n3\nﾁ\nﾄ\n9\nｹ\nﾒ\n1\nﾕ\nﾍ", "7\nﾊ\n0\nｼ\nﾝ\n4\nﾆ\nﾐ\n2\nｱ", "ﾎ\n5\nﾜ\nﾅ\n8\nｻ\nﾌ\n0\nﾓ\nｷ", "2\nﾔ\nﾃ\n6\nｸ\nﾏ\n1\nﾇ\nｵ\n9", "ｾ\n4\nﾘ\nﾑ\n0\nﾁ\n7\nﾈ\nｶ\nﾄ", "8\nﾕ\nｴ\n3\nﾍ\nﾗ\n5\nｹ\nﾒ\n1", "ﾝ\n6\nﾐ\nﾆ\n2\nﾊ\nｼ\n0\nﾎ\nﾜ", "1\nｷ\nﾌ\n7\nﾓ\nﾅ\n4\nｱ\nｻ\n9"];

export default function Terminal({ lang, onNavigate }: { lang: Lang; onNavigate: (page: "about") => void }) {
  const pt = lang === "pt";
  const [lines, setLines] = useState<Line[]>([{ kind: "accent", text: "VL/OS 0.1 — connection established" }, { kind: "output", text: pt ? "Este sistema recompensa curiosidade. Digite help." : "This system rewards curiosity. Type help." }]);
  const [value, setValue] = useState(""); const [history, setHistory] = useState<string[]>([]); const [cursor, setCursor] = useState(0);
  const [identity] = useState<Identity | null>(() => { try { const stored = typeof window === "undefined" ? null : window.localStorage.getItem("vl-visitor"); return stored ? JSON.parse(stored) as Identity : null; } catch { return null; } }); const [coin, setCoin] = useState<"idle" | "flipping" | "heads">("idle"); const [matrix, setMatrix] = useState(false); const [easterEggOpen, setEasterEggOpen] = useState(false);
  const input = useRef<HTMLInputElement>(null); const body = useRef<HTMLDivElement>(null); const coinTimer = useRef<number | null>(null); const coinHideTimer = useRef<number | null>(null); const matrixTimer = useRef<number | null>(null);
  useEffect(() => input.current?.focus(), []);
  useEffect(() => () => { if (coinTimer.current) window.clearTimeout(coinTimer.current); if (coinHideTimer.current) window.clearTimeout(coinHideTimer.current); if (matrixTimer.current) window.clearTimeout(matrixTimer.current); }, []);
  useEffect(() => body.current?.scrollTo({ top: body.current.scrollHeight, behavior: "smooth" }), [lines, coin, easterEggOpen]);

  const output = (text: string, kind: Line["kind"] = "output") => setLines((old) => [...old, { kind, text }]);
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
  const execute = async (raw: string) => {
    const cmd = raw.trim().toLowerCase();
    setLines((old) => [...old, { kind: "input", text: `visitor@vl:~ $ ${raw}` }]);
    if (!cmd) return;
    if (cmd !== "coinflip" && cmd !== "moeda") { if (coinTimer.current) window.clearTimeout(coinTimer.current); if (coinHideTimer.current) window.clearTimeout(coinHideTimer.current); setCoin("idle"); }
    const messageCommand = raw.trim().match(/^msg:\s*"([\s\S]*)"$/i);
    if (messageCommand) { await saveMessage(messageCommand[1]); return; }
    if (cmd === "clear" || cmd === "limpar") { setLines([]); setMatrix(false); setEasterEggOpen(false); return; }
    if (cmd === "exit" || cmd === "sair") { onNavigate("about"); return; }
    if (cmd === "help" || cmd === "ajuda") output(pt ? "signal  entropy  rabbit-hole  registro  coinflip  matrix  horoscopo  oraculo  sonho  verdade  inteligencias  vico  easteregg  clear  exit\n\nAlguns comandos não estão documentados." : "signal  entropy  rabbit-hole  registry  coinflip  matrix  horoscope  oracle  dream  truth  intelligences  vico  easteregg  clear  exit\n\nSome commands are undocumented.");
    else if (cmd === "signal" || cmd === "sinal") { const list = signals[lang]; output(`SIGNAL ${String(Math.floor(Math.random() * 9999)).padStart(4, "0")}\norigin: belo horizonte\n\n“${list[Math.floor(Math.random() * list.length)]}”`, "accent"); }
    else if (cmd === "entropy" || cmd === "entropia") { const entropy = (crypto.getRandomValues(new Uint32Array(1))[0] / 4294967295 * 100).toFixed(6); output(`${pt ? "entropia da sessão" : "session entropy"}: ${entropy}%\nseed: ${Date.now().toString(36).toUpperCase()}\n${pt ? "Esta saída nunca existirá exatamente assim outra vez." : "This exact output will never exist again."}`, "accent"); }
    else if (cmd === "rabbit-hole" || cmd === "toca") { const hole = holes[Math.floor(Math.random() * holes.length)]; output(`${pt ? "destino selecionado" : "destination selected"}: ${hole.title}\n${pt ? "risco" : "risk"}: ${pt ? "perder aproximadamente" : "losing approximately"} ${hole.risk}\n${hole.url}`, "accent"); }
    else if (cmd === "registro" || cmd === "registry" || cmd === "visitors" || cmd === "visitantes") await showRegistry();
    else if (cmd === "coinflip" || cmd === "moeda") { if (coinTimer.current) window.clearTimeout(coinTimer.current); if (coinHideTimer.current) window.clearTimeout(coinHideTimer.current); setCoin("flipping"); output(pt ? "Lançando moeda…" : "Flipping coin…"); coinTimer.current = window.setTimeout(() => { setCoin("heads"); output(pt ? "CARA." : "HEADS.", "accent"); coinHideTimer.current = window.setTimeout(() => setCoin("idle"), 1100); }, 900); }
    else if (cmd === "matrix") { if (matrixTimer.current) window.clearTimeout(matrixTimer.current); setMatrix(true); output(pt ? "Acordando a matriz…" : "Waking the matrix…", "accent"); matrixTimer.current = window.setTimeout(() => { setMatrix(false); output(pt ? "Você continua aqui." : "You are still here."); }, 3000); }
    else if (cmd === "horoscopo" || cmd === "horoscope") { const list = horoscopes[lang]; output(`${pt ? "HORÓSCOPO COMPUTACIONAL" : "COMPUTATIONAL HOROSCOPE"}\n${list[Math.floor(Math.random() * list.length)]}`, "accent"); }
    else if (cmd === "oraculo" || cmd === "oracle" || cmd.startsWith("oraculo ") || cmd.startsWith("oracle ")) { const list = oracles[lang]; output(`${pt ? "ORÁCULO" : "ORACLE"}\n${list[Math.floor(Math.random() * list.length)]}`, "accent"); }
    else if (cmd === "sonho" || cmd === "dream") { const list = dreams[lang]; output(`${pt ? "SONHO RECUPERADO" : "RECOVERED DREAM"}\n${list[Math.floor(Math.random() * list.length)]}`, "accent"); }
    else if (cmd === "verdade" || cmd === "truth") output("Cruzeiro é o maior de Minas.", "accent");
    else if (cmd === "inteligencias" || cmd === "inteligências" || cmd === "intelligences") { const song = randomInteligencia(); output(`INTELIGÊNCIAS\n${song.title} — ${song.artist}${song.note ? ` (${song.note})` : ""}`, "accent"); }
    else if (cmd === "vico") output(vicoAbout[lang], "accent");
    else if (cmd === "easteregg") output(pt ? "NÃO É ASSIM QUE FUNCIONA UM EASTER EGG.\n\nDigite: 404" : "THAT IS NOT HOW AN EASTER EGG WORKS.\n\nType: 404", "accent");
    else if (cmd === "404") output(pt ? "404 — A PÁGINA NÃO EXISTE.\nMas alguma coisa ficou para trás.\n\nDigite: ls" : "404 — THE PAGE DOES NOT EXIST.\nBut something was left behind.\n\nType: ls", "accent");
    else if (cmd === "ls") output(pt ? "memorias/  sistema/  .nao-toque\n\nUm arquivo começa com ponto porque prefere não ser visto.\nDigite: cat .nao-toque" : "memories/  system/  .nao-toque\n\nA file begins with a dot because it would rather not be seen.\nType: cat .nao-toque", "accent");
    else if (cmd === "cat .nao-toque") output(pt ? "Você ignorou o nome do arquivo. Bom sinal.\nA próxima pista desceu um andar.\n\nDigite: cd porao" : "You ignored the file name. Good sign.\nThe next clue went down one floor.\n\nType: cd porao", "accent");
    else if (cmd === "cd porao") output(pt ? "Você entrou no porão.\nHá uma porta sem maçaneta.\n\nDigite: sudo abrir porta" : "You entered the basement.\nThere is a door without a handle.\n\nType: sudo abrir porta", "accent");
    else if (cmd === "sudo abrir porta") output(pt ? "[sudo] permissão emocional concedida.\nA porta abriu um centímetro.\n\nDigite: abra" : "[sudo] emotional permission granted.\nThe door opened one centimetre.\n\nType: abra", "accent");
    else if (cmd === "abra") { output(pt ? "EASTER EGG ENCONTRADO." : "EASTER EGG FOUND.", "accent"); setEasterEggOpen(true); }
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
      <form onSubmit={submit}><label htmlFor="terminal-input">visitor@vl:~ $</label><input id="terminal-input" ref={input} value={value} autoComplete="off" spellCheck={false} onChange={(e) => setValue(e.target.value)} onKeyDown={(e) => { if (e.key === "ArrowUp" && history.length) { e.preventDefault(); const next = Math.max(0, cursor - 1); setCursor(next); setValue(history[next] ?? ""); } if (e.key === "ArrowDown") { e.preventDefault(); const next = Math.min(history.length, cursor + 1); setCursor(next); setValue(history[next] ?? ""); } if (e.key === "Tab") { e.preventDefault(); const commands = ["help", "signal", "entropy", "rabbit-hole", "registro", "coinflip", "matrix", "horoscopo", "oraculo", "sonho", "verdade", "inteligencias", "vico", "easteregg", "clear", "exit"]; const match = commands.find((c) => c.startsWith(value.toLowerCase())); if (match) setValue(match); } if (e.key === "c" && e.ctrlKey) { e.preventDefault(); output("^C"); setValue(""); } }} /></form>
    </div>
    {matrix && <div className="matrixRain" aria-hidden="true">{matrixColumns.map((column, index) => <span key={index} style={{ left: `${index * 8.5}%`, animationDelay: `${-((index % 5) * .38)}s` }}>{column}</span>)}</div>}
    <div className="terminalHint">TAB: autocomplete · ↑↓: history · CTRL+C: interrupt</div>
  </div>;
}
