import React, { useState, useEffect, useMemo } from 'react';
import { ContactInquiry, User } from '../../types';
import { safeFetchJson } from '../../utils/api';
import {
  MessageSquare,
  Search,
  RefreshCw,
  Mail,
  Phone,
  Clock,
  CheckCircle2,
  AlertCircle,
  Archive,
  Trash2,
  ExternalLink,
  MessageCircle,
  Reply,
  Check,
  X,
  Filter,
  Sparkles,
  Inbox,
  UserCheck,
  Send,
  Eye,
} from 'lucide-react';

interface CustomerInquiriesViewProps {
  currentUser?: User | null;
}

export const CustomerInquiriesView: React.FC<CustomerInquiriesViewProps> = ({ currentUser }) => {
  const [inquiries, setInquiries] = useState<ContactInquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'UNREAD' | 'READ' | 'REPLIED' | 'ARCHIVED'>('ALL');
  
  // Reply modal / drawer state
  const [selectedInquiry, setSelectedInquiry] = useState<ContactInquiry | null>(null);
  const [replyNotes, setReplyNotes] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  const fetchInquiries = async (silent = false) => {
    try {
      if (!silent) setIsLoading(true);
      else setIsRefreshing(true);
      setError(null);

      const res = await safeFetchJson<ContactInquiry[]>('/api/contact/inquiries');
      if (res.success && res.data) {
        setInquiries(res.data);
      } else {
        setError(res.message || 'Failed to load inquiries.');
      }
    } catch (err: any) {
      setError(err.message || 'Error connecting to inquiries service.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  const triggerToast = (msg: string) => {
    setActionSuccessMessage(msg);
    setTimeout(() => setActionSuccessMessage(null), 3000);
  };

  const handleUpdateStatus = async (
    id: string,
    newStatus: ContactInquiry['status'],
    notes?: string
  ) => {
    try {
      const res = await safeFetchJson<ContactInquiry>(`/api/contact/inquiries/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          replyNotes: notes,
        }),
      });

      if (res.success && res.data) {
        setInquiries((prev) =>
          prev.map((item) => (item.id === id ? res.data! : item))
        );
        triggerToast(`Inquiry status updated to ${newStatus}`);
        if (selectedInquiry?.id === id) {
          setSelectedInquiry(null);
          setReplyNotes('');
        }
      } else {
        alert(res.message || 'Failed to update inquiry status');
      }
    } catch (err: any) {
      alert(err.message || 'An error occurred while updating status.');
    }
  };

  const handleDeleteInquiry = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete the inquiry from "${name}"?`)) {
      return;
    }

    try {
      const res = await safeFetchJson(`/api/contact/inquiries/${id}`, {
        method: 'DELETE',
      });

      if (res.success) {
        setInquiries((prev) => prev.filter((item) => item.id !== id));
        triggerToast('Inquiry permanently deleted');
        if (selectedInquiry?.id === id) {
          setSelectedInquiry(null);
        }
      } else {
        alert(res.message || 'Failed to delete inquiry');
      }
    } catch (err: any) {
      alert(err.message || 'An error occurred while deleting inquiry.');
    }
  };

  const handleOpenReplyModal = (inquiry: ContactInquiry) => {
    setSelectedInquiry(inquiry);
    setReplyNotes(inquiry.replyNotes || '');
  };

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInquiry) return;

    setIsSubmittingReply(true);
    await handleUpdateStatus(selectedInquiry.id, 'REPLIED', replyNotes);
    setIsSubmittingReply(false);
  };

  // Quick reply templates
  const quickTemplates = [
    'Confirmed stock availability. Requested patient to visit counter or reserve hold.',
    'Stock currently exhausted. Suggested bioequivalent generic alternative.',
    'Provided clinical dosage and administration guidance via telephone consultation.',
    'Advised patient to consult primary prescriber for dosage adjustment.',
  ];

  // Metrics computation
  const metrics = useMemo(() => {
    const total = inquiries.length;
    const unread = inquiries.filter((i) => i.status === 'UNREAD').length;
    const read = inquiries.filter((i) => i.status === 'READ').length;
    const replied = inquiries.filter((i) => i.status === 'REPLIED').length;
    const archived = inquiries.filter((i) => i.status === 'ARCHIVED').length;
    const responseRate = total > 0 ? Math.round((replied / total) * 100) : 0;
    return { total, unread, read, replied, archived, responseRate };
  }, [inquiries]);

  // Filtered inquiries
  const filteredInquiries = useMemo(() => {
    return inquiries.filter((inq) => {
      // Status filter
      if (statusFilter !== 'ALL' && inq.status !== statusFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = inq.name.toLowerCase().includes(q);
        const matchContact = inq.contact.toLowerCase().includes(q);
        const matchSubject = inq.subject.toLowerCase().includes(q);
        const matchMessage = inq.message.toLowerCase().includes(q);
        const matchReply = inq.replyNotes?.toLowerCase().includes(q);
        return matchName || matchContact || matchSubject || matchMessage || matchReply;
      }
      return true;
    });
  }, [inquiries, statusFilter, searchQuery]);

  const formatDate = (isoString?: string) => {
    if (!isoString) return 'N/A';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  const getCleanPhoneForWhatsApp = (contact: string) => {
    const digits = contact.replace(/\D/g, '');
    if (digits.startsWith('09') || digits.startsWith('07')) {
      return '251' + digits.substring(1);
    }
    return digits;
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {actionSuccessMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="h-4 w-4" />
          <span>{actionSuccessMessage}</span>
        </div>
      )}

      {/* VIEW HEADER */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-[#0070ba] shrink-0 shadow-xs">
            <MessageSquare className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Customer Inquiries & Consultations</h1>
              {metrics.unread > 0 && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-amber-100 text-amber-800 border border-amber-200 animate-pulse">
                  {metrics.unread} Unread
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Messages received via the public storefront contact form, dosage questions, and prescription availability requests.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchInquiries(true)}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition cursor-pointer shadow-2xs"
            title="Refresh Inquiries List"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin text-[#0070ba]' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Inquiries */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Total Inquiries</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{metrics.total}</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">All customer messages</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
            <Inbox className="h-5 w-5" />
          </div>
        </div>

        {/* Unread Inquiries */}
        <div className="bg-white p-4 rounded-2xl border border-amber-200 shadow-xs flex items-center justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />
          <div>
            <p className="text-xs font-semibold text-amber-700">Awaiting Response</p>
            <h3 className="text-2xl font-black text-amber-900 mt-1">{metrics.unread}</h3>
            <p className="text-[11px] text-amber-600 mt-0.5">Require pharmacist action</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
            <AlertCircle className="h-5 w-5" />
          </div>
        </div>

        {/* Replied Inquiries */}
        <div className="bg-white p-4 rounded-2xl border border-emerald-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-emerald-700">Replied & Solved</p>
            <h3 className="text-2xl font-black text-emerald-900 mt-1">{metrics.replied}</h3>
            <p className="text-[11px] text-emerald-600 mt-0.5">Addressed by staff</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>

        {/* Response Rate */}
        <div className="bg-white p-4 rounded-2xl border border-sky-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-sky-700">Response Rate</p>
            <h3 className="text-2xl font-black text-sky-900 mt-1">{metrics.responseRate}%</h3>
            <p className="text-[11px] text-sky-600 mt-0.5">{metrics.replied} of {metrics.total} addressed</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center text-[#0070ba]">
            <Sparkles className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* SEARCH & FILTER BAR */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {[
              { id: 'ALL', label: 'All Inquiries', count: metrics.total },
              { id: 'UNREAD', label: 'Unread', count: metrics.unread, badgeClass: 'bg-amber-100 text-amber-800' },
              { id: 'READ', label: 'Read', count: metrics.read },
              { id: 'REPLIED', label: 'Replied', count: metrics.replied, badgeClass: 'bg-emerald-100 text-emerald-800' },
              { id: 'ARCHIVED', label: 'Archived', count: metrics.archived },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                  statusFilter === tab.id
                    ? 'bg-[#0070ba] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    statusFilter === tab.id
                      ? 'bg-white/20 text-white'
                      : tab.badgeClass || 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative min-w-[260px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by customer, phone, question..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0070ba]/20 focus:border-[#0070ba] transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* INQUIRIES LIST / CARDS */}
      {isLoading ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-xs">
          <RefreshCw className="h-8 w-8 text-[#0070ba] animate-spin mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-700">Loading Customer Inquiries...</p>
          <p className="text-xs text-slate-400 mt-1">Retrieving verified messages from store database</p>
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center">
          <AlertCircle className="h-8 w-8 text-rose-600 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-rose-900">Failed to Retrieve Inquiries</h3>
          <p className="text-xs text-rose-700 mt-1">{error}</p>
          <button
            onClick={() => fetchInquiries()}
            className="mt-3 px-4 py-1.5 bg-rose-600 text-white rounded-xl text-xs font-semibold hover:bg-rose-700 transition"
          >
            Retry Connection
          </button>
        </div>
      ) : filteredInquiries.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-3">
            <Inbox className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">No Inquiries Found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {searchQuery
              ? `No messages matched the search "${searchQuery}". Clear search to view all.`
              : statusFilter !== 'ALL'
              ? `There are no inquiries currently tagged as "${statusFilter}".`
              : 'No customer contact inquiries have been received yet.'}
          </p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="mt-4 px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Clear Search
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredInquiries.map((inq) => {
            const isUnread = inq.status === 'UNREAD';
            const isReplied = inq.status === 'REPLIED';
            const isArchived = inq.status === 'ARCHIVED';
            const isPhone = !inq.contact.includes('@');
            const cleanPhone = isPhone ? getCleanPhoneForWhatsApp(inq.contact) : '';

            return (
              <div
                key={inq.id}
                className={`bg-white rounded-2xl border p-5 transition hover:shadow-md ${
                  isUnread
                    ? 'border-amber-300 ring-2 ring-amber-100 shadow-xs'
                    : isReplied
                    ? 'border-slate-200/90'
                    : isArchived
                    ? 'border-slate-200 bg-slate-50/50 opacity-80'
                    : 'border-slate-200/80 shadow-2xs'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  {/* Sender Info & Header */}
                  <div className="flex items-start gap-3.5 min-w-0 flex-1">
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs ${
                        isUnread
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : isReplied
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-sky-100 text-[#0070ba] border border-sky-200'
                      }`}
                    >
                      {inq.name.charAt(0).toUpperCase()}
                    </div>

                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold text-slate-900 text-sm">{inq.name}</h3>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                          {inq.subject}
                        </span>

                        {/* Status Pill */}
                        {isUnread && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-white animate-pulse">
                            <span className="w-1.5 h-1.5 rounded-full bg-white" />
                            UNREAD
                          </span>
                        )}
                        {inq.status === 'READ' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-200">
                            READ
                          </span>
                        )}
                        {isReplied && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="h-3 w-3" />
                            REPLIED
                          </span>
                        )}
                        {isArchived && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700">
                            ARCHIVED
                          </span>
                        )}
                      </div>

                      {/* Contact row & timestamp */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                        <div className="flex items-center gap-1 font-mono font-medium text-slate-700">
                          {isPhone ? <Phone className="h-3.5 w-3.5 text-slate-400" /> : <Mail className="h-3.5 w-3.5 text-slate-400" />}
                          <span>{inq.contact}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-slate-400">
                          <Clock className="h-3 w-3" />
                          <span>{formatDate(inq.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Reach Actions (WhatsApp, Phone, Email) */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {isPhone ? (
                      <>
                        <a
                          href={`tel:${inq.contact}`}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition"
                          title="Call Customer"
                        >
                          <Phone className="h-3.5 w-3.5 text-sky-600" />
                          <span className="hidden sm:inline">Call</span>
                        </a>
                        <a
                          href={`https://wa.me/${cleanPhone}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold transition"
                          title="Open WhatsApp Chat"
                        >
                          <MessageCircle className="h-3.5 w-3.5 text-emerald-600" />
                          <span className="hidden sm:inline">WhatsApp</span>
                        </a>
                      </>
                    ) : (
                      <a
                        href={`mailto:${inq.contact}?subject=Regarding your Kaziniya inquiry: ${encodeURIComponent(inq.subject)}`}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition"
                        title="Send Email"
                      >
                        <Mail className="h-3.5 w-3.5 text-[#0070ba]" />
                        <span className="hidden sm:inline">Email</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* Message Body */}
                <div className="mt-4 p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-800 leading-relaxed font-normal">
                  <p className="whitespace-pre-wrap">{inq.message}</p>
                </div>

                {/* Reply / Resolution Notes if already replied */}
                {isReplied && inq.replyNotes && (
                  <div className="mt-3 p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs text-emerald-950">
                    <div className="flex items-center justify-between text-[11px] font-bold text-emerald-800 mb-1">
                      <span className="flex items-center gap-1">
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                        Addressed by: {inq.repliedBy || 'Pharmacist'}
                      </span>
                      <span className="font-normal text-emerald-700">{formatDate(inq.repliedAt)}</span>
                    </div>
                    <p className="italic text-emerald-900 leading-relaxed">{inq.replyNotes}</p>
                  </div>
                )}

                {/* Footer Status & Workflow Actions */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {/* Mark Read/Unread */}
                    {isUnread ? (
                      <button
                        onClick={() => handleUpdateStatus(inq.id, 'READ')}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="h-3.5 w-3.5 text-slate-400" />
                        <span>Mark as Read</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUpdateStatus(inq.id, 'UNREAD')}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition flex items-center gap-1 cursor-pointer"
                      >
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        <span>Mark as Unread</span>
                      </button>
                    )}

                    {/* Archive toggle */}
                    {!isArchived ? (
                      <button
                        onClick={() => handleUpdateStatus(inq.id, 'ARCHIVED')}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition flex items-center gap-1 cursor-pointer"
                      >
                        <Archive className="h-3.5 w-3.5 text-slate-400" />
                        <span>Archive</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUpdateStatus(inq.id, 'READ')}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition flex items-center gap-1 cursor-pointer"
                      >
                        <Inbox className="h-3.5 w-3.5 text-slate-400" />
                        <span>Unarchive</span>
                      </button>
                    )}

                    {/* Delete */}
                    <button
                      onClick={() => handleDeleteInquiry(inq.id, inq.name)}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold text-rose-600 hover:text-rose-800 hover:bg-rose-50 transition flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>

                  {/* Primary Reply Button */}
                  <button
                    onClick={() => handleOpenReplyModal(inq)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#0070ba] hover:bg-[#005a9c] text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
                  >
                    <Reply className="h-3.5 w-3.5" />
                    <span>{isReplied ? 'Update Response Note' : 'Record Pharmacist Reply'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* REPLY / RESOLUTION MODAL */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-sky-100 text-[#0070ba] flex items-center justify-center">
                  <Reply className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Record Pharmacist Reply</h3>
                  <p className="text-[11px] text-slate-500">Document advice given to {selectedInquiry.name}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedInquiry(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Original inquiry recap */}
            <div className="my-4 p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs">
              <div className="flex items-center justify-between text-slate-500 text-[11px] mb-1 font-semibold">
                <span>{selectedInquiry.name} ({selectedInquiry.contact})</span>
                <span className="uppercase text-[10px] text-sky-700">{selectedInquiry.subject}</span>
              </div>
              <p className="text-slate-800 line-clamp-3 italic">"{selectedInquiry.message}"</p>
            </div>

            <form onSubmit={handleSubmitReply} className="space-y-4">
              {/* Quick Template Chips */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                  Quick Reply Templates:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {quickTemplates.map((tpl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setReplyNotes(tpl)}
                      className="text-[10px] bg-slate-100 hover:bg-sky-50 hover:text-[#0070ba] hover:border-sky-200 text-slate-700 px-2 py-1 rounded-lg border border-slate-200 transition text-left cursor-pointer"
                    >
                      {tpl.substring(0, 42)}...
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes Textarea */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Pharmacist Action & Reply Notes:
                </label>
                <textarea
                  rows={4}
                  required
                  value={replyNotes}
                  onChange={(e) => setReplyNotes(e.target.value)}
                  placeholder="E.g., Contacted patient via phone; confirmed drug is reserved for 24h at the Bole dispensary counter..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0070ba]/20 focus:border-[#0070ba] transition"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedInquiry(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReply || !replyNotes.trim()}
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  <Check className="h-3.5 w-3.5" />
                  <span>{isSubmittingReply ? 'Saving...' : 'Mark as Replied'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
