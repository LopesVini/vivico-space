# Site pessoal — Vinícius Lacerda

Site pessoal bilíngue com uma tela de entrada, livro público de visitantes,
terminal interativo e histórico de versões.

## Começar

É necessário ter Node.js 22.13 ou mais recente.

```bash
npm install
npm run dev
```

O terminal mostrará um endereço como `http://localhost:3000`.

## Comandos

```bash
npm run dev          # abre o site para desenvolvimento
npm run build        # cria e valida a versão final
npm run lint         # procura problemas no código
npm run check        # executa lint e build juntos
npm run db:generate  # cria uma migração após mudanças no banco
```

## Mapa rápido

- `app/`: páginas e interface do site.
- `app/components/`: partes visuais agrupadas por função.
- `app/api/`: comunicação entre a interface e o banco.
- `db/`: descrição das informações salvas.
- `drizzle/`: histórico de alterações do banco.
- `public/`: arquivos públicos, como o favicon.
- `worker/`, `build/` e arquivos de configuração: infraestrutura necessária.
- `docs/GUIA-DO-PROJETO.md`: explicação detalhada para iniciantes.

Arquivos gerados automaticamente, como `node_modules`, `dist`, `.vinext` e
`.wrangler`, não são código-fonte e não devem ser editados manualmente.
