import { Inter } from "next/font/google";
import type { Metadata } from "next";

import { auth } from "~/server/auth";
import { SiteHeader } from "~/components/site-header";
import { SiteFooter } from "~/components/site-footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "NotePro",
    template: "%s | NotePro",
  },
  description: "A modern notes application built with Next.js",
  keywords: ["notes", "note-taking", "next.js", "react"],
};

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader user={session?.user as any} />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
