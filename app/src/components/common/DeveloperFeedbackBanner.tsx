import { Bug, ArrowUpRight, Coins } from 'lucide-react';

export function DeveloperFeedbackBanner({ className = '' }: { className?: string }) {
  const whatsappUrl =
    'https://wa.me/918509986008?text=Hi%20Sourav!%20I%20found%20a%20bug/suggestion%20on%20Techno%20World%20Books.%0A%0A*Issue:*%20';

  return (
    <div
      className={`rounded-xl border border-stone-200/90 bg-stone-50/80 p-4 sm:p-5 text-stone-800 shadow-2xs backdrop-blur-2xs ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start gap-3.5 max-w-2xl">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-stone-200 bg-white text-stone-700 shadow-2xs">
            <Bug className="h-5 w-5 text-stone-800" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono uppercase tracking-wider font-semibold text-stone-500 bg-stone-200/70 px-2 py-0.5 rounded">
                Developer Bounty Program
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-800">
                <Coins className="h-3 w-3" /> Assured Coins
              </span>
            </div>

            <h3 className="font-serif text-base sm:text-lg font-bold text-stone-900 tracking-tight">
              Spotted a Bug? Earn Techno Coins.
            </h3>

            <p className="text-xs text-stone-600 leading-relaxed">
              Found a UI glitch, lag, checkout error, or have a suggestion? Report valid bugs directly to Sourav (Lead Developer) and get rewarded with assured Techno Coins in your wallet.
            </p>

            <p className="text-[11px] text-stone-400 pt-0.5 leading-normal">
              Note: This line is directly to the developer, not customer support. Please drop a WhatsApp message with a screenshot and brief description. No voice calls, please.
            </p>
          </div>
        </div>

        <div className="sm:self-center shrink-0">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-xs font-semibold text-stone-900 shadow-2xs hover:bg-stone-100/80 hover:border-stone-400 transition-all cursor-pointer whitespace-nowrap"
          >
            <span>Message Developer on WhatsApp</span>
            <ArrowUpRight className="h-3.5 w-3.5 text-stone-500" />
          </a>
        </div>
      </div>
    </div>
  );
}
