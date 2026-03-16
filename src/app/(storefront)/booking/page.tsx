import { Metadata } from "next";
import { BookingPageClient } from "@/components/booking/booking-page-client";

export const metadata: Metadata = {
  title: "Services & Booking | Pratipal Healing",
  description: "Book your personalized healing session — One to One, Need Based, Group Healing, or Learning Curve.",
};

export default function BookingPage() {
  return <BookingPageClient />;
}
