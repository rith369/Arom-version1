import type { Metadata, Viewport } from "next";
import { Inter, Kantumruy_Pro } from "next/font/google";
import "./index.css";
import { LanguageProvider } from "./_components/language-provider";
import { AuthProvider } from "./_components/auth-provider";
import { DetectionProvider } from "./_components/detection-provider";
import { SidebarProvider } from "./_components/sidebar-provider";
import { MobileSidebarDrawer } from "./_components/mobile-sidebar-drawer";
import { AnnouncementBanner } from "./_components/announcement-banner";
import { InstallListener } from "./_components/install-app/install-listener";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const kantumruyPro = Kantumruy_Pro({
  variable: "--font-kantumruy-pro",
  subsets: ["khmer", "latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://arom-version1.vercel.app"),
  title: {
    default: "AROM: Your wellness space",
    template: "%s · AROM",
  },
  description: "A calmer mind, a brighter you.",
  applicationName: "AROM",
  appleWebApp: {
    capable: true,
    title: "AROM",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#1f6f5b",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${kantumruyPro.variable} antialiased`}>
      <body>
        <LanguageProvider>
          <AuthProvider>
            <DetectionProvider>
              <SidebarProvider>
                <AnnouncementBanner />
                {children}
                <MobileSidebarDrawer />
                <InstallListener />
              </SidebarProvider>
            </DetectionProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
