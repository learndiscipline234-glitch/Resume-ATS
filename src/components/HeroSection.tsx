import { useNavigate } from 'react-router-dom';

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <div className="relative w-full min-h-screen overflow-hidden">
      {/* ── Fullscreen Background Video ── */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
        aria-hidden="true"
      >
        <source
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4"
          type="video/mp4"
        />
      </video>

      {/* ── Content Layer ── */}
      <div className="relative z-10 flex flex-col min-h-screen">

        {/* ── Navigation ── */}
        <nav aria-label="Main navigation">
          <div className="flex flex-row items-center justify-between px-8 py-6 max-w-7xl mx-auto w-full">

            {/* Logo */}
            <a
              href="/"
              className="text-3xl tracking-tight text-foreground"
              style={{ fontFamily: "'Instrument Serif', serif" }}
              aria-label="NextStep AI Home"
            >
              NextStep<sup className="text-xs">AI</sup>
            </a>

            {/* Nav Links */}
            <div className="hidden md:flex items-center gap-7">
              <a
                href="/"
                className="text-sm text-foreground transition-colors"
                aria-current="page"
              >
                Home
              </a>
              {[
                { label: 'Features', href: '#features' },
                { label: 'How It Works', href: '#how-it-works' },
                { label: 'Pricing', href: '#pricing' },
              ].map(({ label, href }) => (
                <a
                  key={label}
                  href={href}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {label}
                </a>
              ))}
              <a
                href="/auth"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Sign In
              </a>
            </div>

            {/* Nav CTA */}
            <button
              id="nav-cta-get-started"
              onClick={() => navigate('/auth')}
              className="liquid-glass rounded-full px-6 py-2.5 text-sm text-foreground transition-transform hover:scale-[1.03] cursor-pointer"
            >
              Get Started
            </button>
          </div>
        </nav>

        {/* ── Hero Content ── */}
        <section
          className="relative z-10 flex flex-col items-center justify-center text-center px-6 pt-32 pb-40"
          style={{ minHeight: 'calc(100vh - 88px)' }}
          aria-label="Hero section"
        >
          {/* Headline */}
          <h1
            className="text-5xl sm:text-7xl md:text-8xl font-normal leading-[0.95] max-w-7xl animate-fade-rise"
            style={{
              fontFamily: "'Instrument Serif', serif",
              letterSpacing: '-2.46px',
            }}
          >
            Where your{' '}
            <em className="not-italic text-muted-foreground">next step</em>{' '}
            becomes{' '}
            <em className="not-italic text-muted-foreground">inevitable.</em>
          </h1>

          {/* Subtext */}
          <p
            className="text-muted-foreground text-base sm:text-lg max-w-2xl mt-8 leading-relaxed animate-fade-rise-delay"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            AI-driven resume building, smart job matching, and personalised
            interview coaching — built for ambitious professionals who don't
            leave their careers to chance.
          </p>

          {/* Hero CTA */}
          <button
            id="hero-cta-begin-journey"
            onClick={() => navigate('/auth')}
            className="liquid-glass rounded-full px-14 py-5 text-base text-foreground mt-12 hover:scale-[1.03] cursor-pointer animate-fade-rise-delay-2"
          >
            Begin Your Journey
          </button>
        </section>
      </div>
    </div>
  );
};

export default HeroSection;
