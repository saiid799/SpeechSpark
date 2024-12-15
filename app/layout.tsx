import React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SpeechSpark",
  description: "AI-Powered Language Learning Platform",
  keywords: ["language learning", "AI", "education", "speech recognition"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <main className="min-h-screen bg-background text-foreground">
            {children}
          </main>
          <Toaster
            position="bottom-right"
            toastOptions={{
              duration: 5000,
              style: {
                background: "var(--background)",
                color: "var(--foreground)",
              },
            }}
          />
        </body>
      </html>
    </ClerkProvider>
  );
}
