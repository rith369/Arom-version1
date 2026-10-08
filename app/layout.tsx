import type { Metadata } from "next";
import { Inter, Kantumruy_Pro } from "next/font/google";
import "./index.css";
import { LanguageProvider } from "./_components/language-provider";
import { AuthProvider } from "./_components/auth-provider";
import { DetectionProvider } from "./_components/detection-provider";
import { SidebarProvider } from "./_components/sidebar-provider";
import { MobileSidebarDrawer } from "./_components/mobile-sidebar-drawer";

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
  title: {
    default: "AROM: Your wellness space",
    template: "%s · AROM",
  },
  description: "A calmer mind, a brighter you.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${kantumruyPro.variable} antialiased`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{localStorage.removeItem('arom-theme');document.documentElement.classList.remove('dark');delete document.documentElement.dataset.theme;}catch(e){}",
          }}
        />
      </head>
      <body>
        <LanguageProvider>
          <AuthProvider>
            <DetectionProvider>
              <SidebarProvider>
                {children}
                <MobileSidebarDrawer />
              </SidebarProvider>
            </DetectionProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
