# Portal de Estágio

Sistema web para digitalizar a documentação das fases de estágio de uma faculdade.

> Veja `CLAUDE.md` para o contexto completo de domínio, modelo de dados e design.

## Estrutura

```
portal-estagio/
├── server/   # API Node.js + Express + Prisma
└── client/   # Frontend React + Vite
```

## Pré-requisitos

- Node.js 22+
- Um PostgreSQL acessível (recomendado: [Neon](https://neon.tech) ou [Supabase](https://supabase.com))

## Subindo o backend

```bash
cd server
cp .env.example .env        # preencha DATABASE_URL e JWT_SECRET
npm install
npx prisma migrate dev      # cria o banco
npm run db:seed             # cria 1 coordenador, 1 orientador, 1 aluno
npm run dev                 # sobe em http://localhost:3000
```

## Subindo o frontend

```bash
cd client
cp .env.example .env        # VITE_API_URL=http://localhost:3000
npm install
npm run dev                 # sobe em http://localhost:5173
```

## Usuários do seed (dev)

| Papel        | Email                      | Senha        |
| ------------ | -------------------------- | ------------ |
| coordenador  | `coordenador@portal.dev`   | `coord1234`  |
| orientador   | `orientador@portal.dev`    | `orient1234` |
| aluno (RA 2024001) | `aluno@portal.dev`   | `aluno1234`  |
