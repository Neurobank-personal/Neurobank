# Neurobank Backend

En refaktorerad Node.js/Express backend för Neurobank-applikationen.

## Projektstruktur

```
src/
├── config.js              # Konfiguration och environment variables
├── routes/                 # API routes
│   ├── health.js          # Health check endpoints
│   ├── users.js           # User management routes
│   └── notes.js           # Note management routes
├── services/              # Business logic
│   ├── fileService.js     # Filhantering och datalagring
│   ├── userService.js     # Användarhantering
│   ├── noteService.js     # Anteckningshantering
│   └── aiService.js       # OpenAI integration
├── middleware/            # Express middleware
│   └── errorHandler.js    # Centraliserad felhantering
└── utils/                 # Hjälpfunktioner
    └── validation.js      # Datavalidering
```

## Installation

```bash
npm install
```

## Environment Variables

Skapa en `.env` fil i root:
```env
PORT=3001
OPENAI_API_KEY=your_openai_api_key_here
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

## Utveckling

```bash
npm run dev  # Startar med nodemon
```

## Produktion

```bash
npm start
```

## API Endpoints

### Health
- `GET /health` - Server health check

### Users
- `GET /api/users` - Hämta alla användare
- `POST /api/users` - Spara användare (batch)
- `POST /api/users/create` - Skapa ny användare
- `GET /api/users/:userId` - Hämta specifik användare
- `PUT /api/users/:userId` - Uppdatera användare
- `DELETE /api/users/:userId` - Ta bort användare

### Notes
- `POST /api/notes` - Skapa ny anteckning
- `GET /api/notes/user/:userId` - Hämta användarens anteckningar
- `GET /api/notes/:noteId` - Hämta specifik anteckning
- `PUT /api/notes/:noteId` - Uppdatera anteckning
- `DELETE /api/notes/:noteId` - Ta bort anteckning
- `POST /api/notes/process` - Bearbeta anteckning med AI

## AI Processing Types

- `summarize` - Sammanfatta text
- `expand` - Utvidga och fördjupa text
- `analyze` - Analysera text
- `structure` - Strukturera och organisera text

## Fördelar med denna struktur

- **Modulär uppdelning** - Varje del har sitt eget ansvarsområde
- **Enkel testning** - Services kan testas oberoende
- **Skalbarhet** - Lätt att lägga till nya features
- **Underhållbarhet** - Tydlig struktur och separation of concerns
- **Felhantering** - Centraliserad och konsistent error handling
- **Validering** - Robust datavalidering för alla inputs
└── data/              # JSON databas
    ├── users.json
    └── notes.json
```
