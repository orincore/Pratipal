require("dotenv/config");
const mongoose = require("mongoose");

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function estimateReadTime(html) {
  const text = html.replace(/<[^>]+>/g, " ");
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

const blogs = [
  {
    title: "Top 10 Essential Oils for Emotional Healing & How to Use Them Daily",
    excerpt:
      "Discover the most powerful essential oils for emotional healing and simple ways to incorporate them into your daily routine for lasting well-being.",
    category: "Aromatherapy",
    tags: ["essential oils", "emotional healing", "aromatherapy", "wellness"],
    featured: true,
    content: `
<h2>In today's fast-paced world</h2>
<p>Emotional stress, anxiety, and mental fatigue have become common challenges. One of the most natural and effective ways to restore emotional balance is through essential oils. Used in aromatherapy for centuries, essential oils can uplift mood, calm the mind, and support overall well-being.</p>

<h2>What Are Essential Oils?</h2>
<p>Essential oils are concentrated plant extracts derived from flowers, leaves, roots, and bark. They carry the natural fragrance and healing properties of the plant, making them powerful tools for emotional healing.</p>

<h2>Top 10 Essential Oils for Emotional Healing</h2>

<h3>1. Lavender Oil</h3>
<p>Known for its calming properties, lavender helps reduce stress, anxiety, and improves sleep quality.</p>

<h3>2. Peppermint Oil</h3>
<p>Refreshes the mind, boosts focus, and helps relieve mental fatigue.</p>

<h3>3. Frankincense Oil</h3>
<p>Often used in meditation, it promotes inner peace and spiritual grounding.</p>

<h3>4. Rose Oil</h3>
<p>Uplifts mood, heals emotional wounds, and promotes self-love.</p>

<h3>5. Chamomile Oil</h3>
<p>Reduces anger, irritability, and emotional tension.</p>

<h3>6. Sandalwood Oil</h3>
<p>Enhances clarity and promotes deep relaxation.</p>

<h3>7. Lemon Oil</h3>
<p>Boosts positivity and helps fight depressive feelings.</p>

<h3>8. Eucalyptus Oil</h3>
<p>Clears mental fog and energizes the mind.</p>

<h3>9. Ylang Ylang Oil</h3>
<p>Balances emotions and reduces stress.</p>

<h3>10. Bergamot Oil</h3>
<p>Known for reducing anxiety and uplifting mood.</p>

<h2>How to Use Essential Oils Daily</h2>

<h3>1. Diffusion</h3>
<p>Add a few drops to a diffuser to create a calming atmosphere at home or office.</p>

<h3>2. Topical Application</h3>
<p>Dilute with a carrier oil and apply to wrists, temples, or behind ears.</p>

<h3>3. Bath Therapy</h3>
<p>Add a few drops to warm bath water for relaxation.</p>

<h3>4. Inhalation</h3>
<p>Simply inhale directly from the bottle or put a drop on a tissue.</p>

<h2>Tips for Best Results</h2>
<ul>
  <li>Always use high-quality, pure essential oils</li>
  <li>Dilute before applying to skin</li>
  <li>Use consistently for long-term benefits</li>
</ul>

<h2>Final Thoughts</h2>
<p>Incorporating essential oils into your daily routine can significantly improve emotional well-being. Whether you're dealing with stress, anxiety, or low mood, these natural remedies offer a simple yet powerful solution.</p>
    `.trim(),
  },
  {
    title: "7 Chakras Explained: Signs of Blockage & Simple Ways to Balance Them",
    excerpt:
      "Learn about the 7 chakras, how to identify blockages, and practical techniques to restore balance for better physical, emotional, and spiritual health.",
    category: "Energy Healing",
    tags: ["chakras", "energy healing", "meditation", "spiritual wellness"],
    featured: false,
    content: `
<p>The concept of chakras originates from ancient spiritual traditions. Chakras are energy centers in the body that influence physical, emotional, and spiritual well-being. When these chakras are balanced, life flows smoothly. But when blocked, they can cause disturbances.</p>

<h2>The 7 Chakras and Their Meanings</h2>

<h3>1. Root Chakra (Muladhara)</h3>
<p>Located at the base of the spine. Represents stability and security.<br/><strong>Blocked signs:</strong> Fear, insecurity<br/><strong>Balance:</strong> Grounding exercises, meditation</p>

<h3>2. Sacral Chakra (Swadhisthana)</h3>
<p>Located below the navel. Governs creativity and emotions.<br/><strong>Blocked signs:</strong> Emotional imbalance<br/><strong>Balance:</strong> Creative activities, water exposure</p>

<h3>3. Solar Plexus Chakra (Manipura)</h3>
<p>Located in the stomach area. Controls confidence and power.<br/><strong>Blocked signs:</strong> Low self-esteem<br/><strong>Balance:</strong> Affirmations, sunlight exposure</p>

<h3>4. Heart Chakra (Anahata)</h3>
<p>Located in the chest. Represents love and compassion.<br/><strong>Blocked signs:</strong> Difficulty in relationships<br/><strong>Balance:</strong> Gratitude practice, forgiveness</p>

<h3>5. Throat Chakra (Vishuddha)</h3>
<p>Located in the throat. Governs communication.<br/><strong>Blocked signs:</strong> Fear of speaking<br/><strong>Balance:</strong> Chanting, honest expression</p>

<h3>6. Third Eye Chakra (Ajna)</h3>
<p>Located between the eyebrows. Represents intuition.<br/><strong>Blocked signs:</strong> Lack of clarity<br/><strong>Balance:</strong> Meditation, visualization</p>

<h3>7. Crown Chakra (Sahasrara)</h3>
<p>Located at the top of the head. Connects to spirituality.<br/><strong>Blocked signs:</strong> Disconnection from purpose<br/><strong>Balance:</strong> Silence, spiritual practices</p>

<h2>Simple Ways to Balance Chakras</h2>
<ul>
  <li>Meditation and breathing exercises</li>
  <li>Yoga and physical movement</li>
  <li>Using crystals and essential oils</li>
  <li>Chanting mantras</li>
</ul>

<h2>Why Chakra Healing Matters</h2>
<p>Balanced chakras lead to better mental clarity, emotional stability, and spiritual growth. It helps you align with your true self and live a more fulfilled life.</p>
    `.trim(),
  },
  {
    title: "Salt Healing Rituals: How to Remove Negative Energy from Home & Aura",
    excerpt:
      "Salt has been used for centuries to cleanse and protect energy. Discover powerful salt rituals to purify your home and aura from negative vibrations.",
    category: "Rituals & Cleansing",
    tags: ["salt healing", "energy cleansing", "rituals", "negative energy", "aura"],
    featured: false,
    content: `
<p>Salt has been used for centuries in spiritual practices to cleanse and protect energy. It is believed to absorb negative vibrations and purify spaces, making it a powerful tool for energy healing.</p>

<h2>Why Salt is Powerful</h2>
<p>Salt is known for its ability to absorb unwanted energy. Whether it's emotional negativity or environmental stress, salt helps neutralize and cleanse it effectively.</p>

<h2>Powerful Salt Rituals</h2>

<h3>1. Salt Bath Ritual</h3>
<p>Add rock salt or sea salt to bath water. Soak for 15–20 minutes to cleanse your aura.</p>

<h3>2. Salt Bowl Method</h3>
<p>Place bowls of salt in corners of your home to absorb negativity.</p>

<h3>3. Doorway Protection</h3>
<p>Sprinkle salt near entrances to prevent negative energy from entering.</p>

<h3>4. Salt Water Mop</h3>
<p>Clean floors using salt water to purify the space.</p>

<h3>5. Hand Cleansing Ritual</h3>
<p>Rub salt between your palms to release stress and negativity.</p>

<h2>When to Use Salt Rituals</h2>
<ul>
  <li>After arguments or emotional stress</li>
  <li>Moving into a new home</li>
  <li>Feeling low or drained</li>
  <li>During full moon or new moon</li>
</ul>

<h2>Tips for Effective Results</h2>
<ul>
  <li>Use natural rock or sea salt</li>
  <li>Dispose of used salt properly</li>
  <li>Combine with intention or prayer</li>
</ul>

<h2>Final Thoughts</h2>
<p>Salt healing is simple, affordable, and highly effective. Regular use can bring peace, positivity, and protection into your life and surroundings.</p>
    `.trim(),
  },
  {
    title: "Why You Attract the Same Relationship Patterns & How to Break the Cycle",
    excerpt:
      "Discover why you keep attracting the same relationship dynamics and learn practical steps to heal emotional wounds and create healthier connections.",
    category: "Emotional Healing",
    tags: ["relationships", "emotional healing", "self-love", "patterns", "healing"],
    featured: false,
    content: `
<p>Have you ever wondered why you keep attracting the same type of partner or experiencing similar relationship issues? This is not a coincidence — it often stems from deep-rooted emotional patterns.</p>

<h2>Why Patterns Repeat</h2>

<h3>1. Subconscious Programming</h3>
<p>Your mind stores past experiences and beliefs, influencing your choices.</p>

<h3>2. Emotional Wounds</h3>
<p>Unhealed trauma attracts similar situations for resolution.</p>

<h3>3. Comfort Zone</h3>
<p>Even unhealthy patterns feel familiar and "safe."</p>

<h3>4. Lack of Self-Worth</h3>
<p>Low self-esteem can lead to settling for less.</p>

<h2>Common Relationship Patterns</h2>
<ul>
  <li>Attracting emotionally unavailable partners</li>
  <li>Repeating toxic dynamics</li>
  <li>Fear of commitment</li>
  <li>Over-giving in relationships</li>
</ul>

<h2>How to Break the Cycle</h2>

<h3>1. Self-Awareness</h3>
<p>Identify patterns and understand their root cause.</p>

<h3>2. Heal Past Wounds</h3>
<p>Work on emotional healing through therapy or spiritual practices.</p>

<h3>3. Set Boundaries</h3>
<p>Learn to say no and protect your energy.</p>

<h3>4. Improve Self-Love</h3>
<p>When you value yourself, you attract better relationships.</p>

<h3>5. Change Beliefs</h3>
<p>Replace limiting beliefs with empowering ones.</p>

<h2>Practical Exercises</h2>
<ul>
  <li>Journaling your relationship experiences</li>
  <li>Daily affirmations</li>
  <li>Meditation for emotional healing</li>
</ul>

<h2>Final Thoughts</h2>
<p>Breaking relationship patterns requires conscious effort and self-growth. Once you heal internally, your external relationships naturally improve.</p>
    `.trim(),
  },
];

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    excerpt: { type: String, default: "" },
    content: { type: String, required: true },
    featured_image: { type: String },
    category: { type: String },
    tags: [{ type: String }],
    author: { type: String, default: "Dr. Aparnaa Singh" },
    status: { type: String, enum: ["draft", "published", "archived"], default: "draft" },
    featured: { type: Boolean, default: false },
    read_time: { type: Number },
    seo_title: { type: String },
    seo_description: { type: String },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

const Blog = mongoose.models.Blog || mongoose.model("Blog", blogSchema);

async function main() {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not set in your .env file");
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log("✅ Connected to MongoDB\n");

  let inserted = 0;
  let skipped = 0;

  for (const blog of blogs) {
    const slug = slugify(blog.title);
    const payload = {
      ...blog,
      slug,
      author: "Dr. Aparnaa Singh",
      status: "published",
      read_time: estimateReadTime(blog.content),
    };

    try {
      await Blog.findOneAndUpdate(
        { slug },
        payload,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      console.log(`✔  "${blog.title.slice(0, 60)}..."`);
      inserted++;
    } catch (err) {
      if (err.code === 11000) {
        console.log(`⚠  Already exists, skipped: "${blog.title.slice(0, 50)}"`);
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
