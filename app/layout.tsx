import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OceanicJob - Find Your Dream Job",
  description: "Connect with top employers and find your perfect job opportunity",
};

// Root layout for i18n routing - children contain the locale layout with html/body
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
