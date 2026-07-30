"use client";
import { FormEvent, useEffect, useState } from "react";
import type { Lang } from "../../lib/i18n";

export default function EntryGate({ lang, setLang, onEnter }: { lang: Lang; setLang: (lang: Lang) => void; onEnter: () => void }) {
  const pt = lang === "pt"; const [instagram, setInstagram] = useState(""); const [status, setStatus] = useState("");
  const terminalLine = pt ? "Oi. Isso não é um login. Digite seu @ do Instagram." : "Hi. This is not a login. Enter your Instagram @.";
  const [typedLine, setTypedLine] = useState("");

  useEffect(() => {
    let position = 0;
    const typing = window.setInterval(() => {
      position += 1;
      setTypedLine(terminalLine.slice(0, position));
      if (position >= terminalLine.length) window.clearInterval(typing);
    }, 52);
    return () => window.clearInterval(typing);
  }, [terminalLine]);
  const submit = async (e: FormEvent) => {
    e.preventDefault(); setStatus(pt ? "VERIFICANDO REGISTRO…" : "CHECKING THE RECORD…");
    try {
      const stored = window.localStorage.getItem("vl-visitor");
      const known = stored ? JSON.parse(stored) as { instagram?: string; token?: string } : null;
      const visitorToken = known?.instagram === instagram.toLowerCase() ? known.token : undefined;
      const response = await fetch("/api/visitors", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ instagram, visitorToken }) });
      const data = await response.json() as { existing?: boolean; visitorToken?: string };
      if (!response.ok) throw new Error(data.error);
      if (data.visitorToken) window.localStorage.setItem("vl-visitor", JSON.stringify({ instagram: instagram.toLowerCase(), token: data.visitorToken }));
      setStatus(data.existing ? (pt ? "BEM-VINDO DE VOLTA." : "WELCOME BACK.") : (pt ? "PRIMEIRA VISITA REGISTRADA." : "FIRST VISIT RECORDED."));
      window.setTimeout(onEnter, 550);
    } catch { setStatus(pt ? "Confira seu @ do Instagram." : "Check your Instagram handle."); }
  };
  return <div className="entryGate">
    <header><span>VL/ACCESS</span><button onClick={() => setLang(pt ? "en" : "pt")}><span className={pt ? "active" : ""}>PT</span>/<span className={!pt ? "active" : ""}>EN</span></button></header>
    <main>
      <section className="gateCopy">
        <p>ACCESS / 001</p>
        <div className="terminalGreeting"><span aria-hidden="true">$</span> <span>{typedLine}</span><i aria-hidden="true" /></div>
      </section>
      <section className="gateFormWrap">
        <form onSubmit={submit}>
          <label>INSTAGRAM<div className="handleInput"><span>@</span><input required minLength={1} maxLength={30} pattern="[A-Za-z0-9._]+" value={instagram} onChange={(e) => setInstagram(e.target.value.replace(/^@/, ""))} autoCapitalize="none" autoCorrect="off" autoComplete="username" placeholder="username" /></div></label>
          <button type="submit">{pt ? "CONTINUAR →" : "CONTINUE →"}</button>
        </form>
        {status && <strong className="gateStatus" role="status">{status}</strong>}
      </section>
    </main>
  </div>;
}
