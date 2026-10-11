import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Package, HelpCircle, MessageSquare, Phone, Mail, X, Truck } from 'lucide-react';
import { orderService } from '@/services/api';
import { downloadOrderInvoice } from '@/utils/generateInvoice';
import { toast } from 'sonner';
import { useStore } from '@/store/StoreContext';
import SEOHead from '@/components/SEOHead';
import { ExpandableOrderCard } from '@/components/orders/ExpandableOrderCard';
import IndiaPostBatchExporterModal from '@/components/admin/IndiaPostBatchExporterModal';

export default function MyOrders() {
  const { user } = useStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingInvoiceId, setDownloadingInvoiceId] = useState<string | null>(null);
  const [helpOrderModal, setHelpOrderModal] = useState<any | null>(null);
  const [isIndiaPostModalOpen, setIsIndiaPostModalOpen] = useState(false);

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
    return <div className="p-12 text-center text-stone-500 font-sans">Loading your orders...</div>;
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <SEOHead
        title="My Orders | Techno World Books"
        description="View your order history and track deliveries."
        noIndex={true}
      />
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-2xl font-bold text-stone-900 tracking-tight">My Orders</h1>
        {orders.length > 0 && (
          <button
            onClick={() => setIsIndiaPostModalOpen(true)}
            className="rounded-md border border-stone-800 bg-stone-900 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-stone-800 transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
            title="Export daily batch for India Post CEPT Bulk Booking"
          >
            <Truck className="h-3.5 w-3.5 text-emerald-400" />
            <span>India Post Dispatch</span>
          </button>
        )}
      </div>
      
      {orders.length === 0 ? (
        <div className="bg-white border border-stone-200 rounded-lg p-12 text-center shadow-xs">
          <Package className="h-12 w-12 text-stone-300 mx-auto mb-4" />
          <h3 className="text-lg font-serif font-bold text-stone-900">No orders found</h3>
          <p className="text-stone-500 mb-6 text-sm">Looks like you haven't made your first purchase yet.</p>
          <Link to="/" className="inline-block bg-brand-base text-white px-6 py-2.5 rounded-md text-xs font-semibold hover:bg-brand-light transition-colors">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order, idx) => (
            <ExpandableOrderCard
              key={order.id}
              order={order}
              defaultExpanded={idx === 0}
              onDownloadInvoice={async (ord) => {
                try {
                  setDownloadingInvoiceId(ord.id);
                  await downloadOrderInvoice(ord);
                  toast.success('Invoice downloaded');
                } catch (err: any) {
                  toast.error(err.message || 'Failed to download invoice');
                } finally {
                  setDownloadingInvoiceId(null);
                }
              }}
              isDownloadingInvoice={downloadingInvoiceId === order.id}
              onNeedHelp={(ord) => setHelpOrderModal(ord)}
            />
          ))}
        </div>
      )}

      {/* Need Help? Order Support Modal */}
      {helpOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl space-y-4 border border-stone-200">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-stone-100 text-stone-700">
                  <HelpCircle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-serif font-bold text-stone-900">Need Help with Order?</h3>
                  <p className="text-xs text-stone-500 font-mono">Order #{helpOrderModal.orderNumber}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setHelpOrderModal(null)}
                className="rounded-md p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-600 transition-colors cursor-pointer"
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
                className="group flex items-start gap-3.5 rounded-lg border border-stone-200 bg-stone-50/70 p-3.5 hover:bg-stone-100/70 hover:border-stone-300 transition-all"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-brand-base text-white shadow-xs">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-stone-900">WhatsApp 24/7 (Faster Support)</p>
                    <span className="rounded-md bg-stone-200 px-2 py-0.5 text-[10px] font-semibold text-stone-800">24/7</span>
                  </div>
                  <p className="text-xs text-stone-700 font-mono font-medium mt-0.5">+91 747 913 5626</p>
                  <p className="text-[11px] text-stone-600 mt-1">Usually replies within minutes for order updates, changes & delivery tracking.</p>
                </div>
              </a>

              {/* Option 2: Call Support 9am to 8pm */}
              <a
                href="tel:+917479135626"
                className="group flex items-start gap-3.5 rounded-lg border border-stone-200 bg-stone-50/70 p-3.5 hover:bg-stone-100/70 hover:border-stone-300 transition-all"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-stone-800 text-white shadow-xs">
                  <Phone className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-stone-900">Call Support Desk</p>
                    <span className="rounded-md bg-stone-200 px-2 py-0.5 text-[10px] font-semibold text-stone-800">9 AM – 8 PM</span>
                  </div>
                  <p className="text-xs text-stone-700 font-mono font-medium mt-0.5">+91 747 913 5626 / 033 2219 6115</p>
                  <p className="text-[11px] text-stone-600 mt-1">Direct phone assistance from our College Street office team (Usually replies within hours).</p>
                </div>
              </a>

              {/* Option 3: Support Form (Direct Prefilled) */}
              <Link
                to={`/contact?orderId=${encodeURIComponent(helpOrderModal.orderNumber)}&name=${encodeURIComponent(user?.name || '')}&email=${encodeURIComponent(user?.email || '')}`}
                onClick={() => setHelpOrderModal(null)}
                className="group flex items-start gap-3.5 rounded-lg border border-stone-200 bg-stone-50/70 p-3.5 hover:bg-stone-100/70 hover:border-stone-300 transition-all"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-stone-800 text-white shadow-xs">
                  <Mail className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-stone-900">Fill Help &amp; Support Form</p>
                    <span className="text-[10px] font-semibold text-stone-700 bg-stone-200 px-2 py-0.5 rounded-md">Auto-prefilled</span>
                  </div>
                  <p className="text-xs text-stone-600 mt-0.5">Submit an official inquiry with your order details prefilled.</p>
                  <p className="text-[11px] text-stone-500 mt-1">Saves directly to system & sends confirmation to your email.</p>
                </div>
              </Link>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setHelpOrderModal(null)}
                className="w-full rounded-md border border-stone-200 bg-white py-2.5 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* India Post Dispatch Batch Exporter Modal */}
      <IndiaPostBatchExporterModal
        isOpen={isIndiaPostModalOpen}
        onClose={() => setIsIndiaPostModalOpen(false)}
        orders={orders}
      />
    </div>
  );
}
