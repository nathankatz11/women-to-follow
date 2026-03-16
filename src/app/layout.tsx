import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Women to Follow | Nominate 3 Women to Amplify",
  description:
    "Join the #WomenToFollow movement founded by Rose Horowitz. Nominate 3 women whose voices deserve to be amplified. Together we can close the visibility gap.",
  openGraph: {
    title: "Women to Follow | Nominate 3 Women to Amplify",
    description:
      "Join the #WomenToFollow movement. Nominate 3 women whose voices deserve to be amplified.",
    siteName: "Women to Follow",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    creator: "@RoseHorowitz31",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-brand-cream text-brand-dark antialiased">
        {children}
      </body>
    </html>
  );
}
