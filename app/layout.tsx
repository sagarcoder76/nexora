import type { Metadata } from "next";
import "@fontsource-variable/manrope";
import "@fontsource-variable/fraunces";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: {
    default: "Nexora — Your Journey. Every Possibility.",
    template: "%s · Nexora",
  },
  description:
    "Nexora connects transport comparison, multi-modal route planning, stays, local guides, live journey sharing and travel careers in one platform. Built for India.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-cream text-ink antialiased">
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
