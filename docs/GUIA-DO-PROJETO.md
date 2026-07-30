# Guia do projeto

Este documento explica o projeto sem presumir conhecimento de programação.

## A ideia geral

Quando alguém abre o site, esta é a sequência:

1. O navegador carrega a página principal em `app/page.tsx`.
2. Antes de mostrar o conteúdo, ela exibe `EntryGate.tsx`.
3. A pessoa envia nome e Instagram.
4. A tela conversa com `/api/visitors`, implementada em `app/api/visitors/route.ts`.
5. A API procura o Instagram no banco. Se for novo, cria um registro; se já
   existir, devolve o primeiro registro sem duplicar a pessoa.
6. A home é liberada durante aquela visita.
7. Terminal, livro de visitantes e histórico abrem como camadas sobre a home.

## Pastas que você provavelmente vai editar

### `app/`

É o coração do site.

- `page.tsx`: monta a home, seus textos, projetos e links pessoais.
- `layout.tsx`: define título, descrição, idioma inicial e fontes.
- `globals.css`: controla todo o visual, cores, espaçamentos e versão mobile.
- `lib/i18n.ts`: contém o tipo usado para português e inglês.

### `app/components/entry/`

- `EntryGate.tsx`: primeira tela. Recebe nome e Instagram e explica quais
  informações ficam públicas.

### `app/components/overlays/`

São as três telas que aparecem sobre a home:

- `Terminal.tsx`: terminal VL/OS e seus comandos.
- `VisitorBook.tsx`: livro público com visitantes únicos.
- `SystemLog.tsx`: histórico das versões do site.

### `app/api/visitors/`

- `route.ts`: é a parte que recebe e devolve dados do livro. Ela normaliza o
  Instagram, impede duplicatas e usa consultas preparadas para falar com o
  banco com segurança.

### `db/` e `drizzle/`

- `db/schema.ts`: descreve as tabelas e campos do banco em código.
- `db/index.ts`: abre a conexão com o banco.
- `drizzle/`: guarda migrações, que são o histórico estrutural do banco.

Não altere manualmente uma migração que já tenha sido usada em produção. Para
mudanças futuras, edite `db/schema.ts` e execute `npm run db:generate`.

### `public/`

Arquivos acessíveis diretamente pelo navegador. No momento, contém o favicon.

## Infraestrutura que normalmente não precisa ser tocada

- `worker/`: recebe os acessos quando o site roda na infraestrutura Cloudflare.
- `build/`: integração usada pelo sistema de publicação.
- `.openai/hosting.json`: declara que o site utiliza um banco chamado `DB`.
- `vite.config.ts`: configura execução local e publicação.
- `next.config.ts`, `postcss.config.mjs`, `eslint.config.mjs` e `tsconfig.json`:
  configurações do framework, CSS, verificação e TypeScript.
- `package.json`: lista comandos e bibliotecas do projeto.
- `package-lock.json`: fixa versões exatas dessas bibliotecas.

## Pastas automáticas

Estas pastas podem parecer importantes, mas são recriadas pelas ferramentas:

- `node_modules/`: bibliotecas instaladas por `npm install`.
- `dist/`: site final produzido por `npm run build`.
- `.vinext/`: cache interno do framework.
- `.wrangler/`: ambiente local da Cloudflare e banco local de desenvolvimento.

Não edite arquivos dentro delas. `node_modules`, `dist` e `.vinext` podem ser
apagadas e recriadas. Já `.wrangler` também contém o banco local; apagá-la
remove os visitantes registrados somente no seu computador.

As pastas `work/` e `outputs/` são áreas auxiliares do Codex e estão ignoradas
pelo Git. Elas não participam do site publicado.

## Onde fazer alterações comuns

- Trocar textos, projetos ou links: `app/page.tsx`.
- Mudar cores, tamanhos ou alinhamento: `app/globals.css`.
- Adicionar comando ao terminal: `app/components/overlays/Terminal.tsx`.
- Atualizar versões: `app/components/overlays/SystemLog.tsx`.
- Alterar a entrada: `app/components/entry/EntryGate.tsx`.
- Mudar dados do visitante: `db/schema.ts` e `app/api/visitors/route.ts`.

## Regras simples para trabalhar com segurança

1. Abra sempre a pasta raiz `vinicius-personal-site`, não uma subpasta.
2. Antes de começar, rode `npm install` se as bibliotecas não estiverem presentes.
3. Use `npm run dev` enquanto estiver editando.
4. Ao terminar, rode `npm run check`.
5. Não coloque senhas ou chaves diretamente no código.
6. Não edite `node_modules`, `dist`, `.vinext` ou `.wrangler` manualmente.
7. Guarde mudanças importantes em Git antes de experimentar algo grande.
