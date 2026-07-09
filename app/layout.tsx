import type { Metadata } from "next";
import { Inter, Oswald } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/AuthContext";
import A11yToggle from "@/components/A11yToggle";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const oswald = Oswald({ subsets: ["latin"], variable: "--font-oswald" });

export const metadata: Metadata = {
  title: "Pulp Kicktion | Vintage Football Experience",
  description: "GenAI Stadium Companion with a 1970s poster feel.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${oswald.variable} antialiased`}
      >
        <AuthProvider>
          {children}
          <A11yToggle />
        </AuthProvider>
      </body>
    </html>
  );
}
