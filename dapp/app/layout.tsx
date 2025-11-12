import type { Metadata } from "next";
import React from "react";
import "./globals.css";
import Providers from "./providers";

export const metadata: Metadata = {
    title: "Document Registry dApp",
    description:
        "Gestión de documentos digitales, firmas y verificaciones sobre Ethereum (Anvil).",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="es">
            <body className="min-h-screen bg-slate-950 text-slate-100 antialiased">
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}

