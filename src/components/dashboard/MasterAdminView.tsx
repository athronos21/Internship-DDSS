import React, { useState, useEffect } from 'react';
import { User, PharmacyStoreProfile } from '../../types';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { useToast } from '../../context/ToastContext';
import {
  Shield,
  Building2,
  Users,
  Store,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileCheck,
  TrendingUp,
  Activity,
  Server,
  Database,
  Lock,
  Search,
  Filter,
  Eye,
  Key,
  Globe,
  PlusCircle,
  Pill,
  DollarSign,
  Layers,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Zap,
  Cpu,
  RefreshCw,
  Sliders,
  Send,
  BadgeCheck,
  X,
  Download,
  AlertOctagon,
  Radio,
  FileText,
  Smartphone,
  MapPin,
  Phone,
  Mail,
  Edit,
  Trash2,
  Check,
  SlidersHorizontal,
  ChevronRight,
  ChevronDown,
  TrendingDown,
  Info,
  BarChart3,
  ShieldAlert,
  Terminal,
  FileSpreadsheet,
  History,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { PharmacyAnalyticsView } from './PharmacyAnalyticsView';

export type MasterAdminTab =
  | 'HUB'
  | 'NODES'
  | 'ANALYTICS'
  | 'COMPLIANCE'
  | 'GLOBAL_CATALOG'
  | 'FINANCIALS'
  | 'STAFF'
  | 'SYSTEM_HEALTH';

interface MasterAdminViewProps {
  initialSubTab?: MasterAdminTab;
  initialSubFilter?: string;
  onSwitchToStoreWorkstation?: (storeId?: string, targetView?: string) => void;
  onOpenOwnerRegistration?: () => void;
  currentUser: User;
}

export interface PharmacyNode {
  id: string;
  storeName: string;
  storeType: string;
  tinNumber: string;
  efdaLicense: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  city: string;
  subcity: string;
  status: 'ACTIVE' | 'PENDING_REVIEW' | 'MAINTENANCE' | 'SUSPENDED';
  activeStaffCount: number;
  monthlyGmv: number;
  skuCount: number;
  coldChainReady: boolean;
  is24Hours: boolean;
  deliveryAvailable: boolean;
  registeredAt: string;
  lastActive: string;
}

export interface MasterCatalogItem {
  id: string;
  brandName: string;
  genericName: string;
  efdaCode: string;
  therapeuticClass: string;
  dosageForm: string;
  strength: string;
  maxRetailPrice: number;
  isControlled: boolean;
  requiresColdChain: boolean;
  nationalShortageRisk: 'NONE' | 'LOW' | 'CRITICAL';
  registeredCount: number;
}

export interface BatchRecallNotice {
  id: string;
  drugName: string;
  batchNumber: string;
  manufacturer: string;
  issueReason: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  recalledAt: string;
  status: 'ACTIVE_LOCK' | 'RESOLVED';
  affectedStoresCount: number;
}

export interface GlobalStaffMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  storeName: string;
  storeId: string;
  efdaLicenseNumber?: string;
  status: 'ACTIVE' | 'LOCKED' | 'PENDING';
  lastSeen: string;
}

export const MasterAdminView: React.FC<MasterAdminViewProps> = ({
  initialSubTab = 'HUB',
  initialSubFilter,
  onSwitchToStoreWorkstation,
  onOpenOwnerRegistration,
  currentUser,
}) => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<MasterAdminTab>(initialSubTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'ALL' | 'ACTIVE' | 'PENDING_REVIEW' | 'MAINTENANCE'>('ALL');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastPriority, setBroadcastPriority] = useState<'STANDARD' | 'URGENT' | 'EMERGENCY'>('STANDARD');
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [serverLatency, setServerLatency] = useState(22);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Sub-tabs state inside each dynamic window
  const [nodesSubTab, setNodesSubTab] = useState<'ALL' | 'PENDING' | 'ACTIVE' | 'MAINTENANCE'>('ALL');
  const [complianceSubTab, setComplianceSubTab] = useState<'LICENSES' | 'RECALLS'>('LICENSES');
  const [catalogSubTab, setCatalogSubTab] = useState<'ALL' | 'SHORTAGES' | 'PRICE_CEILINGS'>('ALL');
  const [financialsSubTab, setFinancialsSubTab] = useState<'GMV' | 'SETTLEMENTS'>('GMV');
  const [staffSubTab, setStaffSubTab] = useState<'DIRECTORY' | 'RBAC'>('DIRECTORY');
  const [systemHealthSubTab, setSystemHealthSubTab] = useState<'BROADCAST' | 'TELEMETRY'>('BROADCAST');

  // Modals state
  const [inspectNode, setInspectNode] = useState<PharmacyNode | null>(null);
  const [editingNode, setEditingNode] = useState<PharmacyNode | null>(null);
  const [nodeEditForm, setNodeEditForm] = useState({
    storeName: '',
    ownerName: '',
    ownerEmail: '',
    ownerPhone: '',
    city: '',
    subcity: '',
    tinNumber: '',
    efdaLicense: '',
    status: 'ACTIVE' as PharmacyNode['status'],
    coldChainReady: false,
    is24Hours: false,
  });
  const [isNewRecallModalOpen, setIsNewRecallModalOpen] = useState(false);
  const [isAddCatalogModalOpen, setIsAddCatalogModalOpen] = useState(false);
  const [recallsFilter, setRecallsFilter] = useState<'ALL' | 'ACTIVE' | 'RESOLVED'>('ALL');
  const [staffSearchQuery, setStaffSearchQuery] = useState('');
  const [staffRoleFilter, setStaffRoleFilter] = useState<string>('ALL');
  const [isDiagnosticsRunning, setIsDiagnosticsRunning] = useState(false);
  const [diagnosticsCompleted, setDiagnosticsCompleted] = useState(false);

  // Super Admin Platform Governance State
  const [systemAlertLevel, setSystemAlertLevel] = useState<'NORMAL' | 'ELEVATED' | 'CRITICAL'>('NORMAL');
  const [isEmergencyLockdownModalOpen, setIsEmergencyLockdownModalOpen] = useState(false);
  const [lockdownTargetNode, setLockdownTargetNode] = useState<PharmacyNode | null>(null);
  const [lockdownReason, setLockdownReason] = useState('EFDA Regulatory Audit Quarantine');
  const [isExportDossierModalOpen, setIsExportDossierModalOpen] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState('ALL');
  const [isDirectivesMenuOpen, setIsDirectivesMenuOpen] = useState(false);

  // Super Admin Real-Time Audit Trail
  const [adminAuditTrail, setAdminAuditTrail] = useState<Array<{
    id: string;
    timestamp: string;
    actor: string;
    action: string;
    facility: string;
    category: 'EFDA_REGULATORY' | 'CONTROLLED_SUBSTANCE' | 'PRICE_CEILING' | 'SETTLEMENT' | 'NODE_HEALTH';
    severity: 'NORMAL' | 'WARNING' | 'CRITICAL';
    hash: string;
  }>>([
    {
      id: 'aud-01',
      timestamp: '01:34:12 EAT',
      actor: 'Pharm. Abebe L. (LIC-AA-8891)',
      action: 'Verified Schedule II Ketamine 50mg Dispensation (Rx-2026-901)',
      facility: 'Arada Clinical & Emergency Pharmacy',
      category: 'CONTROLLED_SUBSTANCE',
      severity: 'WARNING',
      hash: 'sha256:7f90..11a2',
    },
    {
      id: 'aud-02',
      timestamp: '01:28:50 EAT',
      actor: 'Telemetry Cold-Chain Bot',
      action: 'Cold-Chain Refrigerator Sensor 1 recovered to 3.8°C (Normal Range)',
      facility: 'Hawassa Referral Community Drug Store',
      category: 'NODE_HEALTH',
      severity: 'NORMAL',
      hash: 'sha256:4b82..cc91',
    },
    {
      id: 'aud-03',
      timestamp: '01:15:02 EAT',
      actor: 'National Clearinghouse (ERCA/CBE)',
      action: 'Telebirr Multi-Store Batch Settlement Cleared (ETB 185,200.00)',
      facility: 'Kaziniya Flagship Store & Health Center',
      category: 'SETTLEMENT',
      severity: 'NORMAL',
      hash: 'sha256:91d2..ef30',
    },
    {
      id: 'aud-04',
      timestamp: '00:54:19 EAT',
      actor: 'EFDA Central Gateway',
      action: 'Automated Price Ceiling Check Verified across 1,420 National SKUs',
      facility: 'All 6 Network Nodes',
      category: 'PRICE_CEILING',
      severity: 'NORMAL',
      hash: 'sha256:1a2c..84bb',
    },
    {
      id: 'aud-05',
      timestamp: 'Yesterday 22:40 EAT',
      actor: 'Super Admin Council',
      action: 'Emergency Recall Quarantine Activated for Paracetamol Syrup Batch ETH-991',
      facility: 'National Mesh (All Nodes)',
      category: 'EFDA_REGULATORY',
      severity: 'CRITICAL',
      hash: 'sha256:ee01..59f4',
    },
  ]);

  // Broadcast History state
  const [broadcastLogs, setBroadcastLogs] = useState<Array<{
    id: string;
    message: string;
    priority: 'STANDARD' | 'URGENT' | 'EMERGENCY';
    timestamp: string;
    nodesCount: number;
    sender: string;
  }>>([
    {
      id: 'bc-1',
      message: 'Urgent: EFDA nationwide quarantine alert issued for Paracetamol Syrup Batch-2026-ETH-991. Check shelf stock.',
      priority: 'EMERGENCY',
      timestamp: 'Today, 09:30 AM',
      nodesCount: 6,
      sender: 'Super Admin Council',
    },
    {
      id: 'bc-2',
      message: 'Notice: Monthly CBE & Telebirr 15% VAT settlement reconciliation cycle opens at 18:00 EAT.',
      priority: 'STANDARD',
      timestamp: 'Yesterday, 14:15 PM',
      nodesCount: 6,
      sender: 'National Treasury',
    },
  ]);

  // Sync initialSubTab and initialSubFilter if parent changes it
  useEffect(() => {
    if (initialSubTab) {
      setActiveTab(initialSubTab);
    }
    if (initialSubFilter) {
      if (initialSubFilter === 'PENDING' || initialSubFilter === 'master_nodes_pending') {
        setNodesSubTab('PENDING');
        setSelectedStatusFilter('PENDING_REVIEW');
      } else if (initialSubFilter === 'ACTIVE') {
        setNodesSubTab('ACTIVE');
        setSelectedStatusFilter('ACTIVE');
      } else if (initialSubFilter === 'ALL' || initialSubFilter === 'master_nodes_list') {
        setNodesSubTab('ALL');
        setSelectedStatusFilter('ALL');
      } else if (initialSubFilter === 'LICENSES' || initialSubFilter === 'master_efda_licenses') {
        setComplianceSubTab('LICENSES');
      } else if (initialSubFilter === 'RECALL' || initialSubFilter === 'RECALLS' || initialSubFilter === 'master_recalls') {
        setComplianceSubTab('RECALLS');
      } else if (initialSubFilter === 'SHORTAGE' || initialSubFilter === 'SHORTAGES' || initialSubFilter === 'master_shortages') {
        setCatalogSubTab('SHORTAGES');
        setSearchQuery('Critical Shortage');
      } else if (initialSubFilter === 'PRICE_CEILINGS' || initialSubFilter === 'master_price_ceilings') {
        setCatalogSubTab('PRICE_CEILINGS');
        setSearchQuery('');
      } else if (initialSubFilter === 'ANALYTICS' || initialSubFilter === 'master_analytics') {
        setActiveTab('ANALYTICS');
      } else if (initialSubFilter === 'GMV' || initialSubFilter === 'master_gmv') {
        setFinancialsSubTab('GMV');
      } else if (initialSubFilter === 'SETTLEMENTS' || initialSubFilter === 'master_settlements') {
        setFinancialsSubTab('SETTLEMENTS');
      } else if (initialSubFilter === 'DIRECTORY' || initialSubFilter === 'master_staff_all') {
        setStaffSubTab('DIRECTORY');
      } else if (initialSubFilter === 'RBAC' || initialSubFilter === 'master_staff_rbac') {
        setStaffSubTab('RBAC');
      } else if (initialSubFilter === 'BROADCAST' || initialSubFilter === 'master_broadcast') {
        setSystemHealthSubTab('BROADCAST');
      } else if (initialSubFilter === 'TELEMETRY' || initialSubFilter === 'master_telemetry') {
        setSystemHealthSubTab('TELEMETRY');
      } else {
        setSelectedStatusFilter('ALL');
        setSearchQuery('');
      }
    }
  }, [initialSubTab, initialSubFilter]);

  // Pharmacy Fleet dataset across Ethiopia
  const [pharmacyFleet, setPharmacyFleet] = useState<PharmacyNode[]>([
    {
      id: 'node-01',
      storeName: 'Kaziniya Flagship Store & Health Center',
      storeType: 'COMMUNITY_DRUG_STORE',
      tinNumber: '0098234123',
      efdaLicense: 'EFDA/DISP/AA/2024/8492',
      ownerName: 'Kaziniya Ahmed',
      ownerEmail: 'kaziniya@kaziniya.com',
      ownerPhone: '+251 911 234 567',
      city: 'Addis Ababa',
      subcity: 'Bole Subcity',
      status: 'ACTIVE',
      activeStaffCount: 8,
      monthlyGmv: 1845000,
      skuCount: 420,
      coldChainReady: true,
      is24Hours: true,
      deliveryAvailable: true,
      registeredAt: '2026-01-01',
      lastActive: 'Just now',
    },
    {
      id: 'node-02',
      storeName: 'Selam Community Pharmacy & Biologicals',
      storeType: 'COMMUNITY_DRUG_STORE',
      tinNumber: '0047812903',
      efdaLicense: 'EFDA/DISP/AA/2025/1042',
      ownerName: 'Dr. Yohannes Tadesse, Pharm.D',
      ownerEmail: 'yohannes@selampharmacy.et',
      ownerPhone: '+251 911 889 001',
      city: 'Addis Ababa',
      subcity: 'Yeka Subcity',
      status: 'ACTIVE',
      activeStaffCount: 5,
      monthlyGmv: 980000,
      skuCount: 310,
      coldChainReady: true,
      is24Hours: false,
      deliveryAvailable: true,
      registeredAt: '2026-02-14',
      lastActive: '2 mins ago',
    },
    {
      id: 'node-03',
      storeName: 'Arada Clinical & Emergency Pharmacy',
      storeType: 'SPECIALTY_PHARMACY',
      tinNumber: '0032901844',
      efdaLicense: 'EFDA/DISP/AA/2026/0411',
      ownerName: 'Pharm. Meron Haile',
      ownerEmail: 'meron@aradapharm.et',
      ownerPhone: '+251 922 456 789',
      city: 'Addis Ababa',
      subcity: 'Arada Subcity',
      status: 'ACTIVE',
      activeStaffCount: 6,
      monthlyGmv: 1240000,
      skuCount: 380,
      coldChainReady: true,
      is24Hours: true,
      deliveryAvailable: false,
      registeredAt: '2026-03-10',
      lastActive: '5 mins ago',
    },
    {
      id: 'node-04',
      storeName: 'Hawassa Central Medical Dispensary',
      storeType: 'COMMUNITY_DRUG_STORE',
      tinNumber: '0089123456',
      efdaLicense: 'EFDA/DISP/SNNPR/2026/9021',
      ownerName: 'Dr. Dawit Bekele',
      ownerEmail: 'dawit@hawassamed.et',
      ownerPhone: '+251 946 789 012',
      city: 'Hawassa',
      subcity: 'Piazza District',
      status: 'PENDING_REVIEW',
      activeStaffCount: 4,
      monthlyGmv: 450000,
      skuCount: 190,
      coldChainReady: false,
      is24Hours: false,
      deliveryAvailable: false,
      registeredAt: '2026-08-18',
      lastActive: '18 mins ago',
    },
    {
      id: 'node-05',
      storeName: 'Adama Express Rx & Vaccines Depot',
      storeType: 'HOSPITAL_ADJACENT_PHARMACY',
      tinNumber: '0071239088',
      efdaLicense: 'EFDA/DISP/OROMIA/2026/3310',
      ownerName: 'Pharm. Tigist Assefa',
      ownerEmail: 'tigist@adamaexpress.et',
      ownerPhone: '+251 933 567 890',
      city: 'Adama',
      subcity: 'Hospital Road',
      status: 'ACTIVE',
      activeStaffCount: 7,
      monthlyGmv: 1650000,
      skuCount: 340,
      coldChainReady: true,
      is24Hours: true,
      deliveryAvailable: true,
      registeredAt: '2026-04-05',
      lastActive: '1 min ago',
    },
    {
      id: 'node-06',
      storeName: 'Dire Dawa Red Cross Partner Pharmacy',
      storeType: 'RETAIL_PHARMACY',
      tinNumber: '0054321980',
      efdaLicense: 'EFDA/DISP/DD/2025/1190',
      ownerName: 'Dr. Solomon Girma',
      ownerEmail: 'solomon@diredawamed.et',
      ownerPhone: '+251 925 112 233',
      city: 'Dire Dawa',
      subcity: 'Kebele 02 Central',
      status: 'ACTIVE',
      activeStaffCount: 6,
      monthlyGmv: 1120000,
      skuCount: 290,
      coldChainReady: true,
      is24Hours: true,
      deliveryAvailable: true,
      registeredAt: '2026-05-12',
      lastActive: '8 mins ago',
    },
  ]);

  // Master Drug Catalog dataset
  const [masterCatalog, setMasterCatalog] = useState<MasterCatalogItem[]>([
    {
      id: 'mc-01',
      brandName: 'Amoxil 500mg',
      genericName: 'Amoxicillin Trihydrate',
      efdaCode: 'EFDA-MED-00291',
      therapeuticClass: 'Antibiotic / Penicillin',
      dosageForm: 'Capsule',
      strength: '500 mg',
      maxRetailPrice: 320,
      isControlled: false,
      requiresColdChain: false,
      nationalShortageRisk: 'NONE',
      registeredCount: 6,
    },
    {
      id: 'mc-02',
      brandName: 'Humalog Mix 50/50 KwikPen',
      genericName: 'Insulin Lispro Protamine',
      efdaCode: 'EFDA-MED-09812',
      therapeuticClass: 'Antidiabetic / Biological',
      dosageForm: 'Injectable Suspension',
      strength: '100 units/mL',
      maxRetailPrice: 1450,
      isControlled: false,
      requiresColdChain: true,
      nationalShortageRisk: 'CRITICAL',
      registeredCount: 4,
    },
    {
      id: 'mc-03',
      brandName: 'Augmentin 625mg',
      genericName: 'Amoxicillin + Clavulanic Acid',
      efdaCode: 'EFDA-MED-00344',
      therapeuticClass: 'Broad-Spectrum Antibacterial',
      dosageForm: 'Film-Coated Tablet',
      strength: '500/125 mg',
      maxRetailPrice: 850,
      isControlled: false,
      requiresColdChain: false,
      nationalShortageRisk: 'LOW',
      registeredCount: 6,
    },
    {
      id: 'mc-04',
      brandName: 'Tramadol HCl 50mg',
      genericName: 'Tramadol Hydrochloride',
      efdaCode: 'EFDA-MED-04410',
      therapeuticClass: 'Opioid Analgesic (Schedule II)',
      dosageForm: 'Capsule',
      strength: '50 mg',
      maxRetailPrice: 180,
      isControlled: true,
      requiresColdChain: false,
      nationalShortageRisk: 'NONE',
      registeredCount: 5,
    },
    {
      id: 'mc-05',
      brandName: 'Norvasc 5mg',
      genericName: 'Amlodipine Besylate',
      efdaCode: 'EFDA-MED-01209',
      therapeuticClass: 'Antihypertensive / CCB',
      dosageForm: 'Tablet',
      strength: '5 mg',
      maxRetailPrice: 420,
      isControlled: false,
      requiresColdChain: false,
      nationalShortageRisk: 'NONE',
      registeredCount: 6,
    },
    {
      id: 'mc-06',
      brandName: 'Ceftriaxone 1g Vial',
      genericName: 'Ceftriaxone Sodium for Injection',
      efdaCode: 'EFDA-MED-00912',
      therapeuticClass: 'Cephalosporin Antibiotic',
      dosageForm: 'Sterile Powder for Injection',
      strength: '1 g',
      maxRetailPrice: 390,
      isControlled: false,
      requiresColdChain: false,
      nationalShortageRisk: 'CRITICAL',
      registeredCount: 5,
    },
  ]);

  // Batch Recall Notices
  const [recalls, setRecalls] = useState<BatchRecallNotice[]>([
    {
      id: 'rec-01',
      drugName: 'Paracetamol Pediatric Syrup 120mg/5ml',
      batchNumber: 'BATCH-2026-ETH-991',
      manufacturer: 'Local Pharma Corp Ltd',
      issueReason: 'Diethylene glycol impurity trace detected during EFDA routine market surveillance.',
      severity: 'CRITICAL',
      recalledAt: '2026-08-20',
      status: 'ACTIVE_LOCK',
      affectedStoresCount: 3,
    },
    {
      id: 'rec-02',
      drugName: 'Metformin 500mg SR Tablets',
      batchNumber: 'BATCH-MET-8842',
      manufacturer: 'Apex Global Formulations',
      issueReason: 'Packaging sealing failure during extreme humidity transit.',
      severity: 'HIGH',
      recalledAt: '2026-08-10',
      status: 'RESOLVED',
      affectedStoresCount: 2,
    },
  ]);

  // Global Staff Roster
  const [globalStaff, setGlobalStaff] = useState<GlobalStaffMember[]>([
    {
      id: 'st-00',
      name: 'Beka Girma',
      email: 'beka.girma@gmail.com',
      phone: '+251 911 000 002',
      role: 'SUPER_ADMIN',
      storeName: 'National Fleet Governance Cockpit',
      storeId: 'node-fleet-01',
      efdaLicenseNumber: 'EFDA-GOV-SYS-002',
      status: 'ACTIVE',
      lastSeen: 'Active Now',
    },
    {
      id: 'st-01',
      name: 'Kaziniya Ahmed',
      email: 'kaziniya@kaziniya.com',
      phone: '+251 911 234 567',
      role: 'STORE_OWNER',
      storeName: 'Kaziniya Flagship Store',
      storeId: 'node-01',
      efdaLicenseNumber: 'EFDA-PH-AA-4491',
      status: 'ACTIVE',
      lastSeen: 'Active Now',
    },
    {
      id: 'st-02',
      name: 'Pharm. Helen Kassa',
      email: 'helen@kaziniya.com',
      phone: '+251 911 884 920',
      role: 'PHARMACIST',
      storeName: 'Kaziniya Flagship Store',
      storeId: 'node-01',
      efdaLicenseNumber: 'EFDA-PH-AA-8902',
      status: 'ACTIVE',
      lastSeen: '5 mins ago',
    },
    {
      id: 'st-03',
      name: 'Monet Alemayehu',
      email: 'monet@kaziniya.com',
      phone: '+251 912 345 678',
      role: 'PHARMACIST',
      storeName: 'Kaziniya Flagship Store',
      storeId: 'node-01',
      efdaLicenseNumber: 'EFDA-PH-AA-9931',
      status: 'ACTIVE',
      lastSeen: '12 mins ago',
    },
    {
      id: 'st-04',
      name: 'Dr. Yohannes Tadesse',
      email: 'yohannes@selampharmacy.et',
      phone: '+251 911 889 001',
      role: 'STORE_OWNER',
      storeName: 'Selam Community Pharmacy',
      storeId: 'node-02',
      efdaLicenseNumber: 'EFDA-PH-AA-1092',
      status: 'ACTIVE',
      lastSeen: '2 mins ago',
    },
    {
      id: 'st-05',
      name: 'Pharm. Meron Haile',
      email: 'meron@aradapharm.et',
      phone: '+251 922 456 789',
      role: 'PHARMACIST',
      storeName: 'Arada Clinical Pharmacy',
      storeId: 'node-03',
      efdaLicenseNumber: 'EFDA-PH-AA-7712',
      status: 'ACTIVE',
      lastSeen: 'Just now',
    },
    {
      id: 'st-06',
      name: 'Dr. Dawit Bekele',
      email: 'dawit@hawassamed.et',
      phone: '+251 946 789 012',
      role: 'STORE_OWNER',
      storeName: 'Hawassa Central Dispensary',
      storeId: 'node-04',
      efdaLicenseNumber: 'EFDA-PH-SNNPR-3310',
      status: 'PENDING',
      lastSeen: '1 hour ago',
    },
    {
      id: 'st-07',
      name: 'Supplier',
      email: 'supplier@medtech.com',
      phone: '+251 911 334 455',
      role: 'SUPPLIER',
      storeName: 'MedTech Wholesale Distribution Hub',
      storeId: 'node-sup-01',
      efdaLicenseNumber: 'EFDA-DIST-AA-5501',
      status: 'ACTIVE',
      lastSeen: 'Active Now',
    },
  ]);

  // Form State for New Recall
  const [newRecallForm, setNewRecallForm] = useState({
    drugName: '',
    batchNumber: '',
    manufacturer: '',
    issueReason: '',
    severity: 'CRITICAL' as 'CRITICAL' | 'HIGH' | 'MEDIUM',
  });

  // Form State for Master SKU
  const [newSkuForm, setNewSkuForm] = useState({
    brandName: '',
    genericName: '',
    efdaCode: '',
    therapeuticClass: '',
    dosageForm: 'Tablet',
    strength: '',
    maxRetailPrice: 100,
    isControlled: false,
    requiresColdChain: false,
  });

  // Toggle Node Status
  const handleToggleNodeStatus = (nodeId: string) => {
    setPharmacyFleet((prev) =>
      prev.map((node) => {
        if (node.id === nodeId) {
          const nextStatus = node.status === 'ACTIVE' ? 'MAINTENANCE' : 'ACTIVE';
          showToast(
            `${node.storeName} status updated to ${nextStatus}`,
            nextStatus === 'ACTIVE' ? 'success' : 'info',
            'Tenant Status Changed'
          );
          return { ...node, status: nextStatus };
        }
        return node;
      })
    );
  };

  // Approve Pending License
  const handleApproveNode = (nodeId: string) => {
    setPharmacyFleet((prev) =>
      prev.map((node) => {
        if (node.id === nodeId) {
          showToast(
            `EFDA License verified & node "${node.storeName}" officially activated in the network!`,
            'success',
            'Pharmacy Approved'
          );
          return { ...node, status: 'ACTIVE' };
        }
        return node;
      })
    );
    setGlobalStaff((prev) =>
      prev.map((staff) => (staff.storeId === nodeId ? { ...staff, status: 'ACTIVE' } : staff))
    );
  };

  // Broadcast
  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) return;
    setIsBroadcasting(true);
    setTimeout(() => {
      setIsBroadcasting(false);
      const newLog = {
        id: `bc-${Date.now().toString().slice(-4)}`,
        message: broadcastMessage,
        priority: broadcastPriority,
        timestamp: 'Just now',
        nodesCount: pharmacyFleet.length,
        sender: currentUser?.name || 'Super Admin',
      };
      setBroadcastLogs((prev) => [newLog, ...prev]);
      showToast(
        `[${broadcastPriority}] System announcement dispatched to all ${pharmacyFleet.length} connected pharmacy nodes and POS terminals.`,
        'success',
        'Global Announcement Broadcasted'
      );
      setBroadcastMessage('');
    }, 500);
  };

  // Toggle Recall Status
  const handleToggleRecallStatus = (recallId: string) => {
    setRecalls((prev) =>
      prev.map((rec) => {
        if (rec.id === recallId) {
          const nextStatus = rec.status === 'ACTIVE_LOCK' ? 'RESOLVED' : 'ACTIVE_LOCK';
          showToast(
            nextStatus === 'RESOLVED'
              ? `Batch ${rec.batchNumber} recall marked resolved. POS terminal lock lifted nationwide.`
              : `Batch ${rec.batchNumber} re-quarantined. POS terminal lock reinstated.`,
            nextStatus === 'RESOLVED' ? 'success' : 'error',
            nextStatus === 'RESOLVED' ? 'Recall Quarantine Resolved' : 'Batch Recall Re-activated'
          );
          return { ...rec, status: nextStatus };
        }
        return rec;
      })
    );
  };

  // Node Editing
  const handleStartEditNode = (node: PharmacyNode) => {
    setEditingNode(node);
    setNodeEditForm({
      storeName: node.storeName,
      ownerName: node.ownerName,
      ownerEmail: node.ownerEmail,
      ownerPhone: node.ownerPhone,
      city: node.city,
      subcity: node.subcity,
      tinNumber: node.tinNumber,
      efdaLicense: node.efdaLicense,
      status: node.status,
      coldChainReady: node.coldChainReady,
      is24Hours: node.is24Hours,
    });
  };

  const handleSaveEditNode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNode) return;
    setPharmacyFleet((prev) =>
      prev.map((n) =>
        n.id === editingNode.id
          ? {
              ...n,
              storeName: nodeEditForm.storeName,
              ownerName: nodeEditForm.ownerName,
              ownerEmail: nodeEditForm.ownerEmail,
              ownerPhone: nodeEditForm.ownerPhone,
              city: nodeEditForm.city,
              subcity: nodeEditForm.subcity,
              tinNumber: nodeEditForm.tinNumber,
              efdaLicense: nodeEditForm.efdaLicense,
              status: nodeEditForm.status,
              coldChainReady: nodeEditForm.coldChainReady,
              is24Hours: nodeEditForm.is24Hours,
            }
          : n
      )
    );
    if (inspectNode?.id === editingNode.id) {
      setInspectNode((prev) =>
        prev
          ? {
              ...prev,
              storeName: nodeEditForm.storeName,
              ownerName: nodeEditForm.ownerName,
              ownerEmail: nodeEditForm.ownerEmail,
              ownerPhone: nodeEditForm.ownerPhone,
              city: nodeEditForm.city,
              subcity: nodeEditForm.subcity,
              tinNumber: nodeEditForm.tinNumber,
              efdaLicense: nodeEditForm.efdaLicense,
              status: nodeEditForm.status,
              coldChainReady: nodeEditForm.coldChainReady,
              is24Hours: nodeEditForm.is24Hours,
            }
          : null
      );
    }
    showToast(`Store profile for "${nodeEditForm.storeName}" successfully updated.`, 'success', 'Node Profile Updated');
    setEditingNode(null);
  };

  // Staff Status Toggle
  const handleToggleStaffStatus = (staffId: string) => {
    setGlobalStaff((prev) =>
      prev.map((s) => {
        if (s.id === staffId) {
          const nextStatus = s.status === 'ACTIVE' ? 'LOCKED' : 'ACTIVE';
          showToast(
            `${s.name}'s account ${nextStatus === 'ACTIVE' ? 'activated' : 'locked by Super Admin'}`,
            nextStatus === 'ACTIVE' ? 'success' : 'info',
            'Staff Status Changed'
          );
          return { ...s, status: nextStatus };
        }
        return s;
      })
    );
  };

  // Export Financial Statement CSV
  const handleExportFinancialAuditCsv = () => {
    const headers = ['Store Name', 'City', 'Subcity', 'TIN', 'EFDA License', 'Monthly GMV (ETB)', 'VAT 15% (ETB)', 'Net Revenue (ETB)', 'Status'];
    const rows = pharmacyFleet.map((node) => [
      `"${node.storeName}"`,
      `"${node.city}"`,
      `"${node.subcity}"`,
      `"${node.tinNumber}"`,
      `"${node.efdaLicense}"`,
      node.monthlyGmv.toFixed(2),
      (node.monthlyGmv * 0.15).toFixed(2),
      (node.monthlyGmv * 0.85).toFixed(2),
      `"${node.status}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Teninete_National_GMV_Tax_Audit_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Consolidated national GMV & VAT audit CSV successfully downloaded.', 'success', 'Audit Export Ready');
  };

  // Run Cloud Diagnostics
  const handleRunDiagnostics = () => {
    setIsDiagnosticsRunning(true);
    setDiagnosticsCompleted(false);
    setTimeout(() => {
      setIsDiagnosticsRunning(false);
      setDiagnosticsCompleted(true);
      setServerLatency(Math.floor(18 + Math.random() * 8));
      showToast('System diagnostics complete: All 4 cloud gateways operational (0 errors, 20ms sync).', 'success', 'Diagnostics Passed');
    }, 800);
  };

  // Refresh Real-Time Mesh Telemetry
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setServerLatency(Math.floor(18 + Math.random() * 8));
      showToast('Real-time telemetry updated: All 6 multi-tenant pharmacy nodes operating normally.', 'success', 'Mesh Synced');
    }, 600);
  };

  // Create Recall Notice
  const handleCreateRecall = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRecallForm.drugName || !newRecallForm.batchNumber) return;

    const newNotice: BatchRecallNotice = {
      id: `rec-${Date.now().toString().slice(-4)}`,
      drugName: newRecallForm.drugName,
      batchNumber: newRecallForm.batchNumber,
      manufacturer: newRecallForm.manufacturer || 'Unspecified Manufacturer',
      issueReason: newRecallForm.issueReason,
      severity: newRecallForm.severity,
      recalledAt: new Date().toISOString().split('T')[0],
      status: 'ACTIVE_LOCK',
      affectedStoresCount: pharmacyFleet.length,
    };

    setRecalls((prev) => [newNotice, ...prev]);
    setIsNewRecallModalOpen(false);
    showToast(
      `Emergency recall published! Batch "${newRecallForm.batchNumber}" has been locked across all connected POS terminals nationwide.`,
      'error',
      'National Batch Recall Active'
    );
    setNewRecallForm({
      drugName: '',
      batchNumber: '',
      manufacturer: '',
      issueReason: '',
      severity: 'CRITICAL',
    });
  };

  // Create Master SKU
  const handleCreateMasterSku = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkuForm.brandName || !newSkuForm.genericName) return;

    const newSku: MasterCatalogItem = {
      id: `mc-${Date.now().toString().slice(-4)}`,
      brandName: newSkuForm.brandName,
      genericName: newSkuForm.genericName,
      efdaCode: newSkuForm.efdaCode || `EFDA-MED-${Math.floor(10000 + Math.random() * 90000)}`,
      therapeuticClass: newSkuForm.therapeuticClass || 'General Healthcare',
      dosageForm: newSkuForm.dosageForm,
      strength: newSkuForm.strength,
      maxRetailPrice: Number(newSkuForm.maxRetailPrice),
      isControlled: newSkuForm.isControlled,
      requiresColdChain: newSkuForm.requiresColdChain,
      nationalShortageRisk: 'NONE',
      registeredCount: 0,
    };

    setMasterCatalog((prev) => [newSku, ...prev]);
    setIsAddCatalogModalOpen(false);
    showToast(`Master drug SKU "${newSku.brandName}" added to national index.`, 'success', 'Catalog Updated');
  };

  // Filtered nodes
  const filteredNodes = pharmacyFleet.filter((node) => {
    const matchesSearch =
      node.storeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      node.tinNumber.includes(searchQuery) ||
      node.efdaLicense.toLowerCase().includes(searchQuery.toLowerCase()) ||
      node.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      node.city.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCity = selectedCity === 'ALL' || node.city === selectedCity;
    let matchesStatus = true;
    if (nodesSubTab === 'PENDING') {
      matchesStatus = node.status === 'PENDING_REVIEW';
    } else if (nodesSubTab === 'ACTIVE') {
      matchesStatus = node.status === 'ACTIVE';
    } else if (nodesSubTab === 'MAINTENANCE') {
      matchesStatus = node.status === 'MAINTENANCE';
    } else if (selectedStatusFilter !== 'ALL') {
      matchesStatus = node.status === selectedStatusFilter;
    }
    return matchesSearch && matchesCity && matchesStatus;
  });

  // Fleet Totals
  const totalNetworkGmv = pharmacyFleet.reduce((acc, n) => acc + n.monthlyGmv, 0);
  const totalActiveStaff = pharmacyFleet.reduce((acc, n) => acc + n.activeStaffCount, 0);
  const totalSkuCatalog = pharmacyFleet.reduce((acc, n) => acc + n.skuCount, 0);
  const activeNodesCount = pharmacyFleet.filter((n) => n.status === 'ACTIVE').length;
  const pendingNodesCount = pharmacyFleet.filter((n) => n.status === 'PENDING_REVIEW').length;
  const criticalRecallsCount = recalls.filter((r) => r.status === 'ACTIVE_LOCK').length;
  const criticalShortagesCount = masterCatalog.filter((c) => c.nationalShortageRisk === 'CRITICAL').length;

  return (
    <div className="space-y-6 w-full animate-in fade-in">
      {/* ========================================================================= */}
      {/* 👑 EXECUTIVE MINIMALIST SUPER ADMIN COMMAND BAR */}
      {/* ========================================================================= */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 sm:p-4 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Left: Brand / Network Identity & Threat Posture */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#0070BA] text-white flex items-center justify-center shadow-xs shrink-0">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900">
                  Digital Drug Store Network
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E0EFF9] text-[#0070BA] border border-[#BAE0F4]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0070BA] animate-pulse" />
                  6 Stores Online
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Unified management for licensed pharmacies across Ethiopia
              </p>
            </div>
          </div>

          {/* System Status Selector */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/80">
            <span className="text-[10px] font-extrabold uppercase text-slate-400 px-1.5">System Status:</span>
            <button
              type="button"
              onClick={() => {
                setSystemAlertLevel('NORMAL');
                showToast('System status set to Normal (All stores operating smoothly).', 'info', 'Status: Normal');
              }}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-black transition cursor-pointer ${
                systemAlertLevel === 'NORMAL'
                  ? 'bg-[#0070BA] text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Normal
            </button>
            <button
              type="button"
              onClick={() => {
                setSystemAlertLevel('ELEVATED');
                showToast('System status set to High Alert (Extra inventory checks active).', 'warning', 'Status: High Alert');
              }}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-black transition cursor-pointer ${
                systemAlertLevel === 'ELEVATED'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              High Alert
            </button>
            <button
              type="button"
              onClick={() => {
                setSystemAlertLevel('CRITICAL');
                showToast('System status set to Emergency Lockdown.', 'error', 'Status: Lockdown');
              }}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-black transition cursor-pointer ${
                systemAlertLevel === 'CRITICAL'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Lockdown
            </button>
          </div>
        </div>

        {/* Right: Quick Actions Dropdown Menu & Add Store Button */}
        <div className="flex items-center gap-2 self-stretch md:self-auto justify-between md:justify-end">
          {/* Quick Actions Dropdown Menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsDirectivesMenuOpen((prev) => !prev)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0070BA] hover:bg-[#005A96] text-white text-xs font-bold transition shadow-xs cursor-pointer shrink-0"
              title="Quick Store Actions Menu"
            >
              <Zap className="h-3.5 w-3.5 text-amber-300 shrink-0" />
              <span>Quick Actions</span>
              <ChevronDown className="h-3.5 w-3.5 text-white/70" />
            </button>

            {/* Quick Actions Dropdown Menu Content */}
            {isDirectivesMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsDirectivesMenuOpen(false)}
                />
                <div className="absolute right-0 top-full mt-1.5 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50 text-xs text-slate-700 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                    Quick Store Actions
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setIsDirectivesMenuOpen(false);
                      if (onOpenOwnerRegistration) {
                        onOpenOwnerRegistration();
                      } else {
                        setActiveTab('NODES');
                      }
                    }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 hover:bg-[#F0F7FC] text-left font-semibold text-slate-900 hover:text-[#0070BA] transition cursor-pointer"
                  >
                    <PlusCircle className="h-4 w-4 text-[#0070BA] shrink-0" />
                    <div>
                      <div className="font-bold leading-tight">Add New Pharmacy</div>
                      <div className="text-[10px] text-slate-500">Register a licensed branch store</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsDirectivesMenuOpen(false);
                      setIsNewRecallModalOpen(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 hover:bg-amber-50 text-left font-semibold text-slate-900 hover:text-amber-700 transition cursor-pointer"
                  >
                    <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
                    <div>
                      <div className="font-bold leading-tight">Issue Medicine Recall</div>
                      <div className="text-[10px] text-slate-500">Pause recalled medicine across stores</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsDirectivesMenuOpen(false);
                      setLockdownTargetNode(pharmacyFleet[0] || null);
                      setIsEmergencyLockdownModalOpen(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 hover:bg-rose-50 text-left font-semibold text-rose-600 transition cursor-pointer"
                  >
                    <Lock className="h-4 w-4 text-rose-600 shrink-0" />
                    <div>
                      <div className="font-bold leading-tight">Pause Store Cashier POS</div>
                      <div className="text-[10px] text-rose-500">Temporarily disable store cashier</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsDirectivesMenuOpen(false);
                      setActiveTab('SYSTEM_HEALTH');
                      setSystemHealthSubTab('BROADCAST');
                    }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 hover:bg-[#F0F7FC] text-left font-semibold text-slate-900 hover:text-[#0070BA] transition cursor-pointer"
                  >
                    <Radio className="h-4 w-4 text-[#0070BA] shrink-0" />
                    <div>
                      <div className="font-bold leading-tight">Send Urgent Announcement</div>
                      <div className="text-[10px] text-slate-500">Show announcement on cashier screens</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsDirectivesMenuOpen(false);
                      setIsExportDossierModalOpen(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 hover:bg-[#F0F7FC] text-left font-semibold text-slate-900 hover:text-[#0070BA] transition cursor-pointer"
                  >
                    <FileText className="h-4 w-4 text-[#0070BA] shrink-0" />
                    <div>
                      <div className="font-bold leading-tight">Download Inspection Report</div>
                      <div className="text-[10px] text-slate-500">Download official compliance report</div>
                    </div>
                  </button>
                </div>
              </>
            )}
          </div>

          {onOpenOwnerRegistration && (
            <button
              type="button"
              onClick={onOpenOwnerRegistration}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#0070BA] hover:bg-[#005A96] text-white font-bold text-xs transition shadow-xs cursor-pointer whitespace-nowrap"
            >
              <PlusCircle className="h-3.5 w-3.5 shrink-0" />
              <span className="hidden sm:inline">Add Store</span>
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 🧭 SUPER ADMIN MAIN MENU & NAVIGATION BAR */}
      {/* ========================================================================= */}
      <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-2.5 pt-0.5 border-b border-slate-200/80 scrollbar-thin">
        <button
          type="button"
          onClick={() => setActiveTab('HUB')}
          className={`px-3.5 py-2 rounded-2xl text-xs font-black transition flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === 'HUB'
              ? 'bg-[#0070BA] text-white shadow-xs'
              : 'bg-white text-slate-700 border border-slate-200/80 hover:bg-slate-50 hover:text-[#0070BA]'
          }`}
        >
          <Shield className={`h-4 w-4 shrink-0 ${activeTab === 'HUB' ? 'text-amber-300' : 'text-[#0070BA]'}`} />
          <span>Overview</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('NODES')}
          className={`px-3.5 py-2 rounded-2xl text-xs font-black transition flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === 'NODES'
              ? 'bg-[#0070BA] text-white shadow-xs'
              : 'bg-white text-slate-700 border border-slate-200/80 hover:bg-slate-50 hover:text-[#0070BA]'
          }`}
        >
          <Building2 className={`h-4 w-4 shrink-0 ${activeTab === 'NODES' ? 'text-white' : 'text-[#0070BA]'}`} />
          <span>Stores & Branches ({pharmacyFleet.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('ANALYTICS')}
          className={`px-3.5 py-2 rounded-2xl text-xs font-black transition flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === 'ANALYTICS'
              ? 'bg-[#0070BA] text-white shadow-xs'
              : 'bg-white text-slate-700 border border-slate-200/80 hover:bg-slate-50 hover:text-[#0070BA]'
          }`}
        >
          <BarChart3 className={`h-4 w-4 shrink-0 ${activeTab === 'ANALYTICS' ? 'text-white' : 'text-[#0070BA]'}`} />
          <span>Sales & Charts</span>
          <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-black shrink-0 whitespace-nowrap ${
            activeTab === 'ANALYTICS' ? 'bg-white/20 text-white' : 'bg-[#E0EFF9] text-[#0070BA]'
          }`}>
            Live Charts
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('COMPLIANCE')}
          className={`px-3.5 py-2 rounded-2xl text-xs font-black transition flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === 'COMPLIANCE'
              ? 'bg-[#0070BA] text-white shadow-xs'
              : 'bg-white text-slate-700 border border-slate-200/80 hover:bg-slate-50 hover:text-[#0070BA]'
          }`}
        >
          <FileCheck className={`h-4 w-4 shrink-0 ${activeTab === 'COMPLIANCE' ? 'text-white' : 'text-[#0070BA]'}`} />
          <span>Licenses & Recalls</span>
          {(pendingNodesCount > 0 || criticalRecallsCount > 0) && (
            <span className="bg-amber-100 text-amber-900 border border-amber-300 px-1.5 py-0.5 rounded-full text-[10px] font-black shrink-0 whitespace-nowrap">
              {pendingNodesCount + criticalRecallsCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('GLOBAL_CATALOG')}
          className={`px-3.5 py-2 rounded-2xl text-xs font-black transition flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === 'GLOBAL_CATALOG'
              ? 'bg-[#0070BA] text-white shadow-xs'
              : 'bg-white text-slate-700 border border-slate-200/80 hover:bg-slate-50 hover:text-[#0070BA]'
          }`}
        >
          <Pill className={`h-4 w-4 shrink-0 ${activeTab === 'GLOBAL_CATALOG' ? 'text-white' : 'text-[#0070BA]'}`} />
          <span>Medicine Catalog</span>
          {criticalShortagesCount > 0 && (
            <span className="bg-rose-100 text-rose-800 border border-rose-300 px-1.5 py-0.5 rounded-full text-[10px] font-black shrink-0 whitespace-nowrap">
              {criticalShortagesCount} Short
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('FINANCIALS')}
          className={`px-3.5 py-2 rounded-2xl text-xs font-black transition flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === 'FINANCIALS'
              ? 'bg-[#0070BA] text-white shadow-xs'
              : 'bg-white text-slate-700 border border-slate-200/80 hover:bg-slate-50 hover:text-[#0070BA]'
          }`}
        >
          <DollarSign className={`h-4 w-4 shrink-0 ${activeTab === 'FINANCIALS' ? 'text-white' : 'text-[#0070BA]'}`} />
          <span>Sales & Revenue</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('STAFF')}
          className={`px-3.5 py-2 rounded-2xl text-xs font-black transition flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === 'STAFF'
              ? 'bg-[#0070BA] text-white shadow-xs'
              : 'bg-white text-slate-700 border border-slate-200/80 hover:bg-slate-50 hover:text-[#0070BA]'
          }`}
        >
          <Users className={`h-4 w-4 shrink-0 ${activeTab === 'STAFF' ? 'text-white' : 'text-[#0070BA]'}`} />
          <span>Staff Directory</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('SYSTEM_HEALTH')}
          className={`px-3.5 py-2 rounded-2xl text-xs font-black transition flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === 'SYSTEM_HEALTH'
              ? 'bg-[#0070BA] text-white shadow-xs'
              : 'bg-white text-slate-700 border border-slate-200/80 hover:bg-slate-50 hover:text-[#0070BA]'
          }`}
        >
          <Server className={`h-4 w-4 shrink-0 ${activeTab === 'SYSTEM_HEALTH' ? 'text-white' : 'text-[#0070BA]'}`} />
          <span>System & Announcements</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 0: EXECUTIVE COMMAND HUB OVERVIEW */}
      {/* ========================================================================= */}
      {activeTab === 'HUB' && (
        <div className="space-y-6">
          {/* Section 1: Overview Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Medicine Recalls */}
            <div className="p-5 rounded-3xl bg-white border-2 border-rose-100 hover:border-rose-300 text-slate-900 space-y-3 shadow-xs relative overflow-hidden transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-700 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertOctagon className="h-4 w-4 text-rose-600" />
                  <span>Medicine Recalls</span>
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-50 text-rose-700 border border-rose-200">
                  ACTION NEEDED
                </span>
              </div>
              <div>
                <div className="text-2xl font-black font-mono text-slate-900">{criticalRecallsCount} Batches Paused</div>
                <p className="text-xs text-slate-500 mt-1">1,240 units paused at cashier counters across 6 stores.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('COMPLIANCE');
                  setComplianceSubTab('RECALLS');
                }}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0070BA] hover:text-[#005A96] transition cursor-pointer"
              >
                <span>View recalled medicines</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Card 2: Price Limit Alerts */}
            <div className="p-5 rounded-3xl bg-white border-2 border-amber-100 hover:border-amber-300 text-slate-900 space-y-3 shadow-xs relative overflow-hidden transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldAlert className="h-4 w-4 text-amber-600" />
                  <span>Price Limit Alerts</span>
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-50 text-amber-700 border border-amber-200">
                  REVIEW
                </span>
              </div>
              <div>
                <div className="text-2xl font-black font-mono text-slate-900">3 Medicines Above Price Cap</div>
                <p className="text-xs text-slate-500 mt-1">Automated price checks active across all 1,420 medicines.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('GLOBAL_CATALOG');
                  setCatalogSubTab('PRICE_CEILINGS');
                }}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0070BA] hover:text-[#005A96] transition cursor-pointer"
              >
                <span>Review price alerts</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Card 3: Expiring Soon */}
            <div className="p-5 rounded-3xl bg-white border-2 border-sky-100 hover:border-[#0070BA]/40 text-slate-900 space-y-3 shadow-xs relative overflow-hidden transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#0070BA] uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-[#0070BA]" />
                  <span>Expiring Soon (FEFO)</span>
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#E0EFF9] text-[#0070BA] border border-[#BAE0F4]">
                  MONITORED
                </span>
              </div>
              <div>
                <div className="text-2xl font-black font-mono text-slate-900">ETB 14,200 Expiring Soon</div>
                <p className="text-xs text-slate-500 mt-1">Medicines expiring soon tagged to sell or transfer first.</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('ANALYTICS')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0070BA] hover:text-[#005A96] transition cursor-pointer"
              >
                <span>View expiring medicines</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Card 4: Medicine Fridges & Temperatures */}
            <div className="p-5 rounded-3xl bg-white border-2 border-emerald-100 hover:border-emerald-300 text-slate-900 space-y-3 shadow-xs relative overflow-hidden transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>Medicine Fridges</span>
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                  ALL SAFE
                </span>
              </div>
              <div>
                <div className="text-2xl font-black font-mono text-slate-900">6 / 6 Safe (2°C - 8°C)</div>
                <p className="text-xs text-slate-500 mt-1">All insulins and vaccines kept at safe temperatures.</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('ANALYTICS')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0070BA] hover:text-[#005A96] transition cursor-pointer"
              >
                <span>Check fridge temperatures</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Section 2: Pharmacy Network Sales & Prescriptions Overview */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-[#0070BA]" />
                  <span>Pharmacy Network Sales & Prescriptions</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#E0EFF9] text-[#0070BA] border border-[#BAE0F4]">
                    Live Updates
                  </span>
                </h3>
                <p className="text-xs text-slate-500">
                  14-day sales (ETB) and filled prescriptions across all operating stores.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab('ANALYTICS')}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#E0EFF9] hover:bg-[#BAE0F4] text-[#0070BA] font-bold text-xs transition cursor-pointer self-start sm:self-auto"
              >
                <span>View Full Analytics Report</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-slate-200/60">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Average Daily Sales</span>
                <div className="text-lg font-black font-mono text-slate-900">ETB 242.8k</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-slate-200/60">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Daily Prescriptions</span>
                <div className="text-lg font-black font-mono text-slate-900">1,280 Rx/day</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-slate-200/60">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Cashless Payments</span>
                <div className="text-lg font-black font-mono text-[#0070BA]">90.0% Cashless</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-slate-200/60">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Fridge Temperature Alerts</span>
                <div className="text-lg font-black font-mono text-slate-900">0 Reported</div>
              </div>
            </div>

            <div className="h-56 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={[
                    { day: 'Day 1', gmv: 218000, rx: 1150 },
                    { day: 'Day 2', gmv: 232000, rx: 1210 },
                    { day: 'Day 3', gmv: 224000, rx: 1180 },
                    { day: 'Day 4', gmv: 245000, rx: 1290 },
                    { day: 'Day 5', gmv: 260000, rx: 1370 },
                    { day: 'Day 6', gmv: 278000, rx: 1450 },
                    { day: 'Day 7', gmv: 210000, rx: 1120 },
                    { day: 'Day 8', gmv: 235000, rx: 1230 },
                    { day: 'Day 9', gmv: 248000, rx: 1300 },
                    { day: 'Day 10', gmv: 252000, rx: 1320 },
                    { day: 'Day 11', gmv: 268000, rx: 1410 },
                    { day: 'Day 12', gmv: 285000, rx: 1510 },
                    { day: 'Day 13', gmv: 272000, rx: 1420 },
                    { day: 'Day 14', gmv: 290000, rx: 1530 },
                  ]}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="hubGmvGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0070BA" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#0070BA" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.6} />
                  <XAxis dataKey="day" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `ETB ${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(v: any) => [formatCurrency(Number(v)), 'Sales']}
                    contentStyle={{ borderRadius: '12px', backgroundColor: '#ffffff', color: '#0A2A52', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.08)' }}
                  />
                  <Area type="monotone" dataKey="gmv" stroke="#0070BA" strokeWidth={2.5} fill="url(#hubGmvGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Section 3: Live Activity & Security Log */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Terminal className="h-5 w-5 text-[#0070BA]" />
                  <span>Live Activity & Security Log</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Real-time activity log of prescriptions, inventory updates, and cashier sales across connected pharmacies.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#0070BA] bg-[#E0EFF9] px-2.5 py-1 rounded-full border border-[#BAE0F4]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0070BA] animate-pulse" />
                  Live Updates
                </span>
                <button
                  type="button"
                  onClick={() => setIsExportDossierModalOpen(true)}
                  className="text-xs font-bold text-[#0070BA] hover:underline flex items-center gap-1"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download Log</span>
                </button>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {adminAuditTrail.map((ev) => (
                <div key={ev.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="flex items-start sm:items-center gap-3">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black shrink-0 ${
                      ev.severity === 'CRITICAL'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : ev.severity === 'WARNING'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-[#E0EFF9] text-[#0070BA] border border-[#BAE0F4]'
                    }`}>
                      {ev.category.replace('_', ' ')}
                    </span>

                    <div>
                      <div className="font-semibold text-slate-900 flex items-center gap-2">
                        <span>{ev.action}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                        <span className="font-bold text-slate-700">{ev.facility}</span>
                        <span>•</span>
                        <span>{ev.actor}</span>
                        <span>•</span>
                        <span className="font-mono text-[10px] text-slate-400">{ev.hash}</span>
                      </div>
                    </div>
                  </div>

                  <span className="text-[11px] font-mono text-slate-400 shrink-0 self-end sm:self-center">
                    {ev.timestamp}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Connected Pharmacies & Status */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Connected Pharmacies List */}
            <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 p-6 space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <Store className="h-5 w-5 text-[#0070BA]" />
                    <span>Connected Pharmacies & Status</span>
                  </h3>
                  <p className="text-xs text-slate-500">Live operational status, licensing verification, and store cashier controls</p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('NODES')}
                  className="text-xs font-bold text-[#0070BA] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>View All Stores ({pharmacyFleet.length})</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="divide-y divide-slate-100">
                {pharmacyFleet.slice(0, 4).map((node) => (
                  <div key={node.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-[#E0EFF9] text-[#0070BA] flex items-center justify-center font-black text-xs shrink-0">
                        <Store className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-xs font-extrabold text-slate-900 flex items-center gap-2">
                          <span>{node.storeName}</span>
                          {node.status === 'ACTIVE' ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                              <span className="w-1 h-1 rounded-full bg-emerald-500" />
                              ACTIVE
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-black text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                              {node.status}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                          <span>{node.city}, {node.subcity}</span>
                          <span>•</span>
                          <span className="font-mono text-[#0070BA] font-bold">{node.efdaLicense}</span>
                          <span>•</span>
                          <span>{node.activeStaffCount} Staff</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      <div className="text-left sm:text-right">
                        <div className="text-xs font-mono font-bold text-slate-900">
                          {formatCurrency(node.monthlyGmv)}
                        </div>
                        <div className="text-[10px] text-slate-400">{node.skuCount} Medicines</div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setInspectNode(node)}
                          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                          title="View Store Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setLockdownTargetNode(node);
                            setIsEmergencyLockdownModalOpen(true);
                          }}
                          className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition cursor-pointer"
                          title="Pause Store Cashier POS"
                        >
                          <Lock className="h-4 w-4" />
                        </button>

                        {onSwitchToStoreWorkstation && (
                          <button
                            type="button"
                            onClick={() => onSwitchToStoreWorkstation(node.id, 'pos')}
                            className="p-2 rounded-xl bg-[#E0EFF9] hover:bg-[#BAE0F4] text-[#0070BA] transition cursor-pointer"
                            title="Open Cashier Counter"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Announcement Widget */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 space-y-4 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2.5 text-[#0070BA] mb-2">
                  <Radio className="h-5 w-5 animate-pulse" />
                  <h3 className="text-sm font-extrabold text-slate-900">Send Store Announcement</h3>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">
                  Send announcements, urgent reminders, or updates directly to all cashier counters across all branches.
                </p>

                {/* Preset Chips */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {[
                    'Medicine Recall Notice',
                    'Price Limit Check',
                    'Fridge Temperature Check',
                    'Monthly Tax Report Due',
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setBroadcastMessage(`[ALERT] ${preset}: Please review at your cashier counter.`)}
                      className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium transition cursor-pointer"
                    >
                      {preset}
                    </button>
                  ))}
                </div>

                <form onSubmit={handleSendBroadcast} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setBroadcastPriority('STANDARD')}
                      className={`flex-1 py-1.5 rounded-xl text-[10px] font-bold transition cursor-pointer ${
                        broadcastPriority === 'STANDARD'
                          ? 'bg-[#0070BA] text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      Standard
                    </button>
                    <button
                      type="button"
                      onClick={() => setBroadcastPriority('URGENT')}
                      className={`flex-1 py-1.5 rounded-xl text-[10px] font-bold transition cursor-pointer ${
                        broadcastPriority === 'URGENT'
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      Urgent
                    </button>
                    <button
                      type="button"
                      onClick={() => setBroadcastPriority('EMERGENCY')}
                      className={`flex-1 py-1.5 rounded-xl text-[10px] font-bold transition cursor-pointer ${
                        broadcastPriority === 'EMERGENCY'
                          ? 'bg-rose-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      Emergency
                    </button>
                  </div>

                  <textarea
                    rows={3}
                    required
                    value={broadcastMessage}
                    onChange={(e) => setBroadcastMessage(e.target.value)}
                    placeholder="Enter national advisory message..."
                    className="w-full rounded-2xl border border-slate-200 bg-white p-3 text-xs text-slate-900 focus:outline-none focus:border-[#0070BA]"
                  />

                  <button
                    type="submit"
                    disabled={isBroadcasting || !broadcastMessage.trim()}
                    className="w-full py-2.5 rounded-2xl bg-[#0070BA] hover:bg-[#005A96] text-white font-bold text-xs transition shadow-xs flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>{isBroadcasting ? 'Broadcasting...' : 'Broadcast to All Nodes'}</span>
                  </button>
                </form>
              </div>

              <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Total Reach: 6 Connected Stores</span>
                <span className="text-emerald-600 font-bold">100% Mesh Synced</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: STORES & BRANCHES DIRECTORY */}
      {/* ========================================================================= */}
      {activeTab === 'NODES' && (
        <div className="space-y-4">
          {/* Sub-tab bar & action toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-slate-200/80 shadow-2xs">
            {/* Sub Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              <button
                type="button"
                onClick={() => {
                  setNodesSubTab('ALL');
                  setSelectedStatusFilter('ALL');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  nodesSubTab === 'ALL'
                    ? 'bg-[#0070BA] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Building2 className="h-3.5 w-3.5" />
                <span>All Pharmacies ({pharmacyFleet.length})</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setNodesSubTab('PENDING');
                  setSelectedStatusFilter('PENDING_REVIEW');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  nodesSubTab === 'PENDING'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Clock className="h-3.5 w-3.5" />
                <span>Pending Approvals ({pendingNodesCount})</span>
                {pendingNodesCount > 0 && (
                  <span className="bg-amber-400 text-slate-950 px-1 rounded-full text-[9px] font-black">
                    {pendingNodesCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setNodesSubTab('ACTIVE');
                  setSelectedStatusFilter('ACTIVE');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  nodesSubTab === 'ACTIVE'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Active Stores ({activeNodesCount})</span>
              </button>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
              {onOpenOwnerRegistration && (
                <button
                  type="button"
                  onClick={onOpenOwnerRegistration}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0070BA] hover:bg-[#005A96] text-white font-bold text-xs transition shadow-xs cursor-pointer"
                >
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span>Add New Pharmacy</span>
                </button>
              )}
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-slate-200 shadow-2xs">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by store name, TIN, license, or owner..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-2xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#0070BA]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="rounded-2xl border border-slate-200 text-xs px-3 py-2 font-bold text-slate-700 focus:outline-none focus:border-[#0070BA]"
              >
                <option value="ALL">All Regions / Cities</option>
                <option value="Addis Ababa">Addis Ababa</option>
                <option value="Hawassa">Hawassa</option>
                <option value="Adama">Adama</option>
                <option value="Dire Dawa">Dire Dawa</option>
              </select>

              <button
                type="button"
                onClick={() => {
                  setIsRefreshing(true);
                  setTimeout(() => {
                    setIsRefreshing(false);
                    showToast('Store data refreshed successfully.', 'success', 'Stores Refreshed');
                  }, 400);
                }}
                className="p-2 rounded-2xl border border-slate-200 text-slate-500 hover:text-[#0070BA] transition cursor-pointer"
                title="Refresh Stores"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Stores Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="py-3.5 px-4">Pharmacy & License</th>
                    <th className="py-3.5 px-4">Owner & Contact</th>
                    <th className="py-3.5 px-4">Location</th>
                    <th className="py-3.5 px-4">Medicines & Staff</th>
                    <th className="py-3.5 px-4">Monthly Sales</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredNodes.map((node) => (
                    <tr key={node.id} className="hover:bg-slate-50/70 transition">
                      {/* Node name & license */}
                      <td className="py-3.5 px-4">
                        <div className="font-extrabold text-slate-900 text-xs">
                          {node.storeName}
                        </div>
                        <div className="text-[10px] text-[#0070BA] font-mono font-bold flex items-center gap-1 mt-0.5">
                          <BadgeCheck className="h-3 w-3" />
                          <span>{node.efdaLicense}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">TIN: {node.tinNumber}</div>
                      </td>

                      {/* Owner */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-800">{node.ownerName}</div>
                        <div className="text-[10px] text-slate-400">{node.ownerEmail}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{node.ownerPhone}</div>
                      </td>

                      {/* Location */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-700">{node.city}</div>
                        <div className="text-[10px] text-slate-400">{node.subcity}</div>
                      </td>

                      {/* Catalog & Staff */}
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-slate-800">
                          {node.skuCount} Medicines
                        </div>
                        <div className="text-[10px] text-slate-400">{node.activeStaffCount} Staff</div>
                        <div className="flex items-center gap-1 mt-1">
                          {node.coldChainReady && (
                            <span className="bg-sky-100 text-sky-800 text-[9px] font-bold px-1.5 py-0.2 rounded">
                              Fridge Ready
                            </span>
                          )}
                          {node.is24Hours && (
                            <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-1.5 py-0.2 rounded">
                              24/7
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Sales */}
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {formatCurrency(node.monthlyGmv)}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {node.status === 'ACTIVE' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 whitespace-nowrap shrink-0">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Active
                          </span>
                        )}
                        {node.status === 'PENDING_REVIEW' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 whitespace-nowrap shrink-0">
                            <Clock className="h-3 w-3 text-amber-600" />
                            Pending Review
                          </span>
                        )}
                        {node.status === 'MAINTENANCE' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200 whitespace-nowrap shrink-0">
                            <AlertTriangle className="h-3 w-3 text-rose-600" />
                            Paused
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {node.status === 'PENDING_REVIEW' ? (
                            <button
                              type="button"
                              onClick={() => handleApproveNode(node.id)}
                              className="px-2.5 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] transition shadow-xs flex items-center gap-1 cursor-pointer"
                            >
                              <CheckCircle2 className="h-3 w-3" />
                              <span>Approve</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setInspectNode(node)}
                              className="px-2.5 py-1 rounded-xl bg-[#E0EFF9] hover:bg-[#E0EFF9] text-[#005A96] font-bold text-[10px] transition flex items-center gap-1 cursor-pointer"
                              title="View store profile"
                            >
                              <Eye className="h-3 w-3" />
                              <span>View Store</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleStartEditNode(node)}
                            className="p-1 rounded-xl text-slate-400 hover:text-[#0070BA] hover:bg-slate-100 transition cursor-pointer"
                            title="Edit Store Profile"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleToggleNodeStatus(node.id)}
                            className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                            title="Pause / Activate Store"
                          >
                            <Sliders className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB: PHARMACY & DRUG STORE FLEET ANALYTICS & CHARTS */}
      {/* ========================================================================= */}
      {activeTab === 'ANALYTICS' && (
        <PharmacyAnalyticsView
          pharmacyFleet={pharmacyFleet}
          masterCatalog={masterCatalog}
          onInspectNode={setInspectNode}
          onSwitchToStoreWorkstation={onSwitchToStoreWorkstation}
        />
      )}

      {/* ========================================================================= */}
      {/* TAB 2: LICENSES & MEDICINE RECALLS */}
      {/* ========================================================================= */}
      {activeTab === 'COMPLIANCE' && (
        <div className="space-y-4">
          {/* Sub-tab bar & action toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-slate-200/80 shadow-2xs">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              <button
                type="button"
                onClick={() => setComplianceSubTab('LICENSES')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  complianceSubTab === 'LICENSES'
                    ? 'bg-[#0070BA] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <FileCheck className="h-3.5 w-3.5" />
                <span>Store Licenses & Verification</span>
              </button>

              <button
                type="button"
                onClick={() => setComplianceSubTab('RECALLS')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  complianceSubTab === 'RECALLS'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <AlertOctagon className="h-3.5 w-3.5" />
                <span>Medicine Recalls ({criticalRecallsCount} Active)</span>
                {criticalRecallsCount > 0 && (
                  <span className="bg-rose-200 text-rose-950 px-1.5 rounded-full text-[9px] font-black">
                    PAUSED
                  </span>
                )}
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsNewRecallModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition cursor-pointer self-start sm:self-auto"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              <span>Add New Recall Notice</span>
            </button>
          </div>

          {/* Sub-view 1: RECALLS */}
          {complianceSubTab === 'RECALLS' && (
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <AlertOctagon className="h-5 w-5 text-rose-600" />
                    <span>Medicine Batch Recalls</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Paused medicine batches that cannot be sold at store cashiers.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-b border-slate-100 pb-3">
                <span className="text-xs font-bold text-slate-500">Filter:</span>
                {(['ALL', 'ACTIVE', 'RESOLVED'] as const).map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setRecallsFilter(filter)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                      recallsFilter === filter
                        ? 'bg-[#0070BA] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {filter === 'ALL' && `All Recalls (${recalls.length})`}
                    {filter === 'ACTIVE' && `Paused Batches (${recalls.filter((r) => r.status === 'ACTIVE_LOCK').length})`}
                    {filter === 'RESOLVED' && `Resolved (${recalls.filter((r) => r.status === 'RESOLVED').length})`}
                  </button>
                ))}
              </div>

              <div className="space-y-3">
                {recalls
                  .filter((r) => {
                    if (recallsFilter === 'ACTIVE') return r.status === 'ACTIVE_LOCK';
                    if (recallsFilter === 'RESOLVED') return r.status === 'RESOLVED';
                    return true;
                  })
                  .map((recall) => (
                    <div
                      key={recall.id}
                      className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition ${
                        recall.status === 'ACTIVE_LOCK'
                          ? 'border-rose-200 bg-rose-50/50'
                          : 'border-emerald-200 bg-emerald-50/30'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-extrabold text-slate-900 text-xs">
                            {recall.drugName}
                          </span>
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-black ${
                            recall.status === 'ACTIVE_LOCK'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {recall.batchNumber}
                          </span>
                          <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${
                            recall.status === 'ACTIVE_LOCK'
                              ? 'bg-rose-600 text-white'
                              : 'bg-emerald-600 text-white'
                          }`}>
                            {recall.status === 'ACTIVE_LOCK' ? `${recall.severity} SEVERITY` : 'RESOLVED'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600">{recall.issueReason}</p>
                        <div className="text-[11px] text-slate-400">
                          Manufacturer: {recall.manufacturer} • Issued on: {recall.recalledAt} • Affected: {recall.affectedStoresCount} stores
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {recall.status === 'ACTIVE_LOCK' ? (
                          <>
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300 whitespace-nowrap shrink-0">
                              <Lock className="h-3.5 w-3.5 shrink-0" />
                              Cashier Sale Blocked
                            </span>
                            <button
                              type="button"
                              onClick={() => handleToggleRecallStatus(recall.id)}
                              className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer whitespace-nowrap shrink-0"
                            >
                              Resolve & Unblock Sale
                            </button>
                          </>
                        ) : (
                          <>
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 whitespace-nowrap shrink-0">
                              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                              Resolved & Safe to Sell
                            </span>
                            <button
                              type="button"
                              onClick={() => handleToggleRecallStatus(recall.id)}
                              className="px-3 py-1.5 rounded-xl bg-white border border-rose-200 text-xs font-bold text-rose-600 hover:bg-rose-50 transition cursor-pointer whitespace-nowrap shrink-0"
                            >
                              Pause Batch Again
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Sub-view 2: LICENSES */}
          {complianceSubTab === 'LICENSES' && (
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Store Licenses & Verification
                  </h3>
                  <p className="text-xs text-slate-500">
                    Review licenses, tax details, and storage readiness for each pharmacy branch.
                  </p>
                </div>
                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold font-mono">
                  All Stores Verified
                </span>
              </div>

              <div className="space-y-3">
                {pharmacyFleet.map((node) => (
                  <div
                    key={node.id}
                    className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900 text-xs">
                          {node.storeName}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-[#E0EFF9] text-indigo-800 font-bold">
                          {node.efdaLicense}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Owner: {node.ownerName} • TIN: {node.tinNumber} • Region: {node.city}, {node.subcity}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {node.status === 'PENDING_REVIEW' ? (
                        <button
                          type="button"
                          onClick={() => handleApproveNode(node.id)}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                        >
                          <ShieldCheck className="h-3.5 w-3.5" />
                          <span>Approve License & Issue Token</span>
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600">
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Verified Active</span>
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: NATIONAL MEDICINE INDEX & FORMULARY */}
      {/* ========================================================================= */}
      {activeTab === 'GLOBAL_CATALOG' && (
        <div className="space-y-4">
          {/* Sub-tab bar & action toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-slate-200/80 shadow-2xs">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              <button
                type="button"
                onClick={() => {
                  setCatalogSubTab('ALL');
                  setSearchQuery('');
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  catalogSubTab === 'ALL'
                    ? 'bg-[#0070BA] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Pill className="h-3.5 w-3.5" />
                <span>Master Medicine Registry ({masterCatalog.length})</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCatalogSubTab('SHORTAGES');
                  setSearchQuery('Critical Shortage');
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  catalogSubTab === 'SHORTAGES'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <AlertTriangle className="h-3.5 w-3.5" />
                <span>Low Stock Alerts</span>
                {criticalShortagesCount > 0 && (
                  <span className="bg-rose-200 text-rose-950 px-1.5 rounded-full text-[9px] font-black">
                    {criticalShortagesCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setCatalogSubTab('PRICE_CEILINGS');
                  setSearchQuery('');
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  catalogSubTab === 'PRICE_CEILINGS'
                    ? 'bg-[#0070BA] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <DollarSign className="h-3.5 w-3.5" />
                <span>Price Limits Check</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsAddCatalogModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#0070BA] hover:bg-[#005A96] text-white font-bold text-xs transition shadow-xs cursor-pointer"
              >
                <PlusCircle className="h-3.5 w-3.5" />
                <span>Add Medicine to Catalog</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-slate-200 shadow-xs">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">
                Medicine Catalog & Official Price Limits
              </h3>
              <p className="text-[11px] text-slate-500">
                All medicines and price caps synced across connected pharmacies.
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search medicine or code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#0070BA]"
              />
            </div>
          </div>

          {/* Master Catalog Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="py-3.5 px-4">Medicine Name</th>
                    <th className="py-3.5 px-4">License Code</th>
                    <th className="py-3.5 px-4">Category / Type</th>
                    <th className="py-3.5 px-4">Dosage & Strength</th>
                    <th className="py-3.5 px-4">Max Allowed Price (ETB)</th>
                    <th className="py-3.5 px-4">Storage & Care</th>
                    <th className="py-3.5 px-4 text-right">Availability</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {masterCatalog
                    .filter((item) => {
                      if (catalogSubTab === 'SHORTAGES') {
                        return item.nationalShortageRisk === 'CRITICAL';
                      }
                      if (!searchQuery) return true;
                      const q = searchQuery.toLowerCase();
                      if (q === 'critical shortage') return item.nationalShortageRisk === 'CRITICAL';
                      return (
                        item.brandName.toLowerCase().includes(q) ||
                        item.genericName.toLowerCase().includes(q) ||
                        item.efdaCode.toLowerCase().includes(q) ||
                        item.therapeuticClass.toLowerCase().includes(q)
                      );
                    })
                    .map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-extrabold text-slate-900 text-xs">
                          {item.brandName}
                        </div>
                        <div className="text-[11px] text-slate-500 italic">{item.genericName}</div>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-[#0070BA]">
                        {item.efdaCode}
                      </td>

                      <td className="py-3.5 px-4 text-slate-700 font-medium">
                        {item.therapeuticClass}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">{item.dosageForm}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{item.strength}</div>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {formatCurrency(item.maxRetailPrice)}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1">
                          {item.isControlled && (
                            <span className="bg-amber-100 text-amber-800 text-[9px] font-bold px-1.5 py-0.5 rounded">
                              Prescription Required
                            </span>
                          )}
                          {item.requiresColdChain && (
                            <span className="bg-sky-100 text-sky-800 text-[9px] font-bold px-1.5 py-0.5 rounded">
                              Keep Cold (Fridge 2-8°C)
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        {item.nationalShortageRisk === 'CRITICAL' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 whitespace-nowrap shrink-0">
                            <AlertTriangle className="h-3 w-3 text-rose-600 shrink-0" />
                            Low Stock Alert
                          </span>
                        )}
                        {item.nationalShortageRisk === 'LOW' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 whitespace-nowrap shrink-0">
                            Limited Stock
                          </span>
                        )}
                        {item.nationalShortageRisk === 'NONE' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 whitespace-nowrap shrink-0">
                            In Stock
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: CONSOLIDATED MULTI-STORE FINANCIALS & SETTLEMENTS */}
      {/* ========================================================================= */}
      {activeTab === 'FINANCIALS' && (
        <div className="space-y-4">
          {/* Sub-tab bar & action toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-slate-200/80 shadow-2xs">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              <button
                type="button"
                onClick={() => setFinancialsSubTab('GMV')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  financialsSubTab === 'GMV'
                    ? 'bg-[#0070BA] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <DollarSign className="h-3.5 w-3.5" />
                <span>Branch Sales & Revenue</span>
              </button>

              <button
                type="button"
                onClick={() => setFinancialsSubTab('SETTLEMENTS')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  financialsSubTab === 'SETTLEMENTS'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Smartphone className="h-3.5 w-3.5" />
                <span>Mobile & Bank Payments (VAT 15%)</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              {financialsSubTab === 'SETTLEMENTS' && (
                <button
                  type="button"
                  onClick={() => {
                    showToast('Initiated batch digital settlement synchronization with Telebirr & CBE Gateway.', 'info', 'Sync Started');
                  }}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition cursor-pointer"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Sync Gateways</span>
                </button>
              )}
              <button
                type="button"
                onClick={handleExportFinancialAuditCsv}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition cursor-pointer self-start sm:self-auto shadow-xs"
              >
                <Download className="h-4 w-4" />
                <span>Download Sales & Tax Report</span>
              </button>
            </div>
          </div>

          {/* GMV VIEW */}
          {financialsSubTab === 'GMV' && (
            <>
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">
                      Total Sales Across All Stores
                    </h3>
                    <p className="text-xs text-slate-500">
                      Live sales from all connected pharmacy branches across Ethiopia.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400">Total Monthly Sales:</span>
                    <span className="text-lg font-black font-mono text-[#0070BA]">
                      {formatCurrency(totalNetworkGmv)}
                    </span>
                  </div>
                </div>

                {/* Channels Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2">
                  <div className="p-4 rounded-2xl bg-[#E0EFF9] border border-[#BAE0F4] space-y-1">
                    <span className="text-[11px] font-bold text-slate-900">Total Sales Revenue</span>
                    <div className="text-xl font-black text-slate-950 font-mono">
                      {formatCurrency(totalNetworkGmv)}
                    </div>
                    <p className="text-[10px] text-[#005A96]">Across 6 connected pharmacy branches</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1">
                    <span className="text-[11px] font-bold text-emerald-900">Digital Payments (Telebirr/CBE)</span>
                    <div className="text-xl font-black text-emerald-950 font-mono">
                      {formatCurrency(totalNetworkGmv * 0.90)}
                    </div>
                    <p className="text-[10px] text-emerald-700">90% cashless transactions</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-[11px] font-bold text-slate-700">Cash at Store Registers</span>
                    <div className="text-xl font-black text-slate-900 font-mono">
                      {formatCurrency(totalNetworkGmv * 0.10)}
                    </div>
                    <p className="text-[10px] text-slate-500">10% manual cash at registers</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-1">
                    <span className="text-[11px] font-bold text-amber-900">National VAT (15%) Liability</span>
                    <div className="text-xl font-black text-amber-950 font-mono">
                      {formatCurrency(totalNetworkGmv * 0.15)}
                    </div>
                    <p className="text-[10px] text-amber-700">Ministry of Revenue (ERCA) compliant</p>
                  </div>
                </div>
              </div>

              {/* Store-by-Store Financial Leaderboard */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="p-4 border-b border-slate-100 font-extrabold text-sm text-slate-900 flex items-center justify-between">
                  <span>Branch Sales Leaderboard</span>
                  <span className="text-xs font-semibold text-slate-400">6 Active Stores</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
                      <tr>
                        <th className="py-3 px-4">Pharmacy Store</th>
                        <th className="py-3 px-4">City / Region</th>
                        <th className="py-3 px-4">Monthly Sales</th>
                        <th className="py-3 px-4">Telebirr (62%)</th>
                        <th className="py-3 px-4">CBE (28%)</th>
                        <th className="py-3 px-4">Tax (VAT 15%)</th>
                        <th className="py-3 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {pharmacyFleet.map((node) => (
                        <tr key={node.id} className="hover:bg-slate-50/70">
                          <td className="py-3 px-4 font-bold text-slate-900">
                            {node.storeName}
                          </td>
                          <td className="py-3 px-4 text-slate-500">{node.city}</td>
                          <td className="py-3 px-4 font-mono font-bold text-slate-900">
                            {formatCurrency(node.monthlyGmv)}
                          </td>
                          <td className="py-3 px-4 font-mono text-emerald-600 font-bold">
                            {formatCurrency(node.monthlyGmv * 0.62)}
                          </td>
                          <td className="py-3 px-4 font-mono text-purple-600 font-bold">
                            {formatCurrency(node.monthlyGmv * 0.28)}
                          </td>
                          <td className="py-3 px-4 font-mono text-[#0070BA]">
                            {formatCurrency(node.monthlyGmv * 0.15)}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => {
                                setInspectNode(node);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-[#E0EFF9] hover:bg-[#E0EFF9] text-[#005A96] font-bold text-[11px] transition cursor-pointer"
                            >
                              View Store
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* SETTLEMENTS VIEW */}
          {financialsSubTab === 'SETTLEMENTS' && (
            <div className="space-y-4">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <Smartphone className="h-5 w-5 text-emerald-600" />
                    <span>Telebirr & CBE Mobile Settlements & VAT Reconciliation</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Automated bank and merchant wallet settlement batches with integrated 15% VAT withholding and daily remittance logs.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-emerald-900">Telebirr SuperApp Wallet</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-200 text-emerald-900">Auto-Clearing Active</span>
                    </div>
                    <div className="text-xl font-black text-emerald-950 font-mono">
                      {formatCurrency(totalNetworkGmv * 0.62)}
                    </div>
                    <p className="text-[10px] text-emerald-700">
                      Settled to Commercial Bank Account ending in ••••8492
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-purple-900">CBE Birr & CBE Mobile</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-200 text-purple-900">Real-time RTGS</span>
                    </div>
                    <div className="text-xl font-black text-purple-950 font-mono">
                      {formatCurrency(totalNetworkGmv * 0.28)}
                    </div>
                    <p className="text-[10px] text-purple-700">
                      Direct C2B corporate till deposit
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#E0EFF9] border border-[#BAE0F4] space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-900">Total VAT 15% Remitted</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#BAE0F4] text-slate-900">ERCA Verified</span>
                    </div>
                    <div className="text-xl font-black text-slate-950 font-mono">
                      {formatCurrency(totalNetworkGmv * 0.15)}
                    </div>
                    <p className="text-[10px] text-[#005A96]">
                      Automated E-Filing voucher #ETH-VAT-2026-08
                    </p>
                  </div>
                </div>
              </div>

              {/* Settlement Batches Table */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="p-4 border-b border-slate-100 font-extrabold text-sm text-slate-900 flex items-center justify-between">
                  <span>Recent Gateway Settlement & Clearing Batches</span>
                  <button
                    type="button"
                    onClick={() => {
                      showToast('Triggered on-demand digital payout sweep to branch merchant accounts.', 'success', 'Payout Sweep Initiated');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition cursor-pointer flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Run Daily Payout Sweep</span>
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
                      <tr>
                        <th className="py-3 px-4">Batch Reference</th>
                        <th className="py-3 px-4">Gateway Channel</th>
                        <th className="py-3 px-4">Target Facility</th>
                        <th className="py-3 px-4">Gross Amount</th>
                        <th className="py-3 px-4">Fee (0.5%)</th>
                        <th className="py-3 px-4">Net Deposited</th>
                        <th className="py-3 px-4">VAT (15%)</th>
                        <th className="py-3 px-4 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {pharmacyFleet.map((node, idx) => (
                        <tr key={node.id} className="hover:bg-slate-50/70">
                          <td className="py-3 px-4 font-mono font-bold text-slate-900">
                            SETTLE-ETH-{202600 + idx}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              idx % 2 === 0
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-purple-100 text-purple-800'
                            }`}>
                              <Smartphone className="h-3 w-3" />
                              {idx % 2 === 0 ? 'Telebirr Merchant' : 'CBE Birr API'}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-bold text-slate-900">
                            {node.storeName}
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-slate-900">
                            {formatCurrency(node.monthlyGmv * 0.62)}
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-500">
                            {formatCurrency(node.monthlyGmv * 0.62 * 0.005)}
                          </td>
                          <td className="py-3 px-4 font-mono text-emerald-600 font-bold">
                            {formatCurrency(node.monthlyGmv * 0.62 * 0.995)}
                          </td>
                          <td className="py-3 px-4 font-mono text-[#0070BA]">
                            {formatCurrency(node.monthlyGmv * 0.15)}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                              <CheckCircle2 className="h-3 w-3" /> Settled & Cleared
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: NATIONAL STAFF & PHARMACIST DIRECTORY */}
      {/* ========================================================================= */}
      {activeTab === 'STAFF' && (
        <div className="space-y-4">
          {/* Sub-tab bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-slate-200/80 shadow-2xs">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              <button
                type="button"
                onClick={() => setStaffSubTab('DIRECTORY')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  staffSubTab === 'DIRECTORY'
                    ? 'bg-[#0070BA] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Users className="h-3.5 w-3.5" />
                <span>Staff Directory ({globalStaff.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setStaffSubTab('RBAC')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  staffSubTab === 'RBAC'
                    ? 'bg-[#0070BA] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Lock className="h-3.5 w-3.5" />
                <span>Roles & Permissions</span>
              </button>
            </div>

            <div className="text-xs font-mono font-bold px-3 py-1.5 rounded-full bg-[#E0EFF9] text-[#0070BA] border border-[#BAE0F4]">
              {globalStaff.length} Accounts Active
            </div>
          </div>

          {/* DIRECTORY VIEW */}
          {staffSubTab === 'DIRECTORY' && (
            <div className="space-y-4">
              {/* Search & Role Filter Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-slate-200 shadow-xs">
                <div className="relative w-full sm:w-80">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search staff by name, email, pharmacy..."
                    value={staffSearchQuery}
                    onChange={(e) => setStaffSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#0070BA]"
                  />
                </div>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                  <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Filter:</span>
                  {(['ALL', 'SUPER_ADMIN', 'STORE_OWNER', 'PHARMACIST', 'SUPPLIER'] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setStaffRoleFilter(r)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                        staffRoleFilter === r
                          ? 'bg-[#0070BA] text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {r === 'ALL' ? 'All Roles' : r.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
                      <tr>
                        <th className="py-3.5 px-4">Staff Member</th>
                        <th className="py-3.5 px-4">Role</th>
                        <th className="py-3.5 px-4">Assigned Store</th>
                        <th className="py-3.5 px-4">Pharmacist License</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {globalStaff
                        .filter((staff) => {
                          if (staffRoleFilter !== 'ALL' && staff.role !== staffRoleFilter) return false;
                          if (!staffSearchQuery) return true;
                          const q = staffSearchQuery.toLowerCase();
                          return (
                            staff.name.toLowerCase().includes(q) ||
                            staff.email.toLowerCase().includes(q) ||
                            staff.storeName.toLowerCase().includes(q) ||
                            (staff.efdaLicenseNumber && staff.efdaLicenseNumber.toLowerCase().includes(q))
                          );
                        })
                        .map((staff) => (
                          <tr key={staff.id} className="hover:bg-slate-50/70 transition">
                            <td className="py-3.5 px-4">
                              <div className="font-extrabold text-slate-900 text-xs">{staff.name}</div>
                              <div className="text-[10px] text-slate-400">{staff.email} • {staff.phone}</div>
                            </td>

                            <td className="py-3.5 px-4">
                              <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                                staff.role === 'SUPER_ADMIN'
                                  ? 'bg-[#E0EFF9] text-slate-900'
                                  : staff.role === 'STORE_OWNER'
                                  ? 'bg-blue-100 text-blue-900'
                                  : staff.role === 'SUPPLIER'
                                  ? 'bg-teal-100 text-teal-900'
                                  : 'bg-emerald-100 text-emerald-900'
                              }`}>
                                {staff.role.replace('_', ' ')}
                              </span>
                            </td>

                            <td className="py-3.5 px-4 font-semibold text-slate-700">
                              {staff.storeName}
                            </td>

                            <td className="py-3.5 px-4 font-mono text-[11px] text-[#0070BA] font-bold">
                              {staff.efdaLicenseNumber || '—'}
                            </td>

                            <td className="py-3.5 px-4">
                              {staff.status === 'ACTIVE' && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                                  <CheckCircle2 className="h-3 w-3" /> Active
                                </span>
                              )}
                              {staff.status === 'LOCKED' && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                                  <Lock className="h-3 w-3" /> Account Locked
                                </span>
                              )}
                              {staff.status === 'PENDING' && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                                  <Clock className="h-3 w-3" /> Pending Approval
                                </span>
                              )}
                            </td>

                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    showToast(`Password reset link sent to ${staff.email}`, 'info', 'Password Reset');
                                  }}
                                  className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold transition cursor-pointer"
                                >
                                  Reset Password
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleToggleStaffStatus(staff.id)}
                                  className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition cursor-pointer ${
                                    staff.status === 'ACTIVE'
                                      ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                                      : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                  }`}
                                >
                                  {staff.status === 'ACTIVE' ? 'Lock Account' : 'Unlock Account'}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* RBAC GOVERNANCE VIEW */}
          {staffSubTab === 'RBAC' && (
            <div className="space-y-4">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">
                      User Roles & Permissions
                    </h3>
                    <p className="text-xs text-slate-500">
                      Our system has 3 clear roles: Super Admin, Store Owner, and Pharmacist.
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#E0EFF9] text-[#005A96] border border-[#BAE0F4]">
                    3 User Roles
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  {/* Super Admin */}
                  <div className="p-5 rounded-2xl bg-[#E0EFF9]/70 border border-[#BAE0F4] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#0070BA] text-white uppercase tracking-wider">
                        Tier 1
                      </span>
                      <Shield className="h-5 w-5 text-[#0070BA]" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-950 text-sm">Super Admin</h4>
                      <p className="text-xs text-[#005A96]">System Administrator</p>
                    </div>
                    <ul className="text-xs text-slate-600 space-y-1.5 pt-1">
                      <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-[#0070BA] shrink-0" /> Manage All Stores & Branches</li>
                      <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-[#0070BA] shrink-0" /> Regulatory Approvals & Medicine Recalls</li>
                      <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-[#0070BA] shrink-0" /> System Sales & Revenue Overview</li>
                      <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-[#0070BA] shrink-0" /> Send System Announcements</li>
                      <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-[#0070BA] shrink-0" /> Manage All Staff & User Accounts</li>
                    </ul>
                  </div>

                  {/* Drug Store Owner */}
                  <div className="p-5 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-600 text-white uppercase tracking-wider">
                        Tier 2
                      </span>
                      <Store className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-blue-950 text-sm">Drug Store Owner</h4>
                      <p className="text-xs text-blue-700">Store Manager & Owner</p>
                    </div>
                    <ul className="text-xs text-slate-600 space-y-1.5 pt-1">
                      <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-blue-600 shrink-0" /> Store Details & Business License</li>
                      <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-blue-600 shrink-0" /> Manage Medicine Stock & Expiry Dates</li>
                      <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-blue-600 shrink-0" /> Order from Suppliers & Pay Bills</li>
                      <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-blue-600 shrink-0" /> Daily Sales Reports & Profits</li>
                      <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-blue-600 shrink-0" /> Invite & Manage Store Employees</li>
                    </ul>
                  </div>

                  {/* Pharmacist */}
                  <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-600 text-white uppercase tracking-wider">
                        Tier 3
                      </span>
                      <Pill className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-emerald-950 text-sm">Pharmacist</h4>
                      <p className="text-xs text-emerald-700">Front-Desk Cashier & Pharmacist</p>
                    </div>
                    <ul className="text-xs text-slate-600 space-y-1.5 pt-1">
                      <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> Fast Cashier Checkout & Receipts</li>
                      <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> Check Prescriptions & Dispense Medicines</li>
                      <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> Accept Telebirr & CBE Birr QR Payments</li>
                      <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> Cash Drawer Handover & Shift Reports</li>
                      <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> Quick Medicine Search & Stock Check</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 7: PLATFORM ANNOUNCEMENTS & SYSTEM HEALTH */}
      {/* ========================================================================= */}
      {activeTab === 'SYSTEM_HEALTH' && (
        <div className="space-y-4">
          {/* Sub-tab bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-slate-200/80 shadow-2xs">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              <button
                type="button"
                onClick={() => setSystemHealthSubTab('BROADCAST')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  systemHealthSubTab === 'BROADCAST'
                    ? 'bg-[#0070BA] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Radio className="h-3.5 w-3.5" />
                <span>Send Store Announcement</span>
              </button>

              <button
                type="button"
                onClick={() => setSystemHealthSubTab('TELEMETRY')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  systemHealthSubTab === 'TELEMETRY'
                    ? 'bg-[#0070BA] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Server className="h-3.5 w-3.5" />
                <span>System & Database Health</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Broadcaster */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#0070BA] text-white flex items-center justify-center">
                  <Send className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">
                    Send Store Announcement
                  </h3>
                  <p className="text-xs text-slate-500">
                    Send an urgent alert or important notice to all store cashiers immediately.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSendBroadcast} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Urgency Level
                  </label>
                  <div className="flex items-center gap-2">
                    {(['STANDARD', 'URGENT', 'EMERGENCY'] as const).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setBroadcastPriority(p)}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                          broadcastPriority === p
                            ? p === 'EMERGENCY'
                              ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                              : p === 'URGENT'
                              ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                              : 'bg-[#0070BA] text-white shadow-md shadow-[#0070BA]/30'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {p === 'STANDARD' ? 'Normal' : p === 'URGENT' ? 'Urgent' : 'Critical'}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Announcement Message Content
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={broadcastMessage}
                    onChange={(e) => setBroadcastMessage(e.target.value)}
                    placeholder="Type announcement, medicine recall alert, or system update here..."
                    className="w-full rounded-2xl border border-slate-200 p-3 text-xs text-slate-900 focus:outline-none focus:border-[#0070BA]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isBroadcasting || !broadcastMessage.trim()}
                  className="w-full py-3 rounded-2xl bg-[#0070BA] hover:bg-[#0070BA] text-white font-bold text-xs transition shadow-md shadow-[#0070BA]/20 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  <Zap className="h-4 w-4 text-amber-300" />
                  <span>{isBroadcasting ? 'Sending...' : `Send Announcement to All ${pharmacyFleet.length} Stores`}</span>
                </button>
              </form>

              {/* Live Banner Preview */}
              {broadcastMessage.trim() && (
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    How Stores Will See This Notice
                  </span>
                  <div className={`p-2.5 rounded-xl text-xs font-semibold flex items-start gap-2 ${
                    broadcastPriority === 'EMERGENCY'
                      ? 'bg-rose-50 text-rose-800 border border-rose-200'
                      : broadcastPriority === 'URGENT'
                      ? 'bg-amber-50 text-amber-800 border border-amber-200'
                      : 'bg-[#E0EFF9] text-[#005A96] border border-[#BAE0F4]'
                  }`}>
                    <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-extrabold uppercase text-[10px] mr-1.5">[{broadcastPriority}]</span>
                      {broadcastMessage}
                    </div>
                  </div>
                </div>
              )}

              {/* Dispatched Broadcasts History */}
              {broadcastLogs.length > 0 && (
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <span className="text-[11px] font-bold text-slate-500">
                    Recent Announcements ({broadcastLogs.length})
                  </span>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {broadcastLogs.map((log) => (
                      <div key={log.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-[11px] flex items-center justify-between gap-2">
                        <div className="truncate flex-1">
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-black mr-1.5 ${
                            log.priority === 'EMERGENCY' ? 'bg-rose-100 text-rose-700' :
                            log.priority === 'URGENT' ? 'bg-amber-100 text-amber-700' :
                            'bg-[#E0EFF9] text-[#005A96]'
                          }`}>
                            {log.priority}
                          </span>
                          <span className="text-slate-700">{log.message}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 shrink-0">{log.timestamp}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Infrastructure Health */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center">
                    <Server className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900">
                      System & Server Health
                    </h3>
                    <p className="text-xs text-slate-500">Live server status and database sync health.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRunDiagnostics}
                  disabled={isDiagnosticsRunning}
                  className="px-3 py-1.5 rounded-xl bg-[#E0EFF9] hover:bg-[#E0EFF9] text-[#005A96] font-bold text-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isDiagnosticsRunning ? 'animate-spin' : ''}`} />
                  <span>{isDiagnosticsRunning ? 'Checking...' : 'Check System Health'}</span>
                </button>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="p-3.5 rounded-2xl bg-slate-50 flex items-center justify-between border border-slate-100">
                  <div>
                    <div className="font-bold text-slate-800">Database Sync (PostgreSQL)</div>
                    <div className="text-[10px] text-slate-400">Main Database & Automated Backups</div>
                  </div>
                  <span className="text-emerald-600 font-bold flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> All In Sync
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 flex items-center justify-between border border-slate-100">
                  <div>
                    <div className="font-bold text-slate-800">Offline Cashier Mode (PWA)</div>
                    <div className="text-[10px] text-slate-400">Works even if store internet disconnects</div>
                  </div>
                  <span className="text-emerald-600 font-bold flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Ready & Active
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 flex items-center justify-between border border-slate-100">
                  <div>
                    <div className="font-bold text-slate-800">Regulatory License Check (EFDA)</div>
                    <div className="text-[10px] text-slate-400">Verifies store licenses and tax ID automatically</div>
                  </div>
                  <span className="text-emerald-600 font-bold flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Connected & Working
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 flex items-center justify-between border border-slate-100">
                  <div>
                    <div className="font-bold text-slate-800">Telebirr & CBE Birr Payments</div>
                    <div className="text-[10px] text-slate-400">Instant QR payment confirmations</div>
                  </div>
                  <span className="text-emerald-600 font-bold flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Working Smoothly (99.98%)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🔍 MODAL 1: INSPECT PHARMACY NODE MODAL */}
      {/* ========================================================================= */}
      {inspectNode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95">
            {/* Header */}
            <div className="bg-[#0060df] text-white p-6 relative">
              <button
                type="button"
                onClick={() => setInspectNode(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-white font-bold">
                  <Store className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">{inspectNode.storeName}</h3>
                  <p className="text-xs text-sky-100 flex items-center gap-2">
                    <span>{inspectNode.city}, {inspectNode.subcity}</span>
                    <span>•</span>
                    <span className="font-mono font-bold">{inspectNode.efdaLicense}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Content Details */}
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-slate-400 font-bold uppercase text-[10px]">TIN Number (Tax ID)</span>
                  <div className="text-sm font-black text-slate-900 font-mono">{inspectNode.tinNumber}</div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-slate-400 font-bold uppercase text-[10px]">Monthly Sales</span>
                  <div className="text-sm font-black text-emerald-600 font-mono">{formatCurrency(inspectNode.monthlyGmv)}</div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-slate-400 font-bold uppercase text-[10px] block">Store Owner / Manager</span>
                <div className="font-extrabold text-slate-900 text-sm">{inspectNode.ownerName}</div>
                <div className="text-slate-500 flex flex-wrap gap-4">
                  <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" /> {inspectNode.ownerEmail}</span>
                  <span className="flex items-center gap-1 font-mono"><Phone className="h-3.5 w-3.5" /> {inspectNode.ownerPhone}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 text-[10px] block">Medicines in Stock</span>
                  <span className="font-black text-sm text-slate-900 font-mono">{inspectNode.skuCount} Medicines</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 text-[10px] block">Active Staff</span>
                  <span className="font-black text-sm text-slate-900 font-mono">{inspectNode.activeStaffCount} Staff</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 text-[10px] block">Medicine Fridge</span>
                  <span className="font-black text-sm text-sky-600">{inspectNode.coldChainReady ? 'Yes (2-8°C)' : 'None'}</span>
                </div>
              </div>

              {/* Super Admin Audit & Inspection Launchpad */}
              {onSwitchToStoreWorkstation && (
                <div className="p-4 rounded-2xl bg-[#E0EFF9]/70 border border-[#BAE0F4] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-950 flex items-center gap-1.5">
                      <ShieldCheck className="h-4 w-4 text-[#0070BA]" />
                      Visit Store Sections
                    </span>
                    <span className="text-[10px] text-[#0070BA] font-semibold">
                      Admin View & Edit Mode
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const targetId = inspectNode.id;
                        setInspectNode(null);
                        onSwitchToStoreWorkstation(targetId, 'pos');
                      }}
                      className="py-2 px-2.5 rounded-xl bg-white hover:bg-[#0070BA] hover:text-white border border-[#BAE0F4] text-slate-800 font-bold text-[11px] transition shadow-xs flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Store className="h-3.5 w-3.5" />
                      <span>Cashier POS</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const targetId = inspectNode.id;
                        setInspectNode(null);
                        onSwitchToStoreWorkstation(targetId, 'inventory');
                      }}
                      className="py-2 px-2.5 rounded-xl bg-white hover:bg-[#0070BA] hover:text-white border border-[#BAE0F4] text-slate-800 font-bold text-[11px] transition shadow-xs flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Pill className="h-3.5 w-3.5" />
                      <span>Medicine Stock</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const targetId = inspectNode.id;
                        setInspectNode(null);
                        onSwitchToStoreWorkstation(targetId, 'sales');
                      }}
                      className="py-2 px-2.5 rounded-xl bg-white hover:bg-[#0070BA] hover:text-white border border-[#BAE0F4] text-slate-800 font-bold text-[11px] transition shadow-xs flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      <span>Sales & Invoices</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const targetId = inspectNode.id;
                        setInspectNode(null);
                        onSwitchToStoreWorkstation(targetId, 'reports');
                      }}
                      className="py-2 px-2.5 rounded-xl bg-white hover:bg-[#0070BA] hover:text-white border border-[#BAE0F4] text-slate-800 font-bold text-[11px] transition shadow-xs flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <TrendingUp className="h-3.5 w-3.5" />
                      <span>Daily Z-Report</span>
                    </button>
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleNodeStatus(inspectNode.id)}
                    className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-100 transition cursor-pointer"
                  >
                    {inspectNode.status === 'ACTIVE' ? 'Pause Store' : 'Activate Store'}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const target = inspectNode;
                      setInspectNode(null);
                      handleStartEditNode(target);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Edit className="h-3.5 w-3.5" />
                    <span>Edit Store Details</span>
                  </button>
                </div>

                {onSwitchToStoreWorkstation && (
                  <button
                    type="button"
                    onClick={() => {
                      const targetId = inspectNode.id;
                      setInspectNode(null);
                      onSwitchToStoreWorkstation(targetId, 'dashboard');
                    }}
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#0070BA] hover:bg-[#0070BA] text-white font-bold transition shadow-md shadow-[#0070BA]/20 cursor-pointer"
                  >
                    <Store className="h-4 w-4" />
                    <span>Open Store Dashboard</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ✏️ MODAL 1B: EDIT PHARMACY NODE MODAL */}
      {/* ========================================================================= */}
      {editingNode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-xl rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95">
            <div className="bg-[#0060df] text-white p-6 relative">
              <button
                type="button"
                onClick={() => setEditingNode(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-white">
                  <Edit className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Edit Store Information</h3>
                  <p className="text-xs text-sky-100">Update license, tax ID, or contact details for {editingNode.storeName}</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSaveEditNode} className="p-6 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="block text-slate-700 font-bold">Store / Pharmacy Name</label>
                <input
                  type="text"
                  required
                  value={nodeEditForm.storeName}
                  onChange={(e) => setNodeEditForm({ ...nodeEditForm, storeName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-slate-700 font-bold">City</label>
                  <input
                    type="text"
                    required
                    value={nodeEditForm.city}
                    onChange={(e) => setNodeEditForm({ ...nodeEditForm, city: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-slate-700 font-bold">Subcity / Area</label>
                  <input
                    type="text"
                    required
                    value={nodeEditForm.subcity}
                    onChange={(e) => setNodeEditForm({ ...nodeEditForm, subcity: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-slate-700 font-bold">TIN Number (Tax ID)</label>
                  <input
                    type="text"
                    required
                    value={nodeEditForm.tinNumber}
                    onChange={(e) => setNodeEditForm({ ...nodeEditForm, tinNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-slate-700 font-bold">EFDA Pharmacy License</label>
                  <input
                    type="text"
                    required
                    value={nodeEditForm.efdaLicense}
                    onChange={(e) => setNodeEditForm({ ...nodeEditForm, efdaLicense: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-slate-700 font-bold">Contact Email</label>
                  <input
                    type="email"
                    required
                    value={nodeEditForm.ownerEmail}
                    onChange={(e) => setNodeEditForm({ ...nodeEditForm, ownerEmail: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-slate-700 font-bold">Contact Phone</label>
                  <input
                    type="text"
                    required
                    value={nodeEditForm.ownerPhone}
                    onChange={(e) => setNodeEditForm({ ...nodeEditForm, ownerPhone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={nodeEditForm.coldChainReady}
                    onChange={(e) => setNodeEditForm({ ...nodeEditForm, coldChainReady: e.target.checked })}
                    className="rounded text-[#0070BA]"
                  />
                  <span className="font-bold text-slate-700">Medicine Fridge (2°C - 8°C)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={nodeEditForm.is24Hours}
                    onChange={(e) => setNodeEditForm({ ...nodeEditForm, is24Hours: e.target.checked })}
                    className="rounded text-[#0070BA]"
                  />
                  <span className="font-bold text-slate-700">Open 24/7 (Emergency Service)</span>
                </label>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setEditingNode(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0070BA] hover:bg-[#0070BA] text-white font-bold transition shadow-md shadow-[#0070BA]/30 flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ⚠️ MODAL 2: ISSUE MEDICINE RECALL NOTICE */}
      {/* ========================================================================= */}
      {isNewRecallModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95">
            <div className="bg-rose-600 text-white p-6 relative">
              <button
                type="button"
                onClick={() => setIsNewRecallModalOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-white">
                  <AlertOctagon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Issue Medicine Recall Notice</h3>
                  <p className="text-xs text-rose-100">Immediately stops cashiers at all stores from selling this medicine batch.</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleCreateRecall} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Medicine Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Paracetamol Pediatric Syrup 120mg/5ml"
                  value={newRecallForm.drugName}
                  onChange={(e) => setNewRecallForm({ ...newRecallForm, drugName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:border-rose-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Batch Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="BATCH-2026-ETH-991"
                    value={newRecallForm.batchNumber}
                    onChange={(e) => setNewRecallForm({ ...newRecallForm, batchNumber: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:border-rose-500 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Manufacturer
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Local Pharma Corp Ltd"
                    value={newRecallForm.manufacturer}
                    onChange={(e) => setNewRecallForm({ ...newRecallForm, manufacturer: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Reason for Recall <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe why this medicine is being recalled (e.g. quality issue, damaged packaging)..."
                  value={newRecallForm.issueReason}
                  onChange={(e) => setNewRecallForm({ ...newRecallForm, issueReason: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setIsNewRecallModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold transition shadow-md shadow-rose-600/30 flex items-center gap-2 cursor-pointer"
                >
                  <AlertOctagon className="h-4 w-4" />
                  <span>Pause Medicine Sale at All Stores</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 💊 MODAL 3: ADD MEDICINE TO CATALOG */}
      {/* ========================================================================= */}
      {isAddCatalogModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95">
            <div className="bg-[#0070BA] text-white p-6 relative">
              <button
                type="button"
                onClick={() => setIsAddCatalogModalOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-white font-bold">
                  <Pill className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Add Medicine to Catalog</h3>
                  <p className="text-xs text-[#E0EFF9]">Add to the medicine catalog and set maximum allowed price.</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleCreateMasterSku} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Brand Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Amoxil 500mg"
                    value={newSkuForm.brandName}
                    onChange={(e) => setNewSkuForm({ ...newSkuForm, brandName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:border-[#0070BA] font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Generic / Chemical Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Amoxicillin Trihydrate"
                    value={newSkuForm.genericName}
                    onChange={(e) => setNewSkuForm({ ...newSkuForm, genericName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:border-[#0070BA]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    License / Registry Code
                  </label>
                  <input
                    type="text"
                    placeholder="EFDA-MED-00291"
                    value={newSkuForm.efdaCode}
                    onChange={(e) => setNewSkuForm({ ...newSkuForm, efdaCode: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:border-[#0070BA] font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Medicine Category
                  </label>
                  <input
                    type="text"
                    placeholder="Antibiotic / Penicillin"
                    value={newSkuForm.therapeuticClass}
                    onChange={(e) => setNewSkuForm({ ...newSkuForm, therapeuticClass: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:border-[#0070BA]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Form
                  </label>
                  <select
                    value={newSkuForm.dosageForm}
                    onChange={(e) => setNewSkuForm({ ...newSkuForm, dosageForm: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none"
                  >
                    <option value="Tablet">Tablet</option>
                    <option value="Capsule">Capsule</option>
                    <option value="Syrup">Syrup</option>
                    <option value="Injectable">Injectable</option>
                    <option value="Ointment">Ointment</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Strength
                  </label>
                  <input
                    type="text"
                    placeholder="500 mg"
                    value={newSkuForm.strength}
                    onChange={(e) => setNewSkuForm({ ...newSkuForm, strength: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Max Allowed Price (ETB)
                  </label>
                  <input
                    type="number"
                    value={newSkuForm.maxRetailPrice}
                    onChange={(e) => setNewSkuForm({ ...newSkuForm, maxRetailPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newSkuForm.isControlled}
                    onChange={(e) => setNewSkuForm({ ...newSkuForm, isControlled: e.target.checked })}
                    className="rounded text-[#0070BA]"
                  />
                  <span className="text-xs font-bold text-slate-700">Prescription Only (Controlled)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newSkuForm.requiresColdChain}
                    onChange={(e) => setNewSkuForm({ ...newSkuForm, requiresColdChain: e.target.checked })}
                    className="rounded text-[#0070BA]"
                  />
                  <span className="text-xs font-bold text-slate-700">Requires Fridge (2°C - 8°C)</span>
                </label>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddCatalogModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#0070BA] hover:bg-[#0070BA] text-white font-bold transition shadow-md shadow-[#0070BA]/30 flex items-center gap-2 cursor-pointer"
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>Save Medicine to Catalog</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
