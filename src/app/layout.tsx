import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const heading = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

const body = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "FixMate — Smart Device & Home Appliance Repair Service",
    template: "%s · FixMate",
  },
  description:
    "FixMate connects you with verified technicians for smartphone, laptop, AC, refrigerator, TV and appliance repairs. Track every job and pay only after the work is done.",
};

const themeInit = `(function(){try{var t=localStorage.getItem("fixmate-theme");if(t!=="fixmate"&&t!=="fixmate-dark"){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"fixmate-dark":"fixmate"}document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="fixmate" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body className={`${heading.variable} ${body.variable} font-body min-h-screen`}>
        {children}
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
