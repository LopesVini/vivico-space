import type { Lang } from "../../lib/i18n";

export default function SystemLog({ lang }: { lang: Lang }) {
  const pt = lang === "pt";
  return <div className="contentPage systemLogPage">
    <div className="logShell">
      <header className="logIntro"><p>CHANGELOG / PUBLIC RECORD</p><h2>{pt ? "O histórico deste lugar." : "The history of this place."}</h2><span>{pt ? "Cada versão registra o que mudou — e por quê." : "Each version records what changed — and why."}</span></header>
      <article className="version"><div><strong>v1.2.0</strong><time>30.07.2026</time></div><section><h3>THE WALL</h3><p>+ {pt ? "mural público: uma pessoa, uma foto" : "public wall: one person, one photo"}</p><p>+ {pt ? "apagamento coletivo por 15 marcações" : "collective removal after 15 marks"}</p><p>+ {pt ? "proteções discretas contra automação e repetição" : "quiet safeguards against automation and repetition"}</p><p>+ {pt ? "nova foto cobre a anterior" : "a new photo covers the previous one"}</p><blockquote>{pt ? "Um muro branco não permanece neutro por muito tempo." : "A blank wall does not stay neutral for long."}</blockquote></section></article>
      <article className="version"><div><strong>v1.1.0</strong><time>29.07.2026</time></div><section><h3>SECOND LAYER</h3><p>+ {pt ? "adicionado um terminal experimental" : "added an experimental terminal"}</p><p>+ Signal, Entropy & Rabbit Hole</p><p>+ {pt ? "registro público e voluntário de visitantes" : "public, voluntary visitor log"}</p><p>+ PT / EN</p><blockquote>{pt ? "A superfície continuou calma. O subsolo ficou vivo." : "The surface stayed quiet. The underground came alive."}</blockquote></section></article>
      <article className="version"><div><strong>v1.0.0</strong><time>29.07.2026</time></div><section><h3>FIRST SIGNAL</h3><p>+ {pt ? "coloquei este lugar online" : "put this place online"}</p><p>+ {pt ? "comecei a contar a vida em tempo real" : "started counting life in real time"}</p><p>+ {pt ? "registrei algumas coisas importantes" : "recorded a few things that matter"}</p><blockquote>{pt ? "Parei de esperar que estivesse perfeito." : "Stopped waiting for it to be perfect."}</blockquote></section></article>
    </div>
  </div>;
}
