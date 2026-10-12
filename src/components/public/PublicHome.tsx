import React, { useState, useEffect } from 'react';
import {
  User as UserType,
  UserRole,
  PharmacyStoreProfile,
  Supplier,
} from '../../types';
import { useToast } from '../../context/ToastContext';
import { OwnerRegistrationModal } from './OwnerRegistrationModal';
import { SupplierRegistrationModal } from './SupplierRegistrationModal';
import { PharmacistAuthorizationModal } from './PharmacistAuthorizationModal';
import { DDSGatewayPage } from './DDSGatewayPage';

interface PublicHomeProps {
  onExploreProducts?: () => void;
  onOpenDashboard?: () => void;
  onOpenLogin?: () => void;
  onOpenOwnerRegister?: () => void;
  onOpenMobileApp?: () => void;
  onNavigateToContact?: () => void;
  onNavigateToRegistration?: () => void;
  onLoginSuccess?: (user: UserType) => void;
  currentUser?: UserType | null;
  onOpenDocumentation?: () => void;
  availableUsers?: UserType[];
  landingMode?: 'NATIONAL' | 'REGISTERED_STORE' | 'REGISTERED_SUPPLIER';
  onSwitchLandingMode?: (mode: 'NATIONAL' | 'REGISTERED_STORE' | 'REGISTERED_SUPPLIER') => void;
}

export const PublicHome: React.FC<PublicHomeProps> = ({
  onExploreProducts = () => {},
  onOpenDashboard = () => {},
  onOpenLogin,
  onOpenOwnerRegister,
  onOpenMobileApp = () => {},
  onNavigateToContact,
  onNavigateToRegistration,
  onLoginSuccess,
  currentUser,
  onOpenDocumentation,
  availableUsers = [],
  landingMode: externalLandingMode,
  onSwitchLandingMode,
}) => {
  const { showToast } = useToast();

  // Navigation views matching the shared HTML:
  // 'home' | 'login' | 'store' | 'supplier' | 'about' | 'contact' | 'registered_store' | 'registered_supplier'
  const [view, setView] = useState<string>('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Registered Entities in local session
  const [registeredStore, setRegisteredStore] = useState<PharmacyStoreProfile | null>(null);
  const [registeredSupplier, setRegisteredSupplier] = useState<Supplier | null>(null);
  const [authorizedPharmacists, setAuthorizedPharmacists] = useState<UserType[]>([]);

  // Modals
  const [isOwnerModalOpen, setIsOwnerModalOpen] = useState(false);
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [isPharmacistModalOpen, setIsPharmacistModalOpen] = useState(false);

  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Store registration inline form state
  const [storeName, setStoreName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [storeEmail, setStoreEmail] = useState('');
  const [address, setAddress] = useState('');
  const [storePassword, setStorePassword] = useState('');
  const [storeConfirmPassword, setStoreConfirmPassword] = useState('');

  // Supplier registration inline form state
  const [supplierName, setSupplierName] = useState('');
  const [supplierContact, setSupplierContact] = useState('');
  const [supplierLic, setSupplierLic] = useState('');
  const [supplierPhone, setSupplierPhone] = useState('');
  const [supplierEmail, setSupplierEmail] = useState('');
  const [supplierAddress, setSupplierAddress] = useState('');
  const [supplierProducts, setSupplierProducts] = useState('');
  const [supplierPassword, setSupplierPassword] = useState('');

  // Contact form state
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');

  // Synchronize registered data and external mode
  useEffect(() => {
    const syncData = () => {
      try {
        const storedStore = localStorage.getItem('dds_registered_store');
        if (storedStore) setRegisteredStore(JSON.parse(storedStore));

        const storedSupplier = localStorage.getItem('dds_registered_supplier');
        if (storedSupplier) setRegisteredSupplier(JSON.parse(storedSupplier));

        const storedPharmacists = localStorage.getItem('dds_authorized_pharmacists');
        if (storedPharmacists) setAuthorizedPharmacists(JSON.parse(storedPharmacists));
      } catch (err) {
        console.error('Error loading persistent DDS registration state:', err);
      }
    };

    syncData();
    window.addEventListener('storage', syncData);
    window.addEventListener('dds_state_updated', syncData);
    return () => {
      window.removeEventListener('storage', syncData);
      window.removeEventListener('dds_state_updated', syncData);
    };
  }, []);

  useEffect(() => {
    if (externalLandingMode === 'REGISTERED_STORE') {
      setView('registered_store');
    } else if (externalLandingMode === 'REGISTERED_SUPPLIER') {
      setView('registered_supplier');
    }
  }, [externalLandingMode]);

  // Click outside and Escape key listener to close menu
  useEffect(() => {
    if (!isMenuOpen) return;
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-menu-container]')) {
        setIsMenuOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMenuOpen(false);
    };
    document.addEventListener('click', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('click', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMenuOpen]);

  const navigateTo = (newView: string) => {
    if (newView === 'login' && onOpenLogin) {
      onOpenLogin();
      setIsMenuOpen(false);
      return;
    }
    setView(newView);
    setIsMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (onSwitchLandingMode) {
      if (newView === 'registered_store') onSwitchLandingMode('REGISTERED_STORE');
      else if (newView === 'registered_supplier') onSwitchLandingMode('REGISTERED_SUPPLIER');
      else onSwitchLandingMode('NATIONAL');
    }
  };

  // 1-Click Role Login
  const handleSimulatedRoleLogin = (role: UserRole) => {
    const predefinedUsers: Partial<Record<UserRole, UserType>> = {
      SUPER_ADMIN: {
        id: 'u-superadmin',
        name: 'Atronos Sisay',
        email: 'athronos21@gmail.com',
        role: 'SUPER_ADMIN',
        employeeId: 'SYS-ADMIN-001',
        isSuperAdmin: true,
        isOwner: false,
        department: 'Whole System Administration & Governance',
        isActive: true,
        createdAt: '2026-01-01T08:00:00Z',
      },
      STORE_OWNER: {
        id: 'u-1',
        name: registeredStore?.ownerName || 'Kaziniya Ahmed',
        email: registeredStore?.ownerEmail || 'kaziniya@kaziniya.com',
        role: 'STORE_OWNER',
        employeeId: 'KZN-OWNER-001',
        isOwner: true,
        isSuperAdmin: false,
        department: 'Pharmacy Administration & Ownership',
        isActive: true,
        createdAt: '2026-01-01T08:00:00Z',
      },
      PHARMACIST: {
        id: authorizedPharmacists[0]?.id || 'u-munaa',
        name: authorizedPharmacists[0]?.name || 'Monet Alemayehu',
        email: authorizedPharmacists[0]?.email || 'monet@kaziniya.com',
        role: 'PHARMACIST',
        employeeId: authorizedPharmacists[0]?.employeeId || 'EMP-PHARM-01',
        isOwner: false,
        isSuperAdmin: false,
        department: 'Dispensary & Counter',
        isActive: true,
        createdAt: '2026-01-01T08:00:00Z',
      },
      SUPPLIER: {
        id: 'u-sup-1',
        name: registeredSupplier?.name || 'Supplier',
        email: registeredSupplier?.email || 'supplier@medtech.com',
        role: 'SUPPLIER',
        employeeId: 'SUP-WHL-001',
        department: 'Pharmaceutical Wholesale & Procurement',
        pharmacyName: registeredSupplier?.name || 'MedTech Wholesale Distribution Hub',
        isActive: true,
        createdAt: '2026-01-05T08:00:00Z',
      },
    };

    const targetUser = availableUsers.find((u) => u.role === role) || predefinedUsers[role] || predefinedUsers.STORE_OWNER!;
    showToast(`Authenticated as ${targetUser.name} (${role})`, 'success', 'Role Authenticated');
    if (onLoginSuccess) {
      onLoginSuccess(targetUser);
    }
  };

  // Credential Login
  const handleCredentialLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoggingIn(true);
    try {
      const match = availableUsers.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
      if (match) {
        showToast(`Welcome back, ${match.name}!`, 'success', 'Login Successful');
        if (onLoginSuccess) onLoginSuccess(match);
      } else {
        const fallbackUser: UserType = {
          id: `u-${Date.now()}`,
          name: email.split('@')[0] || 'Authenticated User',
          email: email,
          role: 'STORE_OWNER',
          isOwner: true,
          isActive: true,
          createdAt: new Date().toISOString(),
        };
        showToast(`Signed in as ${fallbackUser.name}`, 'success', 'Session Initialized');
        if (onLoginSuccess) onLoginSuccess(fallbackUser);
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Handle Register Drug Store Submit
  const handleRegisterDrugStore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeName || !ownerName) {
      showToast('Please provide store name and owner name.', 'error');
      return;
    }

    const newStore: PharmacyStoreProfile = {
      id: `store-${Date.now()}`,
      storeName: storeName.trim(),
      storeType: 'COMMUNITY_DRUG_STORE',
      ownerName: ownerName.trim(),
      ownerEmail: storeEmail || 'athronos21@gmail.com',
      ownerPhone: phone || '+251903852218',
      efdaLicense: licenseNumber || 'EFDA/DISP/AA/2026/8492',
      tinNumber: '0098234123',
      city: 'Adama',
      subcity: 'Adama Special Zone',
      streetAddress: address || 'Adama, Ethiopia',
      phone: phone || '+251903852218',
      email: storeEmail || 'athronos21@gmail.com',
      operatingHours: 'Open 24/7 (365 Days)',
      logoUrl: '',
      registeredAt: new Date().toISOString(),
    };

    const ownerUser: UserType = {
      id: `owner-${Date.now()}`,
      name: ownerName.trim(),
      email: storeEmail || 'owner@drugstore.et',
      role: 'STORE_OWNER',
      isOwner: true,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    setRegisteredStore(newStore);
    try {
      localStorage.setItem('dds_registered_store', JSON.stringify(newStore));
      localStorage.setItem('dds_active_landing_mode', 'REGISTERED_STORE');
      window.dispatchEvent(new CustomEvent('dds_state_updated'));
    } catch {}

    showToast(
      `Drug store "${newStore.storeName}" successfully registered! You can now authorize your pharmacists.`,
      'success',
      'Store Registered'
    );

    setView('registered_store');
    if (onSwitchLandingMode) onSwitchLandingMode('REGISTERED_STORE');
  };

  // Handle Register Supplier Submit
  const handleRegisterSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierName || !supplierContact) {
      showToast('Please provide company name and contact person.', 'error');
      return;
    }

    const newSupplier: Supplier = {
      id: `sup-${Date.now()}`,
      name: supplierName.trim(),
      contactPerson: supplierContact.trim(),
      licenseNumber: supplierLic || 'EFDA/WHL/2026/041',
      phone: supplierPhone || '+251 11 434 8899',
      email: supplierEmail || 'sales@wholesaler.et',
      address: supplierAddress || 'Kality Industrial Zone, Addis Ababa',
      paymentTerms: 'Net 30 Days',
      creditLimit: 1500000,
      createdAt: new Date().toISOString(),
    };

    setRegisteredSupplier(newSupplier);
    try {
      localStorage.setItem('dds_registered_supplier', JSON.stringify(newSupplier));
      localStorage.setItem('dds_active_landing_mode', 'REGISTERED_SUPPLIER');
      window.dispatchEvent(new CustomEvent('dds_state_updated'));
    } catch {}

    showToast(
      `Supplier "${newSupplier.name}" registered! Procurement portal active.`,
      'success',
      'Supplier Registered'
    );

    setView('registered_supplier');
    if (onSwitchLandingMode) onSwitchLandingMode('REGISTERED_SUPPLIER');
  };

  // Handle Pharmacist Authorized
  const handlePharmacistAuthorized = (pharmacistUser: UserType) => {
    const updated = [pharmacistUser, ...authorizedPharmacists.filter((p) => p.id !== pharmacistUser.id)];
    setAuthorizedPharmacists(updated);
    try {
      localStorage.setItem('dds_authorized_pharmacists', JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('dds_state_updated'));
    } catch {}

    showToast(
      `Pharmacist ${pharmacistUser.name} authorized! Added to dispensary roster.`,
      'success',
      'Staff Authorized'
    );
  };

  return (
    <div style={{ fontFamily: "'DM Sans', Arial, sans-serif", color: '#0A2A52', background: '#F8FAFC', lineHeight: 1.5, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* ========================================================================= */}
      {/* 1. STICKY TOP HEADER                                                      */}
      {/* ========================================================================= */}
      <div style={{ position: 'sticky', top: 0, zIndex: 30, background: '#0070BA', color: '#FFFFFF', borderBottom: '1px solid #005A96' }}>
        <header style={{ width: '100%', maxWidth: '1600px', margin: '0 auto', padding: '14px clamp(20px, 3vw, 48px)', position: 'relative', boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
          
          {/* LOGO */}
          <a
            href="#top"
            onClick={(e) => { e.preventDefault(); navigateTo('home'); }}
            style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none', color: 'inherit' }}
          >
            <span style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0070BA" strokeWidth="3" strokeLinecap="round" aria-hidden="true"><path d="M12 4v16M4 12h16"/></svg>
            </span>
            <span style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
              <span style={{ fontFamily: "'Bricolage Grotesque', Arial, sans-serif", fontWeight: 800, fontSize: '22px', letterSpacing: '-0.01em' }}>
                Digital <span style={{ fontWeight: 600, color: '#BFE0FF' }}>Drug Store</span>
              </span>
              <span style={{ fontSize: '12px', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#CFE2F8' }}>
                {view === 'registered_store' && registeredStore
                  ? registeredStore.storeName
                  : view === 'registered_supplier' && registeredSupplier
                  ? registeredSupplier.name
                  : 'Digital pharmacy platform'}
              </span>
            </span>
          </a>

          {/* MENU BUTTON ON THE RIGHT & ANCHORED DROPDOWN */}
          <div data-menu-container style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: 'auto', position: 'relative' }}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Menu"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', minHeight: '48px', padding: '0 18px', borderRadius: '999px', border: '2px solid #FFFFFF', background: '#FFFFFF', color: '#0070BA', font: 'inherit', fontWeight: 700, fontSize: '15px', cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              {!isMenuOpen ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0A2A52" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0A2A52" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>
              )}
              Menu
            </button>

            {/* DROPDOWN NAV ANCHORED TO RIGHT */}
            {isMenuOpen && (
              <nav
                aria-label="Main menu"
                style={{
                  color: '#0A2A52',
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: 0,
                  zIndex: 50,
                  minWidth: '290px',
                  background: '#FFFFFF',
                  borderRadius: '24px',
                  boxShadow: '0 18px 48px rgba(16,35,30,0.22)',
                  padding: '12px 20px',
                  boxSizing: 'border-box',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                  fontWeight: 500,
                  fontSize: '15px',
                }}
              >
                <a
                  href="#top"
                  onClick={(e) => { e.preventDefault(); navigateTo('store'); }}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', minHeight: '44px', textDecoration: 'none', color: '#0A2A52' }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0070BA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 21V9l8-5 8 5v12M9 21v-6h6v6M12 8v4M10 10h4"/></svg>
                  Register Your Drug Store
                </a>

                <a
                  href="#top"
                  onClick={(e) => { e.preventDefault(); navigateTo('supplier'); }}
                  aria-label="Register as Supplier"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', minHeight: '44px', textDecoration: 'none', color: '#0A2A52' }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0070BA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 7h11v9H3zM14 10h4l3 3v3h-7"/><circle cx="7" cy="18" r="1.6"/><circle cx="17" cy="18" r="1.6"/></svg>
                  Register As Supplier
                </a>

                <a
                  href="#top"
                  onClick={(e) => { e.preventDefault(); navigateTo('about'); }}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', minHeight: '44px', textDecoration: 'none', color: '#0A2A52' }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0070BA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/></svg>
                  About Digital Drug Store
                </a>

                <a
                  href="#top"
                  onClick={(e) => { e.preventDefault(); navigateTo('contact'); }}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', minHeight: '44px', textDecoration: 'none', color: '#0A2A52' }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0070BA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>
                  Contact Us
                </a>

                <a
                  href="#top"
                  onClick={(e) => { e.preventDefault(); onExploreProducts(); }}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', minHeight: '44px', textDecoration: 'none', color: '#0A2A52' }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0070BA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M10 10l4 4M14 10l-4 4"/></svg>
                  Medicine Catalog
                </a>

                {onOpenDocumentation && (
                  <a
                    href="#top"
                    onClick={(e) => { e.preventDefault(); onOpenDocumentation(); }}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', minHeight: '44px', textDecoration: 'none', color: '#0A2A52' }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0070BA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    Internship Report (.docx / .pdf)
                  </a>
                )}

                <a
                  href="#top"
                  onClick={(e) => { e.preventDefault(); navigateTo('login'); }}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', minHeight: '44px', borderTop: '1px solid #D2E3F6', marginTop: '6px', paddingTop: '6px', fontWeight: 700, textDecoration: 'none', color: '#0070BA' }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0070BA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 4h4a1 1 0 011 1v14a1 1 0 01-1 1h-4M10 8l-4 4 4 4M6 12h10" transform="rotate(180 12 12)"/></svg>
                  Login (All Roles)
                </a>
              </nav>
            )}
          </div>
        </header>
      </div>

      {/* ========================================================================= */}
      {/* 2. VIEW: HOME                                                             */}
      {/* ========================================================================= */}
      {view === 'home' && (
        <main id="top" style={{ width: '100%', maxWidth: '1600px', margin: '0 auto', padding: '36px clamp(20px, 3vw, 48px) 64px', boxSizing: 'border-box', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 'clamp(32px, 4vw, 56px)', flex: 1 }}>
          
          {/* LEFT COLUMN: HERO HEADLINE & DUAL REGISTRATION CARDS */}
          <div style={{ flex: '1.15 1 500px', minWidth: '320px', display: 'flex', flexDirection: 'column', gap: '28px' }}>
            <h1 style={{ margin: 0, fontFamily: "'Bricolage Grotesque', Arial, sans-serif", fontWeight: 800, fontSize: 'clamp(36px, 4.5vw, 60px)', lineHeight: 1.05, letterSpacing: '-0.03em' }}>
              The digital platform for <span style={{ color: '#0070BA' }}>drug stores and suppliers.</span>
            </h1>
            <p style={{ margin: 0, fontSize: '19px', color: '#44607F', maxWidth: '680px', lineHeight: 1.55 }}>
              Digital Drug Store (DDS & PIMS) connects pharmacies and suppliers in one secure system. Register your drug store or supplier business to join, or log in to your account.
            </p>

            {/* DUAL REGISTRATION CARDS */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', paddingTop: '8px', width: '100%' }}>
              
              {/* CARD 1: REGISTER DRUG STORE */}
              <div style={{ background: '#0070BA', color: '#FFFFFF', borderRadius: '24px', padding: '28px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <span style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#005A96', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 21V9l8-5 8 5v12M9 21v-6h6v6M12 8v4M10 10h4"/></svg>
                </span>
                <h2 style={{ margin: 0, fontSize: '22px' }}>Register Drug Store</h2>
                <p style={{ margin: 0, color: '#CFE2F8', fontSize: '15px' }}>
                  Join the platform to manage stock, sales and purchase orders.
                </p>
                <a
                  href="#top"
                  onClick={(e) => { e.preventDefault(); navigateTo('store'); }}
                  style={{ marginTop: 'auto', alignSelf: 'flex-start', background: '#4DA8FF', color: '#0A2A52', padding: '13px 24px', borderRadius: '12px', fontWeight: 700, textDecoration: 'none' }}
                >
                  Register store
                </a>
              </div>

              {/* CARD 2: REGISTER SUPPLIER */}
              <div style={{ background: '#FFFFFF', border: '2px solid #D2E3F6', borderRadius: '24px', padding: '28px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <span style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#E6F3FB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0070BA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 7h11v9H3zM14 10h4l3 3v3h-7"/><circle cx="7" cy="18" r="1.6"/><circle cx="17" cy="18" r="1.6"/></svg>
                </span>
                <h2 style={{ margin: 0, fontSize: '22px' }}>Register Supplier</h2>
                <p style={{ margin: 0, color: '#44607F', fontSize: '15px' }}>
                  Join the platform to receive purchase orders from drug stores and manage deliveries.
                </p>
                <a
                  href="#top"
                  onClick={(e) => { e.preventDefault(); navigateTo('supplier'); }}
                  style={{ marginTop: 'auto', alignSelf: 'flex-start', background: '#0A2A52', color: '#FFFFFF', padding: '13px 24px', borderRadius: '12px', fontWeight: 700, textDecoration: 'none' }}
                >
                  Register supplier
                </a>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: DIGITAL PHARMACY SHOWCASE WALLPAPER */}
          <div
            id="login"
            onClick={() => navigateTo('login')}
            title="Sign In for All Roles: Super Admin, Store Owner, Pharmacist, Wholesale Supplier"
            style={{
              flex: '1 1 420px',
              maxWidth: '520px',
              maxHeight: '520px',
              height: '520px',
              width: '100%',
              position: 'relative',
              borderRadius: '30px',
              overflow: 'hidden',
              boxShadow: '0 22px 54px rgba(10, 42, 82, 0.17)',
              border: '2px solid #D2E3F6',
              background: '#0A2A52',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              alignSelf: 'center',
              transition: 'transform 0.25s ease, box-shadow 0.25s ease',
            }}
          >
            {/* Wallpaper Image */}
            <img
              src="/digital_pharma_hero_wallpaper.jpg"
              alt="Digital Drug Store & Pharmaceutical Inventory Platform"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center 35%',
                display: 'block',
              }}
            />
          </div>
        </main>
      )}

      {/* ========================================================================= */}
      {/* 3. VIEW: ISLOGIN (DEDICATED LOGIN VIEW - DDS GATEWAY)                      */}
      {/* ========================================================================= */}
      {view === 'login' && (
        <DDSGatewayPage
          availableUsers={availableUsers}
          onLoginSuccess={(user) => {
            if (onLoginSuccess) {
              onLoginSuccess(user);
            } else {
              handleSimulatedRoleLogin(user.role);
            }
          }}
          onOpenOwnerRegistration={() => {
            if (onOpenOwnerRegister) onOpenOwnerRegister();
            else setIsOwnerModalOpen(true);
          }}
          onOpenMobileApp={onOpenMobileApp}
          onOpenPublicPortal={() => navigateTo('home')}
          onOpenDocumentation={onOpenDocumentation}
        />
      )}

      {/* ========================================================================= */}
      {/* 4. VIEW: ISSTORE (REGISTER YOUR DRUG STORE)                               */}
      {/* ========================================================================= */}
      {view === 'store' && (
        <main style={{ width: '100%', maxWidth: '820px', margin: '0 auto', padding: '32px 24px 96px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
          <a
            href="#top"
            onClick={(e) => { e.preventDefault(); navigateTo('home'); }}
            style={{ alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: '8px', minHeight: '44px', fontWeight: 700, color: '#0070BA', textDecoration: 'none' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0070BA" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>
            Back to home
          </a>

          <div style={{ background: '#FFFFFF', border: '1px solid #D2E3F6', borderRadius: '28px', padding: '40px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
            <div>
              <h1 style={{ margin: '0 0 8px', fontFamily: "'Bricolage Grotesque', Arial, sans-serif", fontWeight: 800, fontSize: '36px', letterSpacing: '-0.02em' }}>
                Register Your Drug Store
              </h1>
              <p style={{ margin: 0, color: '#44607F', fontSize: '17px' }}>
                Register your drug store on Digital Drug Store. You will be the Owner and can add your pharmacists.
              </p>
            </div>

            <form onSubmit={handleRegisterDrugStore} style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '18px' }}>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label htmlFor="s-name" style={{ fontWeight: 700, fontSize: '14px' }}>Drug store name</label>
                  <input
                    id="s-name"
                    type="text"
                    required
                    placeholder="Store name"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    style={{ minHeight: '50px', padding: '0 16px', borderRadius: '12px', border: '1.5px solid #BCD3EE', font: 'inherit', fontSize: '16px', boxSizing: 'border-box', width: '100%', background: '#FFFFFF', color: '#0A2A52' }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label htmlFor="s-owner" style={{ fontWeight: 700, fontSize: '14px' }}>Owner full name</label>
                  <input
                    id="s-owner"
                    type="text"
                    required
                    placeholder="Full name"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    style={{ minHeight: '50px', padding: '0 16px', borderRadius: '12px', border: '1.5px solid #BCD3EE', font: 'inherit', fontSize: '16px', boxSizing: 'border-box', width: '100%', background: '#FFFFFF', color: '#0A2A52' }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label htmlFor="s-lic" style={{ fontWeight: 700, fontSize: '14px' }}>Pharmacy license number</label>
                  <input
                    id="s-lic"
                    type="text"
                    required
                    placeholder="EFDA/DISP/AA/2026/8492"
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    style={{ minHeight: '50px', padding: '0 16px', borderRadius: '12px', border: '1.5px solid #BCD3EE', font: 'inherit', fontSize: '16px', boxSizing: 'border-box', width: '100%', background: '#FFFFFF', color: '#0A2A52' }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label htmlFor="s-phone" style={{ fontWeight: 700, fontSize: '14px' }}>Phone</label>
                  <input
                    id="s-phone"
                    type="tel"
                    required
                    placeholder="+251 91 123 4567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    style={{ minHeight: '50px', padding: '0 16px', borderRadius: '12px', border: '1.5px solid #BCD3EE', font: 'inherit', fontSize: '16px', boxSizing: 'border-box', width: '100%', background: '#FFFFFF', color: '#0A2A52' }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label htmlFor="s-email" style={{ fontWeight: 700, fontSize: '14px' }}>Email</label>
                  <input
                    id="s-email"
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={storeEmail}
                    onChange={(e) => setStoreEmail(e.target.value)}
                    style={{ minHeight: '50px', padding: '0 16px', borderRadius: '12px', border: '1.5px solid #BCD3EE', font: 'inherit', fontSize: '16px', boxSizing: 'border-box', width: '100%', background: '#FFFFFF', color: '#0A2A52' }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label htmlFor="s-addr" style={{ fontWeight: 700, fontSize: '14px' }}>Address / City</label>
                  <input
                    id="s-addr"
                    type="text"
                    required
                    placeholder="Adama, Ethiopia"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    style={{ minHeight: '50px', padding: '0 16px', borderRadius: '12px', border: '1.5px solid #BCD3EE', font: 'inherit', fontSize: '16px', boxSizing: 'border-box', width: '100%', background: '#FFFFFF', color: '#0A2A52' }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label htmlFor="s-pw" style={{ fontWeight: 700, fontSize: '14px' }}>Password</label>
                  <input
                    id="s-pw"
                    type="password"
                    required
                    placeholder="Create a password"
                    value={storePassword}
                    onChange={(e) => setStorePassword(e.target.value)}
                    style={{ minHeight: '50px', padding: '0 16px', borderRadius: '12px', border: '1.5px solid #BCD3EE', font: 'inherit', fontSize: '16px', boxSizing: 'border-box', width: '100%', background: '#FFFFFF', color: '#0A2A52' }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label htmlFor="s-pw2" style={{ fontWeight: 700, fontSize: '14px' }}>Confirm password</label>
                  <input
                    id="s-pw2"
                    type="password"
                    required
                    placeholder="Repeat password"
                    value={storeConfirmPassword}
                    onChange={(e) => setStoreConfirmPassword(e.target.value)}
                    style={{ minHeight: '50px', padding: '0 16px', borderRadius: '12px', border: '1.5px solid #BCD3EE', font: 'inherit', fontSize: '16px', boxSizing: 'border-box', width: '100%', background: '#FFFFFF', color: '#0A2A52' }}
                  />
                </div>
              </div>

              <button
                type="submit"
                style={{ minHeight: '54px', borderRadius: '14px', border: 0, background: '#0070BA', color: '#FFFFFF', font: 'inherit', fontWeight: 700, fontSize: '16px', cursor: 'pointer' }}
              >
                Register Drug Store
              </button>
            </form>

            <div style={{ fontSize: '14px', color: '#44607F' }}>
              Already registered?{' '}
              <a href="#top" onClick={(e) => { e.preventDefault(); navigateTo('login'); }} style={{ color: '#0070BA', fontWeight: 700, textDecoration: 'none' }}>
                Login
              </a>
            </div>
          </div>
        </main>
      )}

      {/* ========================================================================= */}
      {/* 5. VIEW: ISSUPPLIER (REGISTER AS SUPPLIER)                                */}
      {/* ========================================================================= */}
      {view === 'supplier' && (
        <main style={{ width: '100%', maxWidth: '820px', margin: '0 auto', padding: '32px 24px 96px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
          <a
            href="#top"
            onClick={(e) => { e.preventDefault(); navigateTo('home'); }}
            style={{ alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: '8px', minHeight: '44px', fontWeight: 700, color: '#0070BA', textDecoration: 'none' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0070BA" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>
            Back to home
          </a>

          <div style={{ background: '#FFFFFF', border: '1px solid #D2E3F6', borderRadius: '28px', padding: '40px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
            <div>
              <h1 style={{ margin: '0 0 8px', fontFamily: "'Bricolage Grotesque', Arial, sans-serif", fontWeight: 800, fontSize: '36px', letterSpacing: '-0.02em' }}>
                Register As Supplier
              </h1>
              <p style={{ margin: 0, color: '#44607F', fontSize: '17px' }}>
                Register your business on Digital Drug Store to receive purchase orders from drug stores.
              </p>
            </div>

            <form onSubmit={handleRegisterSupplier} style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '18px' }}>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label htmlFor="p-name" style={{ fontWeight: 700, fontSize: '14px' }}>Company name</label>
                  <input
                    id="p-name"
                    type="text"
                    required
                    placeholder="Company name"
                    value={supplierName}
                    onChange={(e) => setSupplierName(e.target.value)}
                    style={{ minHeight: '50px', padding: '0 16px', borderRadius: '12px', border: '1.5px solid #BCD3EE', font: 'inherit', fontSize: '16px', boxSizing: 'border-box', width: '100%', background: '#FFFFFF', color: '#0A2A52' }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label htmlFor="p-contact" style={{ fontWeight: 700, fontSize: '14px' }}>Contact person</label>
                  <input
                    id="p-contact"
                    type="text"
                    required
                    placeholder="Full name"
                    value={supplierContact}
                    onChange={(e) => setSupplierContact(e.target.value)}
                    style={{ minHeight: '50px', padding: '0 16px', borderRadius: '12px', border: '1.5px solid #BCD3EE', font: 'inherit', fontSize: '16px', boxSizing: 'border-box', width: '100%', background: '#FFFFFF', color: '#0A2A52' }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label htmlFor="p-lic" style={{ fontWeight: 700, fontSize: '14px' }}>Business license number</label>
                  <input
                    id="p-lic"
                    type="text"
                    required
                    placeholder="EFDA/WHL/2026/041"
                    value={supplierLic}
                    onChange={(e) => setSupplierLic(e.target.value)}
                    style={{ minHeight: '50px', padding: '0 16px', borderRadius: '12px', border: '1.5px solid #BCD3EE', font: 'inherit', fontSize: '16px', boxSizing: 'border-box', width: '100%', background: '#FFFFFF', color: '#0A2A52' }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label htmlFor="p-phone" style={{ fontWeight: 700, fontSize: '14px' }}>Phone</label>
                  <input
                    id="p-phone"
                    type="tel"
                    required
                    placeholder="+251 11 434 8899"
                    value={supplierPhone}
                    onChange={(e) => setSupplierPhone(e.target.value)}
                    style={{ minHeight: '50px', padding: '0 16px', borderRadius: '12px', border: '1.5px solid #BCD3EE', font: 'inherit', fontSize: '16px', boxSizing: 'border-box', width: '100%', background: '#FFFFFF', color: '#0A2A52' }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label htmlFor="p-email" style={{ fontWeight: 700, fontSize: '14px' }}>Email</label>
                  <input
                    id="p-email"
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={supplierEmail}
                    onChange={(e) => setSupplierEmail(e.target.value)}
                    style={{ minHeight: '50px', padding: '0 16px', borderRadius: '12px', border: '1.5px solid #BCD3EE', font: 'inherit', fontSize: '16px', boxSizing: 'border-box', width: '100%', background: '#FFFFFF', color: '#0A2A52' }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label htmlFor="p-addr" style={{ fontWeight: 700, fontSize: '14px' }}>Address / City</label>
                  <input
                    id="p-addr"
                    type="text"
                    required
                    placeholder="Kality Industrial Zone, Addis Ababa"
                    value={supplierAddress}
                    onChange={(e) => setSupplierAddress(e.target.value)}
                    style={{ minHeight: '50px', padding: '0 16px', borderRadius: '12px', border: '1.5px solid #BCD3EE', font: 'inherit', fontSize: '16px', boxSizing: 'border-box', width: '100%', background: '#FFFFFF', color: '#0A2A52' }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label htmlFor="p-prod" style={{ fontWeight: 700, fontSize: '14px' }}>Products supplied</label>
                  <input
                    id="p-prod"
                    type="text"
                    required
                    placeholder="Antibiotics, Vaccines, Cold-Chain Biologics"
                    value={supplierProducts}
                    onChange={(e) => setSupplierProducts(e.target.value)}
                    style={{ minHeight: '50px', padding: '0 16px', borderRadius: '12px', border: '1.5px solid #BCD3EE', font: 'inherit', fontSize: '16px', boxSizing: 'border-box', width: '100%', background: '#FFFFFF', color: '#0A2A52' }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label htmlFor="p-pw" style={{ fontWeight: 700, fontSize: '14px' }}>Password</label>
                  <input
                    id="p-pw"
                    type="password"
                    required
                    placeholder="Create a password"
                    value={supplierPassword}
                    onChange={(e) => setSupplierPassword(e.target.value)}
                    style={{ minHeight: '50px', padding: '0 16px', borderRadius: '12px', border: '1.5px solid #BCD3EE', font: 'inherit', fontSize: '16px', boxSizing: 'border-box', width: '100%', background: '#FFFFFF', color: '#0A2A52' }}
                  />
                </div>
              </div>

              <button
                type="submit"
                style={{ minHeight: '54px', borderRadius: '14px', border: 0, background: '#0070BA', color: '#FFFFFF', font: 'inherit', fontWeight: 700, fontSize: '16px', cursor: 'pointer' }}
              >
                Register Supplier
              </button>
            </form>

            <div style={{ fontSize: '14px', color: '#44607F' }}>
              Already registered?{' '}
              <a href="#top" onClick={(e) => { e.preventDefault(); navigateTo('login'); }} style={{ color: '#0070BA', fontWeight: 700, textDecoration: 'none' }}>
                Login
              </a>
            </div>
          </div>
        </main>
      )}

      {/* ========================================================================= */}
      {/* 6. VIEW: ISABOUT (ABOUT DIGITAL DRUG STORE)                                */}
      {/* ========================================================================= */}
      {view === 'about' && (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          <div style={{ width: '100%', maxWidth: '1600px', margin: '0 auto', padding: '32px clamp(20px, 3vw, 48px) 0', boxSizing: 'border-box' }}>
            <a
              href="#top"
              onClick={(e) => { e.preventDefault(); navigateTo('home'); }}
              style={{ alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: '8px', minHeight: '44px', fontWeight: 700, color: '#0070BA', textDecoration: 'none' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0070BA" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>
              Back to home
            </a>
          </div>

          <section id="dds-platform-info" style={{ background: '#E6F3FB', padding: '72px clamp(20px, 3vw, 48px)', marginTop: '16px', flex: 1 }}>
            <div style={{ maxWidth: '1600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '40px' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '40px', alignItems: 'flex-start' }}>
                <div style={{ flex: '1 1 360px' }}>
                  <h2 style={{ margin: '0 0 12px', fontFamily: "'Bricolage Grotesque', Arial, sans-serif", fontWeight: 800, fontSize: '36px', letterSpacing: '-0.02em' }}>
                    About Digital Drug Store
                  </h2>
                  <p style={{ margin: 0, fontSize: '18px', color: '#44607F' }}>
                    Digital Drug Store is a platform where drug stores and suppliers register, connect and work together: managing stock and expiry, placing and fulfilling purchase orders, and tracking deliveries in one secure place.
                  </p>
                </div>
                <div style={{ flex: '1 1 360px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                  <div style={{ background: '#FFFFFF', borderRadius: '20px', padding: '22px' }}>
                    <div style={{ fontWeight: 700, marginBottom: '4px', fontSize: '17px' }}>For drug stores</div>
                    <div style={{ color: '#44607F', fontSize: '15px' }}>Manage stock, expiry, sales and orders.</div>
                  </div>
                  <div style={{ background: '#FFFFFF', borderRadius: '20px', padding: '22px' }}>
                    <div style={{ fontWeight: 700, marginBottom: '4px', fontSize: '17px' }}>For suppliers</div>
                    <div style={{ color: '#44607F', fontSize: '15px' }}>Receive orders and track deliveries.</div>
                  </div>
                </div>
              </div>

              {/* 6 CLINICAL ARCHITECTURE PILLARS */}
              <div style={{ borderTop: '1px solid #BCD3EE', paddingTop: '32px' }}>
                <h3 style={{ margin: '0 0 20px', fontFamily: "'Bricolage Grotesque', Arial, sans-serif", fontWeight: 800, fontSize: '24px' }}>
                  National Healthcare Architecture Pillars
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                  <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '20px' }}>
                    <strong style={{ display: 'block', fontSize: '16px', color: '#0070BA', marginBottom: '6px' }}>FEFO Expiry Triage</strong>
                    <span style={{ fontSize: '14px', color: '#44607F' }}>Automated First-Expiry First-Out triage cuts expiry waste by up to 88% through priority dispensing.</span>
                  </div>
                  <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '20px' }}>
                    <strong style={{ display: 'block', fontSize: '16px', color: '#0070BA', marginBottom: '6px' }}>EFDA Compliance</strong>
                    <span style={{ fontSize: '14px', color: '#44607F' }}>Ethiopian Food & Drug Authority batch verification with instant safety recall quarantine.</span>
                  </div>
                  <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '20px' }}>
                    <strong style={{ display: 'block', fontSize: '16px', color: '#0070BA', marginBottom: '6px' }}>Cold-Chain IoT Vault</strong>
                    <span style={{ fontSize: '14px', color: '#44607F' }}>24/7 temperature monitoring (2°C - 8°C) for vaccines, insulins, and critical biologics.</span>
                  </div>
                  <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '20px' }}>
                    <strong style={{ display: 'block', fontSize: '16px', color: '#0070BA', marginBottom: '6px' }}>3-Sec POS & Telebirr</strong>
                    <span style={{ fontSize: '14px', color: '#44607F' }}>Rapid barcode scanning with instantaneous digital payment via Telebirr and CBE Birr QR.</span>
                  </div>
                  <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '20px' }}>
                    <strong style={{ display: 'block', fontSize: '16px', color: '#0070BA', marginBottom: '6px' }}>B2B Wholesale Supply</strong>
                    <span style={{ fontSize: '14px', color: '#44607F' }}>Electronic purchase order issuance directly linked to licensed pharmaceutical distributors.</span>
                  </div>
                  <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '20px' }}>
                    <strong style={{ display: 'block', fontSize: '16px', color: '#0070BA', marginBottom: '6px' }}>EIMS Tax Engine</strong>
                    <span style={{ fontSize: '14px', color: '#44607F' }}>Ministry of Revenues compliant automated 15% VAT breakdown and fiscal receipt issuance.</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. VIEW: ISCONTACT (CONTACT US)                                           */}
      {/* ========================================================================= */}
      {view === 'contact' && (
        <main style={{ width: '100%', maxWidth: '960px', margin: '0 auto', padding: '32px 24px 96px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
          <a
            href="#top"
            onClick={(e) => { e.preventDefault(); navigateTo('home'); }}
            style={{ alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: '8px', minHeight: '44px', fontWeight: 700, color: '#0070BA', textDecoration: 'none' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0070BA" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>
            Back to home
          </a>

          <div style={{ background: '#FFFFFF', border: '1px solid #D2E3F6', borderRadius: '28px', padding: '40px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
            <div>
              <h1 style={{ margin: '0 0 8px', fontFamily: "'Bricolage Grotesque', Arial, sans-serif", fontWeight: 800, fontSize: '36px', letterSpacing: '-0.02em' }}>
                Contact Us
              </h1>
              <p style={{ margin: 0, color: '#44607F', fontSize: '17px' }}>
                Questions about registration or your account? Reach out and we will respond.
              </p>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '28px' }}>
              <div style={{ flex: '1 1 220px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <div style={{ fontWeight: 700 }}>Address</div>
                  <div style={{ color: '#44607F' }}>Adama, Ethiopia</div>
                </div>
                <div>
                  <div style={{ fontWeight: 700 }}>Phone</div>
                  <div style={{ color: '#44607F' }}>+251903852218</div>
                </div>
                <div>
                  <div style={{ fontWeight: 700 }}>Email</div>
                  <div style={{ color: '#44607F' }}>athronos21@gmail.com</div>
                </div>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  showToast('Thank you! Your message has been sent.', 'success');
                  setContactName('');
                  setContactEmail('');
                  setContactMessage('');
                }}
                style={{ flex: '2 1 320px', display: 'flex', flexDirection: 'column', gap: '14px' }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label htmlFor="c-name" style={{ fontWeight: 700, fontSize: '14px' }}>Your name</label>
                  <input
                    id="c-name"
                    type="text"
                    required
                    placeholder="Full name"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    style={{ minHeight: '50px', padding: '0 16px', borderRadius: '12px', border: '1.5px solid #BCD3EE', font: 'inherit', fontSize: '16px', boxSizing: 'border-box', width: '100%', background: '#FFFFFF', color: '#0A2A52' }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label htmlFor="c-email" style={{ fontWeight: 700, fontSize: '14px' }}>Email</label>
                  <input
                    id="c-email"
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    style={{ minHeight: '50px', padding: '0 16px', borderRadius: '12px', border: '1.5px solid #BCD3EE', font: 'inherit', fontSize: '16px', boxSizing: 'border-box', width: '100%', background: '#FFFFFF', color: '#0A2A52' }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label htmlFor="c-msg" style={{ fontWeight: 700, fontSize: '14px' }}>Message</label>
                  <textarea
                    id="c-msg"
                    rows={4}
                    required
                    placeholder="How can we help?"
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    style={{ padding: '14px 16px', borderRadius: '12px', border: '1.5px solid #BCD3EE', font: 'inherit', fontSize: '16px', boxSizing: 'border-box', width: '100%', resize: 'vertical' }}
                  />
                </div>

                <button
                  type="submit"
                  style={{ minHeight: '54px', borderRadius: '14px', border: 0, background: '#0070BA', color: '#FFFFFF', font: 'inherit', fontWeight: 700, fontSize: '16px', cursor: 'pointer' }}
                >
                  Send message
                </button>
              </form>
            </div>
          </div>
        </main>
      )}

      {/* ========================================================================= */}
      {/* 8. VIEW: REGISTERED DRUG STORE DEDICATED LANDING PAGE                     */}
      {/* ========================================================================= */}
      {view === 'registered_store' && (
        <main style={{ width: '100%', maxWidth: '1600px', margin: '0 auto', padding: '32px clamp(20px, 3vw, 48px) 96px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: '32px', flex: 1 }}>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <a
              href="#top"
              onClick={(e) => { e.preventDefault(); navigateTo('home'); }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', minHeight: '44px', fontWeight: 700, color: '#0070BA', textDecoration: 'none' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0070BA" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>
              Back to national platform
            </a>

            <span style={{ background: '#E6F3FB', color: '#0070BA', padding: '6px 14px', borderRadius: '999px', fontSize: '13px', fontWeight: 700 }}>
              Mode: 'REGISTERED_STORE'
            </span>
          </div>

          {/* STORE HERO BANNER */}
          <div style={{ background: '#0070BA', color: '#FFFFFF', borderRadius: '28px', padding: '40px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '28px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '640px' }}>
              <span style={{ background: 'rgba(255,255,255,0.2)', alignSelf: 'flex-start', padding: '4px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                EFDA Certified Community Drug Store
              </span>
              <h1 style={{ margin: 0, fontFamily: "'Bricolage Grotesque', Arial, sans-serif", fontWeight: 800, fontSize: '38px', letterSpacing: '-0.02em' }}>
                {registeredStore?.storeName || 'Kaziniya Drug Store'}
              </h1>
              <p style={{ margin: 0, color: '#CFE2F8', fontSize: '16px' }}>
                Proprietor: <strong style={{ color: '#FFFFFF' }}>{registeredStore?.ownerName || 'Kaziniya Ahmed'}</strong> • License: {registeredStore?.efdaLicense || 'EFDA/DISP/AA/2026/8492'} • TIN: {registeredStore?.tinNumber || '0098234123'}
              </p>
              <span style={{ fontSize: '14px', color: '#BFE0FF' }}>
                📍 {registeredStore?.streetAddress || 'Adama, Ethiopia'} • 🕒 {registeredStore?.operatingHours || 'Open 24/7 (365 Days)'}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minWidth: '220px' }}>
              <button
                type="button"
                onClick={onOpenDashboard}
                style={{ background: '#4DA8FF', color: '#0A2A52', border: 0, padding: '14px 20px', borderRadius: '12px', font: 'inherit', fontWeight: 700, fontSize: '15px', cursor: 'pointer' }}
              >
                Launch Store Dashboard →
              </button>
              <button
                type="button"
                onClick={() => handleSimulatedRoleLogin('PHARMACIST')}
                style={{ background: '#FFFFFF', color: '#0070BA', border: 0, padding: '14px 20px', borderRadius: '12px', font: 'inherit', fontWeight: 700, fontSize: '15px', cursor: 'pointer' }}
              >
                Open POS Terminal
              </button>
            </div>
          </div>

          {/* STORE OWNER PHARMACIST AUTHORIZATION HUB */}
          <div style={{ background: '#FFFFFF', border: '1px solid #D2E3F6', borderRadius: '28px', padding: '36px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h2 style={{ margin: '0 0 6px', fontFamily: "'Bricolage Grotesque', Arial, sans-serif", fontWeight: 800, fontSize: '26px' }}>
                  Create & Authorize Pharmacist Accounts
                </h2>
                <p style={{ margin: 0, color: '#44607F', fontSize: '15px' }}>
                  As the Drug Store Owner, you can authorize licensed pharmacists, issue counter IDs, and configure dispensing permissions.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsPharmacistModalOpen(true)}
                style={{ background: '#0070BA', color: '#FFFFFF', border: 0, padding: '14px 24px', borderRadius: '12px', font: 'inherit', fontWeight: 700, fontSize: '15px', cursor: 'pointer' }}
              >
                + Authorize New Pharmacist
              </button>
            </div>

            {/* AUTHORIZED PHARMACIST ROSTER */}
            <div style={{ borderTop: '1px solid #E6F3FB', paddingTop: '20px' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 700, color: '#0A2A52' }}>
                Authorized Dispensary Staff Roster ({authorizedPharmacists.length + 1} Licensed Staff)
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                
                {/* Default Pharmacist */}
                <div style={{ background: '#F8FAFC', border: '1px solid #D2E3F6', borderRadius: '18px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                  <div>
                    <strong style={{ display: 'block', fontSize: '16px', color: '#0A2A52' }}>Monet Alemayehu</strong>
                    <span style={{ fontSize: '13px', color: '#44607F', display: 'block' }}>Lic: EFDA/PH/2024/918 • ID: EMP-PHARM-01</span>
                    <span style={{ fontSize: '12px', color: '#0070BA', fontWeight: 700 }}>Station: Counter 1 (Outpatient)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSimulatedRoleLogin('PHARMACIST')}
                    style={{ background: '#0070BA', color: '#FFFFFF', border: 0, padding: '8px 14px', borderRadius: '8px', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}
                  >
                    Login Staff
                  </button>
                </div>

                {/* Dynamically authorized pharmacists */}
                {authorizedPharmacists.map((ph) => (
                  <div key={ph.id} style={{ background: '#F8FAFC', border: '1px solid #D2E3F6', borderRadius: '18px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                    <div>
                      <strong style={{ display: 'block', fontSize: '16px', color: '#0A2A52' }}>{ph.name}</strong>
                      <span style={{ fontSize: '13px', color: '#44607F', display: 'block' }}>Lic: {ph.licenseNumber || 'Active'} • ID: {ph.employeeId}</span>
                      <span style={{ fontSize: '12px', color: '#0070BA', fontWeight: 700 }}>Station: {ph.department || 'Counter 2 (Inpatient)'}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (onLoginSuccess) onLoginSuccess(ph);
                        showToast(`Logged in as Pharmacist ${ph.name}`, 'success');
                      }}
                      style={{ background: '#0070BA', color: '#FFFFFF', border: 0, padding: '8px 14px', borderRadius: '8px', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}
                    >
                      Login Staff
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      )}

      {/* ========================================================================= */}
      {/* 9. VIEW: REGISTERED SUPPLIER DEDICATED LANDING PAGE                       */}
      {/* ========================================================================= */}
      {view === 'registered_supplier' && (
        <main style={{ width: '100%', maxWidth: '1600px', margin: '0 auto', padding: '32px clamp(20px, 3vw, 48px) 96px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: '32px', flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <a
              href="#top"
              onClick={(e) => { e.preventDefault(); navigateTo('home'); }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', minHeight: '44px', fontWeight: 700, color: '#0070BA', textDecoration: 'none' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0070BA" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>
              Back to national platform
            </a>

            <span style={{ background: '#E6F3FB', color: '#0070BA', padding: '6px 14px', borderRadius: '999px', fontSize: '13px', fontWeight: 700 }}>
              Mode: 'REGISTERED_SUPPLIER'
            </span>
          </div>

          <div style={{ background: '#0A2A52', color: '#FFFFFF', borderRadius: '28px', padding: '40px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '28px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '640px' }}>
              <span style={{ background: 'rgba(255,255,255,0.15)', alignSelf: 'flex-start', padding: '4px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                EFDA Wholesale Distributor Node
              </span>
              <h1 style={{ margin: 0, fontFamily: "'Bricolage Grotesque', Arial, sans-serif", fontWeight: 800, fontSize: '38px', letterSpacing: '-0.02em' }}>
                {registeredSupplier?.name || 'MedTech Pharmaceutical Wholesalers'}
              </h1>
              <p style={{ margin: 0, color: '#BCD3F0', fontSize: '16px' }}>
                Contact Person: <strong style={{ color: '#FFFFFF' }}>{registeredSupplier?.contactPerson || 'Supplier'}</strong> • Wholesale License: {registeredSupplier?.licenseNumber || 'EFDA/WHL/2026/041'}
              </p>
              <span style={{ fontSize: '14px', color: '#CFE2F8' }}>
                🏭 {registeredSupplier?.address || 'Kality Industrial Zone, Addis Ababa'} • 📞 {registeredSupplier?.phone || '+251 11 434 8899'}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minWidth: '220px' }}>
              <button
                type="button"
                onClick={onOpenDashboard}
                style={{ background: '#4DA8FF', color: '#0A2A52', border: 0, padding: '14px 20px', borderRadius: '12px', font: 'inherit', fontWeight: 700, fontSize: '15px', cursor: 'pointer' }}
              >
                Wholesale Order Dashboard →
              </button>
              <button
                type="button"
                onClick={onExploreProducts}
                style={{ background: '#FFFFFF', color: '#0A2A52', border: 0, padding: '14px 20px', borderRadius: '12px', font: 'inherit', fontWeight: 700, fontSize: '15px', cursor: 'pointer' }}
              >
                Bulk Medicine Catalog
              </button>
            </div>
          </div>
        </main>
      )}

      {/* ========================================================================= */}
      {/* 10. FOOTER                                                                */}
      {/* ========================================================================= */}
      <footer style={{ marginTop: 'auto', background: '#0A2A52', color: '#BCD3F0' }}>
        
        {/* TOP BANNER */}
        <div style={{ background: '#0070BA', color: '#FFFFFF' }}>
          <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '36px clamp(20px, 3vw, 48px)', boxSizing: 'border-box', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '20px' }}>
            <div style={{ flex: '1 1 320px' }}>
              <div style={{ fontFamily: "'Bricolage Grotesque', Arial, sans-serif", fontWeight: 800, fontSize: '28px', letterSpacing: '-0.01em' }}>
                Join Digital Drug Store today
              </div>
              <div style={{ color: '#CFE2F8', fontSize: '16px' }}>
                Drug stores and suppliers, connected in one secure platform.
              </div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
              <a
                href="#top"
                onClick={(e) => { e.preventDefault(); navigateTo('store'); }}
                style={{ background: '#FFFFFF', color: '#0070BA', padding: '14px 24px', borderRadius: '12px', fontWeight: 700, textDecoration: 'none' }}
              >
                Register Your Drug Store
              </a>
              <a
                href="#top"
                onClick={(e) => { e.preventDefault(); navigateTo('supplier'); }}
                style={{ border: '2px solid #FFFFFF', color: '#FFFFFF', padding: '12px 24px', borderRadius: '12px', fontWeight: 700, textDecoration: 'none' }}
              >
                Register As Supplier
              </a>
            </div>
          </div>
        </div>

        {/* LOWER FOOTER */}
        <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '56px clamp(20px, 3vw, 48px) 32px', boxSizing: 'border-box', display: 'flex', flexWrap: 'wrap', gap: '40px' }}>
          <div style={{ flex: '2 1 300px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#0070BA', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" aria-hidden="true"><path d="M12 4v16M4 12h16"/></svg>
              </span>
              <span style={{ fontFamily: "'Bricolage Grotesque', Arial, sans-serif", fontWeight: 800, fontSize: '20px', color: '#FFFFFF' }}>
                Digital Drug Store
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '15px', maxWidth: '380px' }}>
              One secure platform connecting drug stores and suppliers for smarter stock, ordering and delivery.
            </p>
          </div>

          <div style={{ flex: '1 1 180px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ color: '#FFFFFF', fontWeight: 700, marginBottom: '4px' }}>Platform</div>
            <a href="#top" onClick={(e) => { e.preventDefault(); navigateTo('store'); }} style={{ color: '#BCD3F0', fontSize: '15px', textDecoration: 'none' }}>Register Your Drug Store</a>
            <a href="#top" onClick={(e) => { e.preventDefault(); navigateTo('supplier'); }} style={{ color: '#BCD3F0', fontSize: '15px', textDecoration: 'none' }}>Register As Supplier</a>
            <a href="#top" onClick={(e) => { e.preventDefault(); navigateTo('login'); }} style={{ color: '#BCD3F0', fontSize: '15px', textDecoration: 'none' }}>Login</a>
          </div>

          <div style={{ flex: '1 1 180px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ color: '#FFFFFF', fontWeight: 700, marginBottom: '4px' }}>Company</div>
            <a href="#top" onClick={(e) => { e.preventDefault(); navigateTo('about'); }} style={{ color: '#BCD3F0', fontSize: '15px', textDecoration: 'none' }}>About Digital Drug Store</a>
            <a href="#top" onClick={(e) => { e.preventDefault(); navigateTo('contact'); }} style={{ color: '#BCD3F0', fontSize: '15px', textDecoration: 'none' }}>Contact Us</a>
            {onOpenDocumentation && (
              <a href="#top" onClick={(e) => { e.preventDefault(); onOpenDocumentation(); }} style={{ color: '#BCD3F0', fontSize: '15px', textDecoration: 'none' }}>Academic Report (.docx)</a>
            )}
            <a href="#" style={{ color: '#BCD3F0', fontSize: '15px', textDecoration: 'none' }}>Privacy Policy</a>
            <a href="#" style={{ color: '#BCD3F0', fontSize: '15px', textDecoration: 'none' }}>Terms of Use</a>
          </div>

          <div id="contact" style={{ flex: '1 1 220px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ color: '#FFFFFF', fontWeight: 700, marginBottom: '4px' }}>Contact</div>
            <span style={{ fontSize: '15px' }}>Adama, Ethiopia</span>
            <span style={{ fontSize: '15px' }}>+251903852218</span>
            <span style={{ fontSize: '15px' }}>athronos21@gmail.com</span>
          </div>
        </div>

        <div style={{ borderTop: '1px solid #1F4A80' }}>
          <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '20px clamp(20px, 3vw, 48px)', boxSizing: 'border-box', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '8px 24px', fontSize: '14px' }}>
            <span>© 2026 Digital Drug Store. All rights reserved.</span>
            <span>Authorized pharmacies and suppliers only.</span>
          </div>
        </div>
      </footer>

      {/* MODALS */}
      <OwnerRegistrationModal
        isOpen={isOwnerModalOpen}
        onClose={() => setIsOwnerModalOpen(false)}
        onSuccess={(owner, store) => {
          setRegisteredStore(store);
          setView('registered_store');
        }}
        onOpenPosTerminal={() => {
          setIsOwnerModalOpen(false);
          handleSimulatedRoleLogin('PHARMACIST');
        }}
        onViewStorefront={() => {
          setIsOwnerModalOpen(false);
          setView('registered_store');
        }}
      />

      <SupplierRegistrationModal
        isOpen={isSupplierModalOpen}
        onClose={() => setIsSupplierModalOpen(false)}
        onSuccess={(supplier) => {
          setRegisteredSupplier(supplier);
          setView('registered_supplier');
        }}
      />

      <PharmacistAuthorizationModal
        isOpen={isPharmacistModalOpen}
        onClose={() => setIsPharmacistModalOpen(false)}
        pharmacyProfile={registeredStore}
        onSuccess={handlePharmacistAuthorized}
        onInstantLogin={(ph) => {
          setIsPharmacistModalOpen(false);
          if (onLoginSuccess) onLoginSuccess(ph);
        }}
      />
    </div>
  );
};
