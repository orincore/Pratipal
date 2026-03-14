import Link from "next/link";
import { Header } from "@/components/storefront/header";
import { Footer } from "@/components/storefront/footer";
import { CustomerAuthProvider } from "@/lib/customer-auth-context";

export default function ProductNotFound() {
  return (
    <CustomerAuthProvider>
      <div className="bg-[#fff7f1] min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-md mx-auto">
            <div className="mb-8">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-12 h-12 text-emerald-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2M4 13h2m13-8l-4 4m0 0l-4-4m4 4V3"
                  />
                </svg>
              </div>
              <h1 className="text-3xl font-serif font-bold text-gray-900 mb-4">
                Product Not Found
              </h1>
              <p className="text-gray-600 mb-8">
                The product you're looking for doesn't exist or may have been removed.
              </p>
            </div>
            
            <div className="space-y-4">
              <Link
                href="/shop"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-medium rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 shadow-md hover:shadow-lg"
              >
                Browse All Products
              </Link>
              
              <div className="text-sm text-gray-500">
                <Link
                  href="/"
                  className="hover:text-emerald-600 transition-colors duration-200"
                >
                  ← Back to Home
                </Link>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </CustomerAuthProvider>
  );
}