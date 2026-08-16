"use client";
import type { Lang } from "../lib/i18n";

export default function ZenMode({ lang, onExit }: { lang: Lang, onExit: () => void }) {
  const isPt = lang === "pt";
  return (
    <div className="zenModeContainer">
      <header className="zenHeader">
        <button onClick={onExit} className="zenExitBtn">← {isPt ? "voltar" : "back"}</button>
      </header>

      <main className="zenMain">
        <h1 className="zenTitle">Vinícius Lacerda</h1>
        <p className="zenSubtitle">Belo Horizonte, MG</p>

        <section className="zenSection">
          <h2>{isPt ? "Sobre" : "About"}</h2>
          <p>{isPt ? "Estudante de Engenahria Elétrica na UFMG, interesse em matemática, desenvolvimento, linux, machine learning e música" : "I'm Electrical Engineer Student at UFMG, interest in mathematics, software development, linux, machine learning and music."}</p>
        </section>

        <section className="zenSection">
          <h2>{isPt ? "Projetos" : "Projects"}</h2>
          <ul className="zenList">
            <li><a href="https://vebram.com" target="_blank" rel="noreferrer">VEBRAM</a> - {isPt ? "Desenvolvedor Full-stack" : "Full-stack Developer"}</li>
            <li><a href="https://prossigo.com" target="_blank" rel="noreferrer">Prossigo</a> - {isPt ? "SRD, Closer e Suporte" : "SDR, Closer and Support"}</li>
          </ul>
        </section>

        <section className="zenSection">
          <h2>{isPt ? "Stack" : "Stack"}</h2>
          <ul className="zenList">
            <li>React, Node, Typescript</li>
          </ul>
        </section>

        <section className="zenSection">
          <h2>Links</h2>
          <ul className="zenList">
            <li><a href="https://github.com/LopesVini" target="_blank" rel="noreferrer">GitHub</a></li>
            <li><a href="https://www.linkedin.com/in/vin%C3%ADcius-lacerda-405a72396" target="_blank" rel="noreferrer">LinkedIn</a></li>
            <li><a href="https://instagram.com/vllc.hub" target="_blank" rel="noreferrer">Instagram</a></li>
            <li><a href="https://letterboxd.com/lacerdavinicius/" target="_blank" rel="noreferrer">Letterboxd</a></li>
            <li><a href="mailto:contato@exemplo.com">Email</a></li>
          </ul>
        </section>
      </main>
    </div>
  );
}
