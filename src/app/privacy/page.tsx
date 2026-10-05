import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { Header, Footer } from "@/components/header";
import { en } from "@/lib/i18n";
export const metadata: Metadata = {
  title: "Privacy",
  description:
    "How Pixelpress processes your images on your device and stores only preferences.",
  alternates: { canonical: "/privacy/" },
};
export default function Privacy() {
  return (
    <>
      <Header />
      <main className="privacy-page">
        <ShieldCheck size={28} color="var(--accent)" />
        <h1>{en.privacyHeading}</h1>
        <p>{en.privacyIntro}</p>
        {en.privacySections.map((section) => (
          <section key={section.title}>
            <h2>{section.title}</h2>
            <p>{section.text}</p>
          </section>
        ))}
        <Link href="/" className="button button-outline">
          <ArrowLeft size={15} />
          {en.back}
        </Link>
      </main>
      <Footer />
    </>
  );
}
