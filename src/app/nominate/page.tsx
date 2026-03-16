import { NominationForm } from "@/components/nomination/NominationForm";
import Link from "next/link";

export const metadata = {
  title: "Nominate 3 Women | Women to Follow",
  description:
    "Nominate 3 women whose voices deserve to be amplified. Enter their X handles and we'll do the rest.",
};

export default function NominatePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-brand-cream to-white">
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <Link href="/" className="text-xl font-bold text-brand-red">
          #WomenToFollow
        </Link>
        <Link
          href="/directory"
          className="text-sm font-medium text-gray-600 hover:text-brand-red transition-colors"
        >
          Browse Directory
        </Link>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-brand-dark mb-4">
            Nominate <span className="text-brand-red">3 Women</span> to Follow
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Enter the X handles of 3 women whose voices deserve to be amplified.
            We&apos;ll pull in their profiles automatically.
          </p>
        </div>

        <NominationForm />
      </div>
    </main>
  );
}
