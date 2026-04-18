import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import { NotificationHandler } from "@/components/NotificationHandler";
import { HighContrastProvider } from "@/lib/contexts/HighContrastContext";
import HighContrastToggle from "@/components/HighContrastToggle";
import SkipLink from "@/components/SkipLink";
import KeyboardShortcutsWrapper from "@/components/KeyboardShortcutsWrapper";

export const metadata: Metadata = {
  title: "CrowdGo | Go Smarter. Wait Less. Miss Nothing.",
  description: "The real-time crowd orchestration platform for the next generation of sports fans. No more L lines, just W movement.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <SkipLink />
        <AuthProvider>
          <HighContrastProvider>
            <HighContrastToggle />
            <KeyboardShortcutsWrapper />
            <NotificationHandler />
            {children}
          </HighContrastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
