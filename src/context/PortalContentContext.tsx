import React, { createContext, useContext, useState, useEffect } from 'react';
import pharmacyBuildingImg from '../assets/images/pharmacy_building_1786459624657.jpg';

export interface BranchLocation {
  id: string;
  name: string;
  subcity: string;
  address: string;
  phone: string;
  email: string;
  hours: string;
  isMain?: boolean;
}

export interface PortalFaq {
  id: string;
  question: string;
  answer: string;
}

export interface PortalContent {
  // General Store Branding
  storeName: string;
  storeTagline: string;
  efdaLicense: string;
  primaryPhone: string;
  shortcodeHelpline: string;
  whatsappNumber: string;
  primaryEmail: string;
  flagshipAddress: string;
  flagshipHours: string;
  storeBuildingImg: string;

  // Top Announcement Bar
  showAnnouncement: boolean;
  announcementText: string;
  announcementBadge: string;

  // Hero Section
  heroTitlePrefix: string;
  heroTitleHighlight: string;
  heroSubheading: string;
  heroBadgeText: string;
  heroBannerTitle: string;
  heroBannerSub: string;

  // Value Proposition Highlights (4 Feature Cards)
  feature1Title: string;
  feature1Sub: string;
  feature1Badge: string;
  feature2Title: string;
  feature2Sub: string;
  feature2Badge: string;
  feature3Title: string;
  feature3Sub: string;
  feature3Badge: string;
  feature4Title: string;
  feature4Sub: string;
  feature4Badge: string;

  // Branch Locations
  branches: BranchLocation[];

  // Contact Page & FAQ
  contactPageTitle: string;
  contactPageDescription: string;
  faqs: PortalFaq[];
}

export const defaultPortalContent: PortalContent = {
  storeName: 'Kaziniya Drug Store',
  storeTagline: 'Your Trusted 24/7 Community Pharmacy & Healthcare Center in Addis Ababa',
  efdaLicense: 'EFDA Certified Pharmacy #48201',
  primaryPhone: '+251 11 661 2345 / +251 911 889 001',
  shortcodeHelpline: '9229',
  whatsappNumber: '+251 911 000 111',
  primaryEmail: 'contact@kaziniyapharmacy.et',
  flagshipAddress: 'Bole Medhanealem Road, Next to Edna Mall, Addis Ababa',
  flagshipHours: 'Open 24/7 (365 Days)',
  storeBuildingImg: pharmacyBuildingImg,

  showAnnouncement: true,
  announcementText: '🚨 Emergency Drug Verification Hotline (24/7): Dial 9229 or WhatsApp +251 911 000 111 for direct stock availability & reserve.',
  announcementBadge: '24/7 URGENT NOTICE',

  heroTitlePrefix: 'Kaziniya',
  heroTitleHighlight: 'Drug Store',
  heroSubheading: 'Providing 24/7 authentic medicine availability, prescription verification, and expert clinical pharmacist consultations across Addis Ababa.',
  heroBadgeText: 'Certified 24/7 Public Pharmacy Node',
  heroBannerTitle: 'Kaziniya Flagship Store & Health Center',
  heroBannerSub: 'EFDA certified pharmacy providing 24/7 authentic medication dispensing, cold-chain storage, and expert pharmacist consultations.',

  feature1Title: 'EFDA Certified Quality',
  feature1Sub: '100% authentic medications sourced directly from licensed pharmaceutical importers with batch traceability.',
  feature1Badge: '100% Genuine',

  feature2Title: 'Cold-Chain Preservation',
  feature2Sub: 'Active 2–8°C digital temperature logs for insulins, vaccines, biologics, and sensitive injectables.',
  feature2Badge: 'Temp Controlled',

  feature3Title: 'FEFO Batch Management',
  feature3Sub: 'Strict First-Expired-First-Out dispatch guarantees fresh inventory and zero expired drug issuance.',
  feature3Badge: 'Fresh Batches',

  feature4Title: '24/7 Emergency Counter',
  feature4Sub: 'Nightly emergency prescription dispensing with licensed on-duty pharmacists standing by.',
  feature4Badge: '24/7 On Duty',

  branches: [
    {
      id: 'main',
      name: 'Kaziniya Main Flagship Branch',
      subcity: 'Bole Subcity',
      address: 'Bole Medhanealem Road, Next to Edna Mall, Addis Ababa',
      phone: '+251 11 661 2345 / +251 911 889 001',
      email: 'bole@kaziniyapharmacy.et',
      hours: 'Open 24/7 (365 Days)',
      isMain: true,
    },
    {
      id: 'kazanchis',
      name: 'Kaziniya Kazanchis Branch',
      subcity: 'Kirkos Subcity',
      address: 'ECA Road, Opposite Intercontinental Hotel, Kazanchis, Addis Ababa',
      phone: '+251 11 552 4433',
      email: 'kazanchis@kaziniyapharmacy.et',
      hours: '7:30 AM – 10:00 PM',
      isMain: false,
    },
    {
      id: 'sarbet',
      name: 'Kaziniya Sarbet Branch',
      subcity: 'Nifas Silk Lafto',
      address: 'Near African Union Headquarters, Ring Road, Sarbet, Addis Ababa',
      phone: '+251 11 320 1122',
      email: 'sarbet@kaziniyapharmacy.et',
      hours: '8:00 AM – 9:30 PM',
      isMain: false,
    },
    {
      id: 'mexico',
      name: 'Kaziniya Mexico Square Branch',
      subcity: 'Lideta Subcity',
      address: 'Tegbareid Compound Entrance, Mexico Square, Addis Ababa',
      phone: '+251 11 467 9988',
      email: 'mexico@kaziniyapharmacy.et',
      hours: '8:00 AM – 9:00 PM',
      isMain: false,
    },
  ],

  contactPageTitle: 'Visit Kaziniya Drug Store & Reach Our Pharmacists',
  contactPageDescription: 'Located conveniently in Addis Ababa, Ethiopia. Whether you need 24/7 urgent medicine availability, direct phone consultation with a licensed clinical pharmacist, or bulk prescription orders, we are here to serve you.',

  faqs: [
    {
      id: 'faq-1',
      question: 'How do I upload my doctor prescription?',
      answer: 'Click the "Upload Prescription" button in the header or home hero. You can attach a clear photo of your doctor prescription and select your pickup branch or delivery address.',
    },
    {
      id: 'faq-2',
      question: 'Are medications guaranteed authentic?',
      answer: 'Yes, all drugs dispensed at Kaziniya Drug Store are 100% EFDA certified, batch-tracked, and sourced directly from verified importers.',
    },
    {
      id: 'faq-3',
      question: 'How does stock reservation work?',
      answer: 'When you reserve stock online, our pharmacists hold your medication at your chosen branch for up to 24 hours. You can pay via Telebirr, CBE Birr, or Cash upon pickup.',
    },
    {
      id: 'faq-4',
      question: 'Is night emergency dispensing available?',
      answer: 'Yes! Our Bole Flagship branch is open 24 hours a day, 7 days a week, 365 days a year with on-duty pharmacists ready for emergency orders.',
    },
  ],
};

interface PortalContentContextType {
  content: PortalContent;
  updateContent: (newContent: Partial<PortalContent>) => void;
  resetToDefaults: () => void;
}

const PortalContentContext = createContext<PortalContentContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'kaziniya_portal_content_v1';

export const PortalContentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [content, setContent] = useState<PortalContent>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...defaultPortalContent, ...parsed };
      }
    } catch (e) {
      console.error('Failed to load portal content from localStorage', e);
    }
    return defaultPortalContent;
  });

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(content));
    } catch (e) {
      console.error('Failed to save portal content to localStorage', e);
    }
  }, [content]);

  const updateContent = (newContent: Partial<PortalContent>) => {
    setContent((prev) => ({
      ...prev,
      ...newContent,
    }));
  };

  const resetToDefaults = () => {
    setContent(defaultPortalContent);
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <PortalContentContext.Provider value={{ content, updateContent, resetToDefaults }}>
      {children}
    </PortalContentContext.Provider>
  );
};

export const usePortalContent = () => {
  const context = useContext(PortalContentContext);
  if (!context) {
    throw new Error('usePortalContent must be used within a PortalContentProvider');
  }
  return context;
};
