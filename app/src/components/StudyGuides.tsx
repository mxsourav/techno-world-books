import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';

const GUIDES = [
  {
    title: 'Engineering Semester Books',
    description: 'Complete syllabus coverage for B.Tech students.',
    image: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=600',
    link: '/category/engineering'
  },
  {
    title: 'Medical Entrance Guides',
    description: 'Top-rated NEET prep books and previous year papers.',
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=600',
    link: '/category/medical'
  },
  {
    title: 'UPSC Reading List',
    description: 'Essential polity, history, and economy titles.',
    image: 'https://images.unsplash.com/photo-1544716278-e513176f20b5?auto=format&fit=crop&q=80&w=600',
    link: '/search?q=upsc'
  },
  {
    title: 'JEE Preparation',
    description: 'Master physics, chemistry, and maths for JEE Advanced.',
    image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=600',
    link: '/search?q=jee'
  }
];

export default function StudyGuides() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:py-16">
      
      <div className="mb-6 sm:mb-10">
        <h2 className="font-serif text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl">
          Book Lists & Study Guides
        </h2>
        <p className="mt-1 sm:mt-2 text-sm sm:text-base text-stone-500">
          Editorial recommendations from Techno World Books.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {GUIDES.map((guide, idx) => (
          <Link 
            key={idx} 
            to={guide.link}
            className="group relative flex h-40 flex-col justify-end overflow-hidden rounded-lg bg-stone-900 border border-stone-800 sm:h-48"
          >
            {/* Background Image */}
            <div className="absolute inset-0">
              <img 
                src={guide.image} 
                alt={guide.title} 
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/60 to-transparent" />
            </div>

            {/* Content */}
            <div className="relative p-5 sm:p-6">
              <h3 className="font-serif text-lg font-bold text-white sm:text-xl">{guide.title}</h3>
              <p className="mt-1 text-xs sm:text-sm text-stone-300">{guide.description}</p>
              
              <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-emerald-400 opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-2">
                Explore Collection <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          </Link>
        ))}
      </div>
      
    </section>
  );
}
