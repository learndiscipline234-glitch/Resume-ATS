import { Github, Linkedin, Sparkles } from 'lucide-react';
import { PremiumFooterProps } from '@/types/premium.types';

const PremiumFooter: React.FC<PremiumFooterProps> = ({
  logo,
  tagline,
  links
}) => {
  // Default values if none provided
  const defaultLogo = (
    <div className="flex items-center gap-2">
      <Sparkles className="w-8 h-8 text-[#B6FF00]" />
      <span className="text-2xl font-bold text-white">
        Career<span className="text-[#B6FF00]">AI</span>
      </span>
    </div>
  );

  const defaultTagline = "Empowering careers with AI-driven insights";

  const defaultLinks = [
    {
      label: 'GitHub',
      href: 'https://github.com/adrian-25',
      icon: <Github className="w-5 h-5" />
    },
    {
      label: 'LinkedIn',
      href: 'https://www.linkedin.com/in/adrian-dsouza-b19b4933b',
      icon: <Linkedin className="w-5 h-5" />
    }
  ];

  const displayLogo = logo || defaultLogo;
  const displayTagline = tagline || defaultTagline;
  const displayLinks = links.length > 0 ? links : defaultLinks;

  return (
    <footer className="relative border-t border-[#B6FF00]/20 bg-[#0B0F1A]">
      {/* Subtle top glow */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#B6FF00]/50 to-transparent" />
      
      <div className="container mx-auto max-w-7xl px-6 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo and Tagline */}
          <div className="text-center md:text-left">
            <div className="mb-2">
              {displayLogo}
            </div>
            <p className="text-white/60 text-sm">
              {displayTagline}
            </p>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-4">
            {displayLinks.map((link, index) => (
              <a
                key={index}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 text-white/70 hover:text-[#B6FF00] hover:drop-shadow-[0_0_8px_#B6FF00] transition-all duration-300 rounded-lg hover:bg-[#B6FF00]/10"
                aria-label={link.label}
              >
                {link.icon}
                <span className="text-sm font-medium">{link.label}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-6 border-t border-white/10 text-center">
          <p className="text-white/50 text-sm">
            © {new Date().getFullYear()} CareerAI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default PremiumFooter;
