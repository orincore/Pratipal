import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

const CUSTOMER_COOKIE = "customer_session";

interface CustomerSession {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
}

export async function getCustomerSession(): Promise<CustomerSession | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(CUSTOMER_COOKIE);

  if (!sessionCookie?.value) {
    return null;
  }

  const decoded = verifyToken(sessionCookie.value) as (CustomerSession & { sub?: string }) | null;
  if (!decoded) return null;
  return {
    id: decoded.id || decoded.sub || "",
    email: decoded.email,
    first_name: decoded.first_name,
    last_name: decoded.last_name,
  };
}

export async function requireCustomerSession(): Promise<CustomerSession> {
  const session = await getCustomerSession();
  if (!session) {
    throw new Error("Not authenticated");
  }
  return session;
}
