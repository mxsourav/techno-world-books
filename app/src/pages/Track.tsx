import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router';
import {
  FileText,
  Package,
  Truck,
  Home,
  Search,
  MapPin,
  Clock,
  ShieldCheck,
  Loader2,
  Lock,
} from 'lucide-react';
import { BOOKS } from '@/data/books';
import { formatINR } from '@/utils/helpers';
import { useStore } from '@/store/StoreContext';
import { BookCover } from '@/components/BookCover';
import { shippingService } from '@/services/api';
import SEOHead from '@/components/SEOHead';
import { toast } from 'sonner';

const DEFAULT_STEPS = [
  { key: 'Placed', icon: FileText, desc: 'Order confirmed & payment received' },
  { key: 'Packed', icon: Package, desc: 'Packed at fulfilment centre, label generated' },
  { key: 'Shipped', icon: Truck, desc: 'Handed to India Post Speed Post' },
  { key: 'Delivered', icon: Home, desc: 'Consignment successfully delivered' },
];

export default function Track() {
  const { orders } = useStore();
  const [params] = useSearchParams();
  const tokenParam = (params.get('token') || '').trim();
  const initialId = (
    params.get('id') ||
    params.get('tracking') ||
    params.get('trackingNumber') ||
    params.get('orderId') ||
    ''
  ).trim();

  const [input, setInput] = useState(initialId || tokenParam);
  const [lookup, setLookup] = useState(initialId);
  const [activeToken, setActiveToken] = useState(tokenParam);
  const [loading, setLoading] = useState(false);
  const [liveTracking, setLiveTracking] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Anti-enumeration verification state
  const [requiresVerification, setRequiresVerification] = useState(false);
  const [verifyCredential, setVerifyCredential] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    const t = (params.get('token') || '').trim();
    const q = (
      params.get('id') ||
      params.get('tracking') ||
      params.get('trackingNumber') ||
      params.get('orderId') ||
      ''
    ).trim();

    if (t && t !== activeToken) {
      setActiveToken(t);
      setInput(t);
      setLookup('');
    } else if (q && q !== lookup) {
      setInput(q);
      setLookup(q);
      setActiveToken('');
    }
  }, [params, lookup, activeToken]);

  const localOrder = orders.find(
    (o) =>
      o.id.toLowerCase() === (lookup || input).trim().toLowerCase() ||
      o.trackingId.toLowerCase() === (lookup || input).trim().toLowerCase()
  );

  // Fetch tracking data via token or identifier
  useEffect(() => {
    let isMounted = true;

    if (activeToken) {
      setLoading(true);
      setErrorMsg('');
      setRequiresVerification(false);

      shippingService
        .trackByToken(activeToken)
        .then((res) => {
          if (isMounted) {
            if (res.success && res.data) {
              setLiveTracking(res.data);
            } else {
              setLiveTracking(null);
              setErrorMsg('Invalid or expired tracking link.');
            }
          }
        })
        .catch((err) => {
          if (isMounted) {
            console.warn('Track by token error:', err);
            setErrorMsg(err.message || 'Unable to load shipment for this secure link.');
          }
        })
        .finally(() => {
          if (isMounted) setLoading(false);
        });
      return;
    }

    if (!lookup.trim()) {
      setLiveTracking(null);
      setRequiresVerification(false);
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setRequiresVerification(false);

    shippingService
      .trackShipment(lookup.trim())
      .then((res) => {
        if (isMounted) {
          if (res.success && res.data) {
            setLiveTracking(res.data);
          } else {
            setLiveTracking(null);
          }
        }
      })
      .catch((err: any) => {
        if (isMounted) {
          console.warn('Live tracking fallback:', err);
          if (err.requiresVerification || err.status === 403 || err.message?.toLowerCase().includes('identity')) {
            setRequiresVerification(true);
            setErrorMsg('');
          } else if (!localOrder) {
            setErrorMsg(err.message || 'Unable to fetch live tracking. Please check the ID.');
          }
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [lookup, activeToken]);

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cred = verifyCredential.trim();
    if (!cred) {
      toast.error('Please enter the phone number or email registered with this order');
      return;
    }

    setIsVerifying(true);
    try {
      const isEmail = cred.includes('@');
      const res = await shippingService.trackShipment(lookup.trim(), {
        phone: isEmail ? undefined : cred,
        email: isEmail ? cred : undefined,
      });

      if (res.success && res.data) {
        setLiveTracking(res.data);
        setRequiresVerification(false);
        toast.success('Identity verified. Showing order tracking details.');
      } else {
        toast.error('Verification failed. Credentials do not match this order.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Verification failed. Credentials do not match this order.');
    } finally {
      setIsVerifying(false);
    }
  };

  const trackingDetails = liveTracking?.tracking?.tracking_details || [];
  const bookingDetails = liveTracking?.tracking?.booking_details;
  const matchedOrder = liveTracking?.order || localOrder;

  // Robust status resolution from matchedOrder, localOrder, or India Post live tracking
  const rawStatus = String(
    matchedOrder?.status ||
    localOrder?.status ||
    liveTracking?.tracking?.del_status?.del_status ||
    ''
  ).toUpperCase();

  let activeIdx = 0;
  if (rawStatus.includes('DELIVER')) {
    activeIdx = 3;
  } else if (rawStatus.includes('SHIP') || rawStatus.includes('DISPATCH') || rawStatus.includes('TRANSIT') || rawStatus.includes('OUT')) {
    activeIdx = 2;
  } else if (rawStatus.includes('PACK') || rawStatus.includes('PROCESS')) {
    activeIdx = 1;
  } else if (rawStatus.includes('PLACED') || rawStatus.includes('CONFIRM')) {
    activeIdx = 0;
  } else if (trackingDetails.length > 1) {
    activeIdx = 2;
  } else if (matchedOrder) {
    activeIdx = 1;
  }

  const lookupTrimmed = lookup.trim();
  const isLikelyInvalid = lookupTrimmed && !loading && !requiresVerification && !matchedOrder && !bookingDetails && (
    lookupTrimmed.length < 8 ||
    (!lookupTrimmed.toUpperCase().startsWith('TW') && !/^[A-Z]{2}\d{8,}[A-Z]{2}$/.test(lookupTrimmed.toUpperCase()))
  );

  return (
    <div className="mx-auto max-w-3xl px-3 py-8 sm:px-6">
      <SEOHead
        title="Track Order & Consignment | Techno World Books"
        description="Track your book package delivery status in real-time with India Post Speed Post consignment integration on Techno World Books."
        canonicalUrl="/track"
      />
      <div className="flex items-center gap-2">
        <h1 className="font-serif text-2xl font-bold text-stone-900 tracking-tight">Track Your Order</h1>
        <span className="rounded-md bg-stone-100 border border-stone-200 px-2.5 py-0.5 text-xs font-semibold text-stone-700 flex items-center gap-1">
          <ShieldCheck className="h-3 w-3 text-emerald-700" /> India Post Integrated
        </span>
      </div>
      <p className="mt-1 text-sm text-stone-500">
        Enter your Order ID (e.g. TW-20261017-...), India Post Barcode (e.g. EB468827991IN), or cryptographic tracking token.
      </p>

      {/* Search Input Bar */}
      <div className="mt-4 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              setActiveToken('');
              setLookup(input.trim());
            }
          }}
          placeholder="e.g. TW-20261017-1234 or EB468827991IN"
          className="w-full rounded-md border border-stone-300 bg-white px-4 py-3 text-sm outline-none focus:border-stone-500 shadow-xs font-mono"
        />
        <button
          disabled={loading}
          onClick={() => {
            setActiveToken('');
            setLookup(input.trim());
          }}
          className="flex items-center gap-2 rounded-md bg-brand-base px-6 py-3 text-sm font-semibold text-white hover:bg-brand-light disabled:opacity-50 transition-colors shadow-xs cursor-pointer"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          Track
        </button>
      </div>

      {/* Anti-Enumeration Privacy Verification Challenge (DPDP Act 2023) */}
      {requiresVerification && (
        <div className="mt-6 rounded-lg border border-stone-300 bg-white p-6 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-50 border border-amber-200 text-amber-800">
              <Lock className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-stone-900">Verification Required for Guest Tracking</h3>
              <p className="mt-1 text-xs text-stone-600 leading-relaxed">
                In strict adherence to the <strong>Digital Personal Data Protection (DPDP) Act 2023</strong> anti-enumeration rules, raw order numbers cannot be tracked by anonymous visitors without proof of customer identity.
              </p>
              <form onSubmit={handleVerifySubmit} className="mt-4 space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-600 mb-1">
                    Registered Mobile Number or Email for Order #{lookup}
                  </label>
                  <input
                    type="text"
                    value={verifyCredential}
                    onChange={(e) => setVerifyCredential(e.target.value)}
                    placeholder="e.g. 9876543210 or yourname@example.com"
                    autoFocus
                    className="w-full rounded-md border border-stone-300 bg-stone-50/50 px-3.5 py-2.5 text-sm text-stone-900 outline-none focus:border-stone-900 focus:bg-white"
                  />
                </div>
                <div className="flex items-center justify-between gap-3 pt-1">
                  <p className="text-[11px] text-stone-400">
                    Alternatively, sign in with your account to view all orders directly.
                  </p>
                  <button
                    type="submit"
                    disabled={isVerifying || !verifyCredential.trim()}
                    className="inline-flex items-center gap-1.5 rounded-md bg-stone-900 px-4 py-2 text-xs font-semibold text-white hover:bg-stone-800 transition-colors disabled:opacity-50 cursor-pointer shrink-0"
                  >
                    {isVerifying ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ShieldCheck className="h-3.5 w-3.5" />}
                    <span>Verify &amp; Track</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Not Found / Error Notice */}
      {lookup && !loading && !requiresVerification && !matchedOrder && !bookingDetails && (
        <div className="mt-6 rounded-md border border-stone-200 bg-stone-50 p-5 text-center text-sm text-stone-700">
          {isLikelyInvalid ? (
            <>
              <p className="font-semibold text-stone-900 text-base mb-1">Invalid Tracking ID</p>
              <p>
                <b>"{lookup}"</b> is not a valid Order ID or India Post barcode.
              </p>
              <p className="mt-2 text-xs text-stone-500">
                Order IDs start with <code>TW-</code>. India Post barcodes look like <code>EB123456789IN</code>.
              </p>
            </>
          ) : errorMsg ? (
            errorMsg
          ) : (
            <>
              <p className="font-semibold text-stone-900 text-base mb-1">No tracking data yet</p>
              <p>
                No live tracking found for <b>"{lookup}"</b>.
              </p>
              <p className="mt-2 text-xs text-stone-500">
                If you just placed this order, your AWB / consignment number will be assigned once we hand it over to India Post. Check back soon or contact us on WhatsApp.
              </p>
            </>
          )}
        </div>
      )}

      {/* Tracking Results Card */}
      {(matchedOrder || bookingDetails) && !requiresVerification && (
        <div className="mt-6 rounded-lg border border-stone-200 bg-white p-6 shadow-xs">
          {/* Masked PII Notice for Public Views */}
          {matchedOrder?.isPublicMaskedView && (
            <div className="rounded-md bg-stone-50 border border-stone-200 px-3.5 py-2 text-xs text-stone-600 mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-700 shrink-0" />
                <span>Recipient PII is masked for legal compliance (DPDP Act 2023 anti-enumeration).</span>
              </div>
              <span className="font-mono text-[10px] text-stone-400 uppercase">Protected</span>
            </div>
          )}

          {/* Header Bar */}
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-dashed border-stone-200 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <p className="font-serif text-base font-bold text-stone-900">
                  {matchedOrder?.orderNumber ? `Order #${matchedOrder.orderNumber}` : `Consignment ${bookingDetails?.article_number || lookup}`}
                </p>
                <span className="rounded-md bg-stone-100 px-2 py-0.5 text-[11px] font-semibold text-stone-800 border border-stone-200">
                  {matchedOrder?.carrier || 'India Post Speed Post'}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500 flex items-center gap-2">
                <span>AWB: <b>{bookingDetails?.article_number || matchedOrder?.trackingNumber || lookup}</b></span>
                {bookingDetails?.booked_on && (
                  <span>· Booked: {new Date(bookingDetails.booked_on).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                )}
              </p>
            </div>

            {matchedOrder?.totalAmount && (
              <p className="text-right text-sm">
                <span className="font-extrabold text-slate-900">{formatINR(matchedOrder.totalAmount)}</span>
                <br />
                <span className="text-xs text-emerald-600 font-semibold">
                  Status: {matchedOrder.status || 'In Transit'}
                </span>
              </p>
            )}
          </div>

          {/* India Post Checkpoints Timeline */}
          {trackingDetails.length > 0 ? (
            <div className="mt-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
                Official India Post Postal History
              </h3>
              <div className="space-y-4">
                {trackingDetails.map((evt: any, idx: number) => {
                  const isLatest = idx === trackingDetails.length - 1;
                  return (
                    <div key={idx} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <span
                          className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                            isLatest
                              ? 'bg-[#0B2B19] text-white ring-4 ring-emerald-100'
                              : 'border-2 border-slate-300 bg-slate-100 text-slate-600'
                          }`}
                        >
                          {isLatest ? <Truck className="h-4 w-4" /> : <Clock className="h-3.5 w-3.5" />}
                        </span>
                        {idx < trackingDetails.length - 1 && (
                          <span className="h-10 w-0.5 bg-slate-200 mt-1" />
                        )}
                      </div>
                      <div className="pt-0.5 pb-2">
                        <div className="flex items-center gap-2">
                          <p className={`text-sm font-bold ${isLatest ? 'text-[#0B2B19]' : 'text-slate-800'}`}>
                            {evt.event}
                          </p>
                          {isLatest && (
                            <span className="rounded bg-stone-100 border border-stone-200 px-2 py-0.5 text-[10px] font-semibold text-stone-700">
                              Latest Checkpoint
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3 w-3 text-slate-400" />
                          {evt.office} {evt.officeid ? `(Office ID: ${evt.officeid})` : ''}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {evt.date} · {evt.time} {evt.description ? `· ${evt.description}` : ''}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* High-level Semantic Stepper */
            <div className="mt-6 space-y-0">
              {DEFAULT_STEPS.map((s, i) => {
                const done = i < activeIdx || (rawStatus.includes('DELIVER') && i <= activeIdx);
                const current = i === activeIdx && !rawStatus.includes('DELIVER');
                const StepIcon = s.icon;
                return (
                  <div key={s.key} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="relative flex items-center justify-center">
                        {current && (
                          <span className="absolute -inset-1 rounded-full bg-emerald-500/30 animate-ping pointer-events-none" />
                        )}
                        <span
                          className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold relative z-10 ${
                            done
                              ? 'bg-[#0B2B19] text-white shadow-2xs'
                              : current
                              ? 'bg-emerald-50 border-2 border-[#155D36] text-[#155D36] shadow-2xs font-bold'
                              : 'border-2 border-slate-200 bg-white text-slate-300'
                          }`}
                        >
                          <StepIcon className="h-4 w-4" />
                        </span>
                      </div>
                      {i < DEFAULT_STEPS.length - 1 && (
                        <span className={`h-8 w-0.5 ${i < activeIdx ? 'bg-[#155D36]' : 'bg-slate-200'}`} />
                      )}
                    </div>
                    <div className="pb-6 pt-1.5">
                      <p className={`text-sm font-bold ${done || current ? 'text-slate-900' : 'text-slate-400'}`}>{s.key}</p>
                      <p className="text-xs text-slate-500">{s.desc}</p>
                      {current && (
                        <p className="mt-0.5 text-xs font-semibold text-brand-base">
                          ← Current status · updates in real-time via India Post
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Masked Recipient Address & Consignment Info */}
          {matchedOrder?.address && (
            <div className="mt-4 border-t border-dashed border-slate-200 pt-4 text-xs text-stone-600">
              <span className="font-semibold text-stone-800 uppercase tracking-wider text-[11px] block mb-1">
                Destination
              </span>
              <p>
                Recipient: <strong className="font-medium text-stone-900">{matchedOrder.customerName || matchedOrder.address.fullName || 'Customer'}</strong>
                {matchedOrder.customerPhone && <> · Phone: <span className="font-mono">{matchedOrder.customerPhone}</span></>}
              </p>
              <p className="text-stone-500 mt-0.5">
                {matchedOrder.address.city}, {matchedOrder.address.state} — <span className="font-mono">{matchedOrder.address.pincode}</span>
              </p>
            </div>
          )}

          {/* Book Items Preview */}
          {matchedOrder?.items && matchedOrder.items.length > 0 && (
            <div className="mt-4 flex gap-3 overflow-x-auto border-t border-dashed border-slate-200 pt-4">
              {matchedOrder.items.map((i: any, idx: number) => {
                const b = BOOKS.find((x) => x.id === (i.bookId || i.id) || x.slug === i.slug);
                const bookObj: any = {
                  id: i.bookId || i.id || b?.id,
                  title: i.title || b?.title || 'Academic Book',
                  slug: i.slug || b?.slug || '',
                  author: i.author || b?.author || 'Techno World Editorial Board',
                  coverUrl: i.coverUrl || i.book?.coverUrl || b?.coverUrl,
                  coverImage: i.coverImage || i.coverUrl || i.book?.coverUrl || b?.coverImage,
                  category: i.category || b?.category,
                  publisher: i.publisher || b?.publisher,
                };
                const bookSlug = bookObj.slug;
                const content = (
                  <div className="w-20 shrink-0 text-center group">
                    <div className="h-28 w-20 rounded bg-stone-100 overflow-hidden border border-stone-200/80 shadow-2xs group-hover:border-stone-400 transition-colors">
                      <BookCover book={bookObj} className="w-full h-full text-[6px]" />
                    </div>
                    <p className="mt-1 line-clamp-2 text-[11px] font-semibold text-slate-700 group-hover:text-brand-base transition-colors">
                      {bookObj.title}
                    </p>
                  </div>
                );
                return bookSlug ? (
                  <Link key={idx} to={`/book/${bookSlug}`} className="shrink-0">
                    {content}
                  </Link>
                ) : (
                  <div key={idx} className="shrink-0">
                    {content}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {!lookup && !activeToken && orders.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-3 text-base font-extrabold text-slate-900">Your recent orders</h2>
          <div className="space-y-2">
            {orders.map((o) => (
              <button
                key={o.id}
                onClick={() => {
                  setInput(o.id);
                  setLookup(o.id);
                  setActiveToken('');
                }}
                className="flex w-full items-center justify-between rounded-lg border border-stone-200 bg-white p-4 text-left shadow-xs hover:border-stone-300 transition-colors cursor-pointer"
              >
                <span>
                  <span className="block text-sm font-semibold text-stone-900">{o.id}</span>
                  <span className="text-xs text-stone-500">
                    {new Date(o.placedAt).toLocaleDateString('en-IN')} · {o.items.length} item(s) · {o.courier || 'India Post'}
                  </span>
                </span>
                <span className="rounded bg-stone-100 border border-stone-200 px-2.5 py-0.5 text-xs font-semibold text-stone-700">
                  {o.status}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
