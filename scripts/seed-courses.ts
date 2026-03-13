import "dotenv/config";
import mongoose, { Schema } from "mongoose";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const instructor = {
  name: "Dr Aparnaa Singh",
  title: "Naturopathy & Holistic Healing Practitioner",
  bio: "Founder – Pratipal. Integrates naturopathy, acupressure, EFT, energy medicine, and plant therapeutics into holistic healing journeys.",
};

const courses = [
  {
    title: "Solfeggio Frequency Healing Course",
    subtitle:
      "Learn how to use powerful sacred sound frequencies to shift energy, release emotional blocks, and restore harmony.",
    description:
      "Solfeggio frequencies are specific sound vibrations known for their ability to influence human energy fields and promote deep healing. This practical course teaches the energetic science behind each frequency and how to integrate them into personal healing rituals and client sessions.",
    price: 777,
    duration: "Self-paced intensive",
    level: "all",
    category: "Sound Healing",
    highlights: [
      "Understand the meaning and healing role of each Solfeggio frequency",
      "Discover how sacred sound vibrations affect the human energy system",
      "Learn techniques for energy cleansing and emotional release",
      "Integrate frequency healing into daily rituals and professional sessions",
      "Build powerful sound healing practices for clients and self-care",
    ],
    curriculum: [
      {
        title: "Sacred Sound Foundations",
        description: "Introduction to Solfeggio frequencies, their origins, and energetic influence on the body-mind system.",
        topics: ["History of Solfeggio scale", "Frequency-emotion mapping", "Energetic hygiene basics"],
      },
      {
        title: "Applied Frequency Healing",
        description: "Practical frameworks to design, facilitate, and integrate sound healing sessions using tuning forks, voice, and recorded tones.",
        topics: ["Session design", "Frequency layering", "Daily integration rituals"],
      },
    ],
    what_you_receive: [
      "Comprehensive study notes",
      "Session recording access",
      "Instant access to the dedicated community group",
    ],
    who_is_this_for: [
      "Healers, therapists, and spiritual practitioners",
      "Sound healers expanding their toolkit",
      "Seekers interested in vibrational healing for self-transformation",
    ],
    bonuses: ["Community support circle"],
    featured: true,
    display_order: 1,
  },
  {
    title: "Colour Therapy Workshop",
    subtitle:
      "Understand and consciously use the vibrational intelligence of colours to support mood, energy, and holistic rituals.",
    description:
      "This immersive workshop dives into chromotherapy principles and how colour frequencies influence emotions, appetite, relationships, and overall well-being. Learn to apply colour wisdom in healing sessions, rituals, and product creation.",
    price: 666,
    duration: "Live workshop + recordings",
    level: "all",
    category: "Chromotherapy",
    highlights: [
      "Understand the energetic qualities of major colours",
      "Learn how colours influence psychology and energy",
      "Discover practical colour therapy techniques for daily life",
      "Use colour mapping for health, mood, and relationship challenges",
      "Apply colour wisdom to candles, salts, and healing products",
    ],
    curriculum: [
      {
        title: "Colour Energy Foundations",
        description: "Explore colour frequencies, symbolism, and their role in vibrational healing.",
        topics: ["Colour as vibration", "Psychology of colour", "Chakra correspondences"],
      },
      {
        title: "Practical Chromotherapy",
        description: "Integrate colours into food, rituals, and product design for targeted outcomes.",
        topics: ["Colour-based nutrition", "Ritual design", "Product palette planning"],
      },
    ],
    what_you_receive: [
      "Complete workshop training",
      "PDF study material",
      "Session recording for future reference",
    ],
    who_is_this_for: [
      "Candle healers and makers",
      "Salt artisans and ritual product creators",
      "Energy workers seeking to refine colour selection",
    ],
    bonuses: [],
    featured: false,
    display_order: 2,
  },
  {
    title: "EFT (Emotional Freedom Techniques) Course",
    subtitle:
      "Release emotional blockages by pairing modern psychology with meridian tapping methods.",
    description:
      "A comprehensive EFT training that blends energy awareness, emotional healing principles, and guided tapping sequences. Learn to facilitate deep emotional release, reduce anxiety, and reprogram limiting beliefs.",
    price: 5999,
    duration: "Multi-session online course",
    level: "all",
    category: "Energy Psychology",
    highlights: [
      "Study the origins and science of EFT",
      "Map emotional energy and subconscious blockages",
      "Master all primary tapping points",
      "Facilitate sessions for stress, trauma, and limiting beliefs",
      "Learn advanced EFT methods for deeper transformation",
    ],
    curriculum: [
      {
        title: "EFT Foundations",
        description: "Principles of tapping, meridian maps, and safety protocols.",
        topics: ["History of EFT", "Meridian theory", "Setup statements"],
      },
      {
        title: "Applied EFT Healing",
        description: "Using EFT for stress, trauma, and belief reprogramming in personal and client sessions.",
        topics: ["Anxiety sessions", "Fear release", "Confidence building"],
      },
    ],
    what_you_receive: [
      "Complete course training",
      "Detailed PDF study material",
      "Session recordings for lifetime review",
    ],
    who_is_this_for: [
      "Holistic healers and therapists",
      "Coaches and counselors",
      "Energy healing practitioners",
      "Wellness professionals",
      "Individuals seeking emotional healing techniques",
    ],
    bonuses: [],
    featured: true,
    display_order: 3,
  },
  {
    title: "Sacred Womb Healing & Fertility Activation Journey",
    subtitle:
      "A two-week immersive to heal the womb, release emotional blockages, and activate conscious fertility.",
    description:
      "This journey blends ancient Vedic wisdom, energy medicine, naturopathy, and holistic fertility practices. Participants restore their womb connection, transmute emotional imprints, and cultivate a receptive environment for conception.",
    price: 15000,
    duration: "2-week guided journey",
    level: "all",
    category: "Womb Healing",
    highlights: [
      "Address emotional, energetic, physical, and spiritual aspects of fertility",
      "Learn womb self-care, nutrition, and movement practices",
      "Experience chakra healing, EFT tapping, and guided meditations",
      "Receive fertility rituals, affirmations, and Vedic wisdom",
      "Integrate naturopathic tools, herbs, and hydrotherapy", 
    ],
    curriculum: [
      {
        title: "Week 1 – Womb Healing Foundations",
        description: "Understanding fertility holistically, emotional trauma release, womb nourishment, and energetic practices.",
        topics: ["Womb as energetic center", "Nutrition & self-care", "Forgiveness and emotional release", "Movement medicine"],
      },
      {
        title: "Week 2 – Advanced Fertility Activation",
        description: "Preparing body-mind-energy for conception with Vedic rituals, herbs, subconscious reprogramming, and stress relief.",
        topics: ["Fertility affirmations", "Ovulation awareness", "Alkaline diet", "Mantras & salt rituals"],
      },
    ],
    what_you_receive: [
      "Live guided sessions",
      "Digital course notes",
      "1-year recording access",
      "Completion certificate",
      "Personalized support and guidance",
    ],
    who_is_this_for: [
      "Women facing fertility challenges",
      "Those healing after miscarriages",
      "Women experiencing hormonal imbalance or irregular cycles",
      "Anyone seeking deeper connection with feminine energy",
    ],
    bonuses: [
      "1-year access to recordings",
      "51 Stress Relief Hacks guide",
      "Guided fertility meditation",
      "Comprehensive digital workbook",
      "Live Q&A support session",
      "Personalized fertility diet chart",
    ],
    featured: true,
    display_order: 4,
  },
  {
    title: "Intention & Ritual Candle Mastery",
    subtitle:
      "Create powerful manifestation and healing candles while building a spiritual product line.",
    description:
      "This training covers live candle making, ritual design, and business guidance to craft intention candles infused with colours, herbs, crystals, and sacred programming.",
    price: 5555,
    duration: "Comprehensive program",
    level: "all",
    category: "Product Mastery",
    highlights: [
      "Live candle making demonstrations",
      "Recipes for manifestation, protection, and healing",
      "Energetic meaning of candle colours",
      "Using crystals, herbs, and essential oils",
      "Charging, energizing, and activating candles",
    ],
    curriculum: [
      {
        title: "Ritual Candle Craft",
        description: "Step-by-step candle creation, colour magick, and intention setting.",
        topics: ["Wax types", "Colour correspondences", "Ingredient selection"],
      },
      {
        title: "Candle Business Blueprint",
        description: "Branding, marketing, and launching a profitable spiritual candle line.",
        topics: ["Brand design", "Social media strategy", "Product positioning"],
      },
    ],
    what_you_receive: [
      "Live training",
      "Recipes and formulations",
      "Business guidance",
    ],
    who_is_this_for: [
      "Spiritual practitioners",
      "Energy healers",
      "Candle makers and holistic product creators",
      "Ritual practitioners building product lines",
    ],
    bonuses: [],
    featured: false,
    display_order: 5,
  },
  {
    title: "Intention & Ritual Salt Mastery",
    subtitle:
      "Learn to craft healing salts and magical powders for cleansing, protection, and manifestation.",
    description:
      "A specialized training that teaches how to combine salts, herbs, oils, and crystals to create intention-based blends while positioning them as premium spiritual wellness products.",
    price: 5555,
    duration: "Focused training",
    level: "all",
    category: "Product Mastery",
    highlights: [
      "Understand the energetic science of salt",
      "Master multiple salt varieties and their uses",
      "Formulate blends for cleansing, protection, and manifestation",
      "Create magical powders for rituals",
      "Charge and program salts with intention",
    ],
    curriculum: [
      {
        title: "Salt Magick Essentials",
        description: "Energetic properties of salts, ingredients, and ritual applications.",
        topics: ["Salt varieties", "Herbs & oils", "Crystal infusions"],
      },
      {
        title: "Building a Salt Brand",
        description: "Packaging, positioning, and marketing healing salts as spiritual products.",
        topics: ["Product differentiation", "Brand storytelling", "Sales channels"],
      },
    ],
    what_you_receive: [
      "In-depth formulation training",
      "Guidance on magical powders",
      "Brand-building insights",
    ],
    who_is_this_for: [
      "Spiritual entrepreneurs",
      "Energy healers",
      "Holistic product creators",
    ],
    bonuses: [],
    featured: false,
    display_order: 6,
  },
  {
    title: "Herb Magic Mastery",
    subtitle:
      "Explore the sacred science of healing and ritual herbs for protection, manifestation, and emotional balance.",
    description:
      "A deep dive into the energetic intelligence of herbs and practical ways to weave them into rituals, healing sessions, and intentional products.",
    price: 4555,
    duration: "Live intensive",
    level: "all",
    category: "Herbal Wisdom",
    highlights: [
      "Understand the energetic science behind herbs",
      "Use herbs for cleansing, protection, and prosperity",
      "Create custom herbal blends",
      "Integrate herbs into healing practices and rituals",
      "Enhance manifestation work with plant allies",
    ],
    curriculum: [
      {
        title: "Herbal Energy Foundations",
        description: "Energetic properties, spiritual significance, and safety.",
        topics: ["Herb correspondences", "Protection blends", "Emotional healing"],
      },
      {
        title: "Practical Herb Magick",
        description: "Applications in rituals, product creation, and manifestation work.",
        topics: ["Ritual design", "Manifestation sachets", "Herbal product ideas"],
      },
    ],
    what_you_receive: [
      "Complete training",
      "Guided applications",
      "Resource lists",
    ],
    who_is_this_for: [
      "Spiritual practitioners",
      "Energy healers",
      "Holistic wellness enthusiasts",
      "Herbal enthusiasts",
    ],
    bonuses: [],
    featured: false,
    display_order: 7,
  },
];

const courseSchema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    subtitle: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    featured_image: { type: String },
    duration: { type: String },
    level: {
      type: String,
      enum: ["beginner", "intermediate", "advanced", "all"],
      default: "all",
    },
    category: { type: String },
    highlights: [{ type: String }],
    curriculum: [
      {
        title: { type: String, required: true },
        description: { type: String, required: true },
        topics: [{ type: String }],
      },
    ],
    what_you_receive: [{ type: String }],
    who_is_this_for: [{ type: String }],
    bonuses: [{ type: String }],
    instructor: {
      name: { type: String, required: true },
      title: { type: String, required: true },
      bio: { type: String, required: true },
    },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },
    featured: { type: Boolean, default: false },
    display_order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Course = mongoose.models.Course || mongoose.model("Course", courseSchema);

async function main() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is not set");
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Seeding courses...\n");

    for (const course of courses) {
      const slug = slugify(course.title);
      const payload = {
        ...course,
        slug,
        instructor,
        status: "published",
      };

      await Course.findOneAndUpdate(
        { slug },
        payload,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      console.log(`✔️  Upserted course: ${course.title}`);
    }

    console.log("\n✅ Course seeding complete.");
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("Course seeding failed", error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

main();
