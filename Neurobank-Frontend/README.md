# Neurobank Frontend

Frontend för Neurobank - AI-driven anteckningsbearbetning byggd med Vue 3, TypeScript och Vite.

## Kom igång

### Installation
```bash
npm install
```

### Environment Variables
Skapa en `.env` fil:
```env
VITE_API_URL=http://localhost:3001
```

### Utveckling
```bash
npm run dev
```

### Byggning
```bash
npm run build
```

## Backend
Detta projekt kräver att backend-servern körs separat. Se `../Neurobank-Backend/` för instruktioner.

## Projektstruktur
```
src/
├── components/        # Vue komponenter
├── views/            # Sidor/vyer
├── router/           # Vue Router konfiguration
├── services/         # API services och repositories
├── stores/           # Pinia stores
├── types/            # TypeScript typer
└── config/           # Konfiguration
```

## Teknikstack
- Vue 3 med Composition API
- TypeScript
- Vite
- Vue Router
- CSS för styling
