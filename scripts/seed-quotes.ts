import "dotenv/config";
import mongoose, { Schema } from "mongoose";

// Generates YYYY-MM-DD going backwards from today
// i=0 → today, i=1 → yesterday, i=2 → 2 days ago, etc.
function dateOffset(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split("T")[0];
}

const quotes = [
  {
    text: "Healing is not a destination — it is the sacred act of returning to yourself, one breath at a time.",
    author: "Dr. Aparnaa Singh",
  },
  {
    text: "Your body is not broken. It is speaking. Learn its language and it will guide you home.",
    author: "Dr. Aparnaa Singh",
  },
  {
    text: "Nature does not hurry, yet everything is accomplished. Trust the pace of your own healing.",
    author: "Lao Tzu",
  },
  {
    text: "The wound is the place where the light enters you.",
    author: "Rumi",
  },
  {
    text: "Every cell in your body is listening to your thoughts. Choose words that heal, not harm.",
    author: "Dr. Aparnaa Singh",
  },
  {
    text: "You are not a drop in the ocean. You are the entire ocean in a drop.",
    author: "Rumi",
  },
  {
    text: "Stillness is where creativity and solutions to problems are found.",
    author: "Eckhart Tolle",
  },
  {
    text: "The greatest medicine of all is to teach people how not to need it.",
    author: "Hippocrates",
  },
  {
    text: "When you plant seeds of intention with love, the universe conspires to help them bloom.",
    author: "Dr. Aparnaa Singh",
  },
  {
    text: "Let food be thy medicine and medicine be thy food.",
    author: "Hippocrates",
  },
  {
    text: "Your energy introduces you before you even speak. Protect it, nurture it, honour it.",
    author: "Dr. Aparnaa Singh",
  },
  {
    text: "The art of healing comes from nature, not from the physician. Therefore the physician must start from nature, with an open mind.",
    author: "Paracelsus",
  },
  {
    text: "Breathe. You are alive. That alone is a miracle worth celebrating today.",
    author: "Dr. Aparnaa Singh",
  },
  {
    text: "To keep the body in good health is a duty, otherwise we shall not be able to keep our mind strong and clear.",
    author: "Buddha",
  },
  {
    text: "Emotions are the language of the soul. When you feel deeply, you are living fully.",
    author: "Dr. Aparnaa Singh",
  },
  {
    text: "The secret of health for both mind and body is not to mourn for the past, worry about the future, but to live the present moment wisely.",
    author: "Buddha",
  },
  {
    text: "A flower does not think of competing with the flower next to it. It just blooms.",
    author: "Zen Proverb",
  },
  {
    text: "Gratitude turns what we have into enough, and more. It turns denial into acceptance, chaos into order.",
    author: "Melody Beattie",
  },
  {
    text: "Your nervous system is your compass. When it feels safe, you heal. Create safety within.",
    author: "Dr. Aparnaa Singh",
  },
  {
    text: "Almost everything will work again if you unplug it for a few minutes — including you.",
    author: "Anne Lamott",
  },
  {
    text: "The soil of the heart must be tended before the seeds of wellness can take root.",
    author: "Dr. Aparnaa Singh",
  },
  {
    text: "In every walk with nature, one receives far more than he seeks.",
    author: "John Muir",
  },
  {
    text: "Rest is not idleness. It is the most productive thing you can do for your healing.",
    author: "Dr. Aparnaa Singh",
  },
  {
    text: "The human body has been designed to resist an infinite number of changes and attacks brought about by its environment.",
    author: "René Dubos",
  },
  {
    text: "You are worthy of the same compassion you so freely give to others. Begin there.",
    author: "Dr. Aparnaa Singh",
  },
];

const quoteSchema = new Schema(
  {
    text: { type: String, required: true },
    author: { type: String, default: "" },
    date: { type: String, required: true, unique: true },
    status: { type: String, enum: ["active", "draft"], default: "active" },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

const Quote = mongoose.models.Quote || mongoose.model("Quote", quoteSchema);

async function main() {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not set in your .env file");
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log("✅ Connected to MongoDB\n");

  let inserted = 0;
  let skipped = 0;

  for (let i = 0; i < quotes.length; i++) {
    const date = dateOffset(i); // today, tomorrow, day after, ...
    const payload = { ...quotes[i], date, status: "active" };

    try {
      await Quote.findOneAndUpdate(
        { date },
        payload,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      console.log(`✔  ${date}  —  "${quotes[i].text.slice(0, 60)}..."`);
      inserted++;
    } catch (err: any) {
      if (err.code === 11000) {
        console.log(`⚠  ${date}  —  already exists, skipped`);
        skipped++;
      } else {
        throw err;
      }
    }
  }

  console.log(`\n🎉 Done — ${inserted} upserted, ${skipped} skipped.`);
  await mongoose.connection.close();
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Seeding failed:", err);
  mongoose.connection.close();
  process.exit(1);
});
