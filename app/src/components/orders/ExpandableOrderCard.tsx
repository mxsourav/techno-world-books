import React, { useState } from 'react';
import { Link } from 'react-router';
import {
  ChevronDown,
  Download,
  Loader2,
  HelpCircle,
  ExternalLink,
  BookOpen,
  FileText,
  Package,
  Truck,
  Home,
  Share2,
} from 'lucide-react';
import { toast } from 'sonner';
import { formatINR } from '@/utils/helpers';
import { getImageUrl } from '@/services/api';
import { BookCover } from '@/components/BookCover';

function getStepIcon(stepKey: string) {
  switch (stepKey) {
    case 'placed':
      return FileText;
    case 'packed':
      return Package;
    case 'dispatched':
      return Truck;
    case 'delivered':
      return Home;
    default:
      return FileText;
  }
}

export interface ExpandableOrderCardProps {
  order: any;
  onDownloadInvoice?: (order: any) => Promise<void> | void;
  isDownloadingInvoice?: boolean;
  onNeedHelp?: (order: any) => void;
  defaultExpanded?: boolean;
}

/**
 * Phase metadata calculation for the 4-step horizontal stepper:
 * 1. Placed -> 2. Packed -> 3. Dispatched -> 4. Delivered
 */
function getOrderTrackingPhases(order: any) {
  const status = (order.status || '').toUpperCase();
  const placedDate = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
    : '';

  const deliveryTimestamp = order.deliveredAt || order.updatedAt || order.createdAt;
  const deliveredDate = deliveryTimestamp
    ? new Date(deliveryTimestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
    : '';

  if (status === 'DELIVERED') {
    return {
      currentStepIndex: 3,
      statusHeader: `Delivered on ${deliveredDate}`,
      statusDotClass: 'bg-emerald-600',
      isDelivered: true,
      isCancelled: false,
      steps: [
        { key: 'placed', label: 'Placed', sublabel: placedDate },
        { key: 'packed', label: 'Packed', sublabel: 'Verified' },
        { key: 'dispatched', label: 'Dispatched', sublabel: order.trackingNumber ? 'India Post' : 'Courier' },
        { key: 'delivered', label: 'Delivered', sublabel: deliveredDate },
      ],
    };
  }

  if (status === 'SHIPPED') {
    return {
      currentStepIndex: 2,
      statusHeader: 'Dispatched & In-Transit',
      statusDotClass: 'bg-stone-800',
      isDelivered: false,
      isCancelled: false,
      steps: [
        { key: 'placed', label: 'Placed', sublabel: placedDate },
        { key: 'packed', label: 'Packed', sublabel: 'Ready' },
        { key: 'dispatched', label: 'Dispatched', sublabel: order.trackingNumber ? 'India Post' : 'In-Transit' },
        { key: 'delivered', label: 'Delivered', sublabel: 'Pending' },
      ],
    };
  }

  if (status === 'PROCESSING') {
    return {
      currentStepIndex: 1,
      statusHeader: 'Preparing for Dispatch',
      statusDotClass: 'bg-stone-700',
      isDelivered: false,
      isCancelled: false,
      steps: [
        { key: 'placed', label: 'Placed', sublabel: placedDate },
        { key: 'packed', label: 'Packed', sublabel: 'In Progress' },
        { key: 'dispatched', label: 'Dispatched', sublabel: 'Pending' },
        { key: 'delivered', label: 'Delivered', sublabel: 'Pending' },
      ],
    };
  }

  if (status === 'CONFIRMED' || status === 'PENDING') {
    return {
      currentStepIndex: 0,
      statusHeader: 'Order Placed',
      statusDotClass: 'bg-stone-600',
      isDelivered: false,
      isCancelled: false,
      steps: [
        { key: 'placed', label: 'Placed', sublabel: placedDate },
        { key: 'packed', label: 'Packed', sublabel: 'Queued' },
        { key: 'dispatched', label: 'Dispatched', sublabel: 'Pending' },
        { key: 'delivered', label: 'Delivered', sublabel: 'Pending' },
      ],
    };
  }

  if (status === 'CANCELLED') {
    return {
      currentStepIndex: -1,
      statusHeader: 'Order Cancelled',
      statusDotClass: 'bg-rose-600',
      isDelivered: false,
      isCancelled: true,
      steps: [],
    };
  }

  if (status === 'REFUNDED') {
    return {
      currentStepIndex: -1,
      statusHeader: 'Order Refunded',
      statusDotClass: 'bg-stone-500',
      isDelivered: false,
      isCancelled: true,
      steps: [],
    };
  }

  return {
    currentStepIndex: 0,
    statusHeader: 'Order Placed',
    statusDotClass: 'bg-stone-600',
    isDelivered: false,
    isCancelled: false,
    steps: [
      { key: 'placed', label: 'Placed', sublabel: placedDate },
      { key: 'packed', label: 'Packed', sublabel: 'Queued' },
      { key: 'dispatched', label: 'Dispatched', sublabel: 'Pending' },
      { key: 'delivered', label: 'Delivered', sublabel: 'Pending' },
    ],
  };
}

export function ExpandableOrderCard({
  order,
  onDownloadInvoice,
  isDownloadingInvoice = false,
  onNeedHelp,
  defaultExpanded = false,
}: ExpandableOrderCardProps) {
  const [isOpen, setIsOpen] = useState(defaultExpanded);

  const firstItem = order.items?.[0];
  const uniqueItemsCount = order.items?.length || 0;
  const totalQuantity =
    order.items?.reduce((acc: number, it: any) => acc + (it.quantity || 1), 0) || uniqueItemsCount;
  const additionalItems = Math.max(0, (uniqueItemsCount > 1 ? uniqueItemsCount : totalQuantity) - 1);

  const trackingMeta = getOrderTrackingPhases(order);

  // 7-day replacement eligibility check
  const deliveryTimestamp = order.deliveredAt || order.updatedAt || order.createdAt;
  const daysSinceDelivery = Math.floor(
    (Date.now() - new Date(deliveryTimestamp).getTime()) / (1000 * 60 * 60 * 24)
  );
  const isReplacementEligible = trackingMeta.isDelivered && daysSinceDelivery <= 7;
  const replacementDaysRemaining = Math.max(0, 7 - daysSinceDelivery);

  const isPreDispatch =
    order.status === 'PENDING' || order.status === 'CONFIRMED' || order.status === 'PROCESSING';

  const firstCoverUrl = firstItem?.book?.coverUrl || firstItem?.book?.coverImage;

  return (
    <div className="bg-white border border-stone-200 rounded-xl shadow-sm transition-colors duration-200 hover:border-stone-300 overflow-hidden">
      {/* 1. THE COLLAPSED STATE (MINIMAL & CLEAN) */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        className="w-full p-4 sm:p-5 flex items-center justify-between gap-3 sm:gap-4 text-left cursor-pointer select-none transition-colors hover:bg-stone-50/50"
      >
        {/* Left Side: A single 40x40px thumbnail of the first book */}
        <div className="relative w-10 h-10 rounded-md bg-stone-100 border border-stone-200 shrink-0 flex items-center justify-center">
          <div className="w-full h-full overflow-hidden rounded-[5px]">
            {firstCoverUrl ? (
              <img
                src={getImageUrl(firstCoverUrl)}
                alt={firstItem?.book?.title || 'Book Cover'}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : firstItem?.book ? (
              <BookCover
                book={{
                  id: firstItem.book.id || firstItem.bookId,
                  title: firstItem.book.title || 'Book',
                  coverUrl: firstItem.book.coverUrl,
                  galleryUrls: firstItem.book.galleryUrls,
                  images: firstItem.book.images,
                  coverImage: firstItem.book.coverImage,
                }}
                className="w-full h-full text-[6px]"
              />
            ) : (
              <BookOpen className="h-4 w-4 text-stone-400" />
            )}
          </div>

          {additionalItems > 0 && (
            <span
              className="absolute -bottom-1 -right-1.5 bg-stone-900 text-white text-[8px] font-mono font-medium px-1.5 py-0.5 rounded-full shadow-2xs leading-none whitespace-nowrap z-10"
              title={`${additionalItems + 1} items in this order`}
            >
              +{additionalItems} {additionalItems === 1 ? 'item' : 'items'}
            </span>
          )}
        </div>

        {/* Middle: Bold primary status header & muted subtitle */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full shrink-0 ${trackingMeta.statusDotClass}`} />
            <span className="font-semibold text-stone-900 text-sm sm:text-base tracking-tight truncate">
              {trackingMeta.statusHeader}
            </span>
          </div>
          <p className="text-xs text-stone-500 font-mono mt-0.5 truncate">
            Order #{order.orderNumber}
          </p>
        </div>

        {/* Right Side: Total Price & Rotating Chevron */}
        <div className="flex items-center gap-3 shrink-0">
          <span className="font-mono font-bold text-sm sm:text-base text-stone-900">
            {formatINR(order.totalAmount)}
          </span>
          <ChevronDown
            className={`h-4 w-4 text-stone-400 transition-transform duration-300 ease-out ${
              isOpen ? 'rotate-180 text-stone-900' : ''
            }`}
          />
        </div>
      </button>

      {/* 2. THE ANIMATED EXPANSION (TAILWIND CSS GRID TRANSITION) */}
      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-out ${
          isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        }`}
      >
        <div className="overflow-hidden">
          <div className="border-t border-stone-200 px-4 sm:px-6 py-5 sm:py-6 space-y-6 bg-white">
            {/* 3. THE HORIZONTAL TRACKING TIMELINE */}
            {!trackingMeta.isCancelled ? (
              <div className="py-2 px-1 sm:px-4">
                <div className="max-w-xl mx-auto w-full">
                  <div className="flex items-start">
                    {trackingMeta.steps.map((step, idx) => {
                      const isPast = idx < trackingMeta.currentStepIndex || (trackingMeta.isDelivered && idx <= trackingMeta.currentStepIndex);
                      const isActive = idx === trackingMeta.currentStepIndex && !trackingMeta.isDelivered;
                      const isLineCompleted = idx < trackingMeta.currentStepIndex;
                      const StepIcon = getStepIcon(step.key);

                      return (
                        <React.Fragment key={step.key}>
                          {/* Step Node */}
                          <div className="flex flex-col items-center text-center shrink-0 w-16 sm:w-20">
                            <div className="relative flex items-center justify-center">
                              {isActive && (
                                <span className="absolute -inset-1 rounded-full bg-emerald-500/30 animate-ping pointer-events-none" />
                              )}
                              <div
                                className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-colors duration-200 relative z-10 ${
                                  isPast
                                    ? 'bg-[#0B2B19] text-white shadow-2xs'
                                    : isActive
                                    ? 'bg-emerald-50 border-2 border-[#155D36] text-[#155D36] font-bold shadow-2xs'
                                    : 'bg-stone-100 border border-stone-200 text-stone-400'
                                }`}
                                title={`${step.label}: ${step.sublabel || ''}`}
                              >
                                <StepIcon className="w-3.5 h-3.5" />
                              </div>
                            </div>
                            <div className="mt-2 flex flex-col items-center w-full">
                              <span
                                className={`text-[11px] font-medium leading-tight ${
                                  isPast || isActive ? 'text-stone-900 font-semibold' : 'text-stone-400'
                                }`}
                              >
                                {step.label}
                              </span>
                              {step.sublabel && (
                                <span className="text-[10px] text-stone-400 mt-0.5 leading-tight truncate max-w-full font-mono">
                                  {step.sublabel}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Connecting Line (1px) */}
                          {idx < trackingMeta.steps.length - 1 && (
                            <div
                              className={`flex-1 h-[1px] mt-3.5 mx-1 sm:mx-2 transition-colors duration-300 ${
                                isLineCompleted ? 'bg-[#155D36]' : 'bg-stone-200'
                              }`}
                            />
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-stone-200 bg-stone-50/50 p-3.5 text-center text-xs text-stone-600">
                {order.status === 'CANCELLED'
                  ? 'This order was cancelled prior to courier dispatch and has been closed.'
                  : 'This order has been refunded to your original payment method.'}
              </div>
            )}

            {/* Consignment and Merged Notice (Neutral) */}
            {(order.isMerged || (order.childOrders && order.childOrders.length > 0)) && (
              <div className="rounded-md bg-stone-50 border border-stone-200 px-3.5 py-2 text-xs text-stone-600 space-y-1">
                {order.isMerged && (
                  <p>
                    Consolidated with consignment #{order.parentOrder?.orderNumber || order.parentOrderId?.slice(0, 8)}.
                    {Number(order.shippingRefunded) > 0 && (
                      <span className="font-semibold text-stone-800">
                        {' '}• {formatINR(order.shippingRefunded)} delivery fee refunded to Wallet.
                      </span>
                    )}
                  </p>
                )}
                {order.childOrders && order.childOrders.length > 0 && (
                  <p className="font-medium text-stone-800">
                    Master Consignment ({order.childOrders.length} Add-on order{order.childOrders.length > 1 ? 's' : ''} merged).
                  </p>
                )}
              </div>
            )}

            {/* 4. THE DETAILS SECTION */}
            {/* 4.1 The Item List */}
            <div className="space-y-3">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 block">
                Items Ordered ({order.items?.length || 0})
              </span>
              <div className="divide-y divide-stone-100 border-y border-stone-100">
                {order.items?.map((item: any) => {
                  const itemCoverUrl = item.book?.coverUrl || item.book?.coverImage;
                  const unitPrice = item.unitPrice || item.priceAtPurchase || 0;
                  const itemTotal = unitPrice * (item.quantity || 1);

                  return (
                    <div key={item.id} className="py-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Thumbnail */}
                        <div className="w-9 h-12 rounded bg-stone-100 border border-stone-200 overflow-hidden shrink-0 flex items-center justify-center">
                          {itemCoverUrl ? (
                            <img
                              src={getImageUrl(itemCoverUrl)}
                              alt={item.book?.title || 'Book Cover'}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          ) : item.book ? (
                            <BookCover
                              book={{
                                id: item.book.id || item.bookId,
                                title: item.book.title || 'Book',
                                coverUrl: item.book.coverUrl,
                                galleryUrls: item.book.galleryUrls,
                                images: item.book.images,
                                coverImage: item.book.coverImage,
                              }}
                              className="w-full h-full text-[6px]"
                            />
                          ) : (
                            <BookOpen className="h-4 w-4 text-stone-400" />
                          )}
                        </div>

                        {/* Title & Info */}
                        <div className="min-w-0">
                          <h5 className="text-xs sm:text-sm font-semibold text-stone-900 leading-snug line-clamp-1">
                            {item.book?.title || 'Academic Book'}
                          </h5>
                          {item.book?.author && (
                            <p className="text-[11px] text-stone-500 mt-0.5 truncate">
                              by {item.book.author}
                            </p>
                          )}
                          <p className="text-[11px] text-stone-400 mt-0.5">
                            Qty: <span className="font-medium text-stone-700">{item.quantity}</span>
                            {item.quantity > 1 && ` × ${formatINR(unitPrice)}`}
                          </p>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="text-right shrink-0 font-mono text-xs sm:text-sm font-semibold text-stone-900">
                        {formatINR(itemTotal)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 4.2 Shipping & Courier Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1 text-xs sm:text-sm text-stone-500">
              <div className="space-y-1">
                <span className="font-semibold text-stone-700 block text-[11px] uppercase tracking-wider">
                  Delivery Address
                </span>
                {order.address ? (
                  <p className="leading-relaxed text-stone-600">
                    <span className="font-medium text-stone-900">{order.address.fullName}</span>
                    <br />
                    {order.address.addressLine1}
                    {order.address.addressLine2 ? `, ${order.address.addressLine2}` : ''}
                    <br />
                    {order.address.city}, {order.address.state} —{' '}
                    <span className="font-mono text-stone-800">{order.address.pincode}</span>
                    {order.address.phone && (
                      <span className="block text-stone-500 text-xs mt-0.5">
                        Phone: +91 {order.address.phone}
                      </span>
                    )}
                  </p>
                ) : (
                  <p className="text-stone-400">Standard Delivery Address</p>
                )}
              </div>

              <div className="space-y-1">
                <span className="font-semibold text-stone-700 block text-[11px] uppercase tracking-wider">
                  Shipment & Courier
                </span>
                <p className="leading-relaxed text-stone-600">
                  <span className="font-medium text-stone-900">
                    {order.shippingCarrier || 'India Post Speed Post'}
                  </span>
                  {order.trackingNumber ? (
                    <>
                      <br />
                      <span className="text-xs font-mono text-stone-700">
                        AWB:{' '}
                        <Link
                          to={`/track?trackingId=${order.trackingNumber}`}
                          className="font-semibold text-stone-900 underline underline-offset-2 hover:text-brand-base transition-colors"
                          title="Track consignment via India Post"
                        >
                          {order.trackingNumber}
                        </Link>
                      </span>
                    </>
                  ) : (
                    <span className="block text-xs text-stone-400 mt-0.5">
                      Tracking consignment number assigned on India Post dispatch.
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* 4.3 Action Bar */}
            <div className="border-t border-stone-100 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Secondary Status / Window Notices */}
              <div className="text-xs text-stone-500">
                {trackingMeta.isDelivered ? (
                  isReplacementEligible ? (
                    <span className="text-brand-base font-medium">
                      7-day replacement window active ({replacementDaysRemaining === 0 ? 'expires today' : `${replacementDaysRemaining} day${replacementDaysRemaining > 1 ? 's' : ''} left`}).
                    </span>
                  ) : (
                    <span className="text-stone-400">7-day replacement window closed.</span>
                  )
                ) : isPreDispatch ? (
                  <span className="text-stone-500">
                    Pre-dispatch cancellation available before courier handover.
                  </span>
                ) : null}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Request Replacement (if eligible) */}
                {isReplacementEligible && (
                  <a
                    href="https://docs.google.com/forms/d/e/1FAIpQLSdP7BBi2SNX67XU0xoBDzqiXSaL4nyBBIwDfVacG8M9kVR1RQ/viewform?usp=publish-editor"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-md border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-50 hover:border-stone-300 transition-colors shadow-2xs"
                  >
                    Request Replacement <ExternalLink className="h-3 w-3 text-stone-400" />
                  </a>
                )}

                {/* Pre-dispatch Cancellation */}
                {isPreDispatch && (
                  <a
                    href={`https://wa.me/917479135626?text=Hi%20Techno%20World%20Books%2C%20I%20want%20to%20cancel%20my%20pre-dispatch%20order%20%23${order.orderNumber}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-md border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-50 hover:border-stone-300 transition-colors shadow-2xs"
                  >
                    Request Cancellation
                  </a>
                )}

                {/* Download Tax Invoice */}
                {order.status !== 'CANCELLED' && order.status !== 'REFUNDED' && onDownloadInvoice && (
                  <button
                    type="button"
                    disabled={isDownloadingInvoice}
                    onClick={() => onDownloadInvoice(order)}
                    className="inline-flex items-center gap-1.5 rounded-md border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-50 hover:border-stone-300 transition-colors shadow-2xs disabled:opacity-50 cursor-pointer"
                  >
                    {isDownloadingInvoice ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-stone-500" />
                    ) : (
                      <Download className="h-3.5 w-3.5 text-stone-500" />
                    )}
                    <span>Download Invoice</span>
                  </button>
                )}

                {/* Shareable Cryptographic Tracking Link */}
                {(order.trackingToken || order.trackingNumber || order.orderNumber) && (
                  <button
                    type="button"
                    onClick={() => {
                      const token = order.trackingToken || order.trackingNumber || order.orderNumber;
                      const shareUrl = order.trackingToken
                        ? `https://www.technoworldbooks.in/track/shipment?token=${order.trackingToken}`
                        : `https://www.technoworldbooks.in/track?id=${encodeURIComponent(token)}`;
                      if (navigator?.clipboard?.writeText) {
                        navigator.clipboard.writeText(shareUrl)
                          .then(() => toast.success('Cryptographic tracking link copied to clipboard!'))
                          .catch(() => toast.info(`Tracking Link: ${shareUrl}`));
                      } else {
                        toast.info(`Tracking Link: ${shareUrl}`);
                      }
                    }}
                    className="inline-flex items-center gap-1.5 rounded-md border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-50 hover:border-stone-300 transition-colors shadow-2xs cursor-pointer"
                    title="Copy shareable tracking link"
                  >
                    <Share2 className="h-3.5 w-3.5 text-stone-500" />
                    <span>Share Tracking</span>
                  </button>
                )}

                {/* Need Help? */}
                {onNeedHelp && (
                  <button
                    type="button"
                    onClick={() => onNeedHelp(order)}
                    className="inline-flex items-center gap-1.5 rounded-md border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-50 hover:border-stone-300 transition-colors shadow-2xs cursor-pointer"
                  >
                    <HelpCircle className="h-3.5 w-3.5 text-stone-500" />
                    <span>Need Help?</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default ExpandableOrderCard;
