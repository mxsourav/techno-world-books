import { Link } from 'react-router';
import { ShieldCheck, MapPin, Phone, Clock, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import SEOHead from '@/components/SEOHead';

export default function GrievanceRedressal() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <SEOHead
        title="Grievance Redressal Officer & Legal Disclosures | Techno World Books"
        description="Statutory legal disclosures and consumer grievance redressal mechanism under Consumer Protection (E-Commerce) Rules 2020 for Techno World Books, Kolkata."
        canonicalUrl="/legal/grievance-redressal"
      />

      {/* Header */}
      <div className="border-b border-stone-200 pb-6 mb-8">
        <div className="flex items-center gap-2 text-stone-600 text-xs font-semibold uppercase tracking-wider mb-2">
          <ShieldCheck className="h-4 w-4 text-brand-base" /> Statutory Compliance &bull; Consumer Protection (E-Commerce) Rules, 2020
        </div>
        <h1 className="font-serif text-3xl font-bold text-stone-900 tracking-tight">
          Grievance Redressal Mechanism &amp; Legal Disclosures
        </h1>
        <p className="text-sm text-stone-500 mt-2">
          Techno World Books &bull; College Street, Kolkata, West Bengal &bull; Compliance Portal
        </p>
      </div>

      {/* Mandatory Statutory Entity Card */}
      <div className="mb-10 rounded-lg border border-stone-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-base">Registered Business Entity</span>
          <h2 className="text-xl font-bold text-stone-900 mt-1">Techno World Books</h2>
          <p className="text-xs text-stone-500 mt-0.5">Publisher, Academic Bookseller &amp; Educational Distributor</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 pt-2 border-t border-stone-100">
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-stone-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-stone-500">Registered Physical Address</p>
              <p className="text-sm text-stone-800 font-medium leading-relaxed mt-0.5">
                90/6A, Mahatma Gandhi Rd, College Street,<br />
                Kolkata, West Bengal 700007, India
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Phone className="h-5 w-5 text-stone-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-stone-500">Customer Helpline &amp; Desk</p>
              <p className="text-sm text-stone-800 font-medium mt-0.5">
                Landline: <a href="tel:03322571650" className="hover:underline font-semibold">033 2257 1650</a>
              </p>
              <p className="text-xs text-stone-500 mt-0.5">
                Monday to Saturday, 10:30 AM – 7:30 PM IST
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Grievance Officer Details & Statutory SLAs */}
      <div className="mb-10 rounded-lg border border-stone-800 bg-brand-dark text-white p-6 sm:p-8 shadow-xs">
        <div className="max-w-3xl space-y-4">
          <span className="inline-flex items-center gap-1.5 rounded-md bg-stone-900 border border-stone-800 px-3 py-1 text-xs font-medium text-brand-200">
            <ShieldCheck className="h-3.5 w-3.5 text-brand-200" /> Designated Grievance Officer
          </span>
          <h2 className="font-serif text-2xl font-bold text-white">Grievance Redressal Officer</h2>
          <p className="text-sm text-stone-300 leading-relaxed">
            In accordance with the <b>Consumer Protection (E-Commerce) Rules, 2020</b> framed under the Consumer Protection Act, 2019 and the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021, the contact details of the Grievance Officer are set forth below:
          </p>

          <div className="grid gap-4 sm:grid-cols-2 pt-2 border-t border-stone-800 text-xs">
            <div>
              <span className="text-stone-400 font-medium uppercase tracking-wider block">Officer Designation</span>
              <span className="text-sm font-semibold text-white mt-0.5 block">Grievance Redressal Officer &amp; Compliance Head</span>
            </div>
            <div>
              <span className="text-stone-400 font-medium uppercase tracking-wider block">Official Grievance Email</span>
              <a href="mailto:support@technoworldbooks.in" className="text-sm font-semibold text-brand-200 hover:underline mt-0.5 block">
                support@technoworldbooks.in
              </a>
            </div>
          </div>

          {/* Statutory Timelines (Rule 5(3)(b)) */}
          <div className="rounded-md border border-stone-800 bg-stone-900/80 p-4 mt-4 grid gap-3 sm:grid-cols-2">
            <div className="flex items-start gap-2.5">
              <Clock className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-xs text-white">48-Hour Acknowledgment</p>
                <p className="text-[11px] text-stone-400 mt-0.5 leading-snug">
                  Every consumer grievance received will be officially acknowledged within 48 hours with a reference ticket.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-xs text-white">1-Month Resolution</p>
                <p className="text-[11px] text-stone-400 mt-0.5 leading-snug">
                  All grievances will be redressed and resolved within 30 days (1 month) from the date of receipt.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Data Protection Officer (DPDP Act 2023) */}
      <div className="mb-10 rounded-lg border border-slate-200 bg-slate-50 p-6 sm:p-8 shadow-xs">
        <div className="max-w-3xl space-y-3">
          <span className="inline-flex items-center gap-1.5 rounded-md bg-white border border-slate-300 px-3 py-1 text-xs font-medium text-slate-800">
            <ShieldCheck className="h-3.5 w-3.5 text-brand-base" /> Digital Personal Data Protection (DPDP) Act, 2023
          </span>
          <h2 className="font-serif text-2xl font-bold text-slate-900">Data Protection Officer (DPO)</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            In compliance with India&apos;s <b>Digital Personal Data Protection (DPDP) Act, 2023</b>, all technical inquiries regarding personal data processing, consent revocation, data erasure, or third-party logistics data minimization are overseen directly by our Lead System Architect:
          </p>

          <div className="grid gap-4 sm:grid-cols-2 pt-3 border-t border-slate-200 text-xs">
            <div>
              <span className="text-slate-500 font-medium uppercase tracking-wider block">Direct Contact / Developer Line</span>
              <a href="tel:8509986008" className="text-sm font-mono font-bold text-brand-base hover:underline mt-0.5 block">
                +91 85099 86008
              </a>
            </div>
            <div>
              <span className="text-slate-500 font-medium uppercase tracking-wider block">Official Compliance Email</span>
              <a href="mailto:support@technoworldbooks.in" className="text-sm font-semibold text-brand-base hover:underline mt-0.5 block">
                support@technoworldbooks.in
              </a>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 pt-2 border-t border-slate-200">
            Note: For physical bookstore orders, delivery tracking, or replacement queries, please route via Customer Support / Grievance Desk at <a href="tel:03322571650" className="font-semibold text-slate-700 hover:underline">033 2257 1650</a>.
          </p>
        </div>
      </div>

      {/* Escalation Process */}
      <div className="space-y-6 text-sm text-stone-700 leading-relaxed mb-10">
        <h2 className="text-lg font-bold text-stone-900">How to Submit a Grievance</h2>
        
        <div className="space-y-3">
          <div className="flex items-start gap-3 rounded-lg border border-stone-200 bg-white p-4">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-stone-900 text-xs font-bold text-white">1</span>
            <div>
              <p className="font-semibold text-stone-900">Step 1: Contact Customer Support</p>
              <p className="text-xs text-stone-600 mt-0.5">
                For order tracking, dispatch status, or cancellation requests prior to dispatch, email us at <a href="mailto:support@technoworldbooks.in" className="font-medium underline">support@technoworldbooks.in</a> or call <a href="tel:03322571650" className="font-medium underline">033 2257 1650</a>.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-lg border border-stone-200 bg-white p-4">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-stone-900 text-xs font-bold text-white">2</span>
            <div>
              <p className="font-semibold text-stone-900">Step 2: Formal Escalation to Grievance Officer</p>
              <p className="text-xs text-stone-600 mt-0.5">
                If your issue remains unacknowledged within 48 hours or is not satisfactorily addressed, write to <b>support@technoworldbooks.in</b> with the subject line <span className="font-mono bg-stone-100 px-1 py-0.5 rounded text-[11px]">GRIEVANCE ESCALATION - [Your Order ID]</span>, mentioning your full contact details and order invoice number.
              </p>
            </div>
          </div>
        </div>

        {/* Clear Policy Notice on Returns vs Replacements */}
        <div className="rounded-lg border border-stone-300 bg-stone-50 p-5 text-xs text-stone-800 space-y-2">
          <div className="flex items-center gap-2 font-bold text-stone-900">
            <AlertCircle className="h-4 w-4 text-stone-700" />
            Important Notice Regarding Cancellation &amp; Replacement Only Policy
          </div>
          <p className="leading-relaxed">
            Techno World Books operates a strict <b>pre-dispatch cancellation</b> and <b>7-day replacement-only</b> fulfillment model:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-stone-700">
            <li><b>Cancellations:</b> 100% refund is issued exclusively when an order is cancelled <b>prior to courier dispatch</b>. Once an order is handed over to India Post or courier carriers, cancellations are strictly not permitted.</li>
            <li><b>No Returns / No Cash Refunds on Delivered Books:</b> Delivered copies are eligible exclusively for complimentary direct replacement in case of misprints, transit damage, or binding defects within 7 days of delivery (unboxing video required). Doorstep refusals / Return to Origin (RTO) are non-refundable.</li>
          </ul>
        </div>
      </div>

      {/* Relevant Policy Links */}
      <div className="border-t border-stone-200 pt-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-3">Statutory Policy References</h3>
        <div className="flex flex-wrap gap-4 text-xs font-semibold text-brand-base">
          <Link to="/refund-policy" className="hover:underline flex items-center gap-1">
            <FileText className="h-3.5 w-3.5" /> Cancellation &amp; Replacement Policy
          </Link>
          <Link to="/shipping-policy" className="hover:underline flex items-center gap-1">
            <FileText className="h-3.5 w-3.5" /> Shipping Policy
          </Link>
          <Link to="/terms" className="hover:underline flex items-center gap-1">
            <FileText className="h-3.5 w-3.5" /> Terms &amp; Conditions
          </Link>
          <Link to="/privacy-policy" className="hover:underline flex items-center gap-1">
            <FileText className="h-3.5 w-3.5" /> Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  );
}
