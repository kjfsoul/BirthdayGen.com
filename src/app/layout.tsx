import Footer from "@/components/Footer";
import { Header } from "@/components/Header";
import { Toaster } from "@/components/ui/toaster";
import type { Metadata } from "next";
import {
  Caveat,
  DM_Serif_Display,
  Inter,
  Lora,
  Merriweather,
  Montserrat,
  Nunito,
  Playfair_Display,
  Poppins,
} from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-poppins",
});
const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
});
const nunito = Nunito({ subsets: ["latin"], variable: "--font-nunito" });
const lora = Lora({ subsets: ["latin"], variable: "--font-lora" });
const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair-display",
});
const merriweather = Merriweather({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-merriweather",
});
const dmSerifDisplay = DM_Serif_Display({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-dm-serif-display",
});
const caveat = Caveat({ subsets: ["latin"], variable: "--font-caveat" });

export const metadata: Metadata = {
  title: "Z.ai Code Scaffold - AI-Powered Development",
  description:
    "Modern Next.js scaffold optimized for AI-powered development with Z.ai. Built with TypeScript, Tailwind CSS, and shadcn/ui.",
  keywords: [
    "Z.ai",
    "Next.js",
    "TypeScript",
    "Tailwind CSS",
    "shadcn/ui",
    "AI development",
    "React",
  ],
  authors: [{ name: "Z.ai Team" }],
  openGraph: {
    title: "Z.ai Code Scaffold",
    description: "AI-powered development with modern React stack",
    url: "https://chat.z.ai",
    siteName: "Z.ai",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Z.ai Code Scaffold",
    description: "AI-powered development with modern React stack",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${poppins.variable} ${montserrat.variable} ${nunito.variable} ${lora.variable} ${playfairDisplay.variable} ${merriweather.variable} ${dmSerifDisplay.variable} ${caveat.variable} antialiased`}
      >
        <Header />
        {children}
        <Footer />
        <Toaster />
      </body>
    </html>
  );
}
