import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero */}
      <header className="border-b bg-white">
        <div className="container flex h-16 items-center justify-between">
          <span className="text-xl font-bold text-primary">WriteRight SG</span>
          <nav className="flex gap-4">
            <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground">
              Log in
            </Link>
            <Link
              href="/register"
              className="rounded-md bg-primary px-4 py-2 text-sm text-white hover:bg-primary/90"
            >
              Get Started Free
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="container py-24 text-center">
          <h1 className="text-5xl font-bold tracking-tight">
            AI Essay Feedback for
            <br />
            <span className="text-primary">Singapore O-Level Students</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Get instant, MOE-aligned feedback on English essays. Aligned to the 1184 syllabus
            with situational and continuous writing rubrics. Scores match qualified teachers 70%+
            of the time.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Link
              href="/register"
              className="rounded-md bg-primary px-8 py-3 text-lg font-medium text-white hover:bg-primary/90"
            >
              Try Free — 3 Essays/Month
            </Link>
            <Link
              href="#how-it-works"
              className="rounded-md border px-8 py-3 text-lg font-medium hover:bg-muted"
            >
              How It Works
            </Link>
          </div>
        </section>

        {/* Features */}
        <section id="how-it-works" className="border-t bg-muted/50 py-24">
          <div className="container">
            <h2 className="text-center text-3xl font-bold">How WriteRight Works</h2>
            <div className="mt-16 grid gap-8 md:grid-cols-3">
              {[
                {
                  step: '1',
                  title: 'Upload Your Essay',
                  desc: 'Snap a photo of your handwritten essay or type it in. Our OCR handles the rest.',
                },
                {
                  step: '2',
                  title: 'Get AI Feedback',
                  desc: 'Receive band scores, strengths, weaknesses, and actionable next steps — all citing your actual text.',
                },
                {
                  step: '3',
                  title: 'Improve & Track',
                  desc: 'See model rewrites, track your progress over time, and earn achievement badges.',
                },
              ].map((feature) => (
                <div key={feature.step} className="rounded-lg border bg-white p-8">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-lg font-bold text-white">
                    {feature.step}
                  </div>
                  <h3 className="mt-4 text-xl font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-muted-foreground">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="container py-24">
          <h2 className="text-center text-3xl font-bold">Simple Pricing</h2>
          <div className="mx-auto mt-16 grid max-w-3xl gap-8 md:grid-cols-2">
            <div className="rounded-lg border p-8">
              <h3 className="text-xl font-semibold">Free</h3>
              <p className="mt-2 text-3xl font-bold">$0</p>
              <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
                <li>✓ 3 submissions/month</li>
                <li>✓ Full marking + feedback</li>
                <li>✓ Rewrite (view only)</li>
                <li>✓ 30-day analytics</li>
              </ul>
            </div>
            <div className="rounded-lg border-2 border-primary p-8">
              <h3 className="text-xl font-semibold">WriteRight Plus</h3>
              <p className="mt-2 text-3xl font-bold">
                $14.90<span className="text-sm font-normal text-muted-foreground">/month</span>
              </p>
              <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
                <li>✓ Unlimited submissions</li>
                <li>✓ Full rewrite + export</li>
                <li>✓ Unlimited topic generation</li>
                <li>✓ Full analytics history</li>
                <li>✓ Priority processing (&lt;3 min)</li>
                <li>✓ Up to 3 student profiles</li>
              </ul>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} WriteRight SG. Built for Singapore students.
      </footer>
    </div>
  );
}
