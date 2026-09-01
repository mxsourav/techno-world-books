import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { BookOpen, Plus, Search, ShoppingCart, Users, Download, IndianRupee, AlertCircle, Pause, Play, Trash2, Edit3, Truck, Printer, ShieldCheck, X, Loader2, Mail, CheckCircle2, XCircle, Send, AlertTriangle, MessageSquare, ChevronDown, ChevronUp, Settings, ArrowRight, Bell } from 'lucide-react';
import { formatINR } from '@/utils/helpers';
import type { Book } from '@/types/index';
import { adminService, bookService, categoryService, orderService, mediaService, cmsService, promotionService, shippingService } from '@/services/api';
import { toast } from 'sonner';
import PromotionEditModal from '@/components/admin/PromotionEditModal';
import ProductsWorkspace from '@/components/admin/catalog/ProductsWorkspace';

export default function Dashboard() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const tab = searchParams.get('tab') || 'dashboard';
  const navigate = useNavigate();


  
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importAnalysis, setImportAnalysis] = useState<any>(null);
  


  const [stats, setStats] = useState({ 
    revenue: 0, totalOrders: 0, aov: 0, lowStock: 0, 
    totalBooks: 0, outOfStock: 0, totalUsers: 0 
  });
  const [categories, setCategories] = useState<any[]>([]);

  const [lowStockBooks, setLowStockBooks] = useState<Book[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [shippingLoading, setShippingLoading] = useState<string | null>(null);
  const [shippingModalLabel, setShippingModalLabel] = useState<any | null>(null);
  const [shippingTrackingModal, setShippingTrackingModal] = useState<any | null>(null);
  
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('ALL');
  const [emailModalOrder, setEmailModalOrder] = useState<any | null>(null);
  const [emailTemplate, setEmailTemplate] = useState<string>('DELAY_NOTICE');
  const [emailSubject, setEmailSubject] = useState<string>('');
  const [emailMessage, setEmailMessage] = useState<string>('');
  const [emailRecipient, setEmailRecipient] = useState<string>('');
  const [emailSending, setEmailSending] = useState(false);

  const [rejectModalOrder, setRejectModalOrder] = useState<any | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('Book currently out of print / unavailable from publisher');
  const [rejectCustomReason, setRejectCustomReason] = useState<string>('');
  const [rejecting, setRejecting] = useState(false);
  const [expandedNotesOrderId, setExpandedNotesOrderId] = useState<string | null>(null);

  const [mediaItems, setMediaItems] = useState<any[]>([]);
  const [cmsSections, setCmsSections] = useState<any[]>([]);
  const [cmsEditing, setCmsEditing] = useState<Record<string, any>>({});  const [isUploading, setIsUploading] = useState(false);
  const [promotions, setPromotions] = useState<any[]>([]);
  const [editingPromotion, setEditingPromotion] = useState<any>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);



  useEffect(() => {
    if (tab === 'dashboard') {
      adminService.getStats().then(res => setStats(res.data)).catch(console.error);
      categoryService.getCategories().then(res => setCategories(res.data)).catch(console.error);
      bookService.getBooks({ limit: 6 }).then(res => setLowStockBooks(res.data)).catch(console.error);
      orderService.getNotifications().then((res: any) => {
        if (res.success) setPendingOrdersSummary(res.pendingOrders || []);
      }).catch(() => {});
    }
    if (tab === 'settings') {
      fetchAdminSettings();
    }
  }, [tab]);

  // Live polling on Orders tab so newly placed orders pop up immediately
  useEffect(() => {
    if (tab === 'orders') {
      const fetchOrders = () => {
        orderService.getAllOrders().then(res => setOrders(res.data || [])).catch(console.error);
      };
      fetchOrders();
      const interval = setInterval(fetchOrders, 4000);
      return () => clearInterval(interval);
    }
  }, [tab]);




  useEffect(() => {
    if (tab === 'media') {
      mediaService.list().then(res => setMediaItems(res.data)).catch(console.error);
    }
  }, [tab]);

  useEffect(() => {
    if (tab === 'cms') {
      cmsService.getSections().then(res => {
        setCmsSections(res.data);
        const editing: Record<string, any> = {};
        for (const s of res.data) editing[s.sectionKey] = s.configData;
        setCmsEditing(editing);
      }).catch(console.error);
    }
  }, [tab]);

  useEffect(() => {
    if (tab === 'coupons') {
      promotionService.getAll().then(res => setPromotions(res.data)).catch(console.error);
    }
  }, [tab]);

  const saveCmsSection = async (key: string) => {
    try {
      await cmsService.updateSection(key, { configData: cmsEditing[key] });
      toast.success(`"${key}" saved!`);
    } catch (err: any) {
      toast.error(err.message || 'Save failed');
    }
  };

  const toggleCmsSection = async (key: string) => {
    try {
      const res = await cmsService.toggleSection(key);
      setCmsSections(s => s.map(sec => sec.sectionKey === key ? { ...sec, isEnabled: res.data.isEnabled } : sec));
      toast.success(res.message);
    } catch (err: any) {
      toast.error(err.message || 'Toggle failed');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      const res = await adminService.analyzeImport(file);
      setImportAnalysis({ ...res.data, file, filename: file.name });
      setIsImportModalOpen(true);
    } catch (err: any) {
      toast.error(err.message || 'Analysis failed');
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleExecuteImport = async () => {
    if (!importAnalysis) return;
    setIsImporting(true);
    try {
      const res = await adminService.executeImport({
        filename: importAnalysis.filename,
        toAdd: importAnalysis.toAdd,
        toUpdate: importAnalysis.toUpdate,
        newCategories: importAnalysis.newCategories,
        newAuthors: importAnalysis.newAuthors,
        newPublishers: importAnalysis.newPublishers,
        warnings: importAnalysis.warnings,
        strategy: 'SKIP', // or OVERWRITE
      });
      toast.success(`Import success! Added: ${(res as any).recordsAdded}, Updated: ${(res as any).recordsUpdated}, Skipped: ${(res as any).recordsSkipped}`);
      setImportResult(res);
      setImportAnalysis(null);
    } catch (err: any) {
      toast.error(err.message || 'Import failed');
    } finally {
      setIsImporting(false);
    }
  };

  const getStock = (_id: string, def: number) => def;

  const downloadErrorsCsv = () => {
    if (!importResult?.errors?.length) return;
    const csvContent = "data:text/csv;charset=utf-8," 
        + "Row,Error Message\n" 
        + importResult.errors.map((e: any) => `${e.row},"${e.message.replace(/"/g, '""')}"`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "import_errors.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  // Quick Template Helper for Admin Customer Emails
  const applyEmailTemplate = (templateKey: string, order: any) => {
    setEmailTemplate(templateKey);
    const customerName = order.address?.name || order.user?.name || 'Valued Customer';
    const firstBookTitle = order.items?.[0]?.book?.title || 'the ordered title(s)';

    if (templateKey === 'DELAY_NOTICE') {
      setEmailSubject(`Important Update: Order #${order.orderNumber} Dispatch Notice - Techno World Books`);
      setEmailMessage(
`Dear ${customerName},

Thank you for placing order #${order.orderNumber} with Techno World Books.

We would like to inform you that "${firstBookTitle}" is currently being arranged from our publisher warehouse. As a result, there will be a slight delay of 2–3 business days in dispatching your package.

Rest assured, your order is confirmed and prioritized. As soon as it is packed, we will dispatch it via India Post Speed Post and email your live tracking barcode immediately.

Thank you for your patience and understanding.

Warm regards,
Techno World Orders Team
admin@technoworld.com | https://techno-world-books.vercel.app`
      );
    } else if (templateKey === 'ADDRESS_CLARIFICATION') {
      setEmailSubject(`Address Clarification Required: Order #${order.orderNumber} - Techno World Books`);
      setEmailMessage(
`Dear ${customerName},

We are getting your order #${order.orderNumber} ready for dispatch via India Post Speed Post.

To ensure seamless delivery by the postal carrier, could you please confirm your complete street address, nearby landmark, and 6-digit postal PIN code?

Recipient Address on File:
${order.address?.line1 || ''}, ${order.address?.city || ''}, ${order.address?.state || ''} - ${order.address?.pincode || ''}

Thank you for your quick confirmation.

Warm regards,
Techno World Dispatch Team
admin@technoworld.com`
      );
    } else if (templateKey === 'ORDER_CONFIRMATION') {
      setEmailSubject(`Order Confirmed: #${order.orderNumber} is Being Prepared - Techno World Books`);
      setEmailMessage(
`Dear ${customerName},

Great news! Your order #${order.orderNumber} for "${firstBookTitle}" has been reviewed and accepted by our fulfillment team.

We are currently packing your books with protective bubble wrap. You will receive an India Post Speed Post tracking number once the consignment is dispatched.

Thank you for choosing Techno World Books!

Warm regards,
Techno World Books Team`
      );
    } else {
      setEmailSubject(`Update regarding your Order #${order.orderNumber} - Techno World Books`);
      setEmailMessage(
`Dear ${customerName},

We are writing to you regarding your order #${order.orderNumber}.



Warm regards,
Techno World Orders Team
admin@technoworld.com`
      );
    }
  };

  const openEmailModal = (order: any, initialTemplate = 'DELAY_NOTICE') => {
    setEmailModalOrder(order);
    setEmailRecipient(order.user?.email || 'customer@technoworld.com');
    applyEmailTemplate(initialTemplate, order);
  };

  const handleSendCustomEmail = async () => {
    if (!emailModalOrder || !emailSubject.trim() || !emailMessage.trim()) {
      return toast.error('Please enter a subject and message');
    }

    setEmailSending(true);
    try {
      const res = await orderService.sendCustomEmail(emailModalOrder.id, {
        subject: emailSubject,
        message: emailMessage,
        templateType: emailTemplate as any,
        recipientEmail: emailRecipient,
        recipientName: emailModalOrder.address?.name || emailModalOrder.user?.name,
      });

      if (res.success) {
        toast.success(`Email sent from admin@technoworld.com to ${emailRecipient}`);
        setEmailModalOrder(null);
        // Refresh orders to reflect updated communication notes
        orderService.getAllOrders().then(r => r.data && setOrders(r.data));
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to send email');
    } finally {
      setEmailSending(false);
    }
  };

  const handleAcceptOrder = async (order: any) => {
    try {
      await orderService.updateStatus(order.id, 'PROCESSING', 'Order accepted by Admin for fulfillment');
      toast.success(`Order #${order.orderNumber} accepted! Status changed to PROCESSING.`);
      setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: 'PROCESSING' } : o));
    } catch (err: any) {
      toast.error(err.message || 'Failed to accept order');
    }
  };

  const handleRejectOrderSubmit = async () => {
    if (!rejectModalOrder) return;
    const finalReason = rejectReason === 'Other' ? rejectCustomReason : rejectReason;
    if (!finalReason.trim()) {
      return toast.error('Please specify a rejection reason');
    }

    setRejecting(true);
    try {
      await orderService.updateStatus(rejectModalOrder.id, 'CANCELLED', undefined, finalReason);
      toast.success(`Order #${rejectModalOrder.orderNumber} cancelled. Notification email sent to customer.`);
      setOrders(prev => prev.map(o => o.id === rejectModalOrder.id ? { ...o, status: 'CANCELLED' } : o));
      setRejectModalOrder(null);
      setRejectCustomReason('');
    } catch (err: any) {
      toast.error(err.message || 'Failed to reject order');
    } finally {
      setRejecting(false);
    }
  };

  const updateOrderStatus = async (id: string, status: string) => {
    try {
      await orderService.updateStatus(id, status);
      toast.success(`Order ${id} updated to ${status}`);
      setOrders(orders.map(o => o.id === id ? { ...o, status } : o));
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const bookIndiaPostShipment = async (orderId: string) => {
    setShippingLoading(orderId);
    try {
      const res = await shippingService.bookShipment(orderId);
      if (res.success && res.data) {
        toast.success(`Consignment booked via India Post! Barcode: ${res.data.barcode}`);
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId || o.orderNumber === orderId
              ? {
                  ...o,
                  trackingNumber: res.data.barcode,
                  shippingCarrier: res.data.carrier,
                  status: o.status === 'PENDING' ? 'PROCESSING' : o.status,
                }
              : o
          )
        );
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to book consignment with India Post');
    } finally {
      setShippingLoading(null);
    }
  };

  const openShippingLabel = async (orderId: string) => {
    try {
      const res = await shippingService.getShippingLabel(orderId);
      if (res.success && res.data) {
        setShippingModalLabel(res.data.printableData);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to load shipping label');
    }
  };

  const openTrackingModal = async (identifier: string) => {
    try {
      const res = await shippingService.trackShipment(identifier);
      if (res.success && res.data) {
        setShippingTrackingModal(res.data);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to load live tracking data');
    }
  };



  // Settings & SMTP State
  const [adminProfile, setAdminProfile] = useState<any>({ name: '', email: '', phone: '' });
  const [adminPassword, setAdminPassword] = useState('');
  const [adminConfirmPassword, setAdminConfirmPassword] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const [smtpForm, setSmtpForm] = useState({
    senderEmail: 'admin@technoworld.com',
    senderName: 'Techno World Books',
    host: 'smtp.gmail.com',
    port: 587,
    user: '',
    pass: '',
    secure: false,
  });
  const [isSavingSmtp, setIsSavingSmtp] = useState(false);

  const [testEmailTo, setTestEmailTo] = useState('');
  const [isTestingSmtp, setIsTestingSmtp] = useState(false);
  const [isTestEmailModalOpen, setIsTestEmailModalOpen] = useState(false);

  const [pendingOrdersSummary, setPendingOrdersSummary] = useState<any[]>([]);

  const fetchAdminSettings = () => {
    adminService.getSettings()
      .then((res: any) => {
        if (res.success && res.data) {
          if (res.data.admin) {
            setAdminProfile({
              name: res.data.admin.name || '',
              email: res.data.admin.email || '',
              phone: res.data.admin.phone || '',
            });
          }
          if (res.data.smtp) {
            setSmtpForm((prev: any) => ({
              ...prev,
              ...res.data.smtp,
            }));
          }
        }
      })
      .catch(() => {});
  };

  const handleSaveAdminProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminProfile.name || !adminProfile.email) {
      return toast.error('Name and email are required');
    }
    if (adminPassword && adminPassword.length < 6) {
      return toast.error('Password must be at least 6 characters');
    }
    if (adminPassword && adminPassword !== adminConfirmPassword) {
      return toast.error('Passwords do not match');
    }

    setIsSavingProfile(true);
    try {
      const res = await adminService.updateProfile({
        name: adminProfile.name,
        email: adminProfile.email,
        phone: adminProfile.phone || null,
        password: adminPassword || undefined,
      });
      if (res.success) {
        toast.success('Admin profile credentials updated successfully!');
        setAdminPassword('');
        setAdminConfirmPassword('');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update admin profile');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSaveSmtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!smtpForm.senderEmail || !smtpForm.host || !smtpForm.port) {
      return toast.error('Sender email, SMTP Host, and Port are required');
    }

    setIsSavingSmtp(true);
    try {
      const res = await adminService.updateSmtp(smtpForm);
      if (res.success) {
        toast.success('Outbound email & SMTP settings saved successfully!');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to save SMTP settings');
    } finally {
      setIsSavingSmtp(false);
    }
  };

  const handleSendTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testEmailTo) return toast.error('Please enter a recipient email address');

    setIsTestingSmtp(true);
    try {
      const res = await adminService.testSmtp({
        toEmail: testEmailTo,
        host: smtpForm.host,
        port: Number(smtpForm.port),
        user: smtpForm.user,
        pass: smtpForm.pass,
        senderEmail: smtpForm.senderEmail,
        senderName: smtpForm.senderName,
      });
      if (res.success) {
        toast.success(res.message || 'Test email dispatched successfully!');
        setIsTestEmailModalOpen(false);
      }
    } catch (err: any) {
      toast.error(err.message || 'SMTP Test failed. Check credentials.');
    } finally {
      setIsTestingSmtp(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 capitalize">{tab.replace('-', ' ')}</h1>
        {['dashboard', 'products', 'inventory'].includes(tab) && (
          <>
            <input type="file" ref={fileInputRef} className="hidden" accept=".csv,.xlsx" onChange={handleFileUpload} />
            <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-1.5 rounded-lg bg-emerald-700 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-800 transition-colors">
              <Plus className="h-3.5 w-3.5" /> Bulk CSV Import
            </button>
          </>
        )}
      </div>

      <div className="min-w-0 flex-1">
        {tab === 'dashboard' && (
          <div className="space-y-6">
            {/* Urgent Pending Orders Approval Banner */}
            {pendingOrdersSummary.length > 0 && (
              <div className="rounded-2xl border-2 border-amber-400 bg-gradient-to-r from-amber-50 via-amber-100/60 to-amber-50 p-6 shadow-md animate-in fade-in">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500 text-white shadow-md animate-bounce">
                      <Bell className="h-6 w-6" />
                    </div>
                    <div>
                      <h2 className="text-base font-extrabold text-amber-950 flex items-center gap-2">
                        <span>Action Required: {pendingOrdersSummary.length} New Order(s) Awaiting Decision</span>
                        <span className="rounded-full bg-rose-600 text-white text-[10px] font-black px-2 py-0.5">Urgent</span>
                      </h2>
                      <p className="text-xs text-amber-900/80 mt-0.5">
                        Customer orders placed on the bookstore require your review to accept, cancel, or notify regarding publisher stock delay.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate('/admin/dashboard?tab=orders')}
                    className="flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-slate-800 transition-all"
                  >
                    Review Pending Orders <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {[
                { icon: IndianRupee, t: 'Revenue (30d)', v: formatINR(stats.revenue), s: '+18.2% vs last month', c: 'emerald' },
                { icon: ShoppingCart, t: 'Orders (30d)', v: (stats.totalOrders || 0).toLocaleString('en-IN'), s: '+12.4% vs last month', c: 'blue' },
                { icon: BookOpen, t: 'Total Books', v: stats.totalBooks || 0, s: `${stats.outOfStock} out of stock`, c: 'amber' },
                { icon: Users, t: 'Total Users', v: stats.totalUsers || 0, s: 'Active base', c: 'violet' },
              ].map((k) => (
                <div key={k.t} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <k.icon className="h-5 w-5 text-emerald-700" />
                  <p className="mt-3 text-2xl font-extrabold text-slate-900">{k.v}</p>
                  <p className="mt-1 text-sm font-semibold text-slate-500">{k.t}</p>
                  <p className="mt-1 text-xs font-medium text-emerald-600">{k.s}</p>
                </div>
              ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              {/* Main Column */}
              <div className="lg:col-span-2 space-y-6">
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <p className="text-sm font-bold text-slate-800">Recent Orders</p>
                    <button className="text-xs font-bold text-emerald-600 hover:text-emerald-700">View All</button>
                  </div>
                  <div className="space-y-4">
                    {((stats as any).recentOrders || []).map((o: any) => (
                      <div key={o.id} className="flex items-center justify-between border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{o.orderNumber}</p>
                          <p className="text-xs text-slate-500 mt-1">{o.user?.name || 'Guest'} · {o.items?.length || 0} items</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-slate-900 text-sm">{formatINR(o.totalAmount)}</p>
                          <span className={`inline-block mt-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${o.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                            {o.status}
                          </span>
                        </div>
                      </div>
                    ))}
                    {!(stats as any).recentOrders?.length && <p className="text-sm text-slate-500">No recent orders found.</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <p className="mb-4 text-sm font-bold text-slate-800">Top Categories</p>
                    {categories.slice(0, 5).map((c, i) => {
                      const pct = [92, 78, 64, 55, 41][i] || Math.floor(Math.random() * 50) + 10;
                      return (
                        <div key={c.slug} className="mb-3.5 last:mb-0">
                          <div className="flex justify-between text-xs mb-1.5"><span className="font-semibold text-slate-700">{c.name}</span><span className="text-slate-500 font-medium">{pct}%</span></div>
                          <div className="h-2 rounded-full bg-slate-100"><div className="h-full rounded-full bg-emerald-500" style={{ width: `${pct}%` }} /></div>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <p className="mb-4 text-sm font-bold text-slate-800">Coupon Usage & Marketing</p>
                    <div className="flex flex-col h-full justify-center text-center text-sm text-slate-500 p-4 border-2 border-dashed border-slate-100 rounded-lg">
                      <p className="font-medium text-slate-600 mb-1">Coupon System Pending</p>
                      <p className="text-xs">Analytics will appear here once the coupon module is fully implemented.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar Column */}
              <div className="space-y-6">
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-bold text-rose-800 flex items-center gap-2"><AlertCircle className="h-4 w-4" /> Low Stock Alerts</p>
                    <span className="bg-rose-200 text-rose-800 text-xs font-bold px-2 py-0.5 rounded-full">{stats.lowStock || 0}</span>
                  </div>
                  <div className="space-y-3">
                    {lowStockBooks.map((b) => (
                      <div key={b.id} className="flex flex-col border-b border-rose-200/50 pb-3 text-sm last:border-0 last:pb-0">
                        <span className="line-clamp-2 font-medium text-rose-900 leading-tight">{b.title}</span>
                        <div className="mt-2 flex justify-between items-center">
                          <span className="font-mono text-xs text-rose-700">{b.isbn || 'No ISBN'}</span>
                          <span className="shrink-0 rounded bg-white px-2 py-0.5 text-xs font-bold text-rose-700 shadow-sm">
                            {getStock(b.id, b.stock)} left
                          </span>
                        </div>
                      </div>
                    ))}
                    {lowStockBooks.length === 0 && <p className="text-xs text-rose-600">All stock levels are healthy.</p>}
                  </div>
                  <button className="w-full mt-4 bg-white border border-rose-200 text-rose-700 text-xs font-bold py-2 rounded-lg hover:bg-rose-100 transition-colors">
                    Manage Inventory
                  </button>
                </div>
                
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                  <p className="mb-4 text-sm font-bold text-slate-800">Latest Reviews</p>
                  <div className="space-y-4">
                    <div className="border-b border-slate-100 pb-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-sm text-slate-800">Great Quality</span>
                        <span className="text-amber-500 text-xs tracking-wider">★★★★★</span>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-2">"The book arrived in perfect condition and the content is exactly what I needed for my exams."</p>
                    </div>
                    <div className="border-b border-slate-100 pb-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-sm text-slate-800">Fast Delivery</span>
                        <span className="text-amber-500 text-xs tracking-wider">★★★★☆</span>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-2">"Delivered within 2 days. The packaging could be slightly better but overall good."</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === 'products' && <ProductsWorkspace />}
        {tab === 'orders' && (
          <div className="space-y-6">
            {/* Header & Status Filter Pills */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2.5">
                    <h2 className="text-lg font-extrabold text-slate-900">Order Management & Logistics Hub</h2>
                    {orders.filter(o => o.status === 'PENDING').length > 0 && (
                      <span className="flex items-center gap-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-0.5 text-xs font-bold animate-pulse">
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-700" />
                        {orders.filter(o => o.status === 'PENDING').length} Pending Decision
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Accept or reject customer orders, dispatch India Post Speed Post consignments, or notify customers of stock procurement delays directly from admin email.
                  </p>
                </div>
                <span className="rounded-full bg-red-50 border border-red-200 px-3.5 py-1.5 text-xs font-bold text-red-700 flex items-center gap-1.5 shadow-sm">
                  <ShieldCheck className="h-4 w-4 text-red-600" /> India Post CEPT Integrated
                </span>
              </div>

              {/* Status Filter Tabs */}
              <div className="mt-4 flex flex-wrap gap-2">
                {[
                  { id: 'ALL', label: `All (${orders.length})` },
                  { id: 'PENDING', label: `Pending Review (${orders.filter(o => o.status === 'PENDING').length})`, alert: orders.filter(o => o.status === 'PENDING').length > 0 },
                  { id: 'CONFIRMED', label: `Confirmed (${orders.filter(o => o.status === 'CONFIRMED').length})` },
                  { id: 'PROCESSING', label: `Processing (${orders.filter(o => o.status === 'PROCESSING').length})` },
                  { id: 'SHIPPED', label: `Shipped (${orders.filter(o => o.status === 'SHIPPED').length})` },
                  { id: 'DELIVERED', label: `Delivered (${orders.filter(o => o.status === 'DELIVERED').length})` },
                  { id: 'CANCELLED', label: `Cancelled (${orders.filter(o => o.status === 'CANCELLED').length})` },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setOrderStatusFilter(f.id)}
                    className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all flex items-center gap-1.5 ${
                      orderStatusFilter === f.id
                        ? 'bg-slate-900 text-white shadow'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    } ${f.alert && orderStatusFilter !== f.id ? 'border border-amber-300 bg-amber-50 text-amber-800' : ''}`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Orders List */}
            {orders.filter(o => orderStatusFilter === 'ALL' || o.status === orderStatusFilter).length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-slate-500 shadow-sm">
                <ShoppingCart className="mx-auto h-10 w-10 text-slate-300 mb-2" />
                <p className="text-sm font-semibold">No orders found in "{orderStatusFilter}" status.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders
                  .filter(o => orderStatusFilter === 'ALL' || o.status === orderStatusFilter)
                  .map((o) => {
                    const isPending = o.status === 'PENDING';
                    const hasNotes = Boolean(o.notes);

                    return (
                      <div
                        key={o.id}
                        className={`rounded-xl border p-5 text-sm transition-all bg-white shadow-sm ${
                          isPending ? 'border-amber-300 ring-2 ring-amber-400/20' : 'border-slate-200'
                        }`}
                      >
                        {/* Pending Decision Banner */}
                        {isPending && (
                          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-amber-50 border border-amber-200 px-3.5 py-2.5 text-xs text-amber-900">
                            <div className="flex items-center gap-2 font-bold">
                              <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                              <span>Requires Decision: Verify stock availability or send procurement delay notice to customer.</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleAcceptOrder(o)}
                                className="flex items-center gap-1 rounded bg-emerald-700 px-2.5 py-1 text-xs font-bold text-white hover:bg-emerald-800 transition-colors shadow-sm"
                              >
                                <CheckCircle2 className="h-3.5 w-3.5" /> Accept Order
                              </button>
                              <button
                                onClick={() => openEmailModal(o, 'DELAY_NOTICE')}
                                className="flex items-center gap-1 rounded bg-blue-700 px-2.5 py-1 text-xs font-bold text-white hover:bg-blue-800 transition-colors shadow-sm"
                              >
                                <Mail className="h-3.5 w-3.5" /> Slight Delay Notice
                              </button>
                              <button
                                onClick={() => setRejectModalOrder(o)}
                                className="flex items-center gap-1 rounded bg-rose-700 px-2.5 py-1 text-xs font-bold text-white hover:bg-rose-800 transition-colors shadow-sm"
                              >
                                <XCircle className="h-3.5 w-3.5" /> Reject
                              </button>
                            </div>
                          </div>
                        )}

                        <div className="flex flex-wrap items-start justify-between gap-4">
                          {/* Order Summary & Customer Info */}
                          <div className="min-w-0 flex-1 space-y-1.5">
                            <div className="flex flex-wrap items-center gap-2.5">
                              <span className="font-extrabold text-slate-900 text-base">{o.orderNumber}</span>
                              <span className="text-slate-300">|</span>
                              <span className="font-black text-emerald-700 text-base">{formatINR(o.totalAmount)}</span>
                              <span className={`rounded-full px-2.5 py-0.5 text-xs font-extrabold ${
                                o.status === 'PENDING' ? 'bg-amber-100 text-amber-800' :
                                o.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-800' :
                                o.status === 'PROCESSING' ? 'bg-indigo-100 text-indigo-800' :
                                o.status === 'SHIPPED' ? 'bg-purple-100 text-purple-800' :
                                o.status === 'DELIVERED' ? 'bg-emerald-100 text-emerald-800' :
                                'bg-rose-100 text-rose-800'
                              }`}>
                                {o.status}
                              </span>
                              {o.trackingNumber && (
                                <span className="rounded bg-red-100 text-red-800 text-xs px-2.5 py-0.5 font-bold flex items-center gap-1">
                                  <Truck className="h-3.5 w-3.5" /> {o.trackingNumber}
                                </span>
                              )}
                            </div>

                            <p className="text-xs text-slate-600">
                              <b>Customer:</b> <span className="font-semibold text-slate-800">{o.address?.name || o.user?.name || 'Guest'}</span> ({o.user?.email || 'N/A'}) · <b>Phone:</b> {o.address?.phone || 'N/A'} · <b>Payment:</b> {o.paymentMethod}
                            </p>

                            {o.address && (
                              <p className="text-xs text-slate-500">
                                📍 <b>Delivery Address:</b> {o.address.line1}, {o.address.city}, {o.address.state} — <b>{o.address.pincode}</b>
                              </p>
                            )}

                            {/* Book items list */}
                            {Array.isArray(o.items) && o.items.length > 0 && (
                              <div className="mt-2 pt-2 border-t border-slate-100 flex flex-wrap gap-2 text-xs text-slate-700">
                                {o.items.map((item: any, idx: number) => (
                                  <span key={idx} className="bg-slate-100 px-2 py-1 rounded font-medium border border-slate-200">
                                    📖 {item.book?.title || 'Book'} <span className="text-slate-500 font-bold">×{item.quantity}</span>
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Action Buttons Toolbar */}
                          <div className="flex items-center gap-2 flex-wrap self-center">
                            {/* Send Custom Email / Delay Modal Button */}
                            <button
                              onClick={() => openEmailModal(o)}
                              className="flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50/80 px-3 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100 transition-colors shadow-sm"
                              title="Send custom communication from admin@technoworld.com"
                            >
                              <Mail className="h-3.5 w-3.5" /> Email Customer
                            </button>

                            {/* India Post Speed Post Booking & Label */}
                            {!o.trackingNumber && o.status !== 'CANCELLED' ? (
                              <button
                                disabled={shippingLoading === o.id}
                                onClick={() => bookIndiaPostShipment(o.id)}
                                className="flex items-center gap-1.5 rounded-lg bg-red-700 px-3.5 py-2 text-xs font-bold text-white hover:bg-red-800 disabled:opacity-50 transition-colors shadow-sm"
                              >
                                {shippingLoading === o.id ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <Truck className="h-3.5 w-3.5" />
                                )}
                                Ship with India Post
                              </button>
                            ) : o.trackingNumber ? (
                              <>
                                <button
                                  onClick={() => openShippingLabel(o.id)}
                                  className="flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm"
                                >
                                  <Printer className="h-3.5 w-3.5 text-slate-600" /> Print Label
                                </button>
                                <button
                                  onClick={() => openTrackingModal(o.trackingNumber || o.orderNumber)}
                                  className="flex items-center gap-1 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-100 shadow-sm"
                                >
                                  <Truck className="h-3.5 w-3.5 text-emerald-700" /> Live Track
                                </button>
                              </>
                            ) : null}

                            {/* Status Quick Select */}
                            <select
                              value={o.status}
                              onChange={(e) => updateOrderStatus(o.id, e.target.value)}
                              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm"
                            >
                              {['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((s) => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Communication / Notes Timeline Expander */}
                        {hasNotes && (
                          <div className="mt-3 pt-3 border-t border-slate-100">
                            <button
                              onClick={() => setExpandedNotesOrderId(expandedNotesOrderId === o.id ? null : o.id)}
                              className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800"
                            >
                              <MessageSquare className="h-3.5 w-3.5 text-slate-400" />
                              Communication & Activity Log ({o.notes.split('\n').length})
                              {expandedNotesOrderId === o.id ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                            </button>

                            {expandedNotesOrderId === o.id && (
                              <div className="mt-2 rounded-lg bg-slate-50 border border-slate-200 p-3 text-xs text-slate-700 font-mono whitespace-pre-line space-y-1">
                                {o.notes}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}

        {tab === 'reviews' && (
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="mb-6 text-sm font-bold text-slate-800">Review Moderation</p>
            <div className="space-y-4">
              {[{ id: 1, title: 'Great read', book: 'Atomic Habits', rating: 5, body: 'Very helpful.' }, { id: 2, title: 'Too lengthy', book: 'UPSC Polity', rating: 3, body: 'Very informative but too long.' }].map((r) => (
                <div key={r.id} className="rounded-xl border border-slate-200 p-5 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-base font-bold text-slate-900">{r.title}</p>
                      <p className="text-sm text-slate-500 mt-0.5">on <span className="font-medium text-slate-700">{r.book}</span></p>
                    </div>
                    <span className="text-sm font-bold text-amber-500 tracking-widest">{'★'.repeat(r.rating)}</span>
                  </div>
                  <p className="mt-3 text-sm text-slate-600 leading-relaxed">{r.body}</p>
                  <div className="mt-4 flex gap-3">
                    <button className="rounded-lg bg-emerald-50 px-4 py-1.5 text-sm font-bold text-emerald-700">Approve</button>
                    <button className="rounded-lg bg-rose-50 px-4 py-1.5 text-sm font-bold text-rose-700">Flag</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {tab === 'media' && (
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <p className="text-sm font-bold text-slate-800">Media Library</p>
              <label className={`flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-bold text-white cursor-pointer hover:bg-emerald-800 transition-colors ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                <Plus className="h-4 w-4" />
                <input type="file" multiple className="hidden" onChange={async (e) => {
                  const files = Array.from(e.target.files || []);
                  if (!files.length) return;
                  setIsUploading(true);
                  try {
                    for (const file of files) {
                      await mediaService.upload(file, 'general');
                    }
                    toast.success(`${files.length} files uploaded`);
                    const res = await mediaService.list();
                    setMediaItems(res.data);
                  } catch(err) {
                    toast.error('Upload failed');
                  } finally {
                    setIsUploading(false);
                  }
                }} />
                {isUploading ? 'Uploading...' : 'Upload Files'}
              </label>
            </div>
            {mediaItems.length === 0 ? (
              <div className="py-12 text-center text-sm text-slate-500 border-2 border-dashed border-slate-200 rounded-xl">No media files found. Upload some!</div>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {mediaItems.map(m => (
                  <div key={m.id} className="group relative aspect-square overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                    {m.type === 'image' ? (
                      <img src={m.url} alt={m.altText || m.filename} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center text-slate-400 p-2 text-center">
                        <BookOpen className="h-8 w-8 mb-2" />
                        <span className="text-xs font-medium break-all line-clamp-2">{m.filename}</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-slate-900/60 opacity-0 transition-opacity group-hover:opacity-100 flex items-center justify-center gap-2">
                      <button onClick={() => window.open(m.url, '_blank')} className="rounded bg-white/20 p-2 text-white hover:bg-white/40"><Search className="h-4 w-4" /></button>
                      <button onClick={async () => {
                        if(confirm('Delete this file?')) {
                          try {
                            await mediaService.delete(m.id);
                            setMediaItems(items => items.filter(i => i.id !== m.id));
                            toast.success('Deleted');
                          } catch(err) { toast.error('Failed to delete'); }
                        }
                      }} className="rounded bg-rose-500/80 p-2 text-white hover:bg-rose-500"><AlertCircle className="h-4 w-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'cms' && (
          <div className="space-y-5">
            <p className="text-sm text-slate-500">Edit homepage sections without touching code. Toggle sections on/off, update text, and save.</p>
            {cmsSections.length === 0 ? (
              <div className="py-12 text-center text-sm text-slate-500 border-2 border-dashed border-slate-200 rounded-xl">No CMS sections found. Run the seed script first.</div>
            ) : (
              cmsSections.map(section => {
                const cfg = cmsEditing[section.sectionKey] || {};
                const updateField = (field: string, value: any) => {
                  setCmsEditing(prev => ({
                    ...prev,
                    [section.sectionKey]: { ...prev[section.sectionKey], [field]: value },
                  }));
                };
                return (
                  <div key={section.id} className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-5 py-3">
                      <div className="flex items-center gap-3">
                        <span className={`h-2.5 w-2.5 rounded-full ${section.isEnabled ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                        <h3 className="text-sm font-bold text-slate-800">{section.title || section.sectionKey}</h3>
                        <span className="rounded bg-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">{section.sectionKey}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => toggleCmsSection(section.sectionKey)} className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${section.isEnabled ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                          {section.isEnabled ? 'Enabled' : 'Disabled'}
                        </button>
                        <button onClick={() => saveCmsSection(section.sectionKey)} className="rounded-lg bg-emerald-700 px-4 py-1.5 text-xs font-bold text-white hover:bg-emerald-800 transition-colors">
                          Save
                        </button>
                      </div>
                    </div>
                    <div className="p-5 space-y-4">
                      {section.sectionKey === 'hero_banner' && (
                        <>
                          <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">Headline</label>
                            <input value={cfg.headline || ''} onChange={e => updateField('headline', e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20" />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">Subtext</label>
                            <textarea value={cfg.subtext || ''} onChange={e => updateField('subtext', e.target.value)} rows={2} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none" />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-bold text-slate-600 mb-1">CTA Text</label>
                              <input value={cfg.ctaText || ''} onChange={e => updateField('ctaText', e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20" />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-600 mb-1">CTA Link</label>
                              <input value={cfg.ctaLink || ''} onChange={e => updateField('ctaLink', e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20" />
                            </div>
                          </div>
                        </>
                      )}
                      {section.sectionKey === 'flash_sale' && (
                        <>
                          <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">Headline</label>
                            <input value={cfg.headline || ''} onChange={e => updateField('headline', e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20" />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">Subtext</label>
                            <input value={cfg.subtext || ''} onChange={e => updateField('subtext', e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20" />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-bold text-slate-600 mb-1">End Date</label>
                              <input type="datetime-local" value={cfg.endDate ? new Date(cfg.endDate).toISOString().slice(0, 16) : ''} onChange={e => updateField('endDate', new Date(e.target.value).toISOString())} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20" />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-600 mb-1">Badge Text</label>
                              <input value={cfg.badgeText || ''} onChange={e => updateField('badgeText', e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20" />
                            </div>
                          </div>
                        </>
                      )}
                      {section.sectionKey === 'featured_books' && (
                        <>
                          <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">Section Title</label>
                            <input value={cfg.sectionTitle || ''} onChange={e => updateField('sectionTitle', e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20" />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">Max Books to Display</label>
                            <input type="number" value={cfg.maxDisplay || 10} onChange={e => updateField('maxDisplay', parseInt(e.target.value) || 10)} className="w-32 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20" />
                          </div>
                          <p className="text-xs text-slate-400">Featured books are auto-selected from the catalog based on bestseller and trending flags.</p>
                        </>
                      )}
                      {section.sectionKey === 'testimonials' && (
                        <>
                          <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">Section Title</label>
                            <input value={cfg.sectionTitle || ''} onChange={e => updateField('sectionTitle', e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20" />
                          </div>
                          <div className="space-y-3">
                            {(cfg.items || []).map((item: any, idx: number) => (
                              <div key={idx} className="rounded-lg border border-slate-200 p-3 space-y-2">
                                <div className="grid grid-cols-2 gap-3">
                                  <input value={item.name} onChange={e => {
                                    const items = [...(cfg.items || [])];
                                    items[idx] = { ...items[idx], name: e.target.value };
                                    updateField('items', items);
                                  }} placeholder="Name" className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none" />
                                  <input type="number" min={1} max={5} value={item.rating} onChange={e => {
                                    const items = [...(cfg.items || [])];
                                    items[idx] = { ...items[idx], rating: parseInt(e.target.value) || 5 };
                                    updateField('items', items);
                                  }} placeholder="Rating" className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none w-20" />
                                </div>
                                <textarea value={item.text} onChange={e => {
                                  const items = [...(cfg.items || [])];
                                  items[idx] = { ...items[idx], text: e.target.value };
                                  updateField('items', items);
                                }} rows={2} className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none resize-none" />
                                <button onClick={() => {
                                  const items = (cfg.items || []).filter((_: any, i: number) => i !== idx);
                                  updateField('items', items);
                                }} className="text-xs font-bold text-rose-600 hover:text-rose-700">Remove</button>
                              </div>
                            ))}
                            <button onClick={() => {
                              const items = [...(cfg.items || []), { name: '', text: '', rating: 5 }];
                              updateField('items', items);
                            }} className="rounded-lg border-2 border-dashed border-slate-200 px-4 py-2 text-xs font-bold text-slate-500 hover:border-emerald-300 hover:text-emerald-700 transition-colors w-full">
                              + Add Testimonial
                            </button>
                          </div>
                        </>
                      )}
                      {section.sectionKey === 'sale_banner' && (
                        <>
                          <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">Headline</label>
                            <input value={cfg.headline || ''} onChange={e => updateField('headline', e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20" />
                          </div>
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <label className="block text-xs font-bold text-slate-600 mb-1">CTA Text</label>
                              <input value={cfg.ctaText || ''} onChange={e => updateField('ctaText', e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20" />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-600 mb-1">CTA Link</label>
                              <input value={cfg.ctaLink || ''} onChange={e => updateField('ctaLink', e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20" />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-600 mb-1">Background Color</label>
                              <div className="flex items-center gap-2">
                                <input type="color" value={cfg.bgColor || '#065f46'} onChange={e => updateField('bgColor', e.target.value)} className="h-9 w-9 rounded cursor-pointer" />
                                <input value={cfg.bgColor || '#065f46'} onChange={e => updateField('bgColor', e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-mono outline-none focus:ring-2 focus:ring-emerald-500/20" />
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                      {section.sectionKey === 'promo-banners' && (
                        <>
                          <div className="space-y-4">
                            <p className="text-xs text-slate-500 mb-2">Manage your promotional banners here. They will appear on the homepage below the hero section.</p>
                            {(cfg.banners || []).map((banner: any, idx: number) => (
                              <div key={idx} className="rounded-lg border border-slate-200 p-4 space-y-3 bg-slate-50 relative">
                                <div className="absolute top-3 right-3 flex gap-2">
                                  <button onClick={() => {
                                    const banners = [...(cfg.banners || [])];
                                    banners[idx] = { ...banners[idx], isActive: !banners[idx].isActive };
                                    updateField('banners', banners);
                                  }} className={`text-xs font-bold px-2 py-1 rounded ${banner.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                                    {banner.isActive ? 'Active' : 'Inactive'}
                                  </button>
                                  <button onClick={() => {
                                    const banners = (cfg.banners || []).filter((_: any, i: number) => i !== idx);
                                    updateField('banners', banners);
                                  }} className="text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-100 px-2 py-1 rounded">Remove</button>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4 pt-6">
                                  <div>
                                    <label className="block text-xs font-bold text-slate-600 mb-1">Image URL</label>
                                    <input value={banner.imageUrl || ''} onChange={e => {
                                      const banners = [...(cfg.banners || [])];
                                      banners[idx] = { ...banners[idx], imageUrl: e.target.value };
                                      updateField('banners', banners);
                                    }} placeholder="/banners/example.jpg" className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none" />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-bold text-slate-600 mb-1">Link URL</label>
                                    <input value={banner.linkUrl || ''} onChange={e => {
                                      const banners = [...(cfg.banners || [])];
                                      banners[idx] = { ...banners[idx], linkUrl: e.target.value };
                                      updateField('banners', banners);
                                    }} placeholder="/category/engineering" className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none" />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-bold text-slate-600 mb-1">Alt Text</label>
                                    <input value={banner.altText || ''} onChange={e => {
                                      const banners = [...(cfg.banners || [])];
                                      banners[idx] = { ...banners[idx], altText: e.target.value };
                                      updateField('banners', banners);
                                    }} placeholder="Engineering Books Offer" className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none" />
                                  </div>
                                  <div className="grid grid-cols-2 gap-2">
                                    <div>
                                      <label className="block text-xs font-bold text-slate-600 mb-1">Start Date (Optional)</label>
                                      <input type="datetime-local" value={banner.startDate ? new Date(banner.startDate).toISOString().slice(0, 16) : ''} onChange={e => {
                                        const banners = [...(cfg.banners || [])];
                                        banners[idx] = { ...banners[idx], startDate: e.target.value ? new Date(e.target.value).toISOString() : undefined };
                                        updateField('banners', banners);
                                      }} className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs outline-none" />
                                    </div>
                                    <div>
                                      <label className="block text-xs font-bold text-slate-600 mb-1">End Date (Optional)</label>
                                      <input type="datetime-local" value={banner.endDate ? new Date(banner.endDate).toISOString().slice(0, 16) : ''} onChange={e => {
                                        const banners = [...(cfg.banners || [])];
                                        banners[idx] = { ...banners[idx], endDate: e.target.value ? new Date(e.target.value).toISOString() : undefined };
                                        updateField('banners', banners);
                                      }} className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs outline-none" />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                            <button onClick={() => {
                              const banners = [...(cfg.banners || []), { id: Date.now().toString(), imageUrl: '', linkUrl: '', altText: '', isActive: true }];
                              updateField('banners', banners);
                            }} className="rounded-lg border-2 border-dashed border-slate-200 px-4 py-3 text-xs font-bold text-slate-500 hover:border-emerald-300 hover:text-emerald-700 transition-colors w-full">
                              + Add Banner
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {tab === 'coupons' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Promotions & Campaigns</h2>
                <p className="text-sm text-slate-500">Create and manage your promotional rules and discount codes</p>
              </div>
              <button onClick={() => setEditingPromotion({})} className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition-colors">
                <Plus className="h-3.5 w-3.5" /> New Promotion
              </button>
            </div>
            
            <div className="rounded-2xl border border-slate-100 bg-white p-1">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 text-xs font-bold uppercase text-slate-400">
                    <tr>
                      <th className="px-6 py-4">Name / Code</th>
                      <th className="px-6 py-4">Type</th>
                      <th className="px-6 py-4">Value</th>
                      <th className="px-6 py-4">Limit</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {promotions.map((promo) => {
                      const isActive = promo.status === 'ACTIVE';
                      const isPaused = promo.status === 'PAUSED';
                      return (
                        <tr key={promo.id} className="hover:bg-slate-50/50">
                          <td className="px-6 py-4">
                            <div className="font-bold text-slate-900">{promo.name}</div>
                            {promo.code && <div className="font-mono text-xs text-slate-500 mt-1 font-semibold">{promo.code}</div>}
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                              {promo.promotionType || 'UNIVERSAL'}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-bold text-slate-900">
                            {promo.discountType === 'FIXED' ? formatINR(promo.discountValue) : promo.discountType === 'PERCENTAGE' ? `${promo.discountValue}%` : 'Free Shipping'}
                          </td>
                          <td className="px-6 py-4 text-xs text-slate-600 font-medium">
                            {promo.usageLimit ? `${promo.usedCount || 0} / ${promo.usageLimit}` : 'Unlimited'}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${
                                isActive 
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                                  : isPaused 
                                  ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                                  : 'bg-slate-100 text-slate-700 border border-slate-200'
                              }`}
                            >
                              <span className={`h-1.5 w-1.5 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : isPaused ? 'bg-amber-500' : 'bg-slate-400'}`} />
                              {isActive ? 'Live' : isPaused ? 'Paused' : 'Draft'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {isActive ? (
                                <button
                                  type="button"
                                  onClick={async () => {
                                    try {
                                      await promotionService.toggleActive(promo.id, 'PAUSED');
                                      const res = await promotionService.getAll();
                                      setPromotions(res.data);
                                      toast.success(`Coupon "${promo.name}" paused / snoozed`);
                                    } catch (e) {
                                      toast.error('Failed to pause promotion');
                                    }
                                  }}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors"
                                  title="Pause / Snooze this code"
                                >
                                  <Pause className="h-3 w-3" /> Snooze
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={async () => {
                                    try {
                                      await promotionService.toggleActive(promo.id, 'ACTIVE');
                                      const res = await promotionService.getAll();
                                      setPromotions(res.data);
                                      toast.success(`Coupon "${promo.name}" is now live!`);
                                    } catch (e) {
                                      toast.error('Failed to activate promotion');
                                    }
                                  }}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
                                  title="Activate and make code live"
                                >
                                  <Play className="h-3 w-3" /> Go Live
                                </button>
                              )}
                              
                              <button 
                                onClick={() => setEditingPromotion(promo)} 
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                                title="Edit promotion details"
                              >
                                <Edit3 className="h-3 w-3" /> Edit
                              </button>

                              <button 
                                onClick={async () => {
                                  if (confirm(`Are you sure you want to delete "${promo.name}"?`)) {
                                    try {
                                      await promotionService.remove(promo.id);
                                      const res = await promotionService.getAll();
                                      setPromotions(res.data);
                                      toast.success('Promotion deleted successfully');
                                    } catch (e) {
                                      toast.error('Failed to delete promotion');
                                    }
                                  }
                                }} 
                                className="inline-flex items-center gap-1 px-2 py-1 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                title="Delete coupon"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {promotions.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                          No promotions found. Create one to get started.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

{/* Settings & Outbound Email Workspace */}
        {tab === 'settings' && (
          <div className="space-y-6">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                    <Settings className="h-5 w-5 text-emerald-700" /> Admin Details & Outbound Email System
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Change your admin login credentials and configure the sender email ID (Gmail SMTP / Custom SMTP) for customer delay notices and order updates.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Card 1: Admin Account Credentials */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-base font-extrabold text-slate-900 mb-1 flex items-center gap-2">
                  <Users className="h-4 w-4 text-emerald-700" /> Admin Account Credentials
                </h3>
                <p className="text-xs text-slate-500 mb-5">Manage your display name, login email, and login password.</p>

                <form onSubmit={handleSaveAdminProfile} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Admin Display Name</label>
                    <input
                      type="text"
                      value={adminProfile.name}
                      onChange={(e) => setAdminProfile({ ...adminProfile, name: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-emerald-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Admin Login Email</label>
                    <input
                      type="email"
                      value={adminProfile.email}
                      onChange={(e) => setAdminProfile({ ...adminProfile, email: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-emerald-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Phone Number (Optional)</label>
                    <input
                      type="text"
                      value={adminProfile.phone}
                      onChange={(e) => setAdminProfile({ ...adminProfile, phone: e.target.value })}
                      placeholder="9876543210"
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="border-t border-slate-100 pt-3 space-y-3">
                    <p className="text-xs font-bold text-slate-700">Change Admin Password (leave blank to keep current)</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-500 mb-1">New Password</label>
                        <input
                          type="password"
                          value={adminPassword}
                          onChange={(e) => setAdminPassword(e.target.value)}
                          placeholder="Min 6 characters"
                          className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs font-semibold outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-500 mb-1">Confirm Password</label>
                        <input
                          type="password"
                          value={adminConfirmPassword}
                          onChange={(e) => setAdminConfirmPassword(e.target.value)}
                          placeholder="Repeat password"
                          className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs font-semibold outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSavingProfile}
                    className="flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-800 shadow transition-all disabled:opacity-50 mt-2"
                  >
                    {isSavingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                    Update Admin Profile
                  </button>
                </form>
              </div>

              {/* Card 2: Outbound Email & Gmail SMTP Configuration */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <Mail className="h-4 w-4 text-emerald-700" /> Outbound Sender Email & SMTP
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setTestEmailTo(adminProfile.email || 'customer@example.com');
                      setIsTestEmailModalOpen(true);
                    }}
                    className="rounded-lg border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 shadow-sm"
                  >
                    🚀 Test SMTP
                  </button>
                </div>
                <p className="text-xs text-slate-500 mb-5">
                  Configure your email address so delay notifications and cancellation updates send from your real address.
                </p>

                <form onSubmit={handleSaveSmtp} className="space-y-3.5">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Sender Display Name</label>
                      <input
                        type="text"
                        value={smtpForm.senderName}
                        onChange={(e) => setSmtpForm({ ...smtpForm, senderName: e.target.value })}
                        placeholder="Techno World Books"
                        className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-emerald-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Sender From Email</label>
                      <input
                        type="email"
                        value={smtpForm.senderEmail}
                        onChange={(e) => setSmtpForm({ ...smtpForm, senderEmail: e.target.value })}
                        placeholder="admin@technoworld.com"
                        className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-emerald-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">SMTP Host (e.g. Gmail)</label>
                      <input
                        type="text"
                        value={smtpForm.host}
                        onChange={(e) => setSmtpForm({ ...smtpForm, host: e.target.value })}
                        placeholder="smtp.gmail.com"
                        className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-emerald-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Port</label>
                      <input
                        type="number"
                        value={smtpForm.port}
                        onChange={(e) => setSmtpForm({ ...smtpForm, port: Number(e.target.value) })}
                        placeholder="587"
                        className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-emerald-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">SMTP Username / Email</label>
                      <input
                        type="text"
                        value={smtpForm.user}
                        onChange={(e) => setSmtpForm({ ...smtpForm, user: e.target.value })}
                        placeholder="yourname@gmail.com"
                        className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">SMTP App Password</label>
                      <input
                        type="password"
                        value={smtpForm.pass}
                        onChange={(e) => setSmtpForm({ ...smtpForm, pass: e.target.value })}
                        placeholder="16-character App Password"
                        className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-emerald-500 font-mono"
                      />
                    </div>
                  </div>

                  {/* Gmail Help Accordion / Box */}
                  <div className="rounded-xl bg-slate-50 border border-slate-200 p-3.5 text-xs text-slate-600 space-y-1.5">
                    <p className="font-bold text-slate-800 flex items-center gap-1.5">
                      <span>💡 How to connect Gmail to send official emails:</span>
                    </p>
                    <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-600">
                      <li>Open your <b>Google Account</b> &rarr; <b>Security</b> &rarr; enable <b>2-Step Verification</b>.</li>
                      <li>Search for <b>&quot;App Passwords&quot;</b> in Google Account settings.</li>
                      <li>Create an app password named <i>&quot;Techno World Bookstore&quot;</i> and copy the 16-character code.</li>
                      <li>Paste it into the <b>SMTP App Password</b> field above and click <b>Save SMTP Settings</b>!</li>
                    </ol>
                  </div>

                  <button
                    type="submit"
                    disabled={isSavingSmtp}
                    className="flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-800 shadow transition-all disabled:opacity-50"
                  >
                    {isSavingSmtp ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                    Save Outbound SMTP Settings
                  </button>
                </form>
              </div>
            </div>

            {/* Test Email Modal */}
            {isTestEmailModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-200">
                  <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50">
                    <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <Mail className="h-4 w-4 text-emerald-700" /> Send Live SMTP Test Email
                    </h3>
                    <button onClick={() => setIsTestEmailModalOpen(false)} className="p-1 text-slate-400 hover:bg-slate-200 rounded-lg">
                      ✕
                    </button>
                  </div>

                  <form onSubmit={handleSendTestEmail} className="p-6 space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Send Test Email To</label>
                      <input
                        type="email"
                        value={testEmailTo}
                        onChange={(e) => setTestEmailTo(e.target.value)}
                        placeholder="your-personal-email@gmail.com"
                        className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-emerald-500"
                        required
                      />
                      <span className="text-[11px] text-slate-400 mt-1 block">We will dispatch a sample verification email to this address.</span>
                    </div>

                    <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
                      <button
                        type="button"
                        onClick={() => setIsTestEmailModalOpen(false)}
                        className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isTestingSmtp}
                        className="flex items-center gap-1.5 rounded-xl bg-emerald-700 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-800 shadow disabled:opacity-50"
                      >
                        {isTestingSmtp ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                        Send Test Email
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {editingPromotion && (
        <PromotionEditModal
          promotion={editingPromotion}
          onClose={() => setEditingPromotion(null)}
          onSuccess={() => {
            setEditingPromotion(null);
            promotionService.getAll().then(res => setPromotions(res.data));
          }}
        />
      )}

      {isImportModalOpen && importAnalysis && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-slate-900 mb-2">Import Analysis</h2>
            <p className="text-sm text-slate-500 mb-6">Review the file <span className="font-mono">{importAnalysis.filename}</span> before executing.</p>
            
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="rounded-xl bg-emerald-50 p-4 border border-emerald-100">
                <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">To Add</p>
                <p className="text-2xl font-extrabold text-emerald-900">{importAnalysis.toAdd.length}</p>
              </div>
              <div className="rounded-xl bg-blue-50 p-4 border border-blue-100">
                <p className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-1">To Update</p>
                <p className="text-2xl font-extrabold text-blue-900">{importAnalysis.toUpdate.length}</p>
              </div>
              <div className="rounded-xl bg-rose-50 p-4 border border-rose-100">
                <p className="text-xs font-bold text-rose-700 uppercase tracking-wider mb-1">Errors</p>
                <p className="text-2xl font-extrabold text-rose-900">{importAnalysis.errors.length}</p>
              </div>
            </div>

            {importAnalysis.errors.length > 0 && (
              <div className="mb-6 rounded-xl border border-rose-200 bg-white">
                <div className="border-b border-rose-100 bg-rose-50/50 px-4 py-3 font-semibold text-rose-800">Errors found</div>
                <div className="max-h-40 overflow-y-auto p-2">
                  {importAnalysis.errors.map((e: any, i: number) => (
                    <div key={i} className="px-2 py-1.5 text-sm text-slate-700 border-b border-slate-50 last:border-0"><span className="font-mono text-xs mr-2 text-rose-600">Row {e.row}</span>{e.message}</div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button disabled={isImporting} onClick={() => setIsImportModalOpen(false)} className="rounded-lg px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors">Cancel</button>
              <button disabled={isImporting || (importAnalysis.toAdd.length === 0 && importAnalysis.toUpdate.length === 0)} onClick={handleExecuteImport} className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50">
                {isImporting ? 'Importing...' : 'Confirm Import'}
              </button>
            </div>
          </div>
        </div>
      )}
      {isImportModalOpen && importResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <AlertCircle className="h-8 w-8 text-emerald-600" />
            </div>
            <h2 className="mb-2 text-xl font-bold text-slate-900">Import Complete</h2>
            <p className="mb-6 text-sm text-slate-500">The catalog has been successfully updated.</p>

            <div className="mb-6 grid grid-cols-3 gap-2">
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                <p className="text-2xl font-extrabold text-slate-800">{importResult.recordsAdded}</p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mt-1">Added</p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                <p className="text-2xl font-extrabold text-slate-800">{importResult.recordsUpdated}</p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mt-1">Updated</p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                <p className="text-2xl font-extrabold text-slate-800">{importResult.recordsSkipped}</p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mt-1">Skipped</p>
              </div>
            </div>

            {importResult.errors?.length > 0 && (
              <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 p-4">
                <p className="text-sm font-bold text-rose-800 mb-2">{importResult.errors.length} Errors encountered</p>
                <button onClick={downloadErrorsCsv} className="flex w-full items-center justify-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-bold text-slate-700 border border-slate-200 hover:bg-slate-50 shadow-sm transition-colors">
                  <Download className="h-4 w-4" /> Download Error Report
                </button>
              </div>
            )}

            <button onClick={() => { setIsImportModalOpen(false); setImportResult(null); }} className="w-full rounded-lg bg-emerald-600 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-700 transition-colors shadow-sm">
              Done
            </button>
          </div>
        </div>
      )}

      {/* India Post Printable Shipping Label Modal */}
      {shippingModalLabel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-red-600" />
                <h3 className="font-bold text-slate-900">India Post Shipping Label</h3>
              </div>
              <button onClick={() => setShippingModalLabel(null)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Label Visual Canvas */}
            <div className="rounded-xl border-2 border-dashed border-slate-300 p-5 bg-white space-y-4 text-xs text-slate-800 font-sans">
              <div className="flex items-start justify-between border-b pb-3">
                <div>
                  <p className="font-extrabold text-sm tracking-wider uppercase text-red-700">INDIA POST</p>
                  <p className="font-bold text-[11px]">{shippingModalLabel.service_type || 'SPEED POST (DOMESTIC)'}</p>
                </div>
                <div className="text-right">
                  <span className="inline-block border border-slate-400 px-2 py-0.5 font-bold text-[10px]">POSTAGE PREPAID / BNPL</span>
                  <p className="text-[10px] text-slate-500 mt-0.5">Booking Hub: {shippingModalLabel.booking_office_name}</p>
                </div>
              </div>

              {/* Barcode Mock */}
              <div className="text-center py-2 bg-slate-50 border border-slate-200 rounded">
                <div className="h-8 flex items-center justify-center gap-1">
                  {[4, 2, 6, 1, 5, 2, 4, 3, 6, 2, 5, 1, 4, 2, 6, 3, 5, 1, 4, 2, 6, 3].map((h, i) => (
                    <span key={i} className="bg-black inline-block" style={{ width: `${(i % 3) + 1}px`, height: `${h * 4 + 10}px` }} />
                  ))}
                </div>
                <p className="mt-1 font-mono font-bold text-sm tracking-widest">{shippingModalLabel.barcode_no}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 border-b pb-3">
                <div>
                  <p className="font-bold uppercase text-[10px] text-slate-500 mb-1">To (Consignee):</p>
                  <p className="font-bold text-sm text-slate-900">{shippingModalLabel.recipient_name}</p>
                  <p className="text-slate-600">{shippingModalLabel.recipient_address}</p>
                  <p className="text-slate-600">{shippingModalLabel.recipient_city}, {shippingModalLabel.recipient_state}</p>
                  <p className="font-extrabold text-sm text-slate-900 mt-1">PIN: {shippingModalLabel.recipient_pin}</p>
                  <p className="text-slate-600">Mob: {shippingModalLabel.recipient_mobile}</p>
                </div>
                <div className="border-l pl-4">
                  <p className="font-bold uppercase text-[10px] text-slate-500 mb-1">From (Sender):</p>
                  <p className="font-bold text-slate-900">{shippingModalLabel.sender_name}</p>
                  <p className="text-slate-600">{shippingModalLabel.sender_address}</p>
                  <p className="text-slate-600">{shippingModalLabel.sender_city} — {shippingModalLabel.sender_pin}</p>
                  <p className="text-slate-600">Mob: {shippingModalLabel.sender_mobile}</p>
                  <p className="mt-2 text-[10px] text-slate-500">Weight: {shippingModalLabel.weight || 450}g</p>
                </div>
              </div>

              <p className="text-[10px] text-slate-400 text-center">Generated on {shippingModalLabel.booking_datetime}</p>
            </div>

            <div className="mt-5 flex gap-3">
              <button
                onClick={() => window.print()}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-700 py-3 text-sm font-bold text-white hover:bg-emerald-800 shadow-sm"
              >
                <Printer className="h-4 w-4" /> Print Label
              </button>
              <button
                onClick={() => setShippingModalLabel(null)}
                className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* India Post Live Tracking Modal */}
      {shippingTrackingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900">Consignment Live Status</h3>
              </div>
              <button onClick={() => setShippingTrackingModal(null)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-4 rounded-xl bg-slate-50 p-4 border border-slate-200 text-xs text-slate-700">
              <p className="font-bold text-sm text-slate-900">
                AWB: {shippingTrackingModal.tracking?.article_number || 'N/A'}
              </p>
              <p className="mt-1 text-slate-500">
                Status: <b className="text-emerald-700 uppercase">{shippingTrackingModal.tracking?.del_status?.del_status || 'IN TRANSIT'}</b>
              </p>
            </div>

            <div className="space-y-4">
              {shippingTrackingModal.tracking?.tracking_details?.map((evt: any, i: number) => (
                <div key={i} className="flex gap-3 text-xs">
                  <div className="flex flex-col items-center">
                    <span className="h-6 w-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[10px]">
                      {i + 1}
                    </span>
                    {i < shippingTrackingModal.tracking.tracking_details.length - 1 && (
                      <span className="h-8 w-0.5 bg-slate-200 mt-1" />
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{evt.event}</p>
                    <p className="text-slate-600">{evt.office} · {evt.date} {evt.time}</p>
                    {evt.description && <p className="text-slate-400 text-[11px]">{evt.description}</p>}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShippingTrackingModal(null)}
              className="mt-6 w-full rounded-xl bg-slate-100 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-200"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Admin Custom Email & Delay Notice Modal */}
      {emailModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow">
                  <Mail className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Send Direct Customer Email</h3>
                  <p className="text-xs text-slate-500">From official admin email: <span className="font-semibold text-slate-700">admin@technoworld.com</span></p>
                </div>
              </div>
              <button onClick={() => setEmailModalOrder(null)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              {/* Order Info Strip */}
              <div className="rounded-lg bg-blue-50 border border-blue-100 p-3 text-xs text-blue-900 flex justify-between items-center">
                <span>Order <b>#{emailModalOrder.orderNumber}</b> · Total: <b>{formatINR(emailModalOrder.totalAmount)}</b></span>
                <span>Customer: <b>{emailModalOrder.address?.name || emailModalOrder.user?.name}</b></span>
              </div>

              {/* Template Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">Quick Email Template</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'DELAY_NOTICE', label: '⏳ Slight Delay (Procurement)' },
                    { id: 'ADDRESS_CLARIFICATION', label: '📍 Address / PIN Clarification' },
                    { id: 'ORDER_CONFIRMATION', label: '✅ Order Accepted & Confirmed' },
                  ].map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => applyEmailTemplate(t.id, emailModalOrder)}
                      className={`px-3 py-2 rounded-lg text-xs font-bold border text-left transition-all ${
                        emailTemplate === t.id
                          ? 'border-blue-500 bg-blue-50 text-blue-800 ring-2 ring-blue-500/20'
                          : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Recipient Email */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Recipient Email</label>
                <input
                  type="email"
                  value={emailRecipient}
                  onChange={(e) => setEmailRecipient(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-xs font-medium outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Subject */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Subject</label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="Enter email subject"
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-xs font-semibold outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Message Body */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Message Body</label>
                <textarea
                  rows={8}
                  value={emailMessage}
                  onChange={(e) => setEmailMessage(e.target.value)}
                  placeholder="Write your email message to the customer..."
                  className="w-full rounded-lg border border-slate-300 p-3 text-xs font-normal outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-sans"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 border-t border-slate-200 bg-slate-50 px-6 py-4">
              <button
                type="button"
                onClick={() => setEmailModalOrder(null)}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={emailSending}
                onClick={handleSendCustomEmail}
                className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-5 py-2 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-50 transition-colors shadow"
              >
                {emailSending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                Send Email to Customer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {rejectModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 bg-rose-50 px-6 py-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-600 text-white shadow">
                  <XCircle className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-bold text-rose-950 text-base">Reject Order #{rejectModalOrder.orderNumber}</h3>
                  <p className="text-xs text-rose-700">Will cancel order and notify customer with refund details</p>
                </div>
              </div>
              <button onClick={() => setRejectModalOrder(null)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Select Cancellation Reason</p>
              <div className="space-y-2">
                {[
                  'Book currently out of print / unavailable from publisher',
                  'Delivery pincode is currently unserviceable by India Post',
                  'Customer requested cancellation before fulfillment',
                  'Suspected duplicate or invalid order details',
                  'Other',
                ].map((reason) => (
                  <label key={reason} className="flex items-center gap-2.5 rounded-lg border border-slate-200 p-2.5 text-xs font-medium cursor-pointer hover:bg-slate-50">
                    <input
                      type="radio"
                      name="rejectReason"
                      checked={rejectReason === reason}
                      onChange={() => setRejectReason(reason)}
                      className="text-rose-600"
                    />
                    <span>{reason}</span>
                  </label>
                ))}
              </div>

              {rejectReason === 'Other' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Specify Custom Reason</label>
                  <textarea
                    rows={3}
                    value={rejectCustomReason}
                    onChange={(e) => setRejectCustomReason(e.target.value)}
                    placeholder="Enter reason to be sent to customer..."
                    className="w-full rounded-lg border border-slate-300 p-2.5 text-xs outline-none focus:border-rose-500"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2.5 border-t border-slate-200 bg-slate-50 px-6 py-4">
              <button
                type="button"
                onClick={() => setRejectModalOrder(null)}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100"
              >
                Go Back
              </button>
              <button
                type="button"
                disabled={rejecting}
                onClick={handleRejectOrderSubmit}
                className="flex items-center gap-1.5 rounded-lg bg-rose-600 px-5 py-2 text-xs font-bold text-white hover:bg-rose-700 disabled:opacity-50 transition-colors shadow"
              >
                {rejecting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <XCircle className="h-3.5 w-3.5" />}
                Confirm Rejection & Notify
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
