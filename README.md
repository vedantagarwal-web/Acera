# Acera

Robinhood-class, AI-powered research & portfolio webapp for Indian equities.

## Monorepo Structure
- `apps/web` – Next.js 14 frontend
- `packages/api` – FastAPI backend
- `packages/ui` – Custom UI kit (shadcn/ui + Radix)

## Getting Started
```sh
pnpm i
make dev
```

## Tech Stack
- Next.js 14, TypeScript, Tailwind CSS, shadcn/ui, Zustand, TanStack Query
- FastAPI, tRPC, Postgres 16 + Timescale, Prisma, pgvector
- Clerk.dev, OpenAI, LangChain, Pinecone

## License
MIT 