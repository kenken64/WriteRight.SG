import Link from 'next/link';
import { AnimatedCard } from '@/components/ui/animated-card';
import { StickyCta } from '@/components/marketing/sticky-cta';

export function LandingInternational() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-[60px] max-w-[1080px] items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold text-gray-900">
            <img src="/logo.jpg" alt="Sharpener" className="h-8 w-8 rounded-full object-cover" />
            Sharpener
          </Link>
          <nav className="flex items-center gap-1">
            <Link href="#how-it-works" className="hidden rounded-lg px-3 py-2 text-sm text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-900 sm:inline-block">
              How It Works
            </Link>
            <Link href="#pricing" className="hidden rounded-lg px-3 py-2 text-sm text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-900 sm:inline-block">
              Pricing
            </Link>
            <Link href="#faq" className="hidden rounded-lg px-3 py-2 text-sm text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-900 sm:inline-block">
              FAQ
            </Link>
            <Link href="/login" className="ml-1 rounded-[10px] border-[1.5px] border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition-all hover:border-blue-600 hover:bg-blue-50 hover:text-blue-600">
              Log in
            </Link>
            <Link href="/register" className="rounded-[10px] bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm shadow-blue-600/25 transition-all hover:-translate-y-px hover:bg-blue-700 hover:shadow-md hover:shadow-blue-600/30">
              Try Free
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section id="hero" className="relative overflow-hidden px-6 pb-16 pt-20 text-center sm:pb-16 sm:pt-20">
          <div className="pointer-events-none absolute left-1/2 top-[-120px] h-[800px] w-[800px] -translate-x-1/2 rounded-full bg-blue-600/[0.06] blur-none" style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.06) 0%, transparent 70%)' }} />
          <div className="relative">
            <div className="mb-6 inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-4 py-1.5 text-sm font-semibold text-blue-600">
              &#x1F393; Cambridge IGCSE Aligned
            </div>
            <h1 className="mx-auto max-w-[700px] text-4xl font-extrabold leading-[1.15] tracking-tight sm:text-5xl">
              Sharpen every essay
              <br />
              <span className="bg-gradient-to-br from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                — AI feedback in minutes
              </span>
            </h1>
            <p className="mx-auto mt-5 max-w-[540px] text-lg leading-relaxed text-gray-500">
              Submit an essay, get a score, detailed feedback, and a model rewrite in under 2 minutes. Aligned to Cambridge IGCSE English standards.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link href="/register" className="rounded-xl bg-blue-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-blue-600/25 transition-all hover:-translate-y-px hover:bg-blue-700 hover:shadow-blue-600/40">
                Try a Sample Essay — Free
              </Link>
              <Link href="/register" className="rounded-xl border-[1.5px] border-gray-200 bg-white px-8 py-3.5 text-base font-semibold text-gray-700 transition-all hover:border-blue-600 hover:bg-blue-50 hover:text-blue-600">
                Start Free — 3 Essays/Month
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-400">
              <span className="flex items-center gap-1.5">&#x2705; No credit card required</span>
              <span className="flex items-center gap-1.5">&#x2705; Feedback in under 2 minutes</span>
              <span className="flex items-center gap-1.5">&#x2705; Cancel anytime</span>
            </div>
          </div>
        </section>

        {/* Demo Teaser */}
        <div className="relative z-10 mx-auto -mt-4 max-w-[780px] px-6">
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg shadow-black/[0.08]">
            <div className="flex items-center gap-2 border-b bg-gray-50 px-5 py-3 text-xs text-gray-400">
              <div className="flex gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
              </div>
              <span className="ml-2">Sharpener — AI Essay Feedback</span>
            </div>
            <div className="grid min-h-[280px] grid-cols-1 sm:grid-cols-2">
              <div className="border-b p-6 sm:border-b-0 sm:border-r">
                <div className="mb-3 text-[11px] font-bold uppercase tracking-wider text-gray-400">&#x1F4DD; Student&apos;s Essay</div>
                <p className="text-sm leading-7 text-gray-500">
                  The rise of social media has fundamentally changed how young people{' '}
                  <span className="rounded bg-yellow-200 px-0.5">communicate and form relationships</span>. While
                  platforms like Instagram and TikTok offer new avenues for self-expression, they also raise
                  concerns about{' '}
                  <span className="rounded bg-green-200 px-0.5">mental health and the pressure to maintain a curated online identity</span>…
                </p>
              </div>
              <div className="bg-blue-50/60 p-6">
                <div className="mb-3 text-[11px] font-bold uppercase tracking-wider text-gray-400">&#x1F4CA; AI Feedback</div>
                {[
                  { label: 'Content', pct: 85, score: '8.5/10', color: 'bg-green-500', textColor: 'text-green-600' },
                  { label: 'Language', pct: 75, score: '15/20', color: 'bg-green-500', textColor: 'text-green-600' },
                  { label: 'Total', pct: 78, score: '23.5/30', color: 'bg-blue-600', textColor: 'text-blue-600' },
                ].map((row) => (
                  <div key={row.label} className="mb-2 flex items-center gap-3">
                    <span className="w-[100px] text-sm text-gray-500">{row.label}</span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200">
                      <div className={`h-full rounded-full ${row.color}`} style={{ width: `${row.pct}%` }} />
                    </div>
                    <span className={`w-[30px] text-sm font-bold ${row.textColor}`}>{row.score}</span>
                  </div>
                ))}
                <div className="mt-4 rounded-lg border border-green-200 bg-white p-3 text-xs leading-relaxed text-gray-500">
                  <strong className="text-green-600">&#x1F4AA; Strength:</strong> Clear thesis statement with well-structured arguments supported by relevant examples.
                  <br /><br />
                  <strong className="text-green-600">&#x26A0;&#xFE0F; Improve:</strong> Strengthen the counter-argument paragraph to demonstrate balanced analysis.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <section id="how-it-works" className="bg-gray-50 py-16 sm:py-20">
          <div className="mx-auto max-w-[1080px] px-6">
            <div className="mb-12 text-center">
              <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">How It Works</h2>
              <p className="mt-2 text-gray-500">Three steps. Under two minutes.</p>
            </div>
            <div className="grid gap-8 sm:grid-cols-3">
              {[
                { num: '1', title: 'Submit', desc: 'Type in our editor, paste text, or snap a photo of handwritten work. Any English essay.' },
                { num: '2', title: 'Get Scored', desc: 'AI scores on Content + Language using Cambridge IGCSE criteria. Paragraph-level feedback with specific quotes.' },
                { num: '3', title: 'Improve', desc: 'See a model rewrite of your essay side-by-side. Understand exactly what "better" looks like.' },
              ].map((step, i) => (
                <AnimatedCard key={step.num} delay={i * 150}>
                  <div className="text-center">
                    <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-[14px] bg-blue-100 text-xl font-extrabold text-blue-600">
                      {step.num}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">{step.title}</h3>
                    <p className="mx-auto mt-2 max-w-[280px] text-sm text-gray-500">{step.desc}</p>
                  </div>
                </AnimatedCard>
              ))}
            </div>
          </div>
        </section>

        {/* Audience Split */}
        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-[1080px] px-6">
            <div className="mb-12 text-center">
              <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">Built for Your Family</h2>
              <p className="mt-2 text-gray-500">Whether you&apos;re the parent guiding or the student writing</p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              {[
                {
                  icon: '\u{1F468}\u200D\u{1F469}\u200D\u{1F467}',
                  title: 'For Parents',
                  subtitle: 'See your child improve — without hovering',
                  items: [
                    'Track scores and progress trends at a glance',
                    'Set assignments in 30 seconds — pick a topic or use ours',
                    'Costs less than a single tutoring session per month',
                    'Motivate with family rewards tied to real achievements',
                  ],
                },
                {
                  icon: '\u{1F393}',
                  title: 'For Students',
                  subtitle: 'Know exactly what to fix — and how',
                  items: [
                    'Get detailed feedback in 2 minutes, not 2 weeks',
                    'See a model rewrite so you learn from every essay',
                    'Earn achievements and build your streak',
                    'Real-time AI coaching while you write in the editor',
                  ],
                },
              ].map((card) => (
                <AnimatedCard key={card.title}>
                  <div className="rounded-2xl border border-gray-200 bg-white p-8">
                    <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900">
                      {card.icon} {card.title}
                    </h3>
                    <p className="mt-1 text-sm text-gray-400">{card.subtitle}</p>
                    <ul className="mt-5 space-y-2">
                      {card.items.map((item) => (
                        <li key={item} className="flex items-start gap-2 text-sm text-gray-500">
                          <span className="mt-0.5 font-bold text-green-500">&#x2713;</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </AnimatedCard>
              ))}
            </div>
          </div>
        </section>

        {/* Why Sharpener Works */}
        <section className="bg-gray-50 py-16 sm:py-20">
          <div className="mx-auto max-w-[1080px] px-6">
            <div className="mb-12 text-center">
              <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">Why Sharpener Works</h2>
              <p className="mt-2 text-gray-500">Specific feedback, not vague encouragement</p>
            </div>
            <div className="grid gap-6 sm:grid-cols-3">
              {[
                {
                  icon: '\u{1F3AF}',
                  title: 'Know exactly where to improve',
                  desc: 'Paragraph-level scoring across Content, Language, and Organisation — aligned to Cambridge IGCSE standards.',
                  proof: 'Try it free — paste any essay and see the breakdown',
                },
                {
                  icon: '\u2728',
                  title: 'See what "good" looks like',
                  desc: 'AI rewrites your essay with improvements highlighted. Side-by-side comparison so you learn from every attempt.',
                  proof: 'Model rewrite included with every submission',
                },
                {
                  icon: '\u{1F4C8}',
                  title: 'Track progress over time',
                  desc: 'Score history, trend charts, and error patterns. Parents and students both see improvement — backed by data.',
                  proof: 'Progress dashboard for parents and students',
                },
              ].map((b, i) => (
                <AnimatedCard key={b.title} delay={i * 150}>
                  <div className="rounded-2xl border border-gray-200 bg-white p-7">
                    <div className="text-3xl">{b.icon}</div>
                    <h3 className="mt-3 font-bold text-gray-900">{b.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-gray-500">{b.desc}</p>
                    <div className="mt-3 border-t pt-3 text-xs font-semibold text-blue-600">
                      &rarr; {b.proof}
                    </div>
                  </div>
                </AnimatedCard>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="py-16 sm:py-20">
          <div className="mx-auto max-w-[1080px] px-6">
            <div className="mb-12 text-center">
              <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">Simple, Fair Pricing</h2>
              <p className="mt-2 text-gray-500">Start free. Upgrade when you see results.</p>
            </div>
            <div className="mx-auto grid max-w-[720px] gap-6 sm:grid-cols-2">
              <div className="rounded-2xl border border-gray-200 bg-white p-8">
                <h3 className="text-lg font-bold text-gray-900">Free</h3>
                <div className="mt-2 text-4xl font-extrabold text-gray-900">$0</div>
                <p className="mt-1 text-sm text-gray-400">Try it out, no commitment</p>
                <ul className="mt-5 space-y-2.5 text-sm text-gray-500">
                  <li className="flex items-center gap-2"><span className="font-bold text-green-500">&#x2713;</span> 3 essay submissions per month</li>
                  <li className="flex items-center gap-2"><span className="font-bold text-green-500">&#x2713;</span> Full AI scoring + feedback</li>
                  <li className="flex items-center gap-2"><span className="font-bold text-green-500">&#x2713;</span> Model rewrite (view only)</li>
                  <li className="flex items-center gap-2"><span className="font-bold text-green-500">&#x2713;</span> Basic progress tracking</li>
                </ul>
                <Link href="/register" className="mt-6 block rounded-xl border-[1.5px] border-gray-200 py-3 text-center text-sm font-semibold text-gray-700 transition-all hover:border-blue-600 hover:bg-blue-50 hover:text-blue-600">
                  Start Free
                </Link>
              </div>
              <div className="relative rounded-2xl border-2 border-blue-600 bg-white p-8 shadow-lg shadow-blue-600/10">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-3 py-0.5 text-xs font-bold uppercase tracking-wide text-white">
                  Most Popular
                </div>
                <h3 className="text-lg font-bold text-gray-900">Sharpener Plus</h3>
                <div className="mt-2">
                  <span className="text-4xl font-extrabold text-gray-900">$14.90</span>
                  <span className="text-sm text-gray-400"> /month</span>
                </div>
                <p className="mt-1 text-sm text-gray-400">Everything for serious improvement</p>
                <ul className="mt-5 space-y-2.5 text-sm text-gray-500">
                  <li className="flex items-center gap-2"><span className="font-bold text-green-500">&#x2713;</span> <strong>Unlimited</strong> submissions</li>
                  <li className="flex items-center gap-2"><span className="font-bold text-green-500">&#x2713;</span> Full rewrite with copy + export</li>
                  <li className="flex items-center gap-2"><span className="font-bold text-green-500">&#x2713;</span> Unlimited topic generation</li>
                  <li className="flex items-center gap-2"><span className="font-bold text-green-500">&#x2713;</span> Full analytics + trend history</li>
                  <li className="flex items-center gap-2"><span className="font-bold text-green-500">&#x2713;</span> Priority feedback (&lt;2 min)</li>
                  <li className="flex items-center gap-2"><span className="font-bold text-green-500">&#x2713;</span> Up to 3 student profiles</li>
                  <li className="flex items-center gap-2"><span className="font-bold text-green-500">&#x2713;</span> Family rewards system</li>
                </ul>
                <Link href="/register" className="mt-6 block rounded-xl bg-blue-600 py-3 text-center text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-px hover:bg-blue-700">
                  Start 7-Day Free Trial
                </Link>
              </div>
            </div>
            <p className="mx-auto mt-6 max-w-[720px] text-center text-sm text-gray-400">
              &#x1F4A1; <strong className="text-gray-700">$14.90/month</strong> — less than the cost of a single tutoring session.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="bg-gray-50 py-16 sm:py-20">
          <div className="mx-auto max-w-[1080px] px-6">
            <div className="mb-12 text-center">
              <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">Frequently Asked Questions</h2>
            </div>
            <div className="mx-auto max-w-[700px] divide-y divide-gray-200">
              {[
                {
                  q: 'How does the AI score essays?',
                  a: 'Sharpener uses advanced AI calibrated against Cambridge IGCSE English criteria. Essays are scored on Task Fulfilment (10 marks) and Language (20 marks) for a total of 30. Feedback references specific paragraphs from your essay.',
                },
                {
                  q: 'What exam standards does it align to?',
                  a: 'Our scoring rubric is modelled on Cambridge IGCSE English Language criteria. We score Content, Language, Organisation, and Tone/Register — the same dimensions your school uses.',
                },
                {
                  q: 'What year levels does it support?',
                  a: 'Currently Year 9 through Year 11 (IGCSE track). Support for A-Level and IELTS preparation is coming soon.',
                },
                {
                  q: 'Is my child\'s data safe?',
                  a: 'Absolutely. All data is encrypted and stored securely. We never share or sell student data. Essays are processed by AI for scoring only and are not used to train models.',
                },
                {
                  q: 'Can I cancel anytime?',
                  a: 'Yes, cancel with one click from your account settings. No lock-in, no penalty. Your free tier access continues after cancellation.',
                },
                {
                  q: 'Can my child upload handwritten essays?',
                  a: 'Yes! Take a photo of handwritten work and our OCR (optical character recognition) will transcribe it. You can review and edit the transcription before submitting for grading.',
                },
                {
                  q: 'How is this different from ChatGPT?',
                  a: 'ChatGPT gives generic writing feedback. Sharpener scores specifically against Cambridge IGCSE rubric with band scores, tracks progress over time, provides structured model rewrites, and has parent dashboards + student gamification.',
                },
              ].map((faq) => (
                <details key={faq.q} className="group">
                  <summary className="flex cursor-pointer items-center justify-between py-5 text-base font-semibold text-gray-900">
                    {faq.q}
                    <span className="ml-4 text-xl text-gray-400 transition-transform group-open:rotate-45">+</span>
                  </summary>
                  <p className="pb-5 text-sm leading-relaxed text-gray-500">{faq.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="bg-gradient-to-br from-blue-600 to-indigo-600 px-6 py-16 text-center text-white">
          <h2 className="text-2xl font-bold sm:text-3xl">Better essays start here</h2>
          <p className="mt-2 text-blue-100">Paste any essay and see the AI feedback in under 2 minutes. Free, no signup required.</p>
          <Link href="/register" className="mt-6 inline-block rounded-xl bg-white px-8 py-3.5 text-base font-bold text-blue-600 transition-all hover:-translate-y-px hover:bg-blue-50">
            Try a Sample Essay — Free
          </Link>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="mx-auto max-w-[1080px] px-6">
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-400">
            <Link href="#" className="hover:text-gray-700">About</Link>
            <Link href="#faq" className="hover:text-gray-700">FAQ</Link>
            <Link href="#" className="hover:text-gray-700">Terms of Service</Link>
            <Link href="#" className="hover:text-gray-700">Privacy Policy</Link>
            <Link href="#" className="hover:text-gray-700">Contact</Link>
          </div>
          <p className="mt-3 text-center text-xs text-gray-400">
            &copy; {new Date().getFullYear()} Sharpener. Sharpen your writing.
          </p>
        </div>
      </footer>

      <StickyCta />
    </div>
  );
}
