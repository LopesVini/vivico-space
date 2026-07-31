"use client";
import { FormEvent, useEffect, useState } from "react";
import type { Lang } from "../../lib/i18n";
import { trackAnonymous } from "../../lib/telemetry";

export default function EntryGate({ lang, setLang, onEnter }: { lang: Lang; setLang: (lang: Lang) => void; onEnter: () => void }) {
  const pt = lang === "pt"; const [instagram, setInstagram] = useState(""); const [status, setStatus] = useState(""); const [submitting, setSubmitting] = useState(false);
  const terminalLead = pt ? "Oi.\nIsso não é um login.\nDigite seu @ do Instagram." : "Hi.\nThis is not a login.\nEnter your Instagram @.";
  const terminalPunchline = pt ? "ou não..." : "or not...";
  const [typedLine, setTypedLine] = useState("");

  useEffect(() => {
    let position = 0;
    let pause: number | undefined;
    let punchlineTyping: number | undefined;
    const typing = window.setInterval(() => {
      position += 1;
      setTypedLine(terminalLead.slice(0, position));
      if (position >= terminalLead.length) {
        window.clearInterval(typing);
        pause = window.setTimeout(() => {
          let punchlinePosition = 0;
          punchlineTyping = window.setInterval(() => {
            punchlinePosition += 1;
            setTypedLine(`${terminalLead}\n${terminalPunchline.slice(0, punchlinePosition)}`);
            if (punchlinePosition >= terminalPunchline.length && punchlineTyping) window.clearInterval(punchlineTyping);
          }, 42);
        }, 2000);
      }
    }, 52);
    return () => { window.clearInterval(typing); if (pause) window.clearTimeout(pause); if (punchlineTyping) window.clearInterval(punchlineTyping); };
  }, [terminalLead, terminalPunchline]);
  const submit = async (e: FormEvent) => {
    e.preventDefault(); if (submitting) return; setSubmitting(true); setStatus(pt ? "VERIFICANDO REGISTRO…" : "CHECKING THE RECORD…");
    try {
      const stored = window.localStorage.getItem("vl-visitor");
      const known = stored ? JSON.parse(stored) as { instagram?: string; token?: string } : null;
      const visitorToken = known?.instagram === instagram.toLowerCase() ? known.token : undefined;
      const response = await fetch("/api/visitors", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ instagram, visitorToken }) });
      const data = await response.json() as { error?: string; existing?: boolean; visitorToken?: string; claimed?: boolean; reclaimed?: boolean };
      if (!response.ok) throw new Error(pt ? data.error : response.status === 429 ? "Too many entries from this network. Try again later." : "Check your Instagram handle.");
      if (data.visitorToken) window.localStorage.setItem("vl-visitor", JSON.stringify({ instagram: instagram.toLowerCase(), token: data.visitorToken }));
      else window.localStorage.removeItem("vl-visitor");
      trackAnonymous("entered_registered");
      setStatus(data.claimed ? (pt ? "ENTRADA LIVRE. ESTA ASSINATURA JÁ TEM FOTO." : "COME IN. THIS SIGNATURE ALREADY HAS A PHOTO.") : data.reclaimed ? (pt ? "ASSINATURA RECUPERADA." : "SIGNATURE RECOVERED.") : data.existing ? (pt ? "BEM-VINDO DE VOLTA." : "WELCOME BACK.") : (pt ? "PRIMEIRA VISITA REGISTRADA." : "FIRST VISIT RECORDED."));
      window.setTimeout(onEnter, 550);
    } catch (error) { setStatus(error instanceof Error && error.message ? error.message : (pt ? "Confira seu @ do Instagram." : "Check your Instagram handle.")); setSubmitting(false); }
  };
  return <div className="entryGate">
    <header><span>VIVICO</span><button onClick={() => setLang(pt ? "en" : "pt")}><span className={pt ? "active" : ""}>PT</span>/<span className={!pt ? "active" : ""}>EN</span></button></header>
    <main>
      <section className="gateCopy">
        <div className="terminalGreeting"><span aria-hidden="true">$</span> <span>{typedLine}</span><i aria-hidden="true" /></div>
      </section>
      <section className="gateFormWrap">
        <form onSubmit={submit}>
          <label>INSTAGRAM<div className="handleInput"><span>@</span><input required minLength={1} maxLength={30} pattern="[A-Za-z0-9._]+" value={instagram} onChange={(e) => setInstagram(e.target.value.replace(/^@/, ""))} autoCapitalize="none" autoCorrect="off" autoComplete="username" placeholder="username" /></div></label>
          <button type="submit" disabled={submitting}>{pt ? "CONTINUAR →" : "CONTINUE →"}</button>
          <button className="guestEnter" type="button" disabled={submitting} onClick={() => { trackAnonymous("entered_guest"); onEnter(); }}>{pt ? "ENTRAR SEM @" : "ENTER WITHOUT @"}</button>
        </form>
        {status && <strong className="gateStatus" role="status">{status}</strong>}
      </section>
    </main>
  </div>;
}
