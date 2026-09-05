import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Aarsh Nandra | Applied AI Engineer & Researcher",
  description: "Mathematics (Statistics) student at Arizona State University building applied AI systems, research infrastructure, multi-agent simulations, and full-stack intelligent products.",
  openGraph: { title: "Aarsh Nandra | Applied AI Engineer & Researcher", description: "Applied AI systems, research infrastructure, multi-agent simulations, and full-stack intelligent products.", type: "website" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
