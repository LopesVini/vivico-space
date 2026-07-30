"use client";
import { useCallback, useEffect, useState } from "react";
import type { Lang } from "../../lib/i18n";

type Entry = { id: number; name: string; instagram: string; firstSeenAt: string };

export default function VisitorBook({ lang }: { lang: Lang }) {
  const pt = lang === "pt"; const [entries, setEntries] = useState<Entry[]>([]); const [loading, setLoading] = useState(true);
  const load = useCallback(async () => { try { const response = await fetch("/api/visitors"); const data = await response.json(); setEntries(data.entries ?? []); } finally { setLoading(false); } }, []);
  useEffect(() => { load(); }, [load]);
  return <div className="contentPage visitorBookPage">
    <div className="visitorShell">
      <header className="visitorIntro"><p>PUBLIC RECORD / FIRST VISITS ONLY</p><h2>{pt ? "Quem já passou por aqui." : "Who has passed through."}</h2><span>{pt ? "Cada pessoa aparece uma única vez, marcada pela data da primeira visita." : "Each person appears once, marked by the date of their first visit."}</span></header>
      <aside className="privacyNote"><strong>{pt ? "COMO FUNCIONA" : "HOW IT WORKS"}</strong><p>{pt ? "O mesmo @ do Instagram sempre recupera o registro original. Retornos não alteram a data e não aumentam esta lista." : "The same Instagram @ always retrieves the original record. Returning does not change the date or add another entry."}</p></aside>
      <div className="visitorStats"><span>{String(entries.length).padStart(2, "0")} {pt ? "PESSOAS REGISTRADAS" : "PEOPLE RECORDED"}</span><span>{pt ? "PRIMEIRAS VISITAS" : "FIRST VISITS"}</span></div>
      <div className="peopleBook">{loading ? <p className="emptyLog">{pt ? "Abrindo o livro…" : "Opening the book…"}</p> : entries.length === 0 ? <p className="emptyLog">{pt ? "O livro ainda está vazio." : "The book is still empty."}</p> : entries.map((entry) => <article key={entry.id}><span>{String(entry.id).padStart(4, "0")}</span><h3>{entry.name}</h3><a href={`https://instagram.com/${entry.instagram}`} target="_blank" rel="noreferrer">@{entry.instagram} ↗</a><time>{pt ? "PRIMEIRA VISITA" : "FIRST VISIT"}<strong>{new Intl.DateTimeFormat(pt ? "pt-BR" : "en-GB", { dateStyle: "long", timeZone: "America/Sao_Paulo" }).format(new Date(entry.firstSeenAt))}</strong></time></article>)}</div>
    </div>
  </div>;
}
