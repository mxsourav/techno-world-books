import { MapPin, ShieldCheck, Truck, ThumbsUp, Tag } from 'lucide-react';

const FEATURES = [
  { icon: MapPin, text: 'College Street Heritage', sub: '90/6A MG Road, Kolkata flagship' },
  { icon: ShieldCheck, text: '100% Genuine Editions', sub: 'Direct publisher partnerships' },
  { icon: Truck, text: 'All-India Dispatch', sub: 'Fast delivery with original invoices' },
  { icon: ThumbsUp, text: '16,000+ Reviews', sub: '4.4/5 rating on Google Business' },
  { icon: Tag, text: 'Academic Discounts', sub: 'Subsidized pricing for students' },
];

export default function AboutTechnoWorld() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16">
      <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:gap-16">
        
        {/* Text Content */}
        <div className="flex-1 space-y-5">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-800">
              Institutional Heritage
            </span>
            <h2 className="mt-1 font-serif text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
              About Techno World Books
            </h2>
          </div>
          
          <p className="text-base leading-relaxed text-stone-600">
            Techno World Books is a premier bookstore based on College Street, Kolkata, serving students, educators, research scholars, and professionals across India. We specialize in engineering, medical, civil services, academic curriculums, Bengali literature, and rare imported editions. 
          </p>
          <p className="text-base leading-relaxed text-stone-600">
            Our mission is to make quality academic literature accessible through an uncompromising online catalog backed by verified stock, transparent discounts, and prompt fulfillment.
          </p>
        </div>

        {/* Badges Grid */}
        <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2">
          {FEATURES.map((badge, idx) => (
            <div 
              key={idx} 
              className="flex items-start gap-3.5 rounded-lg border border-stone-200 bg-white p-4 shadow-xs"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-stone-200 bg-stone-50 text-emerald-900">
                <badge.icon className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <span className="block text-sm font-semibold text-stone-900">{badge.text}</span>
                <span className="block text-xs text-stone-500 mt-0.5">{badge.sub}</span>
              </div>
            </div>
          ))}
        </div>
        
      </div>
    </section>
  );
}
