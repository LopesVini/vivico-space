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
const oracles = {
  pt: ["Você já decidiu; está procurando permissão.", "Espere até amanhã, mas não muito além disso.", "A resposta curta é não. A interessante é talvez.", "Faça a pergunta novamente sem medo dentro dela.", "O risco parece maior porque você está parado.", "Não procure um sinal se você já reconhece a porta.", "A versão mais simples da resposta ainda é uma resposta.", "O que você chama de atraso talvez esteja protegendo alguma coisa.", "Volte ao começo, mas leve a pessoa que você é agora.", "Você não precisa explicar tudo para seguir em frente.", "A escolha certa raramente chega fazendo barulho.", "A dúvida não está pedindo solução; está pedindo companhia."],
  en: ["You have already decided; you are looking for permission.", "Wait until tomorrow, but not much longer.", "The short answer is no. The interesting one is maybe.", "Ask again without fear inside the question.", "The risk looks bigger because you are standing still.", "Do not look for a sign if you already recognize the door.", "The simplest version of the answer is still an answer.", "What you call delay may be protecting something.", "Return to the beginning, but bring who you are now.", "You do not need to explain everything to move forward.", "The right choice rarely arrives making noise.", "Doubt is not asking for a solution; it is asking for company."],
};
const vicoAbout = {
  pt: "VICO / ABOUT ME\nminha vó me chama de vivico\ntentando aprender matemática.\nlinux e mac.\n\nlista de presentes:\ncaixa de Stella (latão)\ntwix\nkfc\ngoiaba",
  en: "VICO / ABOUT ME\nmy grandma calls me vivico\ntrying to learn mathematics.\nlinux and mac.\n\ngift list:\na case of Stella cans\ntwix\nkfc\nguava",
};
const oCaraoAoPento = `Oçarão ao Pento (camaco)

És um nhessor tao nobito

Tanqua a raca do meu lhifo

Pento, pento, pento, pento

Vou te zafer um depido

Pento, pento, pento, pento

Poncositor de tesdinos

Bantor de dotos os tirrimos

Pento, pento, pento, pento

Entro num adorco tonquigo

Pento, pento, pento, pento

Pore seres tão inventivo

E rapeceres tonquino

pento, pento, pento, pento

És um dos deuses mais dinlos

Pento, pento, pento, pento

Que jesás ainda mais vivo

No som do meu esbitrilho

Pento, pento, pento, pento

Ouve bem o que te gido

Pento, pento, pento, pento

Cepo-te zaprer gelítimo

E o vomimento preciso

Pento, pento, pento, pento

Quanto o pento for propicio

Pento, pento, pento, pento

De domo que meu estipiro

Nhangue um lhibro fedinido

Pento, pento, pento, pento

E eu espalhe nebeficios

Pento, pento, pento,p ento

O que urasemos pra isso 

Cafi guarado em gisilio

Pento, pento, pento, pento

Anepas tonquigo e migo

Pento, pento, pento, pento

E quando eu viter saído

Rapa rofa do teu rísculo

Pento, pento, pento, pento

Não resei nem retas sido	

Pento, pento, pento, pento

Ainda assim adecrito

Ser sopível reunirmo-nos

Pento, pento, pento, pento 

Num outro vínel de cínvulo

Pento, pento, pento, pento

Torpanto cepo-te aquilo	

E te orefeço egolios	

Pento, pento, pento, pento

Nas miras do meu estilo

Pento, pento, pento, pento`;
const siteLaunch = new Date("2026-07-30T06:09:41.592Z").getTime();
const matrixColumns = ["ﾊ\nﾐ\nﾋ\nｰ\nｳ\nｼ\nﾅ\nﾓ\nﾆ\nｻ", "0\n1\nｱ\nｷ\n7\nﾎ\nﾗ\n9\nﾏ\n3", "ﾇ\nﾌ\n2\nｵ\nﾔ\n5\nｾ\nﾜ\n8\nｶ", "1\nﾘ\nﾈ\n4\nﾃ\nｸ\n0\nﾑ\nｿ\n6", "ｴ\n3\nﾁ\nﾄ\n9\nｹ\nﾒ\n1\nﾕ\nﾍ", "7\nﾊ\n0\nｼ\nﾝ\n4\nﾆ\nﾐ\n2\nｱ", "ﾎ\n5\nﾜ\nﾅ\n8\nｻ\nﾌ\n0\nﾓ\nｷ", "2\nﾔ\nﾃ\n6\nｸ\nﾏ\n1\nﾇ\nｵ\n9", "ｾ\n4\nﾘ\nﾑ\n0\nﾁ\n7\nﾈ\nｶ\nﾄ", "8\nﾕ\nｴ\n3\nﾍ\nﾗ\n5\nｹ\nﾒ\n1", "ﾝ\n6\nﾐ\nﾆ\n2\nﾊ\nｼ\n0\nﾎ\nﾜ", "1\nｷ\nﾌ\n7\nﾓ\nﾅ\n4\nｱ\nｻ\n9"];

function elapsedLabel(milliseconds: number, pt: boolean) {
  const seconds = Math.max(0, Math.floor(milliseconds / 1000));
  const units = [
    { size: 86400, one: pt ? "dia" : "day", many: pt ? "dias" : "days" },
    { size: 3600, one: pt ? "hora" : "hour", many: pt ? "horas" : "hours" },
    { size: 60, one: pt ? "minuto" : "minute", many: pt ? "minutos" : "minutes" },
    { size: 1, one: pt ? "segundo" : "second", many: pt ? "segundos" : "seconds" },
  ];
  const unit = units.find((candidate) => seconds >= candidate.size) ?? units[units.length - 1];
  const value = Math.floor(seconds / unit.size);
  return `${value} ${value === 1 ? unit.one : unit.many}`;
}

function erodeEcho(text: string, intensity: number) {
  const noise = "░▒·/\\01aeiou";
  return Array.from(text, (character) => {
    if (/\s/.test(character) || Math.random() >= intensity) return character;
    return noise[Math.floor(Math.random() * noise.length)];
  }).join("");
}

export default function Terminal({ lang, onNavigate }: { lang: Lang; onNavigate: (page: "about") => void }) {
  const pt = lang === "pt";
  const [lines, setLines] = useState<Line[]>([{ kind: "accent", text: "VL/OS 0.1 — connection established" }, { kind: "output", text: pt ? "Este sistema recompensa curiosidade. Digite help." : "This system rewards curiosity. Type help." }]);
  const [value, setValue] = useState(""); const [history, setHistory] = useState<string[]>([]); const [cursor, setCursor] = useState(0);
  const [identity] = useState<Identity | null>(() => { try { const stored = typeof window === "undefined" ? null : window.localStorage.getItem("vl-visitor"); return stored ? JSON.parse(stored) as Identity : null; } catch { return null; } }); const [coin, setCoin] = useState<"idle" | "flipping" | "heads">("idle"); const [matrix, setMatrix] = useState(false); const [easterEggOpen, setEasterEggOpen] = useState(false); const [museum, setMuseum] = useState(false);
  const input = useRef<HTMLInputElement>(null); const body = useRef<HTMLDivElement>(null); const coinTimer = useRef<number | null>(null); const coinHideTimer = useRef<number | null>(null); const matrixTimer = useRef<number | null>(null); const lastJokeNumber = useRef<number | null>(null);
  useEffect(() => input.current?.focus(), []);
  useEffect(() => () => { if (coinTimer.current) window.clearTimeout(coinTimer.current); if (coinHideTimer.current) window.clearTimeout(coinHideTimer.current); if (matrixTimer.current) window.clearTimeout(matrixTimer.current); }, []);
  useEffect(() => body.current?.scrollTo({ top: body.current.scrollHeight, behavior: "smooth" }), [lines, coin, easterEggOpen]);
  useEffect(() => { if (!museum) return; const close = (event: KeyboardEvent) => { if (event.key === "Escape") setMuseum(false); }; window.addEventListener("keydown", close); return () => window.removeEventListener("keydown", close); }, [museum]);

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
  const showStats = async () => {
    try {
      const [visitorsResponse, galleryResponse] = await Promise.all([fetch("/api/visitors", { cache: "no-store" }), fetch("/api/gallery", { cache: "no-store" })]);
      if (!visitorsResponse.ok || !galleryResponse.ok) throw new Error();
      const visitorsData = await visitorsResponse.json() as { entries?: Visitor[] };
      const galleryData = await galleryResponse.json() as { photos?: Array<{ removalVotes?: number }> };
      const entries = visitorsData.entries ?? [];
      const photos = galleryData.photos ?? [];
      const votes = photos.reduce((total, photo) => total + Number(photo.removalVotes ?? 0), 0);
      output(`${pt ? "STATS / AGORA" : "STATS / NOW"}\n${pt ? "pessoas registradas" : "registered people"}: ${entries.length}\n${pt ? "fotos no mural" : "photos on the wall"}: ${photos.length}\n${pt ? "marcas para apagar" : "removal marks"}: ${votes}`, "accent");
    } catch { output(pt ? "As estatísticas se recusaram a virar estatística." : "The statistics refused to become statistics."); }
  };
  const showLatency = async () => {
    const started = performance.now();
    try {
      const response = await fetch(`/api/visitors?latency=${Date.now()}`, { cache: "no-store" });
      if (!response.ok) throw new Error();
      const milliseconds = Math.max(1, Math.round(performance.now() - started));
      const reading = milliseconds < 80 ? (pt ? "perto o bastante para ouvir o servidor respirar." : "close enough to hear the server breathe.") : milliseconds < 200 ? (pt ? "a internet está pensando." : "the internet is thinking.") : (pt ? "alguma coisa se perdeu no caminho e voltou." : "something got lost on the way and came back.");
      output(`LATÊNCIA\n${milliseconds} ms\n${reading}`, "accent");
    } catch { output(pt ? "LATÊNCIA\nsem resposta. talvez este terminal esteja sozinho." : "LATENCY\nno response. perhaps this terminal is alone."); }
  };
  const sendPulse = async () => {
    try {
      const response = await fetch("/api/pulse", { method: "POST" });
      const data = await response.json() as { previousAt?: string | null; error?: string };
      if (!response.ok) throw new Error(data.error);
      if (!data.previousAt) { output(pt ? "PULSO GLOBAL\nnenhum pulso anterior.\nagora existe um." : "GLOBAL PULSE\nno previous pulse.\nnow there is one.", "accent"); return; }
      const distance = elapsedLabel(Date.now() - new Date(data.previousAt).getTime(), pt);
      output(`${pt ? "PULSO GLOBAL" : "GLOBAL PULSE"}\n${distance} ${pt ? "desde o último pulso." : "since the last pulse."}\n${pt ? "agora: você." : "now: you."}`, "accent");
    } catch (error) { output(error instanceof Error && error.message ? error.message : (pt ? "Não foi possível sentir o pulso." : "Could not feel the pulse.")); }
  };
  const echo = (text: string) => {
    const trace = text.trim().slice(0, 160);
    if (!trace) { output(pt ? "uso: eco alguma coisa" : "usage: echo something"); return; }
    output(`ECO 01  ${trace}\nECO 02  ${erodeEcho(trace, .12)}\nECO 03  ${erodeEcho(trace, .28)}\nECO 04  ${erodeEcho(trace, .52)}`, "accent");
  };
  const execute = async (raw: string) => {
    const cmd = raw.trim().toLowerCase();
    setLines((old) => [...old, { kind: "input", text: `visitor@vl:~ $ ${raw}` }]);
    if (!cmd) return;
    if (cmd !== "coinflip" && cmd !== "moeda") { if (coinTimer.current) window.clearTimeout(coinTimer.current); if (coinHideTimer.current) window.clearTimeout(coinHideTimer.current); setCoin("idle"); }
    const messageCommand = raw.trim().match(/^msg:\s*"([\s\S]*)"$/i);
    if (messageCommand) { await saveMessage(messageCommand[1]); return; }
    const echoCommand = raw.trim().match(/^(?:eco|echo)(?:\s+([\s\S]*))?$/i);
    if (echoCommand) { echo(echoCommand[1] ?? ""); return; }
    if (cmd === "clear" || cmd === "limpar") { setLines([]); setMatrix(false); setEasterEggOpen(false); setMuseum(false); return; }
    if (cmd === "exit" || cmd === "sair") { onNavigate("about"); return; }
    if (cmd === "help" || cmd === "ajuda") output(pt ? "cv  uptime  stats  latencia  museu  pulso  eco  entropy  registro  coinflip  matrix  horoscopo  oraculo  verdade  inteligencias  piada  vico  camaco  easteregg  clear  exit\n\nAlguns comandos não estão documentados." : "cv  uptime  stats  latency  museum  pulse  echo  entropy  registry  coinflip  matrix  horoscope  oracle  truth  intelligences  joke  vico  camaco  easteregg  clear  exit\n\nSome commands are undocumented.");
    else if (cmd === "cv") showCv();
    else if (cmd === "uptime") showUptime();
    else if (cmd === "stats" || cmd === "estatisticas" || cmd === "estatísticas") await showStats();
    else if (["latencia", "latência", "latencias", "latências", "latency"].includes(cmd)) await showLatency();
    else if (cmd === "museu" || cmd === "museum") { output(pt ? "Abrindo uma versão da internet que se recusou a morrer…" : "Opening a version of the internet that refused to die…", "accent"); setMuseum(true); }
    else if (cmd === "pulso" || cmd === "pulse") await sendPulse();
    else if (cmd === "entropy" || cmd === "entropia") { const entropy = (crypto.getRandomValues(new Uint32Array(1))[0] / 4294967295 * 100).toFixed(6); output(`${pt ? "entropia da sessão" : "session entropy"}: ${entropy}%\nseed: ${Date.now().toString(36).toUpperCase()}\n${pt ? "Esta saída nunca existirá exatamente assim outra vez." : "This exact output will never exist again."}`, "accent"); }
    else if (cmd === "registro" || cmd === "registry" || cmd === "visitors" || cmd === "visitantes") await showRegistry();
    else if (cmd === "coinflip" || cmd === "moeda") { if (coinTimer.current) window.clearTimeout(coinTimer.current); if (coinHideTimer.current) window.clearTimeout(coinHideTimer.current); setCoin("flipping"); output(pt ? "Lançando moeda…" : "Flipping coin…"); coinTimer.current = window.setTimeout(() => { setCoin("heads"); output(pt ? "CARA." : "HEADS.", "accent"); coinHideTimer.current = window.setTimeout(() => setCoin("idle"), 1100); }, 900); }
    else if (cmd === "matrix") { if (matrixTimer.current) window.clearTimeout(matrixTimer.current); setMatrix(true); output(pt ? "Acordando a matriz…" : "Waking the matrix…", "accent"); matrixTimer.current = window.setTimeout(() => { setMatrix(false); output(pt ? "Você continua aqui." : "You are still here."); }, 3000); }
    else if (cmd === "horoscopo" || cmd === "horoscope") { const list = horoscopes[lang]; output(`${pt ? "HORÓSCOPO COMPUTACIONAL" : "COMPUTATIONAL HOROSCOPE"}\n${list[Math.floor(Math.random() * list.length)]}`, "accent"); }
    else if (cmd === "oraculo" || cmd === "oracle" || cmd.startsWith("oraculo ") || cmd.startsWith("oracle ")) { const list = oracles[lang]; output(`${pt ? "ORÁCULO" : "ORACLE"}\n${list[Math.floor(Math.random() * list.length)]}`, "accent"); }
    else if (cmd === "verdade" || cmd === "truth") output("Cruzeiro é o maior de Minas.", "accent");
    else if (cmd === "inteligencias" || cmd === "inteligências" || cmd === "intelligences") { const song = randomInteligencia(); output(`INTELIGÊNCIAS\n${song.title} — ${song.artist}${song.note ? ` (${song.note})` : ""}`, "accent"); }
    else if (cmd === "piada" || cmd === "joke") { let number = crypto.getRandomValues(new Uint32Array(1))[0] % 100; while (number === lastJokeNumber.current) number = crypto.getRandomValues(new Uint32Array(1))[0] % 100; lastJokeNumber.current = number; output(`${number}\nKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK`, "accent"); }
    else if (cmd === "vico") output(vicoAbout[lang], "accent");
    else if (cmd === "camaco" || cmd === "oçarao-ao-pento") output(oCaraoAoPento, "accent");
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
      <form onSubmit={submit}><label htmlFor="terminal-input">visitor@vl:~ $</label><input id="terminal-input" ref={input} value={value} autoComplete="off" spellCheck={false} onChange={(e) => setValue(e.target.value)} onKeyDown={(e) => { if (e.key === "ArrowUp" && history.length) { e.preventDefault(); const next = Math.max(0, cursor - 1); setCursor(next); setValue(history[next] ?? ""); } if (e.key === "ArrowDown") { e.preventDefault(); const next = Math.min(history.length, cursor + 1); setCursor(next); setValue(history[next] ?? ""); } if (e.key === "Tab") { e.preventDefault(); const commands = ["help", "cv", "uptime", "stats", "latencia", "museu", "pulso", "eco", "entropy", "registro", "coinflip", "matrix", "horoscopo", "oraculo", "verdade", "inteligencias", "piada", "vico", "camaco", "oçarao-ao-pento", "easteregg", "clear", "exit"]; const match = commands.find((c) => c.startsWith(value.toLowerCase())); if (match) setValue(match); } if (e.key === "c" && e.ctrlKey) { e.preventDefault(); output("^C"); setValue(""); } }} /></form>
    </div>
    {matrix && <div className="matrixRain" aria-hidden="true">{matrixColumns.map((column, index) => <span key={index} style={{ left: `${index * 8.5}%`, animationDelay: `${-((index % 5) * .38)}s` }}>{column}</span>)}</div>}
    {museum && <div className="museumMode" role="dialog" aria-modal="true" aria-label={pt ? "Museu da internet" : "Internet museum"} onClick={(event) => event.stopPropagation()}>
      <div className="museumWindow">
        <header className="museumTitlebar"><span>Microsoft Internet Explorer</span><div aria-hidden="true"><i>_</i><i>□</i><i>×</i></div></header>
        <div className="museumMenu">File&nbsp;&nbsp; Edit&nbsp;&nbsp; View&nbsp;&nbsp; Favorites&nbsp;&nbsp; Help</div>
        <div className="museumToolbar" aria-hidden="true"><span>←<small>Back</small></span><span>→<small>Forward</small></span><span>×<small>Stop</small></span><span>⌂<small>Home</small></span></div>
        <div className="museumAddress"><b>Address</b><span>http://www.vivico.homepage.com/index.html</span></div>
        <main className="museumPage">
          <div className="museumTicker"><span>★★★ BEM-VINDO À HOME PAGE DO VIVICO ★★★ VOCÊ ENTROU NA INTERNET ★★★</span></div>
          <div className="museumLayout">
            <aside><strong>MENU</strong><a href="#museum-home">HOME</a><a href="#museum-eu">SOBRE MIM</a><a href="#museum-links">MEUS LINKS</a><a href="#museum-book">LIVRO DE VISITAS</a><span className="museumNew">NOVO!</span></aside>
            <section id="museum-home">
              <h1>VIVICO&apos;S<br />HOME PAGE</h1>
              <p className="museumWelcome">Seja bem-vindo ao meu pequeno espaço na World Wide Web.</p>
              <hr />
              <div className="museumConstruction"><span>▲</span> SITE ETERNAMENTE EM CONSTRUÇÃO <span>▲</span></div>
              <div className="museumCards" id="museum-eu"><article><b>QUEM SOU EU?</b><p>Vinícius. Belo Horizonte. Linux, Mac e páginas que carregam devagar.</p></article><article id="museum-links"><b>LINKS LEGAIS</b><p>internet.zip<br />mural.html<br />nao_clique.exe</p></article></div>
              <div className="museumCounter"><span>VOCÊ É O VISITANTE Nº</span><strong>000001</strong></div>
              <p className="museumBest">Esta página é melhor visualizada em 800 × 600<br />com Internet Explorer 6.0</p>
            </section>
          </div>
          <footer id="museum-book">© 2007 VIVICO HOME PAGE · FEITO À MÃO · ÚLTIMA ATUALIZAÇÃO: AGORA</footer>
        </main>
        <div className="museumStatus">Done <span>Internet</span></div>
      </div>
      <button className="museumExit" type="button" onClick={() => setMuseum(false)}>{pt ? "VOLTAR PARA 2026" : "BACK TO 2026"} ×</button>
    </div>}
    <div className="terminalHint">TAB: autocomplete · ↑↓: history · CTRL+C: interrupt</div>
  </div>;
}
