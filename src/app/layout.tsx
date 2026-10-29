import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Copydesk — AI Editorial Workspace",
  description:
    "Research briefs and a writing desk for This Week in AI. From sources to a draft you can stand behind.",
};

  export default function RootLayout({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return (
        <html lang="en" className="h-full antialiased">
          <body className="min-h-full">{children}</body>
        </html>
        );
}

