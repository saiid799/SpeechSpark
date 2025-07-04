import React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "react-hot-toast";
import LoadingBoundary from "@/components/LoadingBoundary";
import ClientErrorHandler from "@/components/ClientErrorHandler";
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="hsl(var(--primary))" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <LoadingBoundary>
          <ClerkProvider
            publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
            appearance={{
              baseTheme: undefined,
              variables: {
                colorPrimary: "hsl(158, 64%, 52%)",
                colorBackground: "hsl(222, 47%, 11%)",
                colorText: "hsl(226, 44%, 91%)",
              },
            }}
          >
            <main className="min-h-screen bg-background text-foreground">
              <ClientErrorHandler />
              {children}
            </main>
            <Toaster
              position="bottom-right"
              toastOptions={{
                duration: 5000,
                style: {
                  background: "hsl(var(--background))",
                  color: "hsl(var(--foreground))",
                  border: "1px solid hsl(var(--border))",
                },
              }}
            />
          </ClerkProvider>
        </LoadingBoundary>
      </body>
    </html>
  );
}
