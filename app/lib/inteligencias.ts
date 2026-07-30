export type Inteligencia = { title: string; artist: string; note?: string };

export const inteligencias: Inteligencia[] = [
  { title: "Bandolim", artist: "Beto Guedes" },
  { title: "That Is All", artist: "George Harrison" },
  { title: "Luzeiro", artist: "Almir Sater" },
  { title: "Lateralus", artist: "Tool" },
  { title: "In the Flesh?", artist: "Pink Floyd" },
  { title: "For No One", artist: "The Beatles" },
  { title: "Ripples", artist: "Genesis" },
  { title: "Diana", artist: "Toninho Horta" },
  { title: "Durango Kid", artist: "Milton Nascimento" },
  { title: "Beco do Mota", artist: "Milton Nascimento" },
  { title: "Quatro", artist: "Beto Guedes" },
  { title: "Sempre Viva", artist: "Lô Borges", note: "bizarro!" },
  { title: "Vagas Estrelas", artist: "Lô Borges" },
  { title: "Viver, Viver", artist: "Lô Borges" },
  { title: "Broon's Bane", artist: "Rush" },
  { title: "Matte Kudasai", artist: "King Crimson" },
  { title: "Agnus Sei", artist: "Milton Nascimento" },
  { title: "Tempo Rei (MTV)", artist: "Gilberto Gil" },
  { title: "Oh Yeah", artist: "Steve Lacy" },
  { title: "Pedras Rolando", artist: "Beto Guedes" },
  { title: "C'est le Bon", artist: "Supertramp" },
  { title: "Unknown Delight", artist: "George Harrison" },
  { title: "The Light That Has Lighted the World", artist: "George Harrison" },
  { title: "Wah-Wah (Live)", artist: "George Harrison" },
  { title: "Paisagem da Janela (Ao Vivo)", artist: "Milton Nascimento" },
  { title: "Angelus", artist: "Milton Nascimento" },
  { title: "Norwegian Wood", artist: "Milton Nascimento", note: "bizarro!" },
  { title: "Southampton Dock", artist: "Pink Floyd" },
  { title: "Two Suns in the Sunset", artist: "Pink Floyd" },
  { title: "Soliloquy", artist: "Rush" },
];

export function randomInteligencia() {
  return inteligencias[Math.floor(Math.random() * inteligencias.length)];
}

export function spotifySearchUrl(item: Inteligencia) {
  return `https://open.spotify.com/search/${encodeURIComponent(`${item.title} ${item.artist}`)}`;
}
