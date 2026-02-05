import type { Metadata } from "next";
import Link from "next/link";
import LandingHeader from "../components/LandingHeader";
import Logo from "../components/Logo";

export const metadata: Metadata = {
  title: "ICCT Smart Attendance System | RFID Web App",
  description:
    "RFID-based smart attendance for ICCT Colleges (Rizal Campus): sub-1s scans, live dashboards, exportable reports, and secure role-based access.",
  alternates: {
    canonical: "https://icct-smart-attendance.example.com",
  },
  openGraph: {
    title: "ICCT Smart Attendance System | RFID Web App",
    description:
      "Contactless, instant, error-free RFID attendance with real-time dashboards and exportable reports for ICCT Colleges.",
    url: "https://icct-smart-attendance.example.com",
    siteName: "ICCT Smart Attendance System",
    type: "website",
  },
};

export default function Home() {
  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "ICCT Smart Attendance System",
    applicationCategory: "School Management Software",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "1,500",
      priceCurrency: "PHP",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      reviewCount: "15",
    },
    description:
      "RFID-based attendance web app for ICCT Colleges with live dashboards, exportable reports, and secure role-based access.",
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />

      <LandingHeader />

      <main id="main-content" className="pb-20">
        <section
          className="relative isolate overflow-hidden border-b border-slate-900/60 bg-gradient-to-b from-slate-950 via-slate-950 to-slate-950/90 py-18 sm:py-24 lg:py-28 min-h-[80vh] lg:min-h-[calc(100vh-72px)]"
          aria-labelledby="hero-title"
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.12),transparent_35%),radial-gradient(circle_at_80%_10%,rgba(99,102,241,0.12),transparent_32%),radial-gradient(circle_at_50%_80%,rgba(56,189,248,0.12),transparent_30%)]" />
          <div className="relative mx-auto flex max-w-4xl lg:max-w-5xl flex-col items-center gap-12 px-4 text-center sm:px-6 lg:px-8">
            <div className="space-y-7 lg:space-y-8">
              <div className="space-y-3 lg:space-y-4">
                <h1
                  id="hero-title"
                  className="text-balance text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl"
                >
                  Contactless attendance system, built with{" "}
                  <span className="bg-gradient-to-r from-icct-primary via-icct-secondary to-icct-rfid bg-clip-text text-transparent motion-safe:animate-pulse">
                    precision
                  </span>
                </h1>
                <p className="max-w-3xl text-sm leading-relaxed text-slate-300 sm:text-base lg:text-lg">
                  RFID/NFC taps log attendance in under a second, stream to live dashboards,
                  and export to CSV/PDF with secure role-based access for admins, faculty, IT,
                  and students.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 lg:gap-4">
                <Link
                  href="/login"
                  className="inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-icct-primary to-icct-secondary px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg sm:w-auto"
                >
                  Demo now
                </Link>
                <a
                  href="#pricing"
                  className="inline-flex w-full items-center justify-center rounded-xl border border-slate-700 bg-slate-900/70 px-5 py-2.5 text-sm font-semibold text-slate-100 transition hover:-translate-y-0.5 hover:border-icct-secondary hover:text-icct-secondary sm:w-auto"
                >
                  Get quote
                </a>
              </div>
            </div>

          </div>
        </section>

        <section
          id="features"
          className="border-b border-slate-900/60 bg-slate-950 py-14 sm:py-16"
          aria-labelledby="features-heading"
        >
          <div className="mx-auto flex max-w-6xl flex-col items-center gap-10 px-4 text-center sm:px-6 lg:px-8">
            <div className="max-w-3xl space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                Why it matters
              </p>
              <h2
                id="features-heading"
                className="text-3xl font-semibold tracking-tight text-white sm:text-4xl"
              >
                Minimal setup. Instant results.
              </h2>
              <p className="text-sm leading-relaxed text-slate-300 sm:text-base">
                Built for ICCT classrooms and labs: fast scans, live visibility, and clean exports
                without extra apps. Admin, faculty, IT, and students each get the right level of
                access.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {featureList.map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-slate-900 bg-slate-900/70 p-5 shadow-sm transition hover:border-icct-secondary/60 hover:bg-slate-900"
                >
                  <p className="text-sm font-semibold text-white">{item.title}</p>
                  <p className="mt-2 text-xs text-slate-300 sm:text-sm">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          id="flow"
          className="border-b border-slate-900/60 bg-slate-950 py-14 sm:py-16"
          aria-labelledby="flow-heading"
        >
          <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 text-center sm:px-6 lg:px-8">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                How it works
              </p>
              <h2
                id="flow-heading"
                className="text-3xl font-semibold tracking-tight text-white sm:text-4xl"
              >
                From tap to report in four steps
              </h2>
              <p className="text-sm text-slate-300 sm:text-base">
                No mobile app required. RFID/NFC at the door, live dashboards on the web.
              </p>
            </div>

            <div className="mt-4 grid w-full gap-4 text-left md:grid-cols-4">
              {flowSteps.map((step) => (
                <div
                  key={step.step}
                  className="rounded-3xl border border-slate-900 bg-slate-900/70 p-4"
                >
                  <div className="mb-3 inline-flex h-7 w-7 items-center justify-center rounded-full bg-icct-secondary text-xs font-semibold text-white">
                    {step.step}
                  </div>
                  <p className="text-sm font-semibold text-white">{step.title}</p>
                  <p className="mt-2 text-xs text-slate-300 sm:text-sm">{step.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          id="pricing"
          className="bg-slate-950 py-16 sm:py-20"
          aria-labelledby="pricing-heading"
        >
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                Pricing
              </p>
              <h2
                id="pricing-heading"
                className="text-3xl font-semibold tracking-tight text-white sm:text-4xl"
              >
                Start with a pilot, scale with confidence
              </h2>
              <p className="text-sm text-slate-300 sm:text-base">
                Simple tiers for ICCT campuses. Predictable pricing, export-ready reports.
              </p>
            </div>

            <div className="mt-10 grid gap-6 md:grid-cols-[1.05fr,0.95fr]">
              <div className="flex flex-col rounded-3xl border border-slate-900 bg-slate-900/80 p-6 shadow-lg">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-300">
                  Pilot
                </p>
                <p className="mt-2 text-3xl font-semibold text-white">Free trial</p>
                <p className="mt-2 text-sm text-slate-200">
                  Run in selected rooms and sections before full rollout.
                </p>
                <ul className="mt-4 space-y-2 text-sm text-slate-200">
                  <li>Up to 3 sections · 200 students</li>
                  <li>Live dashboard and scan feed</li>
                  <li>CSV exports for grading sheets</li>
                  <li>Pilot support via email (no credit card required)</li>
                </ul>
                <div className="mt-auto pt-6">
                  <Link
                    href="/login"
                    className="inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-icct-primary to-icct-secondary px-6 py-2.5 text-sm font-semibold text-white shadow-md transition hover:shadow-lg"
                  >
                    Start free trial
                  </Link>
                </div>
              </div>

              <div className="flex flex-col rounded-3xl border border-slate-900 bg-slate-950/80 p-6 shadow-lg">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">
                  Pro
                </p>
                <p className="mt-2 text-3xl font-semibold text-white">
                  ₱500
                  <span className="text-lg font-normal text-slate-300"> /month/school</span>
                </p>
                <p className="mt-2 text-sm text-slate-200">
                  Unlimited rooms, sections, and users with full analytics and notifications.
                </p>
                <ul className="mt-4 space-y-2 text-sm text-slate-200">
                  <li>Unlimited rooms, sections, users</li>
                  <li>Absentee and late alerts (email/SMS)</li>
                  <li>Advanced analytics + PDF exports</li>
                  <li>AR reader placement preview</li>
                  <li>Role-based access and retention controls</li>
                  <li>Email support; priority response for incidents</li>
                </ul>
                <div className="mt-auto pt-6">
                  <a
                    href="mailto:you@example.com"
                    className="inline-flex w-full items-center justify-center rounded-xl border border-slate-800 bg-slate-900 px-6 py-2.5 text-sm font-semibold text-slate-100 transition hover:border-icct-secondary"
                  >
                    Talk to the developer
                  </a>
                </div>
              </div>
            </div>
            <p className="mt-6 text-center text-xs text-slate-500">
              Billed monthly; cancel anytime. Prices shown in PHP, taxes/fees may apply.
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-900/60 bg-slate-950 py-10 text-slate-300">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:grid-cols-[1.2fr,1fr] sm:px-6 lg:px-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Logo variant="compact" />
              <div className="flex flex-col">
                <p className="text-sm font-semibold text-slate-100">ICCT Smart Attendance System</p>
              </div>
            </div>
            <div className="pl-14 sm:pl-16 space-y-4">
              <p className="text-sm text-slate-300 px-2">
                RFID-based attendance system with live visibility, alerts,
                and export-ready reports.
              </p>
              <p className="text-[12px] text-slate-500 pt-8 px-2">
                © {new Date().getFullYear()} ICCT Smart Attendance System. All rights reserved.
              </p>
            </div>
          </div>

          <div className="grid gap-4 text-sm sm:grid-cols-2">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                Links
              </p>
              <div className="flex flex-col gap-2 text-slate-300">
                <a href="#features" className="hover:text-icct-secondary">Features</a>
                <a href="#flow" className="hover:text-icct-secondary">How it works</a>
                <a href="#pricing" className="hover:text-icct-secondary">Pricing</a>
                <Link href="/privacy" className="hover:text-icct-secondary">Privacy policy</Link>
                <Link href="/terms" className="hover:text-icct-secondary">Terms</Link>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                Contact
              </p>
              <div className="flex flex-col gap-2 text-slate-300">
                <a href="mailto:you@example.com" className="hover:text-icct-secondary">
                  rfid.attendance.system.cainta@gmail.com
                </a>
                <a
                  href="https://github.com/your-github/icct-smart-attendance-demo"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-icct-secondary"
                >
                  GitHub demo
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

type StatCardProps = {
  label: string;
  value: string;
  detail: string;
};

function StatCard({ label, value, detail }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-slate-900 bg-slate-900/70 px-4 py-3 shadow-sm">
      <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">{label}</p>
      <p className="text-lg font-semibold text-white">{value}</p>
      <p className="text-[11px] text-slate-400">{detail}</p>
    </div>
  );
}

const featureList = [
  {
    title: "Sub-1s RFID scans",
    body: "RFID/NFC taps log attendance instantly, even during crowded class changes.",
  },
  {
    title: "Live analytics",
    body: "Real-time headcounts, late arrivals, and absentee alerts for every section.",
  },
  {
    title: "Role-based access",
    body: "Admins, faculty, IT, and students get tailored permissions and views.",
  },
  {
    title: "PWA-ready web app",
    body: "Mobile-responsive experience—no app install required for students.",
  },
  {
    title: "Secure + compliant",
    body: "Encrypted storage, GDPR/PDPA-aware data handling, and least-privilege access.",
  },
  {
    title: "Integrations + AR preview",
    body: "Email/SMS alerts and AR reader placement preview.",
  },
];

const flowSteps = [
  {
    step: "1",
    title: "Tap RFID card",
    body: "Student or faculty taps their ICCT RFID/NFC ID at the classroom door.",
  },
  {
    step: "2",
    title: "Instant log",
    body: "System validates and records present/late with timestamps.",
  },
  {
    step: "3",
    title: "Live dashboard",
    body: "Admins and faculty see live counts, late arrivals, and absentees.",
  },
  {
    step: "4",
    title: "Exports",
    body: "One-click CSV/PDF for grading, clearance, and audits.",
  },
];

