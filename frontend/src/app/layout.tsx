import type {Metadata} from "next";
import "./globals.scss";
import { Toaster } from "sonner";
import localFont from "next/font/local";

export const metadata: Metadata = {
    title: "Сетевой город. Образование"
};

const sfCompact = localFont({
    src: [
        {
            path: "./fonts/SFCompactText-Regular.otf",
            weight: "400",
            style: "normal",
        },
        {
            path: "./fonts/SFCompactText-Medium.otf",
            weight: "500",
            style: "normal",
        },
        {
            path: "./fonts/SFCompactText-Semibold.otf",
            weight: "600",
            style: "normal",
        },
        {
            path: "./fonts/SFCompactText-Bold.otf",
            weight: "700",
            style: "normal",
        },
    ],

    variable: "--font-sf-compact",
});

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>)
{
    return (
        <html lang="ru" style={{ colorScheme: 'light', ['--font-sf-compact' as any]: sfCompact.style.fontFamily }}>
            <head>
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css" crossOrigin="anonymous" referrerPolicy="no-referrer" />
            </head>

            <body>
                <div className="app-layout">
                    {children}
                </div>

                <Toaster position="top-right" richColors closeButton />
            </body>
        </html>
    );
}
