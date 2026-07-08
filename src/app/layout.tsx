import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Instrument_Sans } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import { SessionProvider } from "@/components/providers/session-provider";
import { ServiceWorkerRegister } from "@/components/pwa/service-worker-register";
import { InstallPrompt } from "@/components/pwa/install-prompt";
import { auth } from "@/lib/auth";
import { isRtl } from "@/i18n/dictionary";

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
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "GulfPaws",
  },
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
  const [session, cookieStore] = await Promise.all([auth(), cookies()]);
  const locale = session?.user?.locale ?? cookieStore.get("gp_locale")?.value ?? "en";
  const dir = isRtl(locale) ? "rtl" : "ltr";

  return (
    <html
      lang={locale}
      dir={dir}
      className={`${bricolage.variable} ${instrument.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-petrol text-sand">
        <SessionProvider session={session}>{children}</SessionProvider>
        <ServiceWorkerRegister />
        <InstallPrompt />
      </body>
    </html>
  );
}
