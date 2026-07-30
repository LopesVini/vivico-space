"use client";
/* User-uploaded image URLs are dynamic API resources, not build-time assets. */
/* eslint-disable @next/next/no-img-element */

import { ChangeEvent, useEffect, useRef, useState } from "react";
import type { Lang } from "../lib/i18n";

type Photo = { id: string; instagram: string; createdAt: string; src: string; removalVotes: number };
type Identity = { instagram: string; token: string };

function getIdentity(): Identity | null {
  try {
    const stored = window.localStorage.getItem("vl-visitor");
    if (!stored) return null;
    const value = JSON.parse(stored) as Partial<Identity>;
    return value.instagram && value.token ? { instagram: value.instagram, token: value.token } : null;
  } catch { return null; }
}

async function preparePhoto(file: File) {
  if (file.type === "image/gif") return file;
  const source = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const element = new Image();
      element.onload = () => resolve(element);
      element.onerror = reject;
      element.src = source;
    });
    const scale = Math.min(1, 1800 / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas unavailable");
    context.fillStyle = "#f0efe9";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", .86));
    if (!blob) throw new Error("Photo conversion failed");
    return new File([blob], "foto.jpg", { type: "image/jpeg" });
  } finally { URL.revokeObjectURL(source); }
}

async function responseMessage(response: Response, fallback: string, useServerMessage: boolean) {
  try { return useServerMessage ? ((await response.json()) as { error?: string }).error ?? fallback : fallback; }
  catch { return fallback; }
}

export default function Gallery({ lang }: { lang: Lang }) {
  const pt = lang === "pt";
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [status, setStatus] = useState("");
  const [active, setActive] = useState<Photo | null>(null);
  const [busy, setBusy] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);

  const load = async () => {
    try {
      const response = await fetch("/api/gallery", { cache: "no-store" });
      if (!response.ok) throw new Error();
      const data = await response.json() as { photos?: Photo[] };
      setPhotos(data.photos ?? []);
    } catch { setStatus(pt ? "O MURO NÃO CARREGOU." : "THE WALL DIDN'T LOAD."); }
  };

  useEffect(() => {
    let current = true;
    fetch("/api/gallery", { cache: "no-store" })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error()))
      .then((data: { photos?: Photo[] }) => { if (current) setPhotos(data.photos ?? []); })
      .catch(() => { if (current) setStatus(lang === "pt" ? "O MURO NÃO CARREGOU." : "THE WALL DIDN'T LOAD."); });
    return () => { current = false; };
  }, [lang]);

  useEffect(() => {
    if (!active) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButton.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setActive(null); };
    window.addEventListener("keydown", closeOnEscape);
    return () => { document.body.style.overflow = previousOverflow; window.removeEventListener("keydown", closeOnEscape); };
  }, [active]);

  const upload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || busy) return;
    const identity = getIdentity();
    if (!identity) { setStatus(pt ? "ENTRE NOVAMENTE ANTES DE POSTAR." : "ENTER AGAIN BEFORE POSTING."); return; }
    setBusy(true);
    setStatus(pt ? "COLANDO…" : "PASTING…");
    try {
      const photo = await preparePhoto(file);
      if (photo.size > 8_000_000) throw new Error(pt ? "A FOTO DEVE TER ATÉ 8 MB." : "THE PHOTO MUST BE UNDER 8 MB.");
      const form = new FormData();
      form.set("instagram", identity.instagram);
      form.set("visitorToken", identity.token);
      form.set("photo", photo, photo.name);
      const response = await fetch("/api/gallery", { method: "POST", body: form });
      if (!response.ok) throw new Error(await responseMessage(response, pt ? "A FOTO NÃO COLOU." : response.status === 429 ? "TOO MANY ATTEMPTS. WAIT BEFORE POSTING AGAIN." : response.status === 403 ? "THIS SIGNATURE IS ALREADY IN USE." : "THE PHOTO DIDN'T STICK.", pt));
      await load();
      setStatus(pt ? "FOTO NO MURO." : "PHOTO ON THE WALL.");
    } catch (error) {
      setStatus(error instanceof Error && error.message ? error.message.toUpperCase() : (pt ? "A FOTO NÃO COLOU." : "THE PHOTO DIDN'T STICK."));
    } finally { setBusy(false); }
  };

  const markToDisappear = async () => {
    if (!active || busy) return;
    const identity = getIdentity();
    if (!identity) { setStatus(pt ? "ENTRE NOVAMENTE ANTES DE MARCAR." : "ENTER AGAIN BEFORE MARKING."); return; }
    if (!window.confirm(pt ? "MARCAR PARA APAGAR?" : "MARK TO DISAPPEAR?")) return;
    setBusy(true);
    try {
      const response = await fetch(`/api/gallery/${active.id}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ instagram: identity.instagram, visitorToken: identity.token }) });
      const data = await response.json() as { error?: string; disappeared?: boolean; removalVotes?: number };
      if (!response.ok) throw new Error(pt ? data.error : response.status === 429 ? "WAIT BEFORE TRYING AGAIN." : response.status === 409 ? "THIS ACTION IS NOT AVAILABLE." : "COULDN'T MARK IT.");
      if (data.disappeared) { setActive(null); await load(); }
      else {
        const removalVotes = data.removalVotes ?? active.removalVotes;
        setPhotos((current) => current.map((photo) => photo.id === active.id ? { ...photo, removalVotes } : photo));
        setActive({ ...active, removalVotes });
      }
      setStatus(pt ? "MARCADA." : "MARKED.");
    } catch (error) { setStatus(error instanceof Error && error.message ? error.message.toUpperCase() : (pt ? "NÃO FOI POSSÍVEL MARCAR." : "COULDN'T MARK IT.")); }
    finally { setBusy(false); }
  };

  return <section className="contentPage galleryPage" aria-labelledby="gallery-title">
    <header className="galleryHeader">
      <p className="wallPhrase">{pt ? "TRATE O MURAL COMO UM PIXADOR TRATA UM MURO BRANCO." : "TREAT THE MURAL THE WAY A GRAFFITI ARTIST TREATS A BLANK WALL."}</p>
      <div className="galleryHeading"><h1 id="gallery-title">{pt ? "Mural" : "Wall"}</h1><span>{pt ? "1 PESSOA — 1 FOTO" : "1 PERSON — 1 PHOTO"}</span></div>
      <button className="cameraButton" type="button" disabled={busy} onClick={() => input.current?.click()} aria-label={pt ? "Colar uma foto no mural" : "Post a photo on the wall"}><span className="cameraGlyph" aria-hidden="true" /></button>
      <input ref={input} className="cameraInput" type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={upload} />
      <span className="galleryStatus" role="status" aria-live="polite">{status}</span>
    </header>
    <div className="galleryWall">
      {photos.length === 0 && !status && <p className="emptyWall">{pt ? "O MURO ESTÁ LIMPO." : "THE WALL IS CLEAN."}</p>}
      {photos.map((photo) => <figure key={photo.id}>
        <button type="button" onClick={() => setActive(photo)}><img src={photo.src} alt={`Foto de @${photo.instagram}`} loading="lazy" /></button>
        <figcaption><a className="gallerySignature" href={`https://instagram.com/${photo.instagram}`} target="_blank" rel="noreferrer" title={pt ? "Assinatura declarada; identidade não verificada" : "Declared signature; identity not verified"}>{pt ? "ASSINADO" : "SIGNED"} @{photo.instagram} ↗</a>{photo.removalVotes > 0 && <span className="removalCount">{photo.removalVotes}/15 {pt ? "PARA APAGAR" : "TO REMOVE"}</span>}<time>{new Intl.DateTimeFormat(pt ? "pt-BR" : "en-GB", { dateStyle: "medium", timeZone: "America/Sao_Paulo" }).format(new Date(photo.createdAt))}</time></figcaption>
      </figure>)}
    </div>
    {active && <div className="galleryLightbox" role="dialog" aria-modal="true" aria-label={pt ? "Foto aberta" : "Open photo"} onClick={(event) => { if (event.target === event.currentTarget) setActive(null); }}>
      <button ref={closeButton} className="lightboxClose" type="button" onClick={() => setActive(null)} aria-label={pt ? "Fechar foto" : "Close photo"}>×</button>
      <img src={active.src} alt={`Foto de @${active.instagram}`} />
      <button className="disappearButton" type="button" disabled={busy} onClick={markToDisappear}>{active.removalVotes > 0 && `${active.removalVotes}/15 · `}{pt ? "APAGAR" : "REMOVE"}</button>
    </div>}
  </section>;
}
