import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Package, Truck, CheckCircle2, ExternalLink, Download, Loader2, HelpCircle, MessageSquare, Phone, Mail, X } from 'lucide-react';
import { orderService } from '@/services/api';
import { formatINR } from '@/utils/helpers';
import { downloadOrderInvoice } from '@/utils/generateInvoice';
import { toast } from 'sonner';
import { useStore } from '@/store/StoreContext';
import { BookCover } from '@/components/BookCover';

const getOrderStatusMeta = (status: string) => {
  switch (status) {
    case 'CONFIRMED':
    case 'PROCESSING':
      return { label: 'Processing', pillClass: 'bg-stone-800 text-white' };
    case 'SHIPPED':
      return { label: 'Dispatched', pillClass: 'bg-stone-800 text-white' };
    case 'DELIVERED':
      return { label: 'Delivered', pillClass: 'bg-emerald-950 text-white' };
    case 'CANCELLED':
      return { label: 'Cancelled', pillClass: 'bg-stone-200 text-stone-700' };
    case 'REFUNDED':
      return { label: 'Refunded', pillClass: 'bg-stone-200 text-stone-700' };
    case 'PENDING':
    default:
      return { label: 'Order Confirmed', pillClass: 'bg-stone-800 text-white' };
  }
};

export default function MyOrders() {
  const { user } = useStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingInvoiceId, setDownloadingInvoiceId] = useState<string | null>(null);
  const [helpOrderModal, setHelpOrderModal] = useState<any | null>(null);

  const loadOrders = async () => {
    try {
      const res = await orderService.getUserOrders();
      setOrders(res.data || []);
    } catch (err) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  if (loading) {
    return <div className="p-12 text-center text-slate-500">Loading your orders...</div>;
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-extrabold text-slate-900 mb-6">My Orders</h1>
      
      {orders.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-sm">
          <Package className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900">No orders found</h3>
          <p className="text-slate-500 mb-6">Looks like you haven't made your first purchase yet.</p>
          <Link to="/" className="bg-emerald-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-emerald-700 transition">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const statusInfo = getOrderStatusMeta(order.status);
            return (
              <div
                key={order.id}
                className="rounded-lg border border-stone-200 bg-white overflow-hidden shadow-xs hover:border-stone-300 transition-colors"
              >
                {/* 1. Distinct Contrasting Order Meta Header */}
                <div className="bg-stone-50 border-b border-stone-200 px-4 py-3 sm:px-5 sm:py-3.5 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-600">
                    <div>
                      <span className="text-stone-500 font-medium">Order Placed: </span>
                      <span className="font-semibold text-stone-800">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>

                    <span className="text-stone-300 hidden sm:inline">|</span>

                    <div>
                      <span className="text-stone-500 font-medium">Total: </span>
                      <span className="font-bold text-stone-900 font-mono">
                        {formatINR(order.totalAmount)}
                      </span>
                    </div>

                    {order.isMerged && (
                      <span className="rounded bg-stone-200/70 text-stone-800 px-2 py-0.5 text-[10px] font-medium flex items-center gap-1">
                        Consolidated with #{order.parentOrder?.orderNumber || order.parentOrderId?.slice(0, 8)}
                      </span>
                    )}

                    {order.childOrders && order.childOrders.length > 0 && (
                      <span className="rounded bg-stone-200/70 text-stone-800 px-2 py-0.5 text-[10px] font-medium flex items-center gap-1">
                        Master Consignment ({order.childOrders.length} Add-on{order.childOrders.length > 1 ? 's' : ''})
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-medium text-stone-500">
                      #{order.orderNumber}
                    </span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${statusInfo.pillClass}`}>
                      {statusInfo.label}
                    </span>
                  </div>
                </div>

                {/* 2. Scaled-up Book Thumbnail & Order Items Body */}
                <div className="p-4 sm:p-5 space-y-4">
                  {order.items?.map((item: any) => (
                    <div key={item.id} className="flex gap-4 sm:gap-5 items-start">
                      {/* Scaled-up Book Cover Thumbnail */}
                      <div className="h-24 w-16 sm:h-28 sm:w-20 shrink-0 bg-stone-100 rounded border border-stone-200 overflow-hidden shadow-2xs">
                        <BookCover
                          book={{
                            id: item.book?.id || item.bookId,
                            title: item.book?.title || 'Academic Book',
                            coverUrl: item.book?.coverUrl,
                            galleryUrls: item.book?.galleryUrls,
                            images: item.book?.images,
                            coverImage: item.book?.coverImage,
                          }}
                          className="w-full h-full text-[8px]"
                        />
                      </div>

                      {/* Title & Metadata */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-base sm:text-lg font-semibold text-stone-900 line-clamp-2 leading-snug">
                          {item.book?.title || 'Academic Book'}
                        </h4>
                        {item.book?.author && (
                          <p className="text-xs text-stone-500 mt-1">by {item.book.author}</p>
                        )}
                        {item.book?.edition && (
                          <p className="text-[11px] text-stone-400 mt-0.5">Edition: {item.book.edition}</p>
                        )}
                      </div>

                      {/* Right Pricing Grid */}
                      <div className="text-right shrink-0 whitespace-nowrap">
                        <div className="text-base sm:text-lg font-semibold text-stone-900 font-mono">
                          {formatINR(item.unitPrice * item.quantity)}
                        </div>
                        <div className="text-xs text-stone-500 mt-0.5">
                          Qty: <span className="font-semibold text-stone-800">{item.quantity}</span>
                          {item.quantity > 1 && (
                            <span className="text-[11px] block text-stone-400">{formatINR(item.unitPrice)} each</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 3. Dispatch Status & Action Buttons Footer */}
                <div className="border-t border-stone-200 bg-stone-50/60 p-4 sm:p-5 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      {(order.status === 'PENDING' || order.status === 'CONFIRMED' || order.status === 'PROCESSING') && (
                        <>
                          <div className="text-sm font-semibold text-stone-900 flex items-center gap-1.5">
                            <Package className="h-4 w-4 text-stone-600" />
                            Preparing for Dispatch
                          </div>
                          <p className="text-xs text-stone-500">
                            Eligible for 100% refund cancellation strictly before courier handover.
                          </p>
                        </>
                      )}

                      {order.status === 'SHIPPED' && (
                        <>
                          <div className="text-sm font-semibold text-stone-900 flex items-center gap-1.5">
                            <Truck className="h-4 w-4 text-stone-600" />
                            Dispatched &amp; In-Transit
                          </div>
                          <p className="text-xs text-stone-500">
                            {order.trackingNumber ? `Dispatched via India Post (${order.trackingNumber}).` : 'Dispatched via courier partner.'} Dispatched orders cannot be cancelled.
                          </p>
                        </>
                      )}

                      {order.status === 'DELIVERED' && (() => {
                        const deliveryTimestamp = order.deliveredAt || order.updatedAt || order.createdAt;
                        const deliveryDate = new Date(deliveryTimestamp);
                        const daysSinceDelivery = Math.floor((Date.now() - deliveryDate.getTime()) / (1000 * 60 * 60 * 24));
                        const isReplacementEligible = daysSinceDelivery <= 7;
                        const replacementDaysRemaining = Math.max(0, 7 - daysSinceDelivery);

                        return (
                          <>
                            <div className="text-sm font-semibold text-stone-900 flex items-center gap-1.5">
                              <CheckCircle2 className="h-4 w-4 text-emerald-700" />
                              Delivered on {deliveryDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </div>
                            <p className="text-xs text-stone-500">
                              {isReplacementEligible 
                                ? `7-day replacement window active (${replacementDaysRemaining === 0 ? 'expires today' : `${replacementDaysRemaining} day${replacementDaysRemaining > 1 ? 's' : ''} left`}).`
                                : 'Replacement window has ended for this order.'
                              }
                            </p>
                          </>
                        );
                      })()}

                      {order.status === 'CANCELLED' && (
                        <>
                          <div className="text-sm font-semibold text-rose-800">
                            Order Cancelled
                          </div>
                          <p className="text-xs text-stone-500">
                            This order has been cancelled and closed.
                          </p>
                        </>
                      )}
                    </div>

                    {/* Secondary Action Buttons */}
                    <div className="flex items-center gap-2 flex-wrap sm:shrink-0">
                      {order.status === 'DELIVERED' && (() => {
                        const deliveryTimestamp = order.deliveredAt || order.updatedAt || order.createdAt;
                        const daysSinceDelivery = Math.floor((Date.now() - new Date(deliveryTimestamp).getTime()) / (1000 * 60 * 60 * 24));
                        if (daysSinceDelivery <= 7) {
                          return (
                            <a
                              href="https://docs.google.com/forms/d/e/1FAIpQLSdP7BBi2SNX67XU0xoBDzqiXSaL4nyBBIwDfVacG8M9kVR1RQ/viewform?usp=publish-editor"
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 rounded-md border border-stone-300 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-50 transition-colors shadow-2xs"
                            >
                              Request Replacement <ExternalLink className="h-3 w-3 text-stone-400" />
                            </a>
                          );
                        }
                        return null;
                      })()}

                      {(order.status === 'PENDING' || order.status === 'CONFIRMED' || order.status === 'PROCESSING') && (
                        <a
                          href={`https://wa.me/917479135626?text=Hi%20Techno%20World%20Books%2C%20I%20want%20to%20cancel%20my%20pre-dispatch%20order%20%23${order.orderNumber}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-md border border-stone-300 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-50 transition-colors shadow-2xs"
                        >
                          Request Cancellation
                        </a>
                      )}

                      {order.trackingNumber && (
                        <Link
                          to={`/track?trackingId=${order.trackingNumber}`}
                          className="inline-flex items-center gap-1.5 rounded-md border border-stone-300 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-50 transition-colors shadow-2xs"
                        >
                          <Truck className="h-3.5 w-3.5 text-stone-500" />
                          Track Shipment
                        </Link>
                      )}

                      {order.status !== 'CANCELLED' && order.status !== 'REFUNDED' && (
                        <button
                          type="button"
                          disabled={downloadingInvoiceId === order.id}
                          onClick={async () => {
                            try {
                              setDownloadingInvoiceId(order.id);
                              await downloadOrderInvoice(order);
                              toast.success('Invoice downloaded');
                            } catch (err: any) {
                              toast.error(err.message || 'Failed to download invoice');
                            } finally {
                              setDownloadingInvoiceId(null);
                            }
                          }}
                          className="inline-flex items-center gap-1.5 rounded-md border border-stone-300 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-50 transition-colors shadow-2xs disabled:opacity-50"
                        >
                          {downloadingInvoiceId === order.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin text-stone-500" />
                          ) : (
                            <Download className="h-3.5 w-3.5 text-stone-500" />
                          )}
                          <span>Tax Invoice</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => setHelpOrderModal(order)}
                        className="inline-flex items-center gap-1.5 rounded-md border border-stone-300 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-50 transition-colors shadow-2xs"
                      >
                        Need Help?
                      </button>
                    </div>
                  </div>

                  {/* Subtle Shipping Address */}
                  <div className="pt-2.5 border-t border-stone-200/70 text-xs text-stone-500 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="font-medium text-stone-700">Ship to: </span>
                      {order.address ? (
                        <span>{order.address.fullName}, {order.address.addressLine1}, {order.address.city}, {order.address.state} - {order.address.pincode}</span>
                      ) : (
                        <span>Standard Delivery Address</span>
                      )}
                    </div>
                    {order.trackingNumber && (
                      <span className="font-mono text-[11px] text-stone-400">
                        India Post Ref: #{order.trackingNumber}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Need Help? Order Support Modal */}
      {helpOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4 border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                  <HelpCircle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Need Help with Order?</h3>
                  <p className="text-xs text-slate-500 font-mono">Order #{helpOrderModal.orderNumber}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setHelpOrderModal(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              {/* Option 1: WhatsApp 24/7 Faster Support */}
              <a
                href={`https://wa.me/917479135626?text=${encodeURIComponent(
                  `Hello Techno World Books! I need support regarding my order #${helpOrderModal.orderNumber}.`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="group flex items-start gap-3.5 rounded-xl border border-emerald-200 bg-emerald-50/70 p-3.5 hover:bg-emerald-100/70 hover:border-emerald-300 transition-all"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-emerald-950">WhatsApp 24/7 (Faster Support)</p>
                    <span className="rounded-full bg-emerald-200 px-2 py-0.5 text-[10px] font-black text-emerald-900">24/7</span>
                  </div>
                  <p className="text-xs text-emerald-800 font-semibold mt-0.5">+91 747 913 5626</p>
                  <p className="text-[11px] text-emerald-700/90 mt-1">Usually replies within minutes for order updates, changes & delivery tracking.</p>
                </div>
              </a>

              {/* Option 2: Call Support 9am to 8pm */}
              <a
                href="tel:+917479135626"
                className="group flex items-start gap-3.5 rounded-xl border border-blue-200 bg-blue-50/70 p-3.5 hover:bg-blue-100/70 hover:border-blue-300 transition-all"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
                  <Phone className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-blue-950">Call Support Desk</p>
                    <span className="rounded-full bg-blue-200 px-2 py-0.5 text-[10px] font-black text-blue-900">9 AM – 8 PM</span>
                  </div>
                  <p className="text-xs text-blue-800 font-semibold mt-0.5">+91 747 913 5626 / 033 2219 6115</p>
                  <p className="text-[11px] text-blue-700/90 mt-1">Direct phone assistance from our College Street office team (Usually replies within hours).</p>
                </div>
              </a>

              {/* Option 3: Support Form (Direct Prefilled) */}
              <Link
                to={`/contact?orderId=${encodeURIComponent(helpOrderModal.orderNumber)}&name=${encodeURIComponent(user?.name || '')}&email=${encodeURIComponent(user?.email || '')}`}
                onClick={() => setHelpOrderModal(null)}
                className="group flex items-start gap-3.5 rounded-xl border border-slate-200 bg-slate-50 p-3.5 hover:bg-slate-100 hover:border-slate-300 transition-all"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-white shadow-sm">
                  <Mail className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-slate-900">Fill Help &amp; Support Form</p>
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-200/80 px-2 py-0.5 rounded-full">Auto-prefilled</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">Submit an official inquiry with your order details prefilled.</p>
                  <p className="text-[11px] text-slate-500 mt-1">Saves directly to system & sends confirmation to your email.</p>
                </div>
              </Link>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setHelpOrderModal(null)}
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
