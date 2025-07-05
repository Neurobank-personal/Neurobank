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

Progressiva intervall baserat på easy count:

- **1:a gången**: 1 dag
- **2:a gången**: 2 dagar
- **3:e gången**: 3 dagar
- **4:e gången**: 5 dagar
- **5:e gången**: 8 dagar
- **6:e gången**: 13 dagar
- **7:e gången**: 20 dagar
- **8:e gången**: 30 dagar
- **9:e gången**: 45 dagar
- **10:e gången**: 70 dagar
- **11:e gången**: 100 dagar
- **12:e gången**: 150 dagar
- **13:e gången**: 210 dagar
- **14:e gången**: 270 dagar
- **15:e gången och framåt**: 300 dagar (max)
- Ökar easy count för progressiva intervall

#### Medium (Medel)

- Nästa repetition blir samma intervall som förra gången
- Minimum 5 dagar
- **Minskar easy count med 1** om kortet hade en easy streak (för att justera ner från långa intervall)

#### Hard (Svårt)

- Nästa repetition blir 60% av förra intervallet
- Minimum 1 dag
- **Minskar easy count med 2** om kortet hade en easy streak (större justering eftersom kortet var svårare än förväntat)

### Automatisk förflyttning

Systemet kontrollerar automatiskt när du laddar flashcards om några kort har passerat sitt repetitionsdatum. Kort som har passerat flyttas automatiskt tillbaka till "Remaining" status.

### Manuell uppdatering

Du kan också använda "Refresh Reviews" knappen för att manuellt kontrollera och flytta kort som är redo för repetition.

### Manuell återställning till remaining

För kort i "Completed" status kan du manuellt flytta tillbaka dem till "Remaining" genom att klicka på återställningsknappen (🔄) i kortlistan. Detta är användbart om du vill studera ett kort igen innan dess schemalagda repetitionsdatum.

### Easy Count och Adaptiv Inlärning

Systemet håller reda på hur många gånger i rad ett kort har markerats som "Easy" (easy count). Detta används för att:

- **Öka intervall progressivt** när kort är lätta flera gånger i rad
- **Justera ner intervall** när ett kort som varit lätt plötsligt blir svårare

#### Easy Count Justering

- **Easy**: +1 till easy count (längre intervall nästa gång)
- **Medium**: -1 till easy count (signalerar att kortet inte längre är så lätt)
- **Hard**: -2 till easy count (större justering eftersom kortet var mycket svårare än förväntat)

Detta säkerställer att endast kort som konsekvent är lätta får de längsta repetitionsintervallen.

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
