"use client";

import { Inter } from "next/font/google";
import "./globals.css";
import { useEffect } from "react";
import Lenis from "@studio-freight/lenis";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-black text-gray-100`}>
        {children}
      </body>
    </html>
  );
}