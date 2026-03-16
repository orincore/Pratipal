import { Header } from "@/components/storefront/header";
import { Footer } from "@/components/storefront/footer";
import { CustomerAuthProvider } from "@/lib/customer-auth-context";
import { HeaderThemeProvider } from "@/lib/header-theme-context";
import { CartAnimationProvider } from "@/lib/cart-animation-context";

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CustomerAuthProvider>
      <HeaderThemeProvider>
        <CartAnimationProvider>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </CartAnimationProvider>
      </HeaderThemeProvider>
    </CustomerAuthProvider>
  );
}
