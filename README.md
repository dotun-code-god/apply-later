# apply-later monorepo

This repository is set up as a Yarn workspace monorepo orchestrated with Turborepo, with:

- NestJS backend in `apps/backend`
- Vite + React + TypeScript frontend in `apps/frontend`
- Prisma ORM configured in backend for PostgreSQL

## Project structure

```
.
├── apps
│   ├── backend
│   │   ├── prisma
│   │   │   └── schema.prisma
│   │   └── src
│   │       └── prisma
│   │           ├── prisma.module.ts
│   │           └── prisma.service.ts
│   └── frontend
└── package.json
```

## Prerequisites

- Node.js 20+
- Yarn 1.x
- PostgreSQL running locally or remotely

## Install dependencies

From the repo root:

```bash
yarn install
```

## Turbo commands

Run both apps in parallel:

```bash
yarn dev
```

Run backend only:

```bash
yarn dev:backend
```

Run frontend only:

```bash
yarn dev:frontend
```

## Configure backend environment

Create a backend env file from the example:

```bash
cp apps/backend/.env.example apps/backend/.env
```

Set `DATABASE_URL` in `apps/backend/.env` to your PostgreSQL connection string.

Example:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/apply_later?schema=public"
PORT=3000
```

## Prisma commands

Run from repo root:

```bash
yarn prisma:generate
yarn prisma:migrate:dev --name init
yarn prisma:studio
```

## Useful workspace commands

```bash
yarn build
yarn lint
yarn test
```
