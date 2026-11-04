import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Mail } from 'lucide-react';
import Logo from '../components/Logo';

const MOCK_VENDORS = [
    { name: 'Harbor IT', initials: 'HI', price: '$46,200', delivery: '21 days', score: 91, rec: true },
    { name: 'Kestrel Supply', initials: 'KS', price: '$44,900', delivery: '45 days', score: 74 },
    { name: 'Linden Tech', initials: 'LT', price: '$51,800', delivery: '14 days', score: 68 },
];

const ProductMock = () => (
    <div className="overflow-hidden rounded-2xl border border-line-strong bg-surface shadow-[0_40px_100px_-30px_rgba(19,41,75,0.45)]">
        {/* Window chrome */}
        <div className="flex items-center gap-3 border-b border-line bg-surface-2 px-4 py-2.5">
            <div className="flex gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-line-strong" />
                <span className="h-2.5 w-2.5 rounded-full bg-line-strong" />
                <span className="h-2.5 w-2.5 rounded-full bg-line-strong" />
            </div>
            <div className="mx-auto max-w-[60%] truncate rounded-md bg-surface px-3 py-0.5 font-mono text-[11px] text-subtle ring-1 ring-line">
                rfp-manager / laptops-and-monitors
            </div>
            <div className="w-10" />
        </div>

        <div className="grid md:grid-cols-[1fr_1.4fr]">
            {/* Prompt → structured */}
            <div className="border-b border-line p-5 md:border-b-0 md:border-r sm:p-6">
                <p className="eyebrow">You wrote</p>
                <p className="mt-2 text-[13px] leading-relaxed text-muted">
                    “We need <span className="highlight text-ink">20 laptops with 16GB RAM</span> and{' '}
                    <span className="highlight text-ink">15 27&quot; monitors</span>. Budget is{' '}
                    <span className="highlight text-ink">$50,000</span>, delivered{' '}
                    <span className="highlight text-ink">within 30 days</span>, net 30, 1-year warranty.”
                </p>

                <p className="eyebrow mt-6">We structured</p>
                <div className="mt-2 divide-y divide-line rounded-lg border border-line text-[12px]">
                    {[
                        ['Budget', '$50,000'],
                        ['Delivery', '≤ 30 days'],
                        ['Payment', 'Net 30'],
                        ['Laptop · 16GB', '× 20'],
                        ['Monitor · 27″', '× 15'],
                    ].map(([k, v]) => (
                        <div key={k} className="flex justify-between px-3 py-1.5">
                            <span className="text-muted">{k}</span>
                            <span className="num font-medium text-ink">{v}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Comparison */}
            <div className="p-5 sm:p-6">
                <div className="flex items-center justify-between">
                    <p className="eyebrow">3 proposals · compared</p>
                    <span className="badge badge-dot badge-success">Sent</span>
                </div>
                <div className="mt-3 overflow-hidden rounded-lg border border-line">
                    <table className="data-table text-[12px]">
                        <thead>
                            <tr>
                                <th>Vendor</th>
                                <th className="text-right">Price</th>
                                <th className="hidden text-right sm:table-cell">Delivery</th>
                                <th className="text-right">Score</th>
                            </tr>
                        </thead>
                        <tbody>
                            {MOCK_VENDORS.map((v) => (
                                <tr key={v.name} className={v.rec ? 'bg-accent-soft/60' : ''}>
                                    <td>
                                        <div className="flex items-center gap-2">
                                            <span className="avatar h-6 w-6 text-[10px]">{v.initials}</span>
                                            <span className="font-medium text-ink">{v.name}</span>
                                        </div>
                                    </td>
                                    <td className="num text-right text-ink">{v.price}</td>
                                    <td className="num hidden text-right text-muted sm:table-cell">{v.delivery}</td>
                                    <td className="num text-right font-medium text-ink">{v.score}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="mt-4 rounded-lg bg-ink p-4 text-white">
                    <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-white/50">Recommendation</p>
                    <p className="mt-1 font-display text-2xl">Harbor IT</p>
                    <p className="mt-1 text-[12px] leading-relaxed text-white/70">
                        $1,300 more than the cheapest bid, but delivers 24 days sooner and includes a 2-year warranty.
                    </p>
                </div>
            </div>
        </div>
    </div>
);

const LandingPage = () => {
    const steps = [
        {
            n: '01',
            title: 'Describe it',
            text: 'Type what you need the way you’d explain it to a colleague. AI extracts items, quantities, budget and terms.',
        },
        {
            n: '02',
            title: 'Send it',
            text: 'Pick vendors from your directory and email a clean, structured RFP to all of them in one click.',
        },
        {
            n: '03',
            title: 'Decide',
            text: 'Replies are pulled from your inbox, parsed, and lined up side by side with a scored recommendation.',
        },
    ];

    return (
        <div className="min-h-screen overflow-x-hidden">
            {/* Nav */}
            <nav className="sticky top-0 z-40 border-b border-line/70 bg-canvas/85 backdrop-blur">
                <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
                    <Logo />
                    <div className="hidden items-center gap-7 text-[13px] text-muted md:flex">
                        <a href="#how" className="hover:text-ink">
                            How it works
                        </a>
                        <a href="#features" className="hover:text-ink">
                            Features
                        </a>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Link to="/login" className="btn btn-ghost">
                            Sign in
                        </Link>
                        <Link to="/signup" className="btn btn-primary">
                            Get started
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero */}
            <section className="relative">
                <div className="dot-grid pointer-events-none absolute inset-x-0 top-0 h-[520px] [mask-image:linear-gradient(to_bottom,black,transparent)]" />
                <div className="relative mx-auto max-w-6xl px-5 pb-16 pt-16 sm:px-8 sm:pt-24">
                    <div className="max-w-4xl animate-fade-in">
                        <span className="inline-flex items-center gap-2 rounded-full border border-line-strong bg-surface py-1 pl-1.5 pr-3 text-xs text-muted">
                            <span className="rounded-full bg-accent px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wide text-white">
                                New
                            </span>
                            AI proposal scoring is live
                        </span>

                        <h1 className="display mt-7 text-[3.25rem] sm:text-7xl lg:text-[5.5rem]">
                            RFPs in minutes,
                            <br />
                            <em className="text-accent">not weeks.</em>
                        </h1>

                        <p className="mt-7 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
                            Describe what you need in plain English. We draft the RFP, email your vendors, read their
                            replies and tell you who to pick — and why.
                        </p>

                        <div className="mt-9 flex flex-wrap items-center gap-3">
                            <Link to="/signup" className="btn btn-primary btn-lg">
                                Start for free
                                <ArrowRight size={16} />
                            </Link>
                            <a href="#how" className="btn btn-secondary btn-lg">
                                See how it works
                            </a>
                        </div>
                        <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.08em] text-subtle">
                            Free to start · No credit card
                        </p>
                    </div>

                    <div className="mt-16 animate-slide-up sm:mt-20">
                        <ProductMock />
                    </div>
                </div>
            </section>

            {/* How it works */}
            <section id="how" className="scroll-mt-16 border-t border-line">
                <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
                    <div className="grid gap-10 lg:grid-cols-[1fr_2fr]">
                        <div>
                            <p className="eyebrow text-accent">How it works</p>
                            <h2 className="display mt-3 text-4xl sm:text-5xl">
                                Three steps.
                                <br />
                                <em>Zero templates.</em>
                            </h2>
                        </div>
                        <div className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-3">
                            {steps.map((s) => (
                                <div key={s.n} className="bg-surface p-6">
                                    <p className="num text-sm text-accent">{s.n}</p>
                                    <p className="display mt-8 text-2xl">{s.title}</p>
                                    <p className="mt-2 text-[13px] leading-relaxed text-muted">{s.text}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Features bento */}
            <section id="features" className="scroll-mt-16 border-t border-line bg-surface-2">
                <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
                    <div className="max-w-2xl">
                        <p className="eyebrow text-accent">Features</p>
                        <h2 className="display mt-3 text-4xl sm:text-5xl">Everything between “we need” and “we signed”.</h2>
                    </div>

                    <div className="mt-12 grid gap-4 md:grid-cols-3">
                        {/* Comparison */}
                        <div className="card flex flex-col p-6 md:col-span-2">
                            <div className="flex-1 space-y-3">
                                {MOCK_VENDORS.map((v) => (
                                    <div key={v.name} className="flex items-center gap-3">
                                        <span className="w-28 shrink-0 truncate text-[13px] text-muted">{v.name}</span>
                                        <div className="h-7 flex-1 overflow-hidden rounded-md bg-surface-3">
                                            <div
                                                className={`flex h-full items-center justify-end rounded-md pr-2 font-mono text-[11px] ${
                                                    v.rec ? 'bg-ink text-white' : 'bg-line-strong text-ink'
                                                }`}
                                                style={{ width: `${v.score}%` }}
                                            >
                                                {v.score}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-8">
                                <p className="font-semibold text-ink">Side-by-side proposal scoring</p>
                                <p className="mt-1 text-[13px] text-muted">
                                    Price, delivery, payment terms and warranty normalized into one table — with a
                                    recommendation you can actually defend.
                                </p>
                            </div>
                        </div>

                        {/* Inbox */}
                        <div className="card flex flex-col p-6">
                            <div className="flex-1 space-y-2">
                                {['Re: RFP — Laptops & monitors', 'Quote attached — Kestrel', 'Proposal: Linden Tech'].map(
                                    (subject, i) => (
                                        <div key={subject} className="flex items-center gap-2.5 rounded-md border border-line bg-surface-2 px-3 py-2">
                                            <Mail size={13} className="shrink-0 text-subtle" />
                                            <span className="flex-1 truncate text-[12px] text-ink">{subject}</span>
                                            {i === 0 && <span className="h-1.5 w-1.5 rounded-full bg-accent" />}
                                        </div>
                                    )
                                )}
                            </div>
                            <div className="mt-8">
                                <p className="font-semibold text-ink">Reads your inbox</p>
                                <p className="mt-1 text-[13px] text-muted">
                                    Vendor replies are fetched and parsed automatically. No copy-pasting quotes.
                                </p>
                            </div>
                        </div>

                        {/* Vendors */}
                        <div className="card flex flex-col p-6">
                            <div className="flex flex-1 items-center -space-x-2">
                                {['HI', 'CS', 'FT', 'AS', 'WW'].map((i) => (
                                    <span key={i} className="avatar h-10 w-10 rounded-full bg-surface text-xs ring-2 ring-surface">
                                        {i}
                                    </span>
                                ))}
                                <span className="avatar h-10 w-10 rounded-full bg-ink text-xs text-white ring-2 ring-surface">
                                    +12
                                </span>
                            </div>
                            <div className="mt-8">
                                <p className="font-semibold text-ink">Vendor directory</p>
                                <p className="mt-1 text-[13px] text-muted">
                                    Every supplier, contact and category in one place, ready to receive your next RFP.
                                </p>
                            </div>
                        </div>

                        {/* Structuring */}
                        <div className="card flex flex-col p-6 md:col-span-2">
                            <div className="flex-1 rounded-lg border border-line bg-surface-2 p-4 font-mono text-[12px] leading-relaxed text-muted">
                                <span className="text-subtle">{'{'}</span>
                                <br />
                                &nbsp;&nbsp;<span className="text-ink">"title"</span>: "Laptops &amp; monitors",
                                <br />
                                &nbsp;&nbsp;<span className="text-ink">"budget"</span>:{' '}
                                <span className="text-accent">50000</span>,{' '}
                                <span className="text-ink">"deliveryDays"</span>: <span className="text-accent">30</span>,
                                <br />
                                &nbsp;&nbsp;<span className="text-ink">"items"</span>: [ {'{'} "name": "Laptop", "qty":{' '}
                                <span className="text-accent">20</span> {'}'}, … ]
                                <br />
                                <span className="text-subtle">{'}'}</span>
                            </div>
                            <div className="mt-8">
                                <p className="font-semibold text-ink">Plain English in, structured RFP out</p>
                                <p className="mt-1 text-[13px] text-muted">
                                    No forms, no templates. Write a sentence; get line items, budget, timeline and
                                    terms you can edit and send.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="px-5 py-20 sm:px-8 sm:py-28">
                <div className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl bg-ink px-6 py-16 text-center sm:px-12 sm:py-24">
                    <div
                        className="pointer-events-none absolute inset-0 opacity-[0.07]"
                        style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '22px 22px' }}
                    />
                    <h2 className="relative font-display text-4xl leading-tight text-white sm:text-6xl">
                        Your next RFP is
                        <br />
                        <em className="text-[#f3a283]">one sentence away.</em>
                    </h2>
                    <div className="relative mt-10 flex flex-wrap items-center justify-center gap-3">
                        <Link to="/signup" className="btn btn-accent btn-lg">
                            Get started free
                            <ArrowRight size={16} />
                        </Link>
                        <Link
                            to="/login"
                            className="btn btn-lg text-white/80 hover:bg-white/10 hover:text-white"
                        >
                            Sign in
                            <ArrowUpRight size={16} />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-line">
                <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-8 sm:flex-row sm:px-8">
                    <Logo size="sm" />
                    <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-subtle">
                        © {new Date().getFullYear()} AI RFP Manager
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
