const fs = require("fs").promises;
const path = require("path");

async function migrateFlashcards() {
  try {
    const flashcardsPath = path.join(__dirname, "data", "flashcards.json");
    const data = await fs.readFile(flashcardsPath, "utf8");
    const flashcards = JSON.parse(data);

    console.log(`Migrating ${flashcards.length} flashcards...`);

    const migratedFlashcards = flashcards.map((card) => {
      // Add new fields if they don't exist
      const migratedCard = {
        ...card,
        nextReviewDate: card.nextReviewDate || null,
        reviewCount: card.reviewCount || 0,
        easyCount: card.easyCount || 0,
        status: card.status || (card.lastReviewed ? "completed" : "remaining"),
      };

      // Ensure categories is an array
      if (typeof migratedCard.category === "string") {
        migratedCard.categories = [migratedCard.category];
        delete migratedCard.category;
      } else if (
        !migratedCard.categories ||
        !Array.isArray(migratedCard.categories)
      ) {
        migratedCard.categories = [];
      }

      return migratedCard;
    });

    // Write back to file
    await fs.writeFile(
      flashcardsPath,
      JSON.stringify(migratedFlashcards, null, 2)
    );
    console.log("Migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
  }
}

migrateFlashcards();
