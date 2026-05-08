import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "max liu",
  description: "Developer focused on building interactive web experiences",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
