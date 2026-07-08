import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Instrument_Sans } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/providers/session-provider";
import { auth } from "@/lib/auth";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const instrument = Instrument_Sans({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "GulfPaws — Pet care you can trust, across the Gulf",
  description:
    "Book vetted dog walkers and cat sitters in Dubai, Abu Dhabi, Riyadh, Jeddah, Doha, Kuwait City, Manama and Muscat.",
};

export const viewport: Viewport = {
  themeColor: "#0e1b24",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html
      lang="en"
      dir="ltr"
      className={`${bricolage.variable} ${instrument.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-petrol text-sand">
        <SessionProvider session={session}>{children}</SessionProvider>
      </body>
    </html>
  );
}
