# Sdílej úrodu — REST API

Školní projekt. Backend REST API pro platformu, která umožňuje pěstitelům sdílet přebytky ze zahrady a ostatním si je zarezervovat.

---

## K čemu projekt slouží

Farmáři a zahrádkáři mohou vytvářet **nabídky** (plodina, množství, cena, místo a způsob vyzvednutí). Zájemci pak mohou na nabídku udělat **rezervaci** konkrétního množství. Pokud se vyčerpá dostupné množství, nabídka se automaticky označí jako `SOLD_OUT`.

---

## Co projekt obsahuje

```
sdilej-urodu/
├── backend/                  # Fastify REST API
│   ├── prisma/
│   │   ├── schema.prisma     # Datový model (Offer, Reservation, enumy)
│   │   ├── seed.ts           # Testovací data
│   │   ├── dev.db            # SQLite databáze pro vývoj
│   │   └── test.db           # SQLite databáze pro testy
│   ├── src/
│   │   ├── app.ts            # Sestavení Fastify instance (Zod, Swagger, CORS)
│   │   ├── server.ts         # Spuštění serveru
│   │   ├── lib/
│   │   │   ├── prisma.ts     # Prisma klient (libSQL adapter)
│   │   │   └── errors.ts     # HttpError helper
│   │   └── modules/
│   │       ├── offers/       # GET /api/offers, GET /api/offers/:id, POST /api/offers
│   │       └── reservations/ # POST /api/reservations
│   └── test/
│       └── api.test.ts       # Integrační testy (26 testů, Vitest)
└── shared/                   # Sdílené Zod schémata (validace + typy)
    └── src/
        ├── offers.schema.ts
        ├── reservations.schema.ts
        ├── enums.schema.ts
        └── index.ts
```

### API endpointy

| Metoda | Endpoint | Popis |
|--------|----------|-------|
| `GET` | `/api/offers` | Seznam všech aktivních nabídek |
| `GET` | `/api/offers/:id` | Detail nabídky včetně rezervací |
| `POST` | `/api/offers` | Vytvoření nové nabídky |
| `POST` | `/api/reservations` | Vytvoření rezervace |

Interaktivní dokumentace (Swagger UI) je dostupná na **`/api/docs`** po spuštění serveru.

---

## Spuštění

### Požadavky

- Node.js 20+
- npm 10+

### Instalace závislostí

Z **kořenové složky** projektu:

```bash
npm install
```

### Spuštění vývojového serveru

```bash
cd backend
npm run dev
```

Server naslouchá na `http://localhost:3000`.

---

## Databáze

Projekt používá **SQLite** přes Prisma s libSQL adapterem. Databázový soubor `backend/prisma/dev.db` je součástí repozitáře — není třeba nic nastavovat.

### Přegenerování databáze (volitelné)

Pokud chcete databázi resetovat a znovu aplikovat schéma:

```bash
cd backend
npm run db:push
```

### Seed — naplnění testovacími daty

```bash
cd backend
npm run db:seed
```

Seed vytvoří 4 nabídky (rajčata, cukety, jablka, bylinky) a 3 ukázkové rezervace.

---

## Testy

Testy běží proti oddělené databázi `backend/prisma/test.db` (také součástí repozitáře).

```bash
cd backend
npm test
```

Výstup ukáže výsledky všech 26 integračních testů pokrývajících oba moduly (offers, reservations).

---

## Proč `.env` a `.db` nejsou v `.gitignore`

Jde o školní projekt. Aby zkoušející mohl projekt rovnou spustit bez nutnosti vytvářet konfiguraci nebo inicializovat databázi, jsou tyto soubory záměrně součástí repozitáře. Databáze neobsahuje žádná citlivá ani osobní data.

---

*Vytvořil: Já*
