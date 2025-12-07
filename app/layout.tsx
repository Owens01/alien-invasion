import "./globals.css";
import React from "react";

export const metadata = {
  title: "Shooter",
  description: "2D Alien Invasion built with Next.js + TypeScript + Tailwind",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-900 text-slate-100 min-h-screen antialiased">
        {children}
        
      </body>
    </html>
  );
}
