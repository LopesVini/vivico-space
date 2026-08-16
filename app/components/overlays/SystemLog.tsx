import type { Lang } from "../../lib/i18n";

export default function SystemLog({ lang }: { lang: Lang }) {
  const pt = lang === "pt";

  return (
    <div className="contentPage systemLogPage">
      <div className="logShell">
        <header className="logIntro">
          <p>CHANGELOG / PUBLIC RECORD</p>
          <h2>{pt ? "System log" : "System log"}</h2>
          <span>{pt ? "Cada versão registra o que mudou — e por quê." : "Each version records what changed — and why."}</span>
        </header>

        <article className="version">
          <div>
            <strong>v1.6.0</strong>
            <time>01.08.2026</time>
          </div>
          <section>
            <h3>SYSTEM LOG &amp; POLISH</h3>
            <p>+ {pt ? "sistema de changelog integrado com o histórico" : "changelog system integrated with history"}</p>
            <p>+ {pt ? "ajustes e novas sequências no comando easteregg" : "adjustments and new sequences in easteregg command"}</p>
            <p>+ {pt ? "chave direta CSS OFF no menu de navegação" : "direct CSS OFF toggle in navigation bar"}</p>
            <blockquote>{pt ? "o tempo passa, a linha do tempo cresce" : "time passes, timeline grows"}</blockquote>
          </section>
        </article>

        <article className="version">
          <div>
            <strong>v1.5.0</strong>
            <time>01.08.2026</time>
          </div>
          <section>
            <h3>RETRO MUSEUM</h3>
            <p>+ {pt ? "museu da internet 2012-2013 em moldura Windows 7 Aero (Facebook, Club Penguin, Habbo)" : "2012-2013 internet museum in Windows 7 Aero frame (Facebook, Club Penguin, Habbo)"}</p>
            <p>+ {pt ? "otimização e adaptação para telas mobile" : "optimization and adaptation for mobile screens"}</p>
            <p>+ {pt ? "integração completa com a Command Palette (Cmd+K)" : "full integration with Command Palette (Cmd+K)"}</p>
            <blockquote>{pt ? "a internet de 2012 se recusou a morrer" : "the 2012 internet refused to die"}</blockquote>
          </section>
        </article>

        <article className="version">
          <div>
            <strong>v1.4.0</strong>
            <time>01.08.2026</time>
          </div>
          <section>
            <h3>CAMACO &amp; ZEN</h3>
            <p>+ {pt ? "tradutor de Guinlagem de Camaco (dialeto itabirano) no terminal" : "Guinlagem de Camaco translator (itabira dialect) in terminal"}</p>
            <p>+ {pt ? "modo Zen minimalista sem CSS" : "minimalist Zen mode without CSS"}</p>
            <blockquote>{pt ? "consoantes invertidas, ideias mantidas" : "swapped consonants, preserved ideas"}</blockquote>
          </section>
        </article>

        <article className="version">
          <div>
            <strong>v1.3.0</strong>
            <time>30.07.2026</time>
          </div>
          <section>
            <h3>BOOM</h3>
            <p>+ {pt ? "registros e mural reiniciados para a abertura" : "registry and wall reset for opening"}</p>
            <p>+ {pt ? "a partir daqui, pessoas e fotos passam a fazer parte do arquivo público" : "from here on, people and photos become part of the public archive"}</p>
            <p>+ vivico.space</p>
            <blockquote>{pt ? "vivico.space na rede" : "vivico.space on the web"}</blockquote>
          </section>
        </article>

        <article className="version">
          <div>
            <strong>v1.2.0</strong>
            <time>30.07.2026</time>
          </div>
          <section>
            <h3>THE WALL</h3>
            <p>+ {pt ? "mural público: uma pessoa, uma foto" : "public wall: one person, one photo"}</p>
            <p>+ {pt ? "apagamento coletivo por 15 marcações" : "collective removal after 15 marks"}</p>
            <p>+ {pt ? "proteções discretas contra automação e repetição" : "quiet safeguards against automation and repetition"}</p>
            <p>+ {pt ? "nova foto cobre a anterior" : "a new photo covers the previous one"}</p>
            <blockquote>{pt ? "muro adicionado" : "wall added"}</blockquote>
          </section>
        </article>

        <article className="version">
          <div>
            <strong>v1.1.0</strong>
            <time>29.07.2026</time>
          </div>
          <section>
            <h3>SECOND LAYER</h3>
            <p>+ {pt ? "adicionado um terminal experimental" : "added an experimental terminal"}</p>
            <p>+ Signal, Entropy &amp; Rabbit Hole</p>
            <p>+ {pt ? "registro público e voluntário de visitantes" : "public, voluntary visitor log"}</p>
            <p>+ PT / EN</p>
            <blockquote>{pt ? "Vou usar esse titulos como se fosse um commit kkk" : "Gonna use these titles as commits lol"}</blockquote>
          </section>
        </article>

        <article className="version">
          <div>
            <strong>v1.0.0</strong>
            <time>29.07.2026</time>
          </div>
          <section>
            <h3>BIG BANG</h3>
            <p>+ {pt ? "coloquei este lugar online" : "put this place online"}</p>
            <p>+ {pt ? "comecei a contar a vida em tempo real" : "started counting life in real time"}</p>
            <p>+ {pt ? "registrei algumas coisas importantes" : "recorded a few things that matter"}</p>
            <blockquote>{pt ? "Delírio na madrugada" : "3 AM thoughts"}</blockquote>
          </section>
        </article>
      </div>
    </div>
  );
}
