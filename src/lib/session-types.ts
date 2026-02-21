export interface SessionBooking {
  id: string;
  booking_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  session_type: "one_to_one" | "need_based" | "group_healing" | "learning_curve";
  frequency?: "daily" | "once_week" | "twice_week" | "thrice_week";
  healing_type?: string;
  course_type?: string;
  amount: number;
  payment_status: "pending" | "paid" | "failed";
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  notes?: string;
  created_at: string;
  updated_at: string;
}

export const SESSION_TYPES = {
  one_to_one: {
    label: "One to One Healing Sessions",
    description: "Personalized healing sessions tailored to your needs",
    frequencies: [
      { value: "daily", label: "Daily attention", price: 15000 },
      { value: "thrice_week", label: "Thrice a week", price: 10000 },
      { value: "twice_week", label: "Twice a week", price: 7000 },
      { value: "once_week", label: "Once a week", price: 4000 },
    ],
  },
  need_based: {
    label: "Need Based Healing",
    description: "Targeted healing for specific concerns",
    types: [
      { value: "tarot", label: "Tarot Guidance", price: 2000 },
      { value: "eft", label: "Emotional Freedom Technique (EFT)", price: 2500 },
      { value: "reiki", label: "Reiki Energy Healing", price: 3000 },
      { value: "womb", label: "Conceiving to grooming the womb", price: 5000 },
      { value: "acupressure", label: "Acupressure treatment (with yoga recommendations)", price: 3500 },
      { value: "routine", label: "Shape the routine (24 hrs rituals)", price: 4000 },
    ],
  },
  group_healing: {
    label: "Spiritual Guidance and Group Healing",
    description: "Collective healing circles and guided sessions",
    price: 1500,
  },
  learning_curve: {
    label: "Learning Curve",
    description: "Educational courses and workshops",
    courses: [
      { value: "womb_healing", label: "Womb Healing & Fertility", price: 12000 },
      { value: "energy_healing", label: "Energy Healing & EFT", price: 10000 },
      { value: "colour_therapy", label: "Colour Therapy", price: 8000 },
      { value: "candle_making", label: "Healing Candle Making", price: 6000 },
      { value: "salt_making", label: "Healing Salt Making", price: 5000 },
      { value: "bach_remedies", label: "Bach Remedies", price: 9000 },
      { value: "reiki", label: "Reiki (Usui & Karuna)", price: 15000 },
      { value: "chakra_healing", label: "Chakra Healing & Activation", price: 8000 },
      { value: "essential_oils", label: "Essential Oils Education", price: 7000 },
    ],
  },
};
