import "~/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "~/components/theme-provider";
import { Toaster } from "sonner";

import { TRPCReactProvider } from "~/trpc/react";

export const metadata: Metadata = {
  title: {
    default: "NotePro - Organize Your Thoughts",
    template: "%s | NotePro",
  },
  description: "Capture, organize, and share your notes with NotePro",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${geist.variable}`}>
      <body className="bg-background min-h-screen font-sans antialiased">
        <TRPCReactProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <div className="flex min-h-screen flex-col">{children}</div>
            <Toaster richColors position="top-right" />
          </ThemeProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
