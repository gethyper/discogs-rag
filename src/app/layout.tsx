import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Discogs RAG",
  description: "Chat with your vinyl collection",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
