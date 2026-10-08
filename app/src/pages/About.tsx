import { useState } from 'react';
import { CheckCircle2, BookOpen, Send, Upload, X, Loader2, Sparkles, MessageSquare, Phone, MapPin, Quote } from 'lucide-react';
import { toast } from 'sonner';
import { bookRequestService } from '@/services/api';
import { useStore } from '@/store/StoreContext';
import { CmsText } from '@/components/common/CmsText';
import SEOHead from '@/components/SEOHead';

export default function About() {
  const { user } = useStore();

  const [form, setForm] = useState({
    title: '',
    author: '',
    email: user?.email || '',
    phone: user?.phone || '',
    publisher: '',
    edition: '',
    notes: '',
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image file must be under 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      return toast.error('Please enter the book title.');
    }
    if (!form.author.trim()) {
      return toast.error('Please enter the author name.');
    }
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      return toast.error('Please enter a valid email address.');
    }

    setSubmitting(true);
    try {
      const res = await bookRequestService.submitRequest({
        title: form.title.trim(),
        author: form.author.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        publisher: form.publisher.trim() || undefined,
        edition: form.edition.trim() || undefined,
        notes: form.notes.trim() || undefined,
        imageUrl: imagePreview || undefined,
      });

      if (res.success) {
        setSubmitted(true);
        toast.success(`Book request for "${form.title}" registered successfully!`);
      } else {
        toast.error(res.message || 'Failed to submit request.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error submitting request. Please try again or message us on WhatsApp.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <SEOHead
        title="About Us — Techno World Books | College Street, Kolkata"
        description="Learn about Techno World Books, Kolkata's trusted bookstore from College Street. Providing authentic school, university, medical, engineering and competitive exam textbooks across India."
        canonicalUrl="/about"
      />
      {/* Header Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-extrabold tracking-tight text-emerald-900 sm:text-5xl lg:text-6xl mb-6">
          <CmsText contentKey="about.title" defaultText="About Techno World Books" label="About Page Title" />
        </h1>
        <p className="mx-auto max-w-3xl text-2xl text-emerald-700 leading-relaxed font-semibold">
          <CmsText contentKey="about.subtitle" defaultText="Your Trusted Bookstore for Every Reader" label="About Page Subtitle" />
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
        {/* Text Content */}
        <div className="space-y-6 text-lg text-slate-700 leading-relaxed">
          <p>
            Welcome to Techno World Books, your trusted academic and general bookstore rooted in the heart of College Street, Kolkata—India's legendary destination for books, higher education, and scholarship. Our mission is to make quality books accessible, affordable, and readily available to readers, students, medical & engineering aspirants, educators, and researchers nationwide.
          </p>
          <p>
            Whether you're preparing for competitive exams (NEET, JEE, UPSC, WBCS), pursuing university degrees, building your professional library, or simply searching for your next great read, our experienced College Street team is here to assist you with genuine editions and dependable delivery.
          </p>
          <div>
            <span className="inline-flex items-center gap-2 rounded-md bg-stone-100 px-3.5 py-1.5 text-xs font-semibold text-stone-800 border border-stone-200">
              <MapPin className="h-4 w-4 text-emerald-800 shrink-0" />
              <span>College Street Flagship: 90/6A Mahatma Gandhi Rd, opp. Grace Cinema, Kolkata 700007</span>
            </span>
          </div>
        </div>

        {/* Visual Element */}
        <div className="relative group">
          <div className="aspect-[4/3] rounded-lg overflow-hidden border border-stone-800 shadow-sm bg-[#0B2518] flex items-center justify-center p-8 text-white relative">
            <div className="text-center space-y-4">
              <Quote className="h-8 w-8 text-emerald-600/50 mx-auto" />
              <p className="text-xl sm:text-2xl font-serif italic max-w-md mx-auto leading-snug text-stone-200">
                <CmsText
                  contentKey="about.quote"
                  defaultText='"Connecting generations of readers with the rich literary and academic heritage of College Street."'
                  label="About Inspiring Quote"
                  multiline
                />
              </p>
              <div className="pt-2 text-stone-400 font-semibold uppercase tracking-wider text-xs">
                Techno World Books · Kolkata
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CAN'T FIND A BOOK? & SOURCING REQUEST FORM */}
      <div className="mb-20">
        <div className="bg-stone-50 rounded-lg p-6 sm:p-10 shadow-xs border border-stone-200">
          <div className="max-w-3xl mb-8">
            <div className="inline-flex items-center gap-2 text-emerald-900 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="h-4 w-4 text-emerald-800" /> Book Procurement & Sourcing
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 mb-2">
              <CmsText contentKey="about.procurement_title" defaultText="Can't Find a Book? Request It Here" label="Sourcing Heading" />
            </h2>
            <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
              <CmsText
                contentKey="about.procurement_desc"
                defaultText="Don't worry if the book you're looking for isn't currently displayed on our website. With our deep connections across College Street, national publishers, and academic distributors, our team can source rare, out-of-print, and foreign editions for you."
                label="Sourcing Subtitle"
                multiline
              />
            </p>
          </div>

          {submitted ? (
            <div className="rounded-lg border border-stone-200 bg-white p-8 text-center space-y-4 max-w-2xl mx-auto shadow-xs">
              <CheckCircle2 className="h-12 w-12 text-emerald-800 mx-auto" />
              <h3 className="font-serif text-xl font-bold text-stone-900">Book Sourcing Request Submitted!</h3>
              <p className="text-sm text-stone-600 leading-relaxed">
                Thank you! We have logged your request for <b>"{form.title}"</b> by <b>{form.author}</b> into our procurement desk. Our sourcing team is checking publisher availability and will contact you at <b>{form.email}</b> or WhatsApp.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setForm({
                      title: '',
                      author: '',
                      email: user?.email || '',
                      phone: user?.phone || '',
                      publisher: '',
                      edition: '',
                      notes: '',
                    });
                    setImagePreview(null);
                  }}
                  className="rounded-md bg-stone-100 px-5 py-2.5 text-xs font-semibold text-stone-700 hover:bg-stone-200 transition-colors"
                >
                  Request Another Book
                </button>
                <a
                  href={`https://wa.me/917479135626?text=${encodeURIComponent(
                    `Hi Techno World Books, I submitted a sourcing request for "${form.title}" by ${form.author}.`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-md bg-emerald-800 px-5 py-2.5 text-xs font-semibold text-white hover:bg-emerald-900 transition-colors shadow-xs"
                >
                  <MessageSquare className="h-4 w-4" /> Message on WhatsApp
                </a>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="rounded-lg border border-stone-200 bg-white p-6 sm:p-8 shadow-xs space-y-5">
              <div className="border-b border-stone-100 pb-3">
                <h3 className="font-serif text-base font-bold text-stone-900 flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-stone-700" /> Book Sourcing Request Form
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  Fill in the book details below. Book name, author name, and your email are mandatory.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Book Title / Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. Higher Algebra / Concepts of Physics"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Author Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.author}
                    onChange={(e) => setForm({ ...form, author: e.target.value })}
                    placeholder="e.g. Hall & Knight / H.C. Verma"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Your Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Phone / WhatsApp Number (Optional)
                  </label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="e.g. 7479135626 (For WhatsApp updates)"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Publisher / Imprint (Optional)
                  </label>
                  <input
                    type="text"
                    value={form.publisher}
                    onChange={(e) => setForm({ ...form, publisher: e.target.value })}
                    placeholder="e.g. Cambridge / Wiley / NCERT / S. Chand"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Edition / Year (Optional)
                  </label>
                  <input
                    type="text"
                    value={form.edition}
                    onChange={(e) => setForm({ ...form, edition: e.target.value })}
                    placeholder="e.g. 2026 Latest Edition / 4th Edition"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Image Upload (Optional) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Upload Book Photo / Syllabus / Cover (Optional)
                </label>
                <div className="flex items-center gap-4">
                  <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 hover:border-emerald-500 transition">
                    <Upload className="h-4 w-4 text-emerald-700" />
                    <span>Choose Image (Max 5MB)</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>

                  {imagePreview && (
                    <div className="relative inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-1.5 shadow-xs">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="h-10 w-8 rounded object-cover border border-slate-200"
                      />
                      <span className="text-[11px] font-medium text-slate-600">Photo attached</span>
                      <button
                        type="button"
                        onClick={() => setImagePreview(null)}
                        className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Special Instructions / Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Additional Notes or Instructions (Optional)
                </label>
                <textarea
                  rows={3}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="e.g. Required urgently for semester exams / need paperback edition / looking for 3 copies..."
                  className="w-full rounded-md border border-stone-300 px-3.5 py-2.5 text-sm outline-none focus:border-stone-500"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-stone-100">
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-md bg-emerald-800 px-7 py-3 text-sm font-semibold text-white hover:bg-emerald-900 shadow-xs transition-colors disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Submitting Request...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>Submit Book Sourcing Request</span>
                    </>
                  )}
                </button>

                <div className="text-xs text-stone-500 flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-stone-600" />
                  <span>Immediate inquiry? WhatsApp us at <b>+91 747 913 5626</b></span>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>

      <div className="mb-20">
        <h2 className="text-3xl font-bold tracking-tight text-emerald-900 mb-8 text-center">
          Why Choose Techno World Books?
        </h2>
        <div className="max-w-4xl mx-auto mb-10 text-lg text-slate-700 text-center">
          We are committed to becoming one of India's most trusted bookstores by focusing on what matters most:
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {[
            'Genuine and authentic books',
            'Competitive pricing',
            'Secure online shopping',
            'Fast and reliable delivery across India',
            'Responsive customer support',
            'A customer-first approach built on trust and satisfaction'
          ].map((feature, idx) => (
            <div key={idx} className="flex items-center p-5 bg-white rounded-lg shadow-xs border border-stone-200">
              <CheckCircle2 className="h-6 w-6 text-emerald-800 mr-3.5 flex-shrink-0" />
              <span className="text-stone-800 font-medium text-base leading-snug">{feature}</span>
            </div>
          ))}
        </div>

        <p className="mt-10 text-base text-stone-600 leading-relaxed max-w-3xl mx-auto text-center font-medium">
          Backed by our presence in College Street, Kolkata, we combine the heritage of India's most famous book market with the convenience of modern online shopping, making it easier than ever to discover and purchase the books you need.
        </p>
      </div>

      <div className="text-center max-w-3xl mx-auto bg-stone-50 p-8 sm:p-10 rounded-lg border border-stone-200">
        <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 mb-4">
          Join Our Reading Journey
        </h2>
        <p className="text-base text-stone-600 leading-relaxed mb-4">
          At Techno World Books, we're more than a bookstore—we're your partner in learning, growth, and discovery. Whether you're a student, educator, professional, parent, or passionate reader, we're here to support your journey with the right books and dependable service.
        </p>
        <p className="text-base text-emerald-900 leading-relaxed font-semibold">
          Explore our collection today, and if you ever need help finding a specific title, simply reach out. We'll be happy to help you find the book you're looking for.
        </p>
      </div>
    </div>
  );
}
