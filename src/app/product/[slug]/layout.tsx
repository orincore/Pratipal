import { CartAnimationProvider } from "@/lib/cart-animation-context";
import { HeaderThemeProvider } from "@/lib/header-theme-context";

export default function ProductLayout({ children }: { children: React.ReactNode }) {
  return (
    <HeaderThemeProvider>
      <CartAnimationProvider>
        {children}
      </CartAnimationProvider>
    </HeaderThemeProvider>
  );
}
