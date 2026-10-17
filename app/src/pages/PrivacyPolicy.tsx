import { Link } from 'react-router';
import { Shield, FileText } from 'lucide-react';
import SEOHead from '@/components/SEOHead';

export default function PrivacyPolicy() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <SEOHead
        title="Privacy Policy | Techno World Books"
        description="Learn how Techno World Books protects and handles your personal data, customer orders, and transaction security under Indian data protection regulations."
        canonicalUrl="/privacy-policy"
      />
      {/* Header */}
      <div className="border-b border-slate-200 pb-6 mb-8">
        <div className="flex items-center gap-2 text-brand-base text-xs font-bold uppercase tracking-wider mb-2">
          <Shield className="h-4 w-4" /> Privacy & Security
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Privacy Policy</h1>
        <p className="text-sm text-slate-500 mt-2">
          How Techno World Books protects and handles your personal information
        </p>
      </div>

      <div className="space-y-8 text-sm text-slate-700 leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-900">1. Information We Collect</h2>
          <p>
            When you purchase books or create an account on Techno World Books, we collect personal information strictly necessary to fulfill your orders:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-600">
            <li><b>Contact Details:</b> Name, email address, and phone number for delivery updates and dispatch notices.</li>
            <li><b>Delivery Address:</b> House/flat number, street, nearby landmark, post office, city, state, and 6-digit postal pincode.</li>
            <li><b>Transaction Data:</b> Order history, payment method selection, and invoice records. We do not store full credit/debit card numbers or CVVs on our servers.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-900">2. How We Use Your Information</h2>
          <p>
            Your information is used solely to:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-600">
            <li>Process, pack, and ship your ordered books via India Post or designated courier partners.</li>
            <li>Send order confirmation emails, shipment tracking details, and replacement status updates.</li>
            <li>Provide customer support and resolve order queries.</li>
            <li>Detect and prevent fraudulent transactions.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-900">3. Data Sharing with Courier Partners</h2>
          <p>
            To deliver your parcels, we share necessary recipient details (recipient name, delivery address, postal PIN code, and contact phone number) with our shipping logistics providers, including India Post (Department of Posts, Govt. of India) and local on-demand courier partners. We do not sell or rent your personal information to third-party advertisers. All orders on our platform are processed on a secure prepaid basis.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-900">4. Payment Security</h2>
          <p>
            All online transactions are processed through encrypted 256-bit SSL connections via certified payment gateways compliant with PCI-DSS standards.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-900">5. Data Protection Officer (DPDP Act 2023)</h2>
          <p>
            For technical data protection queries, personal data access, consent revocation, or account deletion requests under the Digital Personal Data Protection (DPDP) Act, 2023, you may directly reach out to our Data Protection Officer:
          </p>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-xs space-y-1.5">
            <p className="font-semibold text-slate-900">Data Protection Officer &amp; Platform Architect</p>
            <p className="text-slate-700">Direct Phone: <a href="tel:8509986008" className="font-mono font-bold text-brand-base hover:underline">+91 85099 86008</a></p>
            <p className="text-slate-700">Official Email: <a href="mailto:support@technoworldbooks.in" className="font-bold text-brand-base hover:underline">support@technoworldbooks.in</a></p>
            <p className="text-slate-500 text-[11px] mt-1 pt-1 border-t border-slate-200">
              Note: For customer order disputes, physical book replacements, or pre-dispatch cancellations, please contact the bookstore Grievance Desk at <a href="tel:03322571650" className="font-semibold text-slate-700 hover:underline">033 2257 1650</a>.
            </p>
          </div>
        </section>
      </div>

      {/* Statutory Policy References */}
      <div className="mt-12 pt-6 border-t border-stone-200">
        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-3">Statutory Policy References</h3>
        <div className="flex flex-wrap gap-4 text-xs font-semibold text-brand-base">
          <Link to="/refund-policy" className="hover:underline flex items-center gap-1">
            <FileText className="h-3.5 w-3.5 text-stone-500" /> Cancellation &amp; Replacement Policy
          </Link>
          <Link to="/shipping-policy" className="hover:underline flex items-center gap-1">
            <FileText className="h-3.5 w-3.5 text-stone-500" /> Shipping Policy
          </Link>
          <Link to="/terms" className="hover:underline flex items-center gap-1">
            <FileText className="h-3.5 w-3.5 text-stone-500" /> Terms &amp; Conditions
          </Link>
          <Link to="/legal/grievance-redressal" className="hover:underline flex items-center gap-1">
            <FileText className="h-3.5 w-3.5 text-stone-500" /> Grievance Redressal
          </Link>
        </div>
      </div>
    </div>
  );
}
