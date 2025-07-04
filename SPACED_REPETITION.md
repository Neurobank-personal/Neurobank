# Spaced Repetition System

Detta dokument beskriver det nya spaced repetition systemet för flashcards i Neurobank.

## Översikt

Flashcards använder nu ett intelligent repetitionssystem som automatiskt schemalägger när kort ska repeteras baserat på hur lätt du tyckte att kortet var.

## Hur det fungerar

### Status för kort

Varje flashcard har nu en status:

- **Remaining**: Kort som är redo att studeras
- **Completed**: Kort som har studerats och väntar på nästa repetitionsdatum

### Svårighetsgrad och repetitionsintervall

När du markerar ett kort under studieläget:

#### Easy (Lätt)

- **Första gången**: 7 dagar
- **Andra gången**: 21 dagar
- **Tredje gången**: 60 dagar
- **Fjärde gången och framåt**: 150 dagar (max)

#### Medium (Medel)

- Nästa repetition blir samma intervall som förra gången
- Minimum 5 dagar

#### Hard (Svårt)

- Nästa repetition blir 60% av förra intervallet
- Minimum 1 dag

### Automatisk förflyttning

Systemet kontrollerar automatiskt när du laddar flashcards om några kort har passerat sitt repetitionsdatum. Kort som har passerat flyttas automatiskt tillbaka till "Remaining" status.

### Manuell uppdatering

Du kan också använda "Refresh Reviews" knappen för att manuellt kontrollera och flytta kort som är redo för repetition.

### Manuell återställning till remaining

För kort i "Completed" status kan du manuellt flytta tillbaka dem till "Remaining" genom att klicka på återställningsknappen (🔄) i kortlistan. Detta är användbart om du vill studera ett kort igen innan dess schemalagda repetitionsdatum.

## UI-förändringar

### DeckView

- **Study Mode**: Visar nu endast kort med status "Remaining"
- **Statistik**: Visar completed/remaining baserat på status istället för lastReviewed
- **Kortlista**: Visar status badges och nästa repetitionsdatum
- **Refresh Reviews knapp**: Manuell uppdatering av reviews
- **Reset knapp**: Återställ completed kort till remaining status (🔄 ikon)

### StudyMode

- Fungerar som tidigare men använder nu den nya markCardReviewed API:n
- Kort flyttas automatiskt till "Completed" när de markeras

## Backend API

### Nya endpoints

- `POST /api/flashcards/user/:userId/refresh-reviews` - Flyttar expired kort tillbaka till remaining
- `PATCH /api/flashcards/:id/reset-to-remaining` - Manuell återställning av kort till remaining status

### Uppdaterade endpoints

- `PATCH /api/flashcards/:id/review` - Beräknar nu nästa repetitionsdatum och sätter status

### Nya fält i flashcard model

- `nextReviewDate`: När kortet ska repeteras igen
- `reviewCount`: Antal gånger kortet har studerats
- `easyCount`: Antal gånger markerat som "Easy" (för progressiva intervall)
- `status`: 'remaining' | 'completed'

## Migration

Befintliga flashcards migreras automatiskt med:

- `status`: 'completed' om lastReviewed finns, annars 'remaining'
- `reviewCount`: 0
- `easyCount`: 0
- `nextReviewDate`: null
