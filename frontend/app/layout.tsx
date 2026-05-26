import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "InnGrid",
  description: "Hospitality operations platform for multi-property teams"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
