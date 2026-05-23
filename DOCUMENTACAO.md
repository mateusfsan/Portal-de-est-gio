# Documentação do Portal de Estágio

> Relatório completo do estado atual do projeto.
> Última atualização: ao fim da Etapa 2 do `CLAUDE.md` (commit `f4ad9c9`).

---

## 1. O que é o sistema

Sistema web para digitalizar a documentação das fases de estágio de uma faculdade.

Hoje, o fluxo é todo em papel. O objetivo é levar o processo inteiro para o digital:
- **Aluno** envia documentos do estágio.
- **Orientador** analisa e aprova ou reprova com parecer.
- **Coordenador** configura cursos, fases e tipos de documento, e acompanha o progresso de todos.

O **supervisor da empresa** não é usuário do sistema — ele assina o documento **digitalmente** (com sua própria ferramenta de assinatura, fora deste sistema) e envia o arquivo ao aluno; o aluno faz upload do PDF já assinado.

---

## 2. Onde estamos agora

Estado em commits (branch `main`):

```
f4ad9c9  feat: crud do coordenador para turmas e empresas       ← Etapa 2.2
794e682  feat: crud do coordenador para cursos, fases e tipos    ← Etapa 2.1
c82384f  feat: setup inicial do monorepo com autenticação JWT    ← Etapa 1
```

| Etapa do `CLAUDE.md` (seção 8) | Status |
|---|---|
| 1. Setup + auth | ✅ concluída |
| 2. Configuração do coordenador (CRUDs) | ✅ concluída |
| 3. Fluxo documental (upload, máquina de estados, versionamento) | ⏳ próxima |
| 4. Telas (perfil, fila, dashboard) | pendente |
| 5. Stretch (notificações, dossiê em PDF) | pendente |

Backend está rodando em produção local em `http://localhost:3000`, conectado ao Postgres do **Supabase** (`iraikpegicxftvjltkrk`, região São Paulo).

---

## 3. Tecnologias — o que usamos e por quê

### Backend (`/server`)

| Tecnologia | Para que serve | Por que escolhida |
|---|---|---|
| **Node.js 22+** | Runtime JavaScript | Stack pedida pelo `CLAUDE.md`; tem `--watch` nativo (substitui nodemon) |
| **Express** | Servidor HTTP / roteamento | Minimalista e bem documentado; perfeito para aprender o ciclo de uma requisição |
| **Prisma** (`@prisma/client` + `prisma`) | ORM + migrations | Esquema declarativo (`schema.prisma`), client TypeScript-like, migrations versionadas |
| **PostgreSQL** (via Supabase) | Banco de dados | Banco relacional robusto; Supabase oferece tier gratuito e zero setup local |
| **JWT** (`jsonwebtoken`) + **bcrypt** | Autenticação stateless | JWT carrega `id`/`papel` no próprio token; bcrypt protege a senha no banco |
| **Zod** | Validação de entrada | Schemas reutilizáveis para body/params/query, erros estruturados |
| **dotenv** | Variáveis de ambiente | Lê `.env` no boot |
| **cors** | Permitir requisições do frontend | Sem ele, o navegador bloquearia chamadas do `localhost:5173` para `:3000` |

### Frontend (`/client`)

| Tecnologia | Para que serve | Por que escolhida |
|---|---|---|
| **React 18** | Biblioteca de UI | Stack pedida; o usuário quer se aprofundar em React |
| **Vite** | Bundler + dev server | Build instantâneo, hot reload nativo, configuração mínima |
| **React Router** | Roteamento de telas | Padrão de fato em SPA React (instalado, será usado a partir da Etapa 4) |
| **TanStack Query** | Cache de dados + loading/erro | Evita "hooks de fetch" caseiros; gerencia cache, refetch, estados |
| **Axios** | Cliente HTTP | Permite **interceptor** global de token (injeta `Authorization` automático) |
| **@fontsource/inter** | Fonte Inter auto-hospedada | Sem depender de Google Fonts em runtime; funciona offline |
| **CSS Modules + variáveis CSS** | Estilização | Sem Tailwind (regra do `CLAUDE.md`); design tokens em `tokens.css` |

### Por que **não** está nessa lista

- **Sem TypeScript** — o `CLAUDE.md` pediu JS puro com JSDoc opcional. Reduz fricção para aprender.
- **Sem nodemon** — Node 22+ tem `node --watch` nativo. Uma dependência a menos.
- **Sem Tailwind** — visual institucional, tokens centralizados em CSS puro.
- **Sem testes automatizados ainda** — validação manual nesta fase, automação entra como melhoria depois.
- **Sem ESLint/Prettier** — tirados de escopo para focar no aprendizado de Node/React.

---

## 4. Arquitetura geral

Monorepo simples: dois projetos independentes na raiz, **sem** workspaces (cada um tem seu `package.json`, suas dependências, seus scripts).

```
portal-estagio/
├── .gitignore
├── README.md
├── DOCUMENTACAO.md          ← este arquivo
├── server/                  ← API Node + Express + Prisma
│   ├── .env                 ← segredos (NÃO commitado)
│   ├── .env.example
│   ├── package.json
│   ├── prisma/
│   │   ├── schema.prisma    ← definição do banco (fonte de verdade)
│   │   ├── seed.js          ← popula usuários de dev
│   │   └── migrations/
│   │       └── 20260523191239_init/
│   │           └── migration.sql
│   └── src/
│       ├── config/env.js    ← lê e valida .env no boot
│       ├── lib/             ← utilidades compartilhadas
│       │   ├── appError.js
│       │   ├── prisma.js
│       │   └── prismaErrors.js
│       ├── middleware/      ← chamados em ordem antes do controller
│       │   ├── auth.js
│       │   ├── rbac.js
│       │   ├── validate.js
│       │   └── errorHandler.js
│       ├── modules/         ← um diretório por recurso, mesmo padrão em todos
│       │   ├── auth/
│       │   ├── cursos/
│       │   ├── fases/
│       │   ├── tipos-documento/
│       │   ├── empresas/
│       │   └── turmas/
│       ├── app.js           ← monta Express e plugga os módulos
│       └── server.js        ← entrypoint; sobe o app na porta
└── client/                  ← frontend React + Vite
    ├── .env                 ← VITE_API_URL (NÃO commitado)
    ├── .env.example
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── api/client.js    ← instância única do Axios + interceptor
        ├── styles/
        │   ├── tokens.css   ← design tokens (cores, espaçamento, tipografia)
        │   └── global.css   ← reset + base
        ├── App.jsx          ← tela de saúde (placeholder)
        └── main.jsx         ← entrypoint do React
```

**Por que monorepo sem workspaces:** dois projetos independentes, sem dependências cruzadas. Workspaces seriam overkill — adicionariam complexidade sem benefício.

---

## 5. Como uma requisição HTTP funciona (ciclo completo)

Esta é a parte mais importante para entender o sistema. Toda requisição segue o mesmo caminho.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          NAVEGADOR (futuro)                              │
│                                                                          │
│  Botão é clicado → React chama api.post('/api/cursos', { nome })         │
│                          │                                               │
│                          ▼                                               │
│                  Axios interceptor                                       │
│                  (lê localStorage)                                       │
│                  adiciona Authorization: Bearer <jwt>                    │
└──────────────────────────┼──────────────────────────────────────────────┘
                           │ HTTP request com header Authorization
                           ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          BACKEND (Express)                               │
│                                                                          │
│   1.  app.use(cors())          permite a origem do frontend             │
│   2.  app.use(express.json())  parseia body JSON em req.body            │
│                                                                          │
│   3.  router.use(auth)         middleware AUTH                           │
│           │                                                              │
│           ├─ lê header `Authorization: Bearer <token>`                  │
│           ├─ jwt.verify(token, JWT_SECRET)  → { sub, papel }            │
│           ├─ prisma.usuario.findUnique({ id: sub })                     │
│           └─ injeta req.usuario = { id, nome, email, papel, ra }        │
│                                                                          │
│   4.  router.use(exigePapel('coordenador'))   middleware RBAC           │
│           └─ se req.usuario.papel ≠ 'coordenador' → AppError(403)       │
│                                                                          │
│   5.  validate({ body: criarCursoSchema })    middleware VALIDATE       │
│           ├─ Zod parseia req.body                                       │
│           └─ Erro? Lança ZodError com lista de problemas                │
│                                                                          │
│   6.  cursosController.criar(req, res, next)  CONTROLLER                │
│           ├─ try { ... } catch(err) { next(err) }                       │
│           └─ const curso = await cursosService.criar(req.body)          │
│                                                                          │
│   7.  cursosService.criar({ nome })           SERVICE                    │
│           ├─ Regras de negócio + AppError(...) em casos de erro         │
│           └─ prisma.curso.create({ data: { nome } })                    │
│                                                                          │
│   8.  Prisma                                                             │
│           ├─ Gera SQL parametrizado                                     │
│           └─ Conecta no Postgres via PgBouncer (pooler do Supabase)     │
│                                                                          │
│   9.  Postgres executa, devolve linha → Prisma → service → controller   │
│                                                                          │
│  10.  Resposta:  res.status(201).json({ curso })                        │
│                                                                          │
│  --- SE QUALQUER ETAPA LANÇOU ERRO ---                                  │
│                                                                          │
│  11.  errorHandler(err, req, res, next)       ÚLTIMO middleware         │
│           ├─ err instanceof AppError    → status configurado            │
│           ├─ err instanceof ZodError    → 400 com `detalhes`            │
│           └─ qualquer outro             → 500 "erro interno"            │
└─────────────────────────────────────────────────────────────────────────┘
                           │ HTTP response (JSON)
                           ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  NAVEGADOR: Axios resolve a promise → React renderiza                    │
└─────────────────────────────────────────────────────────────────────────┘
```

### A regra de ouro: "controller magro, service gordo"

- **Controller** só sabe receber HTTP e responder HTTP. Ele não conhece o banco, não tem regras de negócio.
- **Service** é onde mora a inteligência: validação cruzada, decisões de domínio, queries no Prisma, lançamento de `AppError`.
- **Por quê?** Se amanhã expusermos a mesma lógica via CLI, fila de jobs ou GraphQL, basta criar um novo controller — o service não muda.

---

## 6. O banco de dados — o que existe hoje

A migration `20260523191239_init` criou 10 tabelas + 3 enums no Postgres. Todas existem em código no schema, mas só as 5 primeiras têm CRUD implementado até agora.

### Enums (valores possíveis)

| Enum | Valores | Para que |
|---|---|---|
| `Papel` | `aluno`, `orientador`, `coordenador` | Define o que cada usuário pode fazer |
| `DocumentoStatus` | `pendente`, `enviado`, `em_analise`, `aprovado`, `reprovado` | A máquina de estados do documento |
| `ParecerDecisao` | `aprovado`, `reprovado` | Resultado da análise do orientador |

### Tabelas — visão geral

```
        ┌─────────┐
        │ usuarios│ (papel ∈ {aluno, orientador, coordenador})
        └──┬──┬───┘
           │  │
   alunoId │  │ orientadorId
           │  │
           │  └────────────────┐
           │                   │
           │            ┌──────▼──┐         ┌─────────┐
           │            │ turmas  │◄────────┤ cursos  │
           │            └──────┬──┘  cursoId└────┬────┘
           │                   │                 │
           │                   │            ┌────▼────┐
           │                   │            │  fases  │ (ordem única por curso)
           │                   │            └────┬────┘
           │                   │                 │
           │                   │            ┌────▼────────────┐
           │                   │            │ tipos_documento │
           │                   │            └────┬────────────┘
           │                   │                 │
           └─────┬─────────────┘                 │
                 │                               │
           ┌─────▼─────┐                         │
           │ estagios  │ (aluno + turma + empresa)
           └─────┬─────┘                         │
                 │                               │
                 │       ┌──────────────┐        │
                 └──────►│  documentos  │◄───────┘
                         │ (versionados)│
                         └──────┬───────┘
                                │
                          ┌─────▼─────┐
                          │ pareceres │ (autorId → usuário orientador)
                          └───────────┘

                          ┌──────────────┐
                          │ empresas     │ (dados do supervisor são colunas aqui)
                          └──────────────┘

                          ┌──────────────┐
                          │ notificacoes │ (in-app, stretch)
                          └──────────────┘
```

| Tabela | Resumo | Status |
|---|---|---|
| `usuarios` | Cadastro unificado dos 3 papéis (`papel` distingue) | ✅ CRUD básico (auth) |
| `cursos` | Curso da faculdade (ex.: "ADS") | ✅ CRUD completo |
| `fases` | Etapas do estágio dentro de um curso, com `ordem` única por curso | ✅ CRUD + reorder |
| `tipos_documento` | Quais documentos uma fase exige, e se são obrigatórios | ✅ CRUD completo |
| `turmas` | Turma de orientação (curso + orientador + período) | ✅ CRUD completo |
| `empresas` | Empresa do estágio + dados do supervisor (que não é usuário) | ✅ CRUD completo |
| `estagios` | Vincula aluno + turma + empresa + data de início | 🔜 Etapa 3 |
| `documentos` | Cada envio é uma linha; `versao` cresce a cada reenvio (**append-only**) | 🔜 Etapa 3 |
| `pareceres` | Análise do orientador (aprovado/reprovado + comentário) | 🔜 Etapa 3 |
| `notificacoes` | Mensagens in-app | 🔜 Etapa 5 |

---

## 7. Como funciona a autenticação (JWT, passo a passo)

### O fluxo de login

```
1. Cliente envia POST /api/auth/login { email, senha }

2. auth.service.login():
   - prisma.usuario.findUnique({ email })   busca o usuário
   - bcrypt.compare(senha, senhaHash)        compara hash da senha
   - jwt.sign({ sub: id, papel }, SECRET)    gera token assinado

3. Resposta:
   { token: "eyJhbGciOi...", usuario: { id, nome, papel, ... } }

4. Cliente guarda o token em localStorage com a chave 'portal_estagio_token'.

5. Próximas requisições passam pelo Axios interceptor (client/src/api/client.js):
   - Lê o token do localStorage
   - Adiciona o header Authorization: Bearer <token>
```

### O que o middleware `auth` faz a cada requisição protegida

```
1. Lê o header Authorization: Bearer <token>
2. jwt.verify(token, JWT_SECRET)
   - Token expirado ou inválido? → 401 "token inválido ou expirado"
3. prisma.usuario.findUnique({ id: payload.sub })
   - Por que ir no banco a cada request?
     Para que mudanças de papel ou exclusão de conta tenham efeito imediato
     (não esperar o token expirar).
4. Injeta req.usuario = { id, nome, email, papel, ra }
```

### O que o middleware `exigePapel` faz

```
exigePapel('coordenador')(req, res, next):
  Se req.usuario.papel não está nos papéis permitidos → 403 "acesso negado"
  Caso contrário → next()
```

> ⚠️ **Segurança importante:** a senha do banco do Supabase teve `#` na URL, o que quebrou o Prisma (`#` em URL é caractere especial). A correção foi URL-encodar como `%23`.

---

## 8. O padrão dos módulos do backend

Cada recurso (auth, cursos, fases, tipos-documento, empresas, turmas) é um diretório em `server/src/modules/<recurso>/` com **exatamente 4 arquivos**, todos com a mesma responsabilidade:

```
<recurso>/
├── <recurso>.routes.js      → define rotas + middlewares
├── <recurso>.controller.js  → recebe HTTP, chama service, devolve HTTP
├── <recurso>.service.js     → REGRA DE NEGÓCIO + acesso ao banco
└── <recurso>.schema.js      → validação Zod (body, params, query)
```

### Exemplo concreto: o módulo `cursos`

**`cursos.schema.js`** — define o que o cliente pode mandar:
```js
export const criarCursoSchema = z.object({
  nome: z.string().trim().min(2).max(120),
});
```

**`cursos.service.js`** — onde mora a inteligência:
```js
export async function remover(id) {
  await garantirExistencia(id);
  // Gate defensivo: não apagar curso com fases ou turmas vinculadas.
  const [fases, turmas] = await Promise.all([
    prisma.fase.count({ where: { cursoId: id } }),
    prisma.turma.count({ where: { cursoId: id } }),
  ]);
  if (fases > 0 || turmas > 0) {
    throw new AppError(`curso possui ${fases} fase(s) e ${turmas} turma(s)...`, 409);
  }
  await prisma.curso.delete({ where: { id } });
}
```

**`cursos.controller.js`** — magrinho, só ponte HTTP:
```js
export async function remover(req, res, next) {
  try {
    await cursosService.remover(req.params.id);
    res.status(204).end();
  } catch (err) {
    next(err);  // delega ao errorHandler central
  }
}
```

**`cursos.routes.js`** — monta a rota com a pilha de middlewares:
```js
router.use(auth, exigePapel('coordenador'));   // tudo do módulo exige coordenador
router.delete('/:id', validate({ params: idParam }), cursosController.remover);
```

**Esse mesmo padrão se repete 6 vezes** — uma para cada módulo. Aprender 1 = entender todos.

---

## 9. Endpoints disponíveis hoje

Todos em `http://localhost:3000`. Todas as rotas (exceto `/api/auth/login`, `/api/auth/register`, `/api/health`) exigem `Authorization: Bearer <token>`. Tudo da Etapa 2 exige `papel === 'coordenador'`.

### Autenticação

| Método | Path | Descrição |
|---|---|---|
| GET | `/api/health` | Healthcheck (sem auth) |
| POST | `/api/auth/register` | Criar usuário (qualquer um, sem auth — pode mudar depois) |
| POST | `/api/auth/login` | Login → devolve `{ token, usuario }` |
| GET | `/api/auth/me` | Dados do usuário do token atual |

### Cursos

| Método | Path | Body |
|---|---|---|
| POST | `/api/cursos` | `{ nome }` |
| GET | `/api/cursos` | — |
| GET | `/api/cursos/:id` | — (inclui fases ordenadas e seus tipos) |
| PUT | `/api/cursos/:id` | `{ nome }` |
| DELETE | `/api/cursos/:id` | (409 se tem fases ou turmas) |

### Fases (aninhadas em curso, individuais no recurso raiz)

| Método | Path | Body |
|---|---|---|
| POST | `/api/cursos/:cursoId/fases` | `{ nome, ordem }` |
| GET | `/api/cursos/:cursoId/fases` | — |
| **PATCH** | `/api/cursos/:cursoId/fases/ordem` | `{ ordens: [{ id, ordem }, ...] }` |
| GET | `/api/fases/:id` | — (inclui tipos) |
| PUT | `/api/fases/:id` | `{ nome }` (a ordem só muda via PATCH) |
| DELETE | `/api/fases/:id` | (409 se tem tipos) |

### Tipos de Documento

| Método | Path | Body |
|---|---|---|
| POST | `/api/fases/:faseId/tipos` | `{ nome, obrigatorio? }` |
| GET | `/api/fases/:faseId/tipos` | — |
| GET | `/api/tipos-documento/:id` | — |
| PUT | `/api/tipos-documento/:id` | `{ nome, obrigatorio }` |
| DELETE | `/api/tipos-documento/:id` | (409 se já tem documentos enviados) |

### Empresas

| Método | Path | Body |
|---|---|---|
| POST | `/api/empresas` | `{ razaoSocial, supervisorNome, supervisorEmail }` |
| GET | `/api/empresas` | — |
| GET | `/api/empresas/:id` | — |
| PUT | `/api/empresas/:id` | igual ao POST |
| DELETE | `/api/empresas/:id` | (409 se tem estágios) |

### Turmas

| Método | Path | Body |
|---|---|---|
| POST | `/api/turmas` | `{ cursoId, orientadorId, periodo }` |
| GET | `/api/turmas?cursoId=...` | filtro opcional |
| GET | `/api/turmas/:id` | (inclui curso e orientador) |
| PUT | `/api/turmas/:id` | `{ orientadorId, periodo }` (cursoId fixo) |
| DELETE | `/api/turmas/:id` | (409 se tem estágios) |

> Códigos de resposta padronizados: **201** criado, **200** ok, **204** sem conteúdo (delete), **400** validação Zod, **401** sem token, **403** papel errado, **404** não existe, **409** conflito (delete bloqueado, duplicidade, validação cruzada).

---

## 10. O que existe no frontend hoje

Pouca coisa, propositalmente — a Etapa 1 só pediu fundação visual e integração mínima.

- `client/src/main.jsx` carrega Inter (pesos 400 e 600), `tokens.css`, `global.css`, e o `QueryClientProvider`.
- `client/src/styles/tokens.css` contém **todas** as variáveis da seção 7 do `CLAUDE.md`: cores (paleta + status), tipografia, espaçamento, raio, sombra. Qualquer componente futuro vai usar **só** essas variáveis (nada hardcoded).
- `client/src/api/client.js` exporta uma instância única do Axios com o interceptor de token. Toda chamada à API passa por aqui.
- `client/src/App.jsx` é uma tela de saúde: bate em `/api/health` e mostra um badge usando as cores de status (em-análise enquanto carrega, aprovado se ok, reprovado se erro). Já valida ponta a ponta a conexão front ↔ back.

As telas reais (login, perfil, fila do orientador, dashboard do coordenador) entram na **Etapa 4**, sobre a base de dados já existente nas etapas 1–3.

---

## 11. Cronologia do que foi feito

### Etapa 1 — Setup + autenticação (commit `c82384f`)

Ordem em que os arquivos nasceram:

1. **Raiz**: `.gitignore` (cobre `.env`, `node_modules`), `README.md` curto com instruções.
2. **server/package.json**: definiu a stack (Express, Prisma, JWT, bcrypt, Zod, dotenv, cors). `"type": "module"` para ESM.
3. **server/prisma/schema.prisma**: **schema completo** das 10 tabelas e 3 enums já na primeira migration (decisão para evitar migrations triviais depois).
4. **server/.env.example**: template com `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `PORT`.
5. **server/src/config/env.js**: valida `.env` com Zod **no boot**. Faltou variável? Servidor não sobe.
6. **server/src/lib/prisma.js**: instância única do `PrismaClient` (usa `globalThis` para sobreviver ao `--watch`).
7. **server/src/lib/appError.js**: classe `AppError(msg, statusCode)` — erros de domínio viajam do service ao `errorHandler` central.
8. **Middlewares**:
   - `auth.js` — valida JWT, injeta `req.usuario`.
   - `rbac.js` — `exigePapel(...papeis)`.
   - `validate.js` — middleware genérico para schemas Zod.
   - `errorHandler.js` — único lugar que traduz erro em HTTP.
9. **Módulo `auth/`**: `schema.js`, `service.js` (com bcrypt + jwt), `controller.js`, `routes.js`. Endpoints `/register`, `/login`, `/me`.
10. **server/src/app.js** e **server/src/server.js**: monta Express, registra rotas, sobe na porta.
11. **server/prisma/seed.js**: cria 1 coordenador, 1 orientador, 1 aluno (com RA) com `upsert` (idempotente).
12. **client/package.json**, **vite.config.js**, **index.html**.
13. **client/src/styles/tokens.css**: as variáveis do design system.
14. **client/src/styles/global.css**: reset + base.
15. **client/src/api/client.js**: Axios + interceptor.
16. **client/src/main.jsx** + **client/src/App.jsx**.

Após criar tudo: `npm install` nos dois subprojetos, `prisma generate`, `prisma migrate dev --name init`, `npm run db:seed`. Servidor subiu em `http://localhost:3000`. Login do coordenador devolveu token.

### Etapa 2.1 — Cursos + Fases + Tipos de Documento (commit `794e682`)

Ordem em que os arquivos nasceram:

1. **server/src/lib/prismaErrors.js**: helper que mapeia códigos do Prisma (`P2002` = unique violation → 409; `P2025` = not found → 404) em `AppError`. Evita repetir `switch` em cada service.
2. **Módulo `cursos/`** (4 arquivos): CRUD simples. O `service.remover()` introduziu o padrão "checar dependências antes de deletar" (contar fases e turmas, retornar 409 se houver).
3. **Módulo `fases/`** (4 arquivos): além do CRUD, trouxe a peça mais interessante da etapa — o **PATCH atômico de reordenação**. O problema: `@@unique([cursoId, ordem])` impede um swap ingênuo (não dá pra mover a fase 1 pra ordem 2 enquanto a fase 2 ainda está lá). A solução é `prisma.$transaction` com **duas passadas**: primeiro coloca todas as fases afetadas em ordens negativas (livres por definição), depois nas ordens finais. Fica atômico e nunca colide.
4. **Módulo `tipos-documento/`** (4 arquivos): CRUD com o gate mais crítico — não pode deletar tipo que já foi usado em fluxo real (`documentos.count > 0`). Esse gate protege a regra de imutabilidade do `CLAUDE.md` seção 2.3.
5. **server/src/app.js**: editado para montar os 3 novos routers.

Validação E2E: criar curso → criar 3 fases → tentar ordem duplicada (409) → reordenar swap 1↔3 (deu certo, fase 2 ficou no meio) → criar tipo → tentar deletar fase com tipo (409) → tentar deletar curso com fases (409) → sem token (401) → com token de aluno (403). Tudo passou.

### Etapa 2.2 — Empresas + Turmas (commit `f4ad9c9`)

1. **Módulo `empresas/`** (4 arquivos): standalone, sem FKs interessantes. Apenas valida email do supervisor com Zod.
2. **Módulo `turmas/`** (4 arquivos): introduz a **validação cruzada de papel**. Quando o coordenador cria uma turma, ele passa um `orientadorId`. O service vai no banco verificar que esse usuário existe **e que tem papel `orientador`**. Sem isso, o coordenador poderia colocar um aluno como "orientador" — burlando o RBAC.
3. **server/src/app.js**: editado para montar `/api/empresas` e `/api/turmas`.

Validação E2E: criar empresa → 400 em body inválido → criar turma com orientador real → tentar criar turma usando aluno como "orientador" (409) → tentar com coordenador (409) → filtro `?cursoId=...` na listagem → PUT alterando período.

---

## 12. Decisões importantes e por quê

| Decisão | Por quê |
|---|---|
| **Schema completo na 1ª migration** | Evita uma cascata de migrations triviais à medida que os módulos vão sendo construídos. Tabelas existem antes mesmo de termos CRUD para elas. |
| **Postgres na nuvem (Supabase)** | Zero setup local, plano grátis, painel web para inspecionar dados, integração simples com Prisma via PgBouncer (pooler porta 6543) + direct connection (5432 para migrations). |
| **ESM (`"type": "module"`)** | É o padrão moderno do Node. Sintaxe `import/export` igual ao frontend, sem `require`. |
| **`node --watch` em vez de nodemon** | Built-in desde o Node 18, sem dependência extra. |
| **Cada módulo separado em 4 arquivos** | Cada arquivo com **uma** responsabilidade. Diff de PR fica focado. Em vez de "arquivo cursos.js de 300 linhas", são 4 arquivos curtos. |
| **Controller magro, service gordo** | Service não depende de Express. Se amanhã expor a mesma lógica via CLI, fila ou GraphQL, basta um novo controller. |
| **`AppError` + `errorHandler` central** | Service lança, controller só dá `next(err)`. Um único lugar transforma erro em resposta HTTP. |
| **DELETE bloqueia em vez de cascade** | O coordenador é forçado a desfazer manualmente a estrutura — não há "deletei o curso por engano e perdi tudo". |
| **PATCH atômico para reorder de fases** | Permite swaps que violariam o `@@unique` se feitos via PUT individuais. |
| **Fase atual será DERIVADA, não persistida** (Etapa 3) | Conforme `CLAUDE.md` 2.4. Persistir geraria duas fontes de verdade. |
| **Documento será append-only** (Etapa 3) | Conforme `CLAUDE.md` 2.3. Reenvio = INSERT com `versao + 1`. Nunca UPDATE. Preserva histórico para auditoria. |
| **Senhas de dev fracas no seed** | São propositais e claramente marcadas — não é segredo, é fixture de desenvolvimento. |

---

## 13. O que falta — próximas etapas

### Etapa 3 — Fluxo documental (próxima)

A mais sensível do sistema. Toca o coração do domínio:

- **Estágio**: criar uma instância vinculando aluno + turma + empresa.
- **Upload** de arquivos para o **Cloudinary** (PDF do documento assinado).
- **Documento**: criar com `status='enviado'`. Cada reenvio é uma nova linha (não update) com `versao + 1`.
- **Máquina de estados**: `pendente → enviado → em_analise → aprovado | reprovado`.
- **Parecer**: orientador aprova/reprova com comentário obrigatório.
- **`calcularFaseAtual(estagioId)`**: função pura que olha o estado dos documentos e devolve a fase atual do aluno. **Nunca persistir** esse valor.

### Etapa 4 — Telas

- Perfil do aluno (foto, RA, curso, fase derivada).
- Fila de análise do orientador (aprovar/reprovar com comentário).
- Dashboard do coordenador (alunos agrupados por fase).
- Telas de configuração (CRUDs da Etapa 2) com formulários reais.

### Etapa 5 — Stretch

- Notificações in-app.
- Exportação do dossiê do aluno em PDF.

### Coisas que ficaram fora de escopo do `CLAUDE.md`

- Recuperação de senha.
- Refresh tokens.
- Testes automatizados.
- Controle de carga horária (fase 2 do produto).

---

## 14. Como rodar localmente

**Pré-requisitos:** Node.js 22+, conta no Supabase (ou outro Postgres acessível).

### Backend

```powershell
cd server
copy .env.example .env
# Edite .env e preencha:
#   DATABASE_URL (pooler 6543) — pegue em Supabase → Connect → ORMs → Prisma
#   DIRECT_URL (porta 5432)    — idem
#   JWT_SECRET — gere com: node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"

npm install
npx prisma migrate dev --name init    # cria as tabelas
npm run db:seed                       # cria os 3 usuários de teste
npm run dev                           # sobe em http://localhost:3000
```

### Frontend

```powershell
cd client
copy .env.example .env                # VITE_API_URL=http://localhost:3000
npm install
npm run dev                           # sobe em http://localhost:5173
```

### Login para testes

| Papel | Email | Senha |
|---|---|---|
| coordenador | `coordenador@portal.dev` | `coord1234` |
| orientador | `orientador@portal.dev` | `orient1234` |
| aluno (RA 2024001) | `aluno@portal.dev` | `aluno1234` |

---

## 15. Glossário rápido

- **JWT (JSON Web Token)**: string assinada que carrega informações do usuário. O servidor não guarda sessão — confia no que está dentro do token (porque está assinado e ele pode verificar a assinatura).
- **bcrypt**: algoritmo de hash para senhas. Hash é uma "ida só": dá pra verificar se uma senha bate, mas não dá pra reverter o hash de volta para a senha.
- **Middleware**: função que recebe `(req, res, next)` e roda antes do controller. Em sequência: cors → json parser → auth → rbac → validate → controller → errorHandler.
- **Prisma**: tradutor entre código JavaScript e SQL. Você escreve `prisma.curso.findUnique(...)` e ele gera o SQL.
- **Migration**: arquivo SQL versionado que altera o banco. Time inteiro aplica o mesmo arquivo e fica sincronizado.
- **PgBouncer / Pooler**: intermediário que compartilha conexões com o Postgres. Importante em ambientes com muitos clientes (serverless, etc.). No Supabase, o pooler é a porta 6543.
- **RBAC (Role-Based Access Control)**: controle de acesso por papel. Cada rota declara que papéis podem chamá-la.
- **Append-only**: você só insere, nunca atualiza ou deleta. Histórico fica intacto.
- **Idempotente**: rodar várias vezes dá o mesmo resultado da primeira (ex.: nosso seed usa `upsert`).
