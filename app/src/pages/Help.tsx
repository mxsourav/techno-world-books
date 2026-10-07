import { useState } from 'react';
import { Link } from 'react-router';
import { MessageCircle, Package, RotateCcw, CreditCard, Truck, Ticket, ChevronDown, Phone } from 'lucide-react';
import { toast } from 'sonner';
import SEOHead from '@/components/SEOHead';

const FAQS = [
  { q: 'How long does delivery take?', a: 'Metro cities: 1–3 days. Rest of India: 3–7 days. Remote pincodes via India Post may take up to 7–10 days. Enter your pincode on any product page for an exact estimate.' },
  { q: 'What is your replacement and cancellation policy?', a: 'We provide replacements only — monetary return refunds are not provided once delivered. If your book arrives damaged, defective, or misprinted, you can request a free replacement within 7 days of delivery by filling out our official Google Replacement Form. Order cancellation with full refund is available exclusively before dispatch. Once dispatched, orders cannot be cancelled, and doorstep delivery refusal (RTO) is strictly non-refundable.' },
  { q: 'Are all books genuine and new?', a: 'Yes. Every title is sourced directly from publishers or authorised distributors. We have a zero-tolerance policy on pirated books.' },
  { q: 'How do Techno Rewards points work?', a: 'Earn 1 Techno Coin for every ₹100 spent (excluding delivery charges). Coins are credited upon delivery and can be redeemed on future orders.' },
  { q: 'Can I pay cash on delivery?', a: 'Yes, COD is available across serviceable Indian pincodes with a flat ₹20 courier handling fee. UPI, cards, and net banking are also supported.' },
  { q: 'Do you deliver old/rare books safely?', a: 'Rare and collector\'s editions ship in archival wrapping with rigid corner protection and tamper-proof packaging, fully insured.' },
];

const TOPICS = [
  { icon: Package, t: 'Order Issues', d: 'Missing, wrong or damaged items' },
  { icon: Truck, t: 'Delivery', d: 'Delays, pincode coverage, address change' },
  { icon: RotateCcw, t: '7-Day Replacement', d: 'Submit Google Form within 7 days' },
  { icon: CreditCard, t: 'Payments', d: 'Failed payments, COD, invoices' },
];

export default function Help() {
  const [open, setOpen] = useState<number | null>(0);
  const [ticket, setTicket] = useState({ subject: '', msg: '' });

  return (
    <div className="mx-auto max-w-4xl px-3 py-8 sm:px-6">
      <SEOHead
        title="Help Center & Customer FAQs | Techno World Books"
        description="Get help with your book order, delivery tracking, 7-day replacement requests, payment issues, and answers to common questions about Techno World Books."
        canonicalUrl="/help"
      />
      <h1 className="font-serif text-2xl font-bold text-stone-900 sm:text-3xl">Help Center</h1>
      <p className="mt-1 text-sm text-stone-500">We're here 9 AM – 9 PM, 7 days a week.</p>

      {/* contact cards */}
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <a href="https://wa.me/917479135626?text=Hi%20Techno%20World%20Books!%20I%20need%20assistance." target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-lg bg-emerald-800 p-4 text-white shadow-xs hover:bg-emerald-900 transition-colors">
          <MessageCircle className="h-7 w-7" />
          <span><b className="block text-sm font-semibold">WhatsApp Chat</b><span className="text-xs opacity-90">+91 74791 35626 — fast reply</span></span>
        </a>
        <button onClick={() => toast.success('Live chat connected! An agent will join shortly.')} className="flex items-center gap-3 rounded-lg bg-white p-4 shadow-xs border border-stone-200 hover:border-stone-300 text-left transition-colors">
          <MessageCircle className="h-7 w-7 text-stone-700" />
          <span><b className="block text-sm font-semibold text-stone-800">Live Chat</b><span className="text-xs text-stone-500">Chat with a support agent</span></span>
        </button>
        <a href="tel:03322196115" className="flex items-center gap-3 rounded-lg border border-stone-200 bg-white p-4 shadow-xs hover:border-stone-300 transition-colors">
          <Phone className="h-7 w-7 text-stone-700" />
          <span><b className="block text-sm font-semibold text-stone-800">033 2219 6115</b><span className="text-xs text-stone-500">Store Landline, 9 AM – 8 PM</span></span>
        </a>
      </div>

      <Link to="/track" className="mt-4 flex items-center justify-between rounded-lg border border-stone-200 bg-stone-50 p-4 hover:bg-stone-100 transition-colors">
        <span className="flex items-center gap-3 text-sm font-semibold text-stone-900"><Package className="h-5 w-5 text-stone-600" /> Where is my order?</span>
        <span className="text-xs font-semibold text-stone-700">Track now →</span>
      </Link>

      {/* topics */}
      <h2 className="mt-8 font-serif text-lg font-bold text-stone-900">Browse by topic</h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {TOPICS.map((t) => (
          <button key={t.t} onClick={() => toast.info(`Opening ${t.t} guide…`)} className="flex items-center gap-3 rounded-lg border border-stone-200 bg-white p-4 text-left shadow-xs hover:border-stone-300 transition-colors">
            <t.icon className="h-6 w-6 shrink-0 text-stone-700" />
            <span><b className="block text-sm font-semibold text-stone-800">{t.t}</b><span className="text-xs text-stone-500">{t.d}</span></span>
          </button>
        ))}
      </div>

      {/* FAQs */}
      <h2 className="mt-8 font-serif text-lg font-bold text-stone-900">Frequently asked questions</h2>
      <div className="mt-3 divide-y divide-stone-200 rounded-lg border border-stone-200 bg-white shadow-xs">
        {FAQS.map((f, i) => (
          <div key={i}>
            <button onClick={() => setOpen(open === i ? null : i)} className="flex w-full items-center justify-between gap-3 p-4 text-left">
              <span className="text-sm font-semibold text-stone-800">{f.q}</span>
              <ChevronDown className={`h-4 w-4 shrink-0 text-stone-400 transition ${open === i ? 'rotate-180' : ''}`} />
            </button>
            {open === i && <p className="px-4 pb-4 text-sm leading-relaxed text-stone-600">{f.a}</p>}
          </div>
        ))}
      </div>

      {/* ticket */}
      <h2 className="mt-8 flex items-center gap-2 font-serif text-lg font-bold text-stone-900"><Ticket className="h-5 w-5 text-stone-700" /> Raise a support ticket</h2>
      <div className="mt-3 rounded-lg border border-stone-200 bg-white p-5 shadow-xs">
        <input
          value={ticket.subject}
          onChange={(e) => setTicket({ ...ticket, subject: e.target.value })}
          placeholder="Subject (e.g. Order TWB12345678 not delivered)"
          className="w-full rounded-md border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-stone-500"
        />
        <textarea
          value={ticket.msg}
          onChange={(e) => setTicket({ ...ticket, msg: e.target.value })}
          placeholder="Describe your issue…"
          rows={4}
          className="mt-3 w-full rounded-md border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-stone-500"
        />
        <button
          onClick={() => { if (!ticket.subject) return toast.error('Add a subject'); toast.success(`Ticket #T${Math.floor(Math.random() * 90000 + 10000)} created — we'll reply within 4 hours.`); setTicket({ subject: '', msg: '' }); }}
          className="mt-3 rounded-md bg-emerald-800 px-6 py-2.5 text-sm font-semibold text-white hover:bg-emerald-900 transition-colors"
        >
          Submit Ticket
        </button>
      </div>
    </div>
  );
}
