import Link from "next/link";
import { Globe } from "lucide-react";

// --- Custom Brand Icons (Lucide removed brand logos for trademark reasons) ---
const XIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const LinkedinIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
    <rect x="2" y="9" width="4" height="12"></rect>
    <circle cx="4" cy="4" r="2"></circle>
  </svg>
);

const YoutubeIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"></path>
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
  </svg>
);
// ----------------------------------------------------------------------------

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-[#030303] border-t border-white/[0.05] pt-20 pb-10 overflow-hidden">
      {/* Subtle Ambient Grounding Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80vw] h-[30vh] bg-indigo-500/5 blur-[120px] rounded-t-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* --- TOP: BRAND & LINKS --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12 lg:gap-8 mb-16">
          
          {/* Brand Column (Spans 2) */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-6 group inline-flex">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
                <span className="text-black font-black text-sm tracking-tighter">R</span>
              </div>
              <span className="text-xl font-bold text-white tracking-tight group-hover:text-slate-200 transition-colors">
                Revolut
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed max-w-xs mb-8">
              One app, all things money. Join over 70 million users worldwide who trust us with their daily finances and global transfers.
            </p>
            
            {/* Region Selector */}
            <button className="flex items-center gap-2 text-sm text-slate-300 hover:text-white bg-white/[0.02] hover:bg-white/[0.05] border border-white/10 rounded-full px-4 py-2 transition-colors">
              <Globe className="w-4 h-4" />
              <span>United Kingdom (EN)</span>
            </button>
          </div>

          {/* Links Columns */}
          <div className="lg:col-span-1">
            <h4 className="font-bold text-white mb-6 tracking-wide">Products</h4>
            <ul className="space-y-4 text-sm text-slate-400">
              <li><Link href="#" className="hover:text-white hover:translate-x-1 inline-block transition-all duration-300">Current Account</Link></li>
              <li><Link href="#" className="hover:text-white hover:translate-x-1 inline-block transition-all duration-300">Savings</Link></li>
              <li><Link href="#" className="hover:text-white hover:translate-x-1 inline-block transition-all duration-300">Cards</Link></li>
              <li><Link href="#" className="hover:text-white hover:translate-x-1 inline-block transition-all duration-300">Investments</Link></li>
              <li><Link href="#" className="hover:text-white hover:translate-x-1 inline-block transition-all duration-300">Transfers</Link></li>
            </ul>
          </div>

          <div className="lg:col-span-1">
            <h4 className="font-bold text-white mb-6 tracking-wide">Company</h4>
            <ul className="space-y-4 text-sm text-slate-400">
              <li><Link href="#" className="hover:text-white hover:translate-x-1 inline-block transition-all duration-300">About us</Link></li>
              <li><Link href="#" className="hover:text-white hover:translate-x-1 inline-block transition-all duration-300">Careers</Link></li>
              <li><Link href="#" className="hover:text-white hover:translate-x-1 inline-block transition-all duration-300">Newsroom</Link></li>
              <li><Link href="#" className="hover:text-white hover:translate-x-1 inline-block transition-all duration-300">Contact</Link></li>
              <li><Link href="#" className="hover:text-white hover:translate-x-1 inline-block transition-all duration-300">Leadership</Link></li>
            </ul>
          </div>

          <div className="lg:col-span-1">
            <h4 className="font-bold text-white mb-6 tracking-wide">Legal</h4>
            <ul className="space-y-4 text-sm text-slate-400">
              <li><Link href="#" className="hover:text-white hover:translate-x-1 inline-block transition-all duration-300">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-white hover:translate-x-1 inline-block transition-all duration-300">Terms of Service</Link></li>
              <li><Link href="#" className="hover:text-white hover:translate-x-1 inline-block transition-all duration-300">Cookie Policy</Link></li>
              <li><Link href="#" className="hover:text-white hover:translate-x-1 inline-block transition-all duration-300">Complaints</Link></li>
            </ul>
          </div>
        </div>

        {/* --- MIDDLE: SOCIAL & COPYRIGHT --- */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 py-8 border-t border-white/[0.05]">
          <p className="text-sm text-slate-500 font-medium">
            © {currentYear} Revolut Ltd. All rights reserved.
          </p>
          
          <div className="flex items-center gap-4">
            <Link href="#" className="w-10 h-10 rounded-full bg-white/[0.02] border border-white/[0.05] flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all duration-300">
              <XIcon className="w-4 h-4" />
            </Link>
            <Link href="#" className="w-10 h-10 rounded-full bg-white/[0.02] border border-white/[0.05] flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all duration-300">
              <InstagramIcon className="w-4 h-4" />
            </Link>
            <Link href="#" className="w-10 h-10 rounded-full bg-white/[0.02] border border-white/[0.05] flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all duration-300">
              <LinkedinIcon className="w-4 h-4" />
            </Link>
            <Link href="#" className="w-10 h-10 rounded-full bg-white/[0.02] border border-white/[0.05] flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all duration-300">
              <YoutubeIcon className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* --- BOTTOM: FINE PRINT / LEGAL DISCLAIMERS --- */}
        <div className="pt-8 border-t border-white/[0.05] text-[11px] text-slate-600 space-y-4 leading-relaxed font-medium">
          <p>
            <span className="text-slate-500">¹</span> The Annual Equivalent Rate (AER) shows the interest you can earn over 1 year. AER is compounded, so you'll earn interest on interest already earned. Rates depend on your plan type and savings' currency, from up to 3% on our Standard plan to up to 4% on our Ultra plan. Paid plan subscription fees and T&Cs apply. Interest offered is subject to change and any interest earned is liable to the applicable taxes. Instant Access Savings T&Cs apply.
          </p>
          <p>
            <span className="text-slate-500">²</span> FOR STOCK TRADING: capital at risk. Revolut Trading Ltd provides a non-advised execution-only service in shares. Revolut Trading Ltd does not provide investment advice or personal recommendations. You, as an individual investor, must make your own decisions, seeking independent professional advice if you are unsure as to the suitability or appropriateness of any investment for your individual circumstances or needs.
          </p>
          <p>
            The value of investments can go up as well as down and you may receive less than your original investment or lose the value of your entire initial investment. Past performance and forecasts are not reliable indicators of future results.
          </p>
        </div>

      </div>
    </footer>
  );
}