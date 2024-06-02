import "@/styles/globals.css";
import "@/styles/markdown.css";
import "@/styles/svg.css";
import "@repo/tailwind-config/css";
import { cn } from "@repo/ui/cn";
import "@repo/ui/css";
import "@repo/ui/css/typography";
import "@repo/ui/css/vars";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { GeistMono } from 'geist/font/mono';
import { GeistSans } from 'geist/font/sans';
import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { cookies } from "next/headers";
import { ReactNode } from "react";
import { AnonSession } from "./(threads)/_components/anon-session";
import { ThemeBodyWrapper } from "./(threads)/_components/theme/theme-body-wrapper";
import { Theme } from "./(threads)/_components/theme/theme-store";
import { ThemeSwitcherButton } from "./(threads)/_components/theme/theme-switcher-button";
import { MediaOverlay } from "./_components/media-overlay/ui/overlay";
import { VisitorsStack } from "./_components/real-time";
import { VisitorSync } from "./_components/real-time/ui/visitor-sync";
// const font = Geologica({
//   subsets: ["latin", "cyrillic"],
//   weight: "variable",
//   variable: "--text-font",
// });

const geist = localFont({
  src: "../font/geist/variable/GeistVF.ttf",
  display: "swap",
  variable: "--text-font"
})

export const metadata: Metadata = {
  title: "YZ13",
  description: "Created by YZ13",
  authors: { name: "YZ13", url: "https://github.com/yz13-env" },
  metadataBase: new URL('https://yz13.space'),
  alternates: {
    canonical: "/"
  },
  openGraph: {
    type: "website",
    countryName: "Russia",
    description: "Portfolio website",
    locale: "RU",
    url: "https://yz13.space",
    title: "YZ13",
    images: "https://yz13.space/thumbnail.png",
  },
  icons: {
    icon: "/favicon.ico"
  },
  twitter: {
    card: "summary",
    title: "YZ13",
    description: "The YZ13 portfolio website",
    siteId: "1794707806584446976",
    creator: "@YZ13_DEV",
    creatorId: "1794707806584446976",
    images: {
      url: "https://yz13.space/thumbnail.png"
    },
  }
};

export const viewport: Viewport = {
  colorScheme: "dark light",
  themeColor: "#000000",
}

type LayoutProps = Readonly<{
  children?: ReactNode
}>
export default function RootLayout({ children }: LayoutProps) {
  const cookiesList = cookies()
  const themeCookie = cookiesList.get("theme")
  const theme: Theme = themeCookie?.value as Theme || "light"
  return (
    <html lang="en" className={cn(GeistSans.variable, GeistMono.variable)}>
      <ThemeBodyWrapper theme={theme}>
        <VisitorSync />
        <div className="w-9 gap-2 flex flex-col h-fit absolute top-6 right-6 z-10">
          <ThemeSwitcherButton />
          <VisitorsStack />
        </div>
        <MediaOverlay />
        <Analytics />
        <SpeedInsights />
        <AnonSession />
        {children}
      </ThemeBodyWrapper>
    </html>
  );
}
