import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Indian Public School | CBSE School Admissions 2026–27",
  description:
    "Indian Public School is a CBSE co-educational school where curiosity meets excellence — modern campus, experienced faculty and holistic learning. Admissions open for 2026–27.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
