import Logo from './Logo';

const AuthLayout = ({ title, subtitle, children, footer }) => (
    <div className="grid min-h-screen lg:grid-cols-2">
        {/* Form side */}
        <div className="flex flex-col px-6 py-8 sm:px-12">
            <Logo />
            <div className="flex flex-1 items-center justify-center py-12">
                <div className="w-full max-w-sm animate-fade-in">
                    <h1 className="display text-4xl">{title}</h1>
                    <p className="mt-2 text-sm text-muted">{subtitle}</p>
                    <div className="mt-8">{children}</div>
                    <p className="mt-8 text-sm text-muted">{footer}</p>
                </div>
            </div>
        </div>

        {/* Showcase side */}
        <div className="relative hidden overflow-hidden bg-ink lg:flex lg:flex-col lg:justify-between lg:p-12">
            <div
                className="pointer-events-none absolute inset-0 opacity-[0.07]"
                style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '22px 22px' }}
            />

            <p className="relative font-mono text-[11px] uppercase tracking-[0.1em] text-white/40">
                From one sentence to a sent RFP
            </p>

            <div className="relative mx-auto w-full max-w-md space-y-3">
                <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-[13px] leading-relaxed text-white/70">
                    “We need 20 laptops with 16GB RAM and 15 monitors. Budget $50k, delivered in 30 days.”
                </div>
                <div className="flex justify-center text-white/30">↓</div>
                <div className="rounded-xl bg-canvas p-5 text-ink shadow-2xl">
                    <div className="flex items-center justify-between">
                        <p className="font-semibold">Laptops &amp; monitors</p>
                        <span className="badge badge-dot badge-warning">Draft</span>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                        <div>
                            <p className="eyebrow">Budget</p>
                            <p className="num mt-1 text-sm font-medium">$50,000</p>
                        </div>
                        <div>
                            <p className="eyebrow">Delivery</p>
                            <p className="num mt-1 text-sm font-medium">30 days</p>
                        </div>
                    </div>
                    <div className="mt-4 divide-y divide-line rounded-lg border border-line bg-surface text-xs">
                        <div className="flex justify-between px-3 py-2">
                            <span>Laptop · 16GB RAM</span>
                            <span className="num text-muted">×20</span>
                        </div>
                        <div className="flex justify-between px-3 py-2">
                            <span>Monitor · 27&quot;</span>
                            <span className="num text-muted">×15</span>
                        </div>
                    </div>
                </div>
            </div>

            <p className="relative max-w-sm font-display text-3xl leading-snug text-white">
                Spend your time choosing vendors, <em className="text-[#f3a283]">not writing documents.</em>
            </p>
        </div>
    </div>
);

export default AuthLayout;
