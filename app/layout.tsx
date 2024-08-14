import React from 'react'; // Ensure React is imported
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { Inter } from "next/font/google";
import "./globals.css";
import XMPPClient from "../xmpp/XMPPClient";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode; // Explicitly typing 'children' here
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <TooltipProvider> {children} </TooltipProvider>
      </body>
    </html>
  );
}
