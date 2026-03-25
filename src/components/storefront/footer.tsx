import Link from "next/link";
import Image from "next/image";
import { Mail, Phone, MapPin, Instagram, Facebook, Youtube } from "lucide-react";
import LogoMark from "@/app/assets/logo.png";

export function Footer() {
  return (
    <footer>
      <div className="bg-[#f5efe4] py-8">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="relative h-9 w-9">
                  <Image src={LogoMark} alt="Pratipal logo" fill sizes="36px" className="object-contain" />
                </div>
                <h3 className="text-xl font-serif font-bold text-[#232d5f]">Pratipal</h3>
              </div>
              <p className="text-xs text-[#232d5f]/60 leading-relaxed mb-3">
                Handcrafted healing products rooted in ancient Ayurvedic wisdom and crystal therapy.
              </p>
              <div className="flex items-center gap-2">
                {[Instagram, Facebook, Youtube].map((Icon, i) => (
                  <a key={i} href="#" className="h-8 w-8 rounded-full bg-[#232d5f]/10 hover:bg-[#232d5f] text-[#232d5f] hover:text-white flex items-center justify-center transition-all duration-300">
                    <Icon className="h-3.5 w-3.5" />
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-[11px] uppercase tracking-[0.2em] text-[#232d5f] font-semibold mb-3" style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase" }}>Quick Links</h4>
              <ul className="space-y-2">
                {[
                  { label: "Shop All", href: "/shop" },
                  { label: "Courses", href: "/courses" },
                  { label: "Booking", href: "/booking" },
                  { label: "About", href: "/about" },
                ].map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-xs text-[#232d5f]/60 hover:text-[#232d5f] transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Help */}
            <div>
              <h4 className="text-[11px] uppercase tracking-[0.2em] text-[#232d5f] font-semibold mb-3" style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase" }}>Help</h4>
              <ul className="space-y-2">
                {[
                  { label: "Shipping Policy", href: "/shipping-policy" },
                  { label: "Return & Refund", href: "/refund-policy" },
                  { label: "Privacy Policy", href: "/privacy-policy" },
                  { label: "Terms of Service", href: "/terms" },
                  { label: "Disclaimer", href: "/disclaimer" },
                ].map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-xs text-[#232d5f]/60 hover:text-[#232d5f] transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-[11px] uppercase tracking-[0.2em] text-[#232d5f] font-semibold mb-3" style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase" }}>Contact</h4>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-[#d97745] flex-shrink-0" />
                  <span className="text-xs text-[#232d5f]/60">hello@pratipal.in</span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-[#d97745] flex-shrink-0" />
                  <span className="text-xs text-[#232d5f]/60">+91 98765 43210</span>
                </li>
                <li className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-[#d97745] flex-shrink-0" />
                  <span className="text-xs text-[#232d5f]/60">Jaipur, Rajasthan</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#1b244a] py-3">
        <div className="container">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-1 mb-2">
            <p className="text-[11px] text-white/70 tracking-wider">&copy; {new Date().getFullYear()} Pratipal. All rights reserved.</p>
            <p className="text-[11px] text-white/50 tracking-wider">Handcrafted with love in India 🇮🇳</p>
          </div>
          <div className="h-px bg-white/20 w-full" />
        </div>
      </div>
    </footer>
  );
}
