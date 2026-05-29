# Sdílej úrodu

Školní full-stack aplikace pro sdílení přebytků úrody. Pěstitel vytvoří nabídku, zájemce si zarezervuje konkrétní množství a po vyčerpání zásob se nabídka automaticky označí jako vyprodaná.

## Co aplikace umí

- vytváření nabídek úrody včetně množství, ceny, kontaktu a způsobu vyzvednutí
- validace celkového množství, kroku balení a limitu na osobu
- seznam aktivních nabídek a detail nabídky
- rezervace dostupného množství
- automatické přepnutí nabídky na `SOLD_OUT`
- Swagger dokumentace API na `/api/docs`

## Struktura projektu

```text
backend/   Fastify REST API, Prisma, SQLite
frontend/  React aplikace ve Vite
shared/    Sdílená Zod schemata a TypeScript typy
```

## Požadavky

- Node.js 20+
- npm 10+

## Instalace

Z kořenové složky projektu:

```bash
npm install
```

Databázové soubory `backend/prisma/dev.db` a `backend/prisma/test.db` jsou součástí repozitáře, takže aplikace jde spustit bez další konfigurace.

## Spuštění

Backend i frontend se spouští najednou z kořene:

```bash
npm run dev
```

Po spuštění:

- frontend: `http://localhost:5173`
- backend API: `http://localhost:3000/api`
- Swagger UI: `http://localhost:3000/api/docs`

## Užitečné příkazy

```bash
# Backend testy
npm test --workspace backend

# Backend build / typecheck
npm run build --workspace backend

# Frontend lint
npm run lint --workspace frontend

# Frontend production build
npm run build --workspace frontend

# Frontend preview produkčního buildu
npm run preview --workspace frontend

# Aplikace databázového schématu
npm run db:push --workspace backend

# Naplnění databáze ukázkovými daty
npm run db:seed --workspace backend
```

## API endpointy

| Metoda | Endpoint | Popis |
| --- | --- | --- |
| `GET` | `/api/offers` | Seznam aktivních nabídek |
| `GET` | `/api/offers/:id` | Detail nabídky včetně rezervací |
| `POST` | `/api/offers` | Vytvoření nabídky |
| `POST` | `/api/reservations` | Vytvoření rezervace |

## Testování a kontrola kvality

Backend integrační testy běží nad oddělenou SQLite databází:

```bash
npm test --workspace backend
```

Frontend ověřte minimálně přes lint a produkční build:

```bash
npm run lint --workspace frontend
npm run build --workspace frontend
```

## Lighthouse

Lighthouse má smysl pouštět proti produkčnímu preview, ne proti Vite dev serveru. Dev server obsahuje HMR, WebSocket, React Refresh a development buildy knihoven, takže výsledky umí být zavádějící.

Postup:

```bash
npm run build --workspace frontend
npm run preview --workspace frontend
```

Potom spusťte Lighthouse v prohlížeči proti preview URL, typicky:

```text
http://localhost:4173
```

## Použité knihovny

Frontend:

- React 19
- React Router
- TanStack Query
- React Hook Form
- Zod
- Axios
- Radix UI
- Tailwind CSS
- Lucide React
- Vite

Backend:

- Fastify
- fastify-type-provider-zod
- Fastify Swagger / Swagger UI
- Prisma
- SQLite přes libSQL adapter
- Zod
- Vitest
- tsx

Shared:

- Zod
- sdílená validační schemata a typy pro frontend i backend

## Poznámky

- `.db` soubory jsou v repozitáři záměrně, aby šel projekt rychle spustit a otestovat.
- Lokální generované výstupy jako `dist/`, logy, browser profily z kontrol a `node_modules/` jsou ignorované přes `.gitignore`.

Vytvořil: Jakub Georgiev
