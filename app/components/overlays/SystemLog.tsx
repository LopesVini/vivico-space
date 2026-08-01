import type { Lang } from "../../lib/i18n";
import rawCommits from "../../lib/commits.json";

interface Commit {
  hash: string;
  fullHash: string;
  date: string;
  message: string;
}

const commits = (rawCommits as Commit[]).slice(0, 30);

function formatDate(dateStr: string) {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    return `${parts[2]}.${parts[1]}.${parts[0]}`;
  }
  return dateStr;
}

export default function SystemLog({ lang }: { lang: Lang }) {
  const pt = lang === "pt";

  return (
    <div className="contentPage systemLogPage">
      <div className="logShell">
        <header className="logIntro">
          <p>CHANGELOG / PUBLIC RECORD</p>
          <h2>{pt ? "O histórico deste lugar." : "The history of this place."}</h2>
          <span>{pt ? "Cada versão e commit registra o que mudou — e por quê." : "Each version and commit records what changed — and why."}</span>
        </header>

        {commits.map((c) => (
          <article className="version" key={c.fullHash || c.hash}>
            <div>
              <strong>commit {c.hash}</strong>
              <time>{formatDate(c.date)}</time>
            </div>
            <section>
              <h3>{c.message}</h3>
              <p>
                + <a href={`https://github.com/LopesVini/vivico-space/commit/${c.fullHash}`} target="_blank" rel="noreferrer" style={{ color: "inherit", textDecoration: "underline" }}>
                  {c.fullHash.substring(0, 7)}
                </a>
              </p>
              <blockquote>git commit</blockquote>
            </section>
          </article>
        ))}

        <article className="version"><div><strong>v1.3.0</strong><time>30.07.2026</time></div><section><h3>ZERO HOUR</h3><p>+ {pt ? "registros e mural reiniciados para a abertura" : "registry and wall reset for opening"}</p><p>+ {pt ? "a partir daqui, pessoas e fotos passam a fazer parte do arquivo público" : "from here on, people and photos become part of the public archive"}</p><p>+ vivico.space</p><blockquote>{pt ? "vivico.space na rede" : "vivico.space on the web"}</blockquote></section></article>
        <article className="version"><div><strong>v1.2.0</strong><time>30.07.2026</time></div><section><h3>THE WALL</h3><p>+ {pt ? "mural público: uma pessoa, uma foto" : "public wall: one person, one photo"}</p><p>+ {pt ? "apagamento coletivo por 15 marcações" : "collective removal after 15 marks"}</p><p>+ {pt ? "proteções discretas contra automação e repetição" : "quiet safeguards against automation and repetition"}</p><p>+ {pt ? "nova foto cobre a anterior" : "a new photo covers the previous one"}</p><blockquote>{pt ? "muro adicionado" : "wall added"}</blockquote></section></article>
        <article className="version"><div><strong>v1.1.0</strong><time>29.07.2026</time></div><section><h3>SECOND LAYER</h3><p>+ {pt ? "adicionado um terminal experimental" : "added an experimental terminal"}</p><p>+ Signal, Entropy & Rabbit Hole</p><p>+ {pt ? "registro público e voluntário de visitantes" : "public, voluntary visitor log"}</p><p>+ PT / EN</p><blockquote>{pt ? "Vou usar esse titulos como se fosse um commit kkk" : "Gonna use these titles as commits lol"}</blockquote></section></article>
        <article className="version"><div><strong>v1.0.0</strong><time>29.07.2026</time></div><section><h3>FIRST SIGNAL</h3><p>+ {pt ? "coloquei este lugar online" : "put this place online"}</p><p>+ {pt ? "comecei a contar a vida em tempo real" : "started counting life in real time"}</p><p>+ {pt ? "registrei algumas coisas importantes" : "recorded a few things that matter"}</p><blockquote>{pt ? "Delírio na madrugada" : "3 AM thoughts"}</blockquote></section></article>
      </div>
    </div>
  );
}

