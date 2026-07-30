import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://vivico-mural.viniciuslacerdalc.chatgpt.site"),
  title: "Vinícius Lacerda — Vivico",
  description: "Site pessoal de Vinícius Lacerda: projetos, referências, terminal e mural público.",
  icons: { icon: "/favicon.svg?v=2", shortcut: "/favicon.svg?v=2" },
  openGraph: {
    title: "Vivico — Mural público",
    description: "Um mural público: uma pessoa, uma foto.",
    type: "website",
    locale: "pt_BR",
    images: [{ url: "/og.png", width: 1734, height: 907, alt: "Vivico — Mural público — 1 pessoa, 1 foto" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Vivico — Mural público",
    description: "Um mural público: uma pessoa, uma foto.",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
