import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pivotal — Product operations",
  description: "A focused product administration workspace."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}