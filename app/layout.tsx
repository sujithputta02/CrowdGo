import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import { NotificationHandler } from "@/components/NotificationHandler";

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
        <AuthProvider>
          <NotificationHandler />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
