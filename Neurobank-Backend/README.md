# Neurobank Backend

Backend API för Neurobank - AI-driven anteckningsbearbetning

## Kom igång

### Installation
```bash
npm install
```

### Environment Variables
Skapa en `.env` fil i root:
```env
PORT=3001
OPENAI_API_KEY=your_openai_api_key_here
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

### Utveckling
```bash
npm run dev  # Startar med nodemon
```

### Produktion
```bash
npm start
```

## API Endpoints

### Health Check
- `GET /health` - Server status

### Users
- `GET /api/users` - Hämta alla användare
- `POST /api/users` - Spara användare

### Notes
- `POST /api/notes` - Skapa ny anteckning
- `GET /api/notes/user/:userId` - Hämta användarens anteckningar
- `POST /api/notes/process` - Bearbeta anteckning med AI

## Projektstruktur
```
backend/
├── server.js          # Huvudserver
├── package.json       # Dependencies
├── .env               # Environment variables
└── data/              # JSON databas
    ├── users.json
    └── notes.json
```
