import { Metadata } from "next";
import { BookingSection } from "@/components/booking/booking-section";

export const metadata: Metadata = {
  title: "Book a Session | Pratipal Healing",
  description: "Book your personalized healing session — One to One, Need Based, Group Healing, or Learning Curve.",
};

export default function BookingPage() {
  return (
    <main>
      <BookingSection />
    </main>
  );
}
