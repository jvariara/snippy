import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn, constructMetadata } from "@/lib/utils";
import Navbar from "@/components/Navbar";
import Providers from "@/components/Providers";
import { Toaster } from "sonner";

import "react-loading-skeleton/dist/skeleton.css";
import { Suspense } from "react";
import { ThemeProvider } from "next-themes";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = constructMetadata();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn(
          "min-h-screen font-sans antialiased bg-zinc-200 dark:bg-inherit",
          inter.className
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          disableTransitionOnChange
        >
          <Providers>
            <Suspense>
              <Toaster richColors position="bottom-right" />
              <Navbar />
              {children}
            </Suspense>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
