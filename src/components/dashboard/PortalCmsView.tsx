import React, { useState } from 'react';
import {
  Globe,
  Save,
  RotateCcw,
  Building,
  Phone,
  Mail,
  MapPin,
  Clock,
  Sparkles,
  CheckCircle2,
  Plus,
  Trash2,
  Edit2,
  HelpCircle,
  Megaphone,
  Layout,
  Image as ImageIcon,
  ShieldCheck,
  Eye,
  Check,
} from 'lucide-react';
import { usePortalContent, BranchLocation, PortalFaq } from '../../context/PortalContentContext';
import { useToast } from '../../context/ToastContext';

export const PortalCmsView: React.FC = () => {
  const { content, updateContent, resetToDefaults } = usePortalContent();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'branding' | 'announcement' | 'hero' | 'features' | 'branches' | 'faqs'>('branding');
  const [formData, setFormData] = useState({ ...content });
  const [isSaved, setIsSaved] = useState(false);

  // New Branch Modal State
  const [editingBranch, setEditingBranch] = useState<BranchLocation | null>(null);
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);

  // New FAQ Modal State
  const [editingFaq, setEditingFaq] = useState<PortalFaq | null>(null);
  const [isFaqModalOpen, setIsFaqModalOpen] = useState(false);

  const handleInputChange = (field: keyof typeof formData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setIsSaved(false);
  };

  const handleSaveAll = () => {
    updateContent(formData);
    setIsSaved(true);
    showToast('Public Portal content updated successfully! All customer-facing pages reflect these changes.', 'success', 'Portal Content Saved');
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all Public Portal content back to factory defaults?')) {
      resetToDefaults();
      setFormData({ ...content });
      showToast('Public Portal content reset to default values.', 'info', 'Content Reset');
    }
  };

  // Branch CRUD
  const handleSaveBranch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBranch) return;

    let updatedBranches: BranchLocation[];
    const exists = formData.branches.some((b) => b.id === editingBranch.id);

    if (exists) {
      updatedBranches = formData.branches.map((b) => (b.id === editingBranch.id ? editingBranch : b));
    } else {
      updatedBranches = [...formData.branches, editingBranch];
    }

    setFormData((prev) => ({ ...prev, branches: updatedBranches }));
    setIsBranchModalOpen(false);
    setEditingBranch(null);
    showToast(`Branch "${editingBranch.name}" saved.`, 'success');
  };

  const handleDeleteBranch = (id: string) => {
    if (formData.branches.length <= 1) {
      showToast('You must keep at least one active store branch location.', 'error');
      return;
    }
    const updated = formData.branches.filter((b) => b.id !== id);
    setFormData((prev) => ({ ...prev, branches: updated }));
    showToast('Branch location removed.', 'info');
  };

  // FAQ CRUD
  const handleSaveFaq = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFaq) return;

    let updatedFaqs: PortalFaq[];
    const exists = formData.faqs.some((f) => f.id === editingFaq.id);

    if (exists) {
      updatedFaqs = formData.faqs.map((f) => (f.id === editingFaq.id ? editingFaq : f));
    } else {
      updatedFaqs = [...formData.faqs, editingFaq];
    }

    setFormData((prev) => ({ ...prev, faqs: updatedFaqs }));
    setIsFaqModalOpen(false);
    setEditingFaq(null);
    showToast('FAQ entry saved.', 'success');
  };

  const handleDeleteFaq = (id: string) => {
    const updated = formData.faqs.filter((f) => f.id !== id);
    setFormData((prev) => ({ ...prev, faqs: updated }));
    showToast('FAQ entry removed.', 'info');
  };

  return (
    <div className="space-y-6 max-w-6xl pb-12">
      {/* Page Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 dark:bg-slate-900 dark:border-slate-800">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-extrabold dark:bg-emerald-950 dark:text-emerald-300">
            <Globe className="h-3.5 w-3.5" />
            <span>Public Portal CMS & Content Manager</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Admin Website Content Editor
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Customize all public text, headers, announcements, hero banners, feature highlights, branch locations, and contact information shown to customers.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={handleReset}
            type="button"
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition flex items-center justify-center gap-2 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <RotateCcw className="h-4 w-4 text-slate-400" />
            <span>Reset Defaults</span>
          </button>

          <button
            onClick={handleSaveAll}
            type="button"
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
          >
            {isSaved ? (
              <>
                <Check className="h-4 w-4" />
                <span>Saved Live!</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Save All Changes</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto custom-scrollbar dark:border-slate-800">
        <button
          onClick={() => setActiveTab('branding')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            activeTab === 'branding'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-300'
          }`}
        >
          <Building className="h-4 w-4" />
          <span>Branding & Contact Info</span>
        </button>

        <button
          onClick={() => setActiveTab('announcement')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            activeTab === 'announcement'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-300'
          }`}
        >
          <Megaphone className="h-4 w-4" />
          <span>Top Announcement Bar</span>
        </button>

        <button
          onClick={() => setActiveTab('hero')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            activeTab === 'hero'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-300'
          }`}
        >
          <Layout className="h-4 w-4" />
          <span>Hero & Main Banners</span>
        </button>

        <button
          onClick={() => setActiveTab('features')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            activeTab === 'features'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-300'
          }`}
        >
          <Sparkles className="h-4 w-4" />
          <span>Feature Cards (4 Highlights)</span>
        </button>

        <button
          onClick={() => setActiveTab('branches')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            activeTab === 'branches'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-300'
          }`}
        >
          <MapPin className="h-4 w-4" />
          <span>Branch Locations ({formData.branches.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('faqs')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            activeTab === 'faqs'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-300'
          }`}
        >
          <HelpCircle className="h-4 w-4" />
          <span>Contact Page & FAQs</span>
        </button>
      </div>

      {/* TAB 1: BRANDING & CONTACT INFO */}
      {activeTab === 'branding' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs dark:bg-slate-900 dark:border-slate-800 space-y-6">
          <div className="space-y-1">
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Store Identity & General Info</h3>
            <p className="text-xs text-slate-500">Edit the official store name, phone hotlines, and license numbers shown in the navbar, footers, and cards.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Store Name</label>
              <input
                type="text"
                value={formData.storeName}
                onChange={(e) => handleInputChange('storeName', e.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-900 focus:border-emerald-600 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">EFDA License Badge Text</label>
              <input
                type="text"
                value={formData.efdaLicense}
                onChange={(e) => handleInputChange('efdaLicense', e.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              />
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Store Tagline / Subtitle</label>
              <input
                type="text"
                value={formData.storeTagline}
                onChange={(e) => handleInputChange('storeTagline', e.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Primary Phone Numbers</label>
              <input
                type="text"
                value={formData.primaryPhone}
                onChange={(e) => handleInputChange('primaryPhone', e.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-xs font-mono text-slate-900 focus:border-emerald-600 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Shortcode Helpline (Dial Line)</label>
              <input
                type="text"
                value={formData.shortcodeHelpline}
                onChange={(e) => handleInputChange('shortcodeHelpline', e.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-xs font-mono font-bold text-slate-900 focus:border-emerald-600 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Pharmacist WhatsApp Line</label>
              <input
                type="text"
                value={formData.whatsappNumber}
                onChange={(e) => handleInputChange('whatsappNumber', e.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-xs font-mono text-slate-900 focus:border-emerald-600 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Official Pharmacy Email</label>
              <input
                type="email"
                value={formData.primaryEmail}
                onChange={(e) => handleInputChange('primaryEmail', e.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Flagship Address</label>
              <input
                type="text"
                value={formData.flagshipAddress}
                onChange={(e) => handleInputChange('flagshipAddress', e.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Operating Schedule Summary</label>
              <input
                type="text"
                value={formData.flagshipHours}
                onChange={(e) => handleInputChange('flagshipHours', e.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ANNOUNCEMENT BAR */}
      {activeTab === 'announcement' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs dark:bg-slate-900 dark:border-slate-800 space-y-6">
          <div className="space-y-1">
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Top Website Announcement Bar</h3>
            <p className="text-xs text-slate-500">Configure the high-visibility emergency / promotional ticker shown at the top of the Public Portal.</p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between dark:bg-slate-950 dark:border-slate-800">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-slate-900 dark:text-white">Enable Top Announcement Bar</span>
              <p className="text-[11px] text-slate-500">When enabled, this banner sits above the main header on all public pages.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.showAnnouncement}
                onChange={(e) => handleInputChange('showAnnouncement', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Badge Label</label>
              <input
                type="text"
                value={formData.announcementBadge}
                onChange={(e) => handleInputChange('announcementBadge', e.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Announcement Message Text</label>
              <textarea
                rows={3}
                value={formData.announcementText}
                onChange={(e) => handleInputChange('announcementText', e.target.value)}
                className="w-full rounded-2xl border border-slate-200 p-4 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              />
            </div>

            {/* Live Preview Box */}
            <div className="space-y-2 pt-2">
              <span className="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider">Live Preview</span>
              <div className="bg-emerald-950 text-white p-3 rounded-2xl flex items-center gap-3 text-xs border border-emerald-800">
                <span className="bg-emerald-500 text-slate-950 font-black px-2.5 py-0.5 rounded-full text-[10px] shrink-0 uppercase">
                  {formData.announcementBadge}
                </span>
                <span className="truncate">{formData.announcementText}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: HERO & MAIN BANNERS */}
      {activeTab === 'hero' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs dark:bg-slate-900 dark:border-slate-800 space-y-6">
          <div className="space-y-1">
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Hero & Main Store Banner</h3>
            <p className="text-xs text-slate-500">Edit the headline titles, description, and featured store building photo shown on the public landing page.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Hero Title Prefix</label>
              <input
                type="text"
                value={formData.heroTitlePrefix}
                onChange={(e) => handleInputChange('heroTitlePrefix', e.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Hero Title Highlight (Green Text)</label>
              <input
                type="text"
                value={formData.heroTitleHighlight}
                onChange={(e) => handleInputChange('heroTitleHighlight', e.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-emerald-600 focus:border-emerald-600 focus:outline-none dark:border-slate-800 dark:bg-slate-950"
              />
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Hero Subheading Paragraph</label>
              <textarea
                rows={3}
                value={formData.heroSubheading}
                onChange={(e) => handleInputChange('heroSubheading', e.target.value)}
                className="w-full rounded-2xl border border-slate-200 p-4 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Hero Top Badge Text</label>
              <input
                type="text"
                value={formData.heroBadgeText}
                onChange={(e) => handleInputChange('heroBadgeText', e.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Banner Card Title</label>
              <input
                type="text"
                value={formData.heroBannerTitle}
                onChange={(e) => handleInputChange('heroBannerTitle', e.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              />
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Banner Card Subtitle</label>
              <textarea
                rows={2}
                value={formData.heroBannerSub}
                onChange={(e) => handleInputChange('heroBannerSub', e.target.value)}
                className="w-full rounded-2xl border border-slate-200 p-4 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: FEATURE HIGHLIGHTS */}
      {activeTab === 'features' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs dark:bg-slate-900 dark:border-slate-800 space-y-6">
          <div className="space-y-1">
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Feature Highlight Cards</h3>
            <p className="text-xs text-slate-500">Customize the 4 core service badges & value propositions displayed on the home page.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Feature 1 */}
            <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-3 dark:bg-slate-950 dark:border-slate-800">
              <span className="text-xs font-extrabold uppercase text-emerald-600 block">Feature Card 1</span>
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Title"
                  value={formData.feature1Title}
                  onChange={(e) => handleInputChange('feature1Title', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold dark:bg-slate-900 dark:border-slate-800"
                />
                <input
                  type="text"
                  placeholder="Badge"
                  value={formData.feature1Badge}
                  onChange={(e) => handleInputChange('feature1Badge', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs text-emerald-600 font-bold dark:bg-slate-900 dark:border-slate-800"
                />
                <textarea
                  rows={2}
                  placeholder="Description"
                  value={formData.feature1Sub}
                  onChange={(e) => handleInputChange('feature1Sub', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-3 text-xs dark:bg-slate-900 dark:border-slate-800"
                />
              </div>
            </div>

            {/* Feature 2 */}
            <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-3 dark:bg-slate-950 dark:border-slate-800">
              <span className="text-xs font-extrabold uppercase text-emerald-600 block">Feature Card 2</span>
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Title"
                  value={formData.feature2Title}
                  onChange={(e) => handleInputChange('feature2Title', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold dark:bg-slate-900 dark:border-slate-800"
                />
                <input
                  type="text"
                  placeholder="Badge"
                  value={formData.feature2Badge}
                  onChange={(e) => handleInputChange('feature2Badge', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs text-emerald-600 font-bold dark:bg-slate-900 dark:border-slate-800"
                />
                <textarea
                  rows={2}
                  placeholder="Description"
                  value={formData.feature2Sub}
                  onChange={(e) => handleInputChange('feature2Sub', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-3 text-xs dark:bg-slate-900 dark:border-slate-800"
                />
              </div>
            </div>

            {/* Feature 3 */}
            <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-3 dark:bg-slate-950 dark:border-slate-800">
              <span className="text-xs font-extrabold uppercase text-emerald-600 block">Feature Card 3</span>
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Title"
                  value={formData.feature3Title}
                  onChange={(e) => handleInputChange('feature3Title', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold dark:bg-slate-900 dark:border-slate-800"
                />
                <input
                  type="text"
                  placeholder="Badge"
                  value={formData.feature3Badge}
                  onChange={(e) => handleInputChange('feature3Badge', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs text-emerald-600 font-bold dark:bg-slate-900 dark:border-slate-800"
                />
                <textarea
                  rows={2}
                  placeholder="Description"
                  value={formData.feature3Sub}
                  onChange={(e) => handleInputChange('feature3Sub', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-3 text-xs dark:bg-slate-900 dark:border-slate-800"
                />
              </div>
            </div>

            {/* Feature 4 */}
            <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-3 dark:bg-slate-950 dark:border-slate-800">
              <span className="text-xs font-extrabold uppercase text-emerald-600 block">Feature Card 4</span>
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Title"
                  value={formData.feature4Title}
                  onChange={(e) => handleInputChange('feature4Title', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold dark:bg-slate-900 dark:border-slate-800"
                />
                <input
                  type="text"
                  placeholder="Badge"
                  value={formData.feature4Badge}
                  onChange={(e) => handleInputChange('feature4Badge', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs text-emerald-600 font-bold dark:bg-slate-900 dark:border-slate-800"
                />
                <textarea
                  rows={2}
                  placeholder="Description"
                  value={formData.feature4Sub}
                  onChange={(e) => handleInputChange('feature4Sub', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-3 text-xs dark:bg-slate-900 dark:border-slate-800"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: BRANCH LOCATIONS */}
      {activeTab === 'branches' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs dark:bg-slate-900 dark:border-slate-800 space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Store Branch Directory</h3>
              <p className="text-xs text-slate-500">Manage all pharmacy nodes shown on the Public Location & Contact page.</p>
            </div>

            <button
              onClick={() => {
                setEditingBranch({
                  id: `branch-${Date.now()}`,
                  name: '',
                  subcity: '',
                  address: '',
                  phone: '',
                  email: '',
                  hours: '',
                  isMain: false,
                });
                setIsBranchModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="h-4 w-4" /> Add New Branch
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {formData.branches.map((b) => (
              <div
                key={b.id}
                className="p-5 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col justify-between space-y-3 dark:bg-slate-950 dark:border-slate-800"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700 uppercase">
                      {b.subcity || 'Subcity'}
                    </span>
                    {b.isMain && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        Flagship Node
                      </span>
                    )}
                  </div>
                  <h4 className="font-extrabold text-slate-900 text-sm dark:text-white">{b.name}</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300">{b.address}</p>
                  <p className="text-xs text-slate-500 font-mono">{b.phone}</p>
                  <p className="text-xs text-emerald-600 font-medium">{b.hours}</p>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-800 justify-end">
                  <button
                    onClick={() => {
                      setEditingBranch(b);
                      setIsBranchModalOpen(true);
                    }}
                    className="p-2 text-xs text-slate-700 hover:text-emerald-600 bg-white rounded-lg border border-slate-200 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteBranch(b.id)}
                    className="p-2 text-xs text-rose-600 hover:text-rose-700 bg-white rounded-lg border border-slate-200 dark:bg-slate-900 dark:border-slate-800"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: CONTACT PAGE & FAQS */}
      {activeTab === 'faqs' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs dark:bg-slate-900 dark:border-slate-800 space-y-6">
          <div className="space-y-4">
            <div className="space-y-1">
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Contact Page Intro & FAQs</h3>
              <p className="text-xs text-slate-500">Edit the intro banner text for the Contact Page and manage customer FAQ cards.</p>
            </div>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Contact Page Headline</label>
                <input
                  type="text"
                  value={formData.contactPageTitle}
                  onChange={(e) => handleInputChange('contactPageTitle', e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Contact Page Description</label>
                <textarea
                  rows={2}
                  value={formData.contactPageDescription}
                  onChange={(e) => handleInputChange('contactPageDescription', e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 p-4 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-slate-900 text-sm dark:text-white">Frequently Asked Questions ({formData.faqs.length})</h4>
              <button
                onClick={() => {
                  setEditingFaq({
                    id: `faq-${Date.now()}`,
                    question: '',
                    answer: '',
                  });
                  setIsFaqModalOpen(true);
                }}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1"
              >
                <Plus className="h-3.5 w-3.5" /> Add FAQ
              </button>
            </div>

            <div className="space-y-3">
              {formData.faqs.map((f) => (
                <div key={f.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-1.5 dark:bg-slate-950 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900 dark:text-white">Q: {f.question}</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingFaq(f);
                          setIsFaqModalOpen(true);
                        }}
                        className="p-1 text-slate-500 hover:text-emerald-600"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteFaq(f.id)}
                        className="p-1 text-slate-500 hover:text-rose-600"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 pl-4 border-l-2 border-emerald-500">
                    A: {f.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* EDIT BRANCH MODAL */}
      {isBranchModalOpen && editingBranch && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="font-extrabold text-slate-900 text-base dark:text-white">
              {editingBranch.name ? 'Edit Branch Location' : 'Add New Branch Location'}
            </h3>

            <form onSubmit={handleSaveBranch} className="space-y-3">
              <input
                type="text"
                placeholder="Branch Name (e.g. Kaziniya Bole Branch)"
                required
                value={editingBranch.name}
                onChange={(e) => setEditingBranch({ ...editingBranch, name: e.target.value })}
                className="w-full rounded-2xl border border-slate-200 px-4 py-2 text-xs font-bold dark:bg-slate-950 dark:border-slate-800"
              />
              <input
                type="text"
                placeholder="Subcity (e.g. Kirkos Subcity)"
                required
                value={editingBranch.subcity}
                onChange={(e) => setEditingBranch({ ...editingBranch, subcity: e.target.value })}
                className="w-full rounded-2xl border border-slate-200 px-4 py-2 text-xs dark:bg-slate-950 dark:border-slate-800"
              />
              <textarea
                rows={2}
                placeholder="Full Street Address"
                required
                value={editingBranch.address}
                onChange={(e) => setEditingBranch({ ...editingBranch, address: e.target.value })}
                className="w-full rounded-2xl border border-slate-200 p-3 text-xs dark:bg-slate-950 dark:border-slate-800"
              />
              <input
                type="text"
                placeholder="Phone Numbers"
                required
                value={editingBranch.phone}
                onChange={(e) => setEditingBranch({ ...editingBranch, phone: e.target.value })}
                className="w-full rounded-2xl border border-slate-200 px-4 py-2 text-xs font-mono dark:bg-slate-950 dark:border-slate-800"
              />
              <input
                type="email"
                placeholder="Branch Email"
                required
                value={editingBranch.email}
                onChange={(e) => setEditingBranch({ ...editingBranch, email: e.target.value })}
                className="w-full rounded-2xl border border-slate-200 px-4 py-2 text-xs dark:bg-slate-950 dark:border-slate-800"
              />
              <input
                type="text"
                placeholder="Operating Hours (e.g. 8:00 AM – 9:00 PM)"
                required
                value={editingBranch.hours}
                onChange={(e) => setEditingBranch({ ...editingBranch, hours: e.target.value })}
                className="w-full rounded-2xl border border-slate-200 px-4 py-2 text-xs dark:bg-slate-950 dark:border-slate-800"
              />

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={editingBranch.isMain || false}
                  onChange={(e) => setEditingBranch({ ...editingBranch, isMain: e.target.checked })}
                  className="rounded text-emerald-600"
                />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Set as Main Flagship Store Node</span>
              </label>

              <div className="flex items-center gap-2 pt-3 justify-end">
                <button
                  type="button"
                  onClick={() => setIsBranchModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700"
                >
                  Save Branch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT FAQ MODAL */}
      {isFaqModalOpen && editingFaq && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="font-extrabold text-slate-900 text-base dark:text-white">Edit FAQ Entry</h3>

            <form onSubmit={handleSaveFaq} className="space-y-3">
              <input
                type="text"
                placeholder="Question"
                required
                value={editingFaq.question}
                onChange={(e) => setEditingFaq({ ...editingFaq, question: e.target.value })}
                className="w-full rounded-2xl border border-slate-200 px-4 py-2 text-xs font-bold dark:bg-slate-950 dark:border-slate-800"
              />
              <textarea
                rows={4}
                placeholder="Answer"
                required
                value={editingFaq.answer}
                onChange={(e) => setEditingFaq({ ...editingFaq, answer: e.target.value })}
                className="w-full rounded-2xl border border-slate-200 p-3 text-xs dark:bg-slate-950 dark:border-slate-800"
              />

              <div className="flex items-center gap-2 pt-2 justify-end">
                <button
                  type="button"
                  onClick={() => setIsFaqModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700"
                >
                  Save FAQ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
