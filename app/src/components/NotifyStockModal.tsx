import React, { useState } from 'react';
import {
  X,
  Bell,
  CheckCircle2,
  Mail,
  Phone,
  MessageSquare,
  Loader2,
  BookOpen,
} from 'lucide-react';
import { formatINR } from '@/utils/helpers';

interface NotifyStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: {
    id: string;
    title: string;
    author: string;
    price: number;
    coverUrl?: string;
    coverImage?: string;
    publisher?: string | { name?: string };
    edition?: string;
  };
}

export const NotifyStockModal: React.FC<NotifyStockModalProps> = ({
  isOpen,
  onClose,
  book,
}) => {
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notifyWhatsapp, setNotifyWhatsapp] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const coverImg = book.coverUrl || book.coverImage || '/placeholder-book.png';
  const publisherName =
    typeof book.publisher === 'string'
      ? book.publisher
      : book.publisher?.name || 'Techno World Publications';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    if (!cleanPhone || !/^[6-9]\d{9}$/.test(cleanPhone)) {
      setErrorMessage('Please enter a valid 10-digit Indian mobile number (e.g. 9830012345).');
      return;
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/v1/book-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: book.title,
          author: book.author,
          publisher: publisherName,
          edition: book.edition || 'Latest Edition',
          phone: cleanPhone,
          email: email.trim() || `notify_${cleanPhone}@technoworldbooks.in`,
          notes: `STOCK_ALERT: Registered for restock notification. Notify via WhatsApp: ${notifyWhatsapp ? 'YES' : 'NO'}. Book ID: ${book.id}`,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to register notification request');
      }

      setIsSuccess(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'Unable to connect. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50/80">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-800 shrink-0">
              <Bell className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Notify When Available
              </h3>
              <p className="text-[11px] text-slate-500">
                Get an instant alert as soon as copies arrive
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          
          {/* Book Summary Card */}
          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/60 p-3">
            <img
              src={coverImg}
              alt={book.title}
              className="h-16 w-12 rounded object-cover border border-slate-200 shadow-2xs shrink-0"
            />
            <div className="min-w-0 flex-1">
              <span className="inline-block rounded bg-amber-100 px-1.5 py-0.2 text-[9px] font-bold text-amber-800 uppercase tracking-wider">
                Currently Out of Stock
              </span>
              <h4 className="text-xs font-bold text-slate-900 truncate mt-0.5">
                {book.title}
              </h4>
              <p className="text-[11px] text-slate-500 truncate">
                by {book.author}
              </p>
              <div className="text-xs font-extrabold text-slate-800 mt-1">
                {formatINR(book.price)}
              </div>
            </div>
          </div>

          {isSuccess ? (
            <div className="py-6 text-center space-y-3">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">
                Notification Registered
              </h4>
              <p className="text-xs text-slate-600 max-w-xs mx-auto leading-relaxed">
                Thank you! We will notify you on WhatsApp/SMS ({phone}) the moment publisher stock arrives at College Street.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl bg-slate-900 px-5 py-2 text-xs font-bold text-white hover:bg-slate-800 transition-colors shadow-xs"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {errorMessage && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-2.5 text-xs text-red-700">
                  {errorMessage}
                </div>
              )}

              {/* Mobile Phone */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  WhatsApp / Mobile Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="98300 12345"
                    className="w-full rounded-xl border border-slate-300 bg-white pl-11 pr-3 py-2 text-xs font-semibold text-slate-900 placeholder:text-slate-400 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                  />
                  <Phone className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email Address <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@example.com"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 pr-9 text-xs font-semibold text-slate-900 placeholder:text-slate-400 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                  />
                  <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                </div>
              </div>

              {/* WhatsApp Checkbox */}
              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={notifyWhatsapp}
                  onChange={(e) => setNotifyWhatsapp(e.target.checked)}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                />
                <span className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                  <MessageSquare className="h-3.5 w-3.5 text-emerald-600" />
                  Send instant alert on WhatsApp
                </span>
              </label>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Saving alert...</span>
                    </>
                  ) : (
                    <>
                      <Bell className="h-3.5 w-3.5" />
                      <span>Notify Me When In Stock</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400 pt-1">
                <BookOpen className="h-3 w-3" />
                <span>Zero spam. You will only be alerted once copies arrive.</span>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};

export default NotifyStockModal;
