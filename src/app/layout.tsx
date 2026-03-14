import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "AI Dashboard — All-in-One AI Tools",
  description: "Your personal AI-powered dashboard featuring Notes, YouTube Summarizer, Job Search, and Resume Builder.",
  keywords: ["AI", "dashboard", "notes", "youtube summarizer", "job search", "resume builder"],
  openGraph: {
    title: "AI Dashboard",
    description: "All-in-One AI Tools Dashboard",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased min-h-screen">
        {children}
        <Toaster
          position="bottom-right"
          theme="dark"
          toastOptions={{
            style: {
              background: "hsl(224 71% 6%)",
              border: "1px solid hsl(215 28% 16%)",
              color: "hsl(213 31% 91%)",
            },
          }}
        />
      </body>
    </html>
  );
}
