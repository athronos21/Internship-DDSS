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
      ownerName: 'Dr. Alemu Tadesse',
      ownerEmail: 'admin@kaziniya.com',
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
      id: 'st-01',
      name: 'Dr. Alemu Tadesse',
      email: 'admin@kaziniya.com',
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
      name: 'Pharm. Solomon Bekele',
      email: 'pharmacist@kaziniya.com',
      phone: '+251 933 456 789',
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
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 sm:p-4 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Left: Brand / Network Identity & Threat Posture */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-950 dark:bg-slate-800 text-amber-400 flex items-center justify-center shadow-xs shrink-0">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white">
                  National Pharmacy Network
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300/40">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  6 Nodes Live
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                EFDA Tier-4 Governance Mesh • Addis Ababa & Federal Regions
              </p>
            </div>
          </div>

          {/* Threat Posture Selector */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700">
            <span className="text-[10px] font-extrabold uppercase text-slate-400 px-1.5">Posture:</span>
            <button
              type="button"
              onClick={() => {
                setSystemAlertLevel('NORMAL');
                showToast('System Alert Level set to Normal (Standard EFDA regulatory protocols active).', 'info', 'Threat Posture: Normal');
              }}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-black transition cursor-pointer ${
                systemAlertLevel === 'NORMAL'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Normal
            </button>
            <button
              type="button"
              onClick={() => {
                setSystemAlertLevel('ELEVATED');
                showToast('System Alert Level set to Elevated (Mandatory narcotic check & hourly sync enforced).', 'warning', 'Threat Posture: Elevated');
              }}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-black transition cursor-pointer ${
                systemAlertLevel === 'ELEVATED'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Elevated
            </button>
            <button
              type="button"
              onClick={() => {
                setSystemAlertLevel('CRITICAL');
                showToast('System Alert Level set to Lockdown (National batch quarantine enforcement).', 'error', 'Threat Posture: Lockdown');
              }}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-black transition cursor-pointer ${
                systemAlertLevel === 'CRITICAL'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Lockdown
            </button>
          </div>
        </div>

        {/* Right: Directives Dropdown Menu & Quick Action */}
        <div className="flex items-center gap-2 self-stretch md:self-auto justify-between md:justify-end">
          {/* Directives & Actions Dropdown Menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsDirectivesMenuOpen((prev) => !prev)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-xs cursor-pointer shrink-0"
              title="Super Admin Directives & Operations Menu"
            >
              <Zap className="h-3.5 w-3.5 text-amber-300 shrink-0" />
              <span>Directives & Actions</span>
              <ChevronDown className="h-3.5 w-3.5 text-white/70" />
            </button>

            {/* Directives Dropdown Menu */}
            {isDirectivesMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsDirectivesMenuOpen(false)}
                />
                <div className="absolute right-0 top-full mt-1.5 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 py-1.5 z-50 text-xs text-slate-700 dark:text-slate-200 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800">
                    Regulatory & Fleet Directives
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
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-left font-semibold text-slate-900 dark:text-white transition cursor-pointer"
                  >
                    <PlusCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                    <div>
                      <div className="font-bold leading-tight">Onboard Pharmacy</div>
                      <div className="text-[10px] text-slate-500">Register licensed retail node</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsDirectivesMenuOpen(false);
                      setIsNewRecallModalOpen(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-left font-semibold text-slate-900 dark:text-white transition cursor-pointer"
                  >
                    <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
                    <div>
                      <div className="font-bold leading-tight">Issue EFDA Recall</div>
                      <div className="text-[10px] text-slate-500">Lock defective batch nationwide</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsDirectivesMenuOpen(false);
                      setLockdownTargetNode(pharmacyFleet[0] || null);
                      setIsEmergencyLockdownModalOpen(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-left font-semibold text-rose-600 dark:text-rose-400 transition cursor-pointer"
                  >
                    <Lock className="h-4 w-4 text-rose-600 shrink-0" />
                    <div>
                      <div className="font-bold leading-tight">Emergency POS Lockdown</div>
                      <div className="text-[10px] text-rose-500">Quarantine compromised terminal</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsDirectivesMenuOpen(false);
                      setActiveTab('SYSTEM_HEALTH');
                      setSystemHealthSubTab('BROADCAST');
                    }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-left font-semibold text-slate-900 dark:text-white transition cursor-pointer"
                  >
                    <Radio className="h-4 w-4 text-indigo-600 shrink-0" />
                    <div>
                      <div className="font-bold leading-tight">Broadcast Advisory</div>
                      <div className="text-[10px] text-slate-500">Transmit banner to counter POS</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsDirectivesMenuOpen(false);
                      setIsExportDossierModalOpen(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-left font-semibold text-slate-900 dark:text-white transition cursor-pointer"
                  >
                    <FileText className="h-4 w-4 text-purple-600 shrink-0" />
                    <div>
                      <div className="font-bold leading-tight">Export Compliance Dossier</div>
                      <div className="text-[10px] text-slate-500">Download EFDA audit dossier</div>
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
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-xs cursor-pointer whitespace-nowrap"
            >
              <PlusCircle className="h-3.5 w-3.5 shrink-0" />
              <span className="hidden sm:inline">Onboard</span>
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 🧭 SUPER ADMIN MAIN MENU & NAVIGATION BAR */}
      {/* ========================================================================= */}
      <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-2.5 pt-0.5 border-b border-slate-200 dark:border-slate-800 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
        <button
          type="button"
          onClick={() => setActiveTab('HUB')}
          className={`px-3.5 py-2 rounded-2xl text-xs font-black transition flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === 'HUB'
              ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950 shadow-md'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
          }`}
        >
          <Shield className="h-4 w-4 text-amber-400 shrink-0" />
          <span>Command Hub</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('NODES')}
          className={`px-3.5 py-2 rounded-2xl text-xs font-black transition flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === 'NODES'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
          }`}
        >
          <Building2 className="h-4 w-4 shrink-0" />
          <span>Pharmacy Nodes & Fleets ({pharmacyFleet.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('ANALYTICS')}
          className={`px-3.5 py-2 rounded-2xl text-xs font-black transition flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === 'ANALYTICS'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
          }`}
        >
          <BarChart3 className="h-4 w-4 shrink-0" />
          <span>Pharmacy & Drug Store Analytics</span>
          <span className="bg-emerald-500 text-white px-1.5 py-0.5 rounded-full text-[9px] font-black shrink-0 whitespace-nowrap">
            Live Charts
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('COMPLIANCE')}
          className={`px-3.5 py-2 rounded-2xl text-xs font-black transition flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === 'COMPLIANCE'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
          }`}
        >
          <FileCheck className="h-4 w-4 shrink-0" />
          <span>EFDA Approvals & Recalls</span>
          {(pendingNodesCount > 0 || criticalRecallsCount > 0) && (
            <span className="bg-amber-400 text-slate-950 px-1.5 py-0.5 rounded-full text-[10px] font-black shrink-0 whitespace-nowrap">
              {pendingNodesCount + criticalRecallsCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('GLOBAL_CATALOG')}
          className={`px-3.5 py-2 rounded-2xl text-xs font-black transition flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === 'GLOBAL_CATALOG'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
          }`}
        >
          <Pill className="h-4 w-4 shrink-0" />
          <span>National Medicine Index</span>
          {criticalShortagesCount > 0 && (
            <span className="bg-rose-500 text-white px-1.5 py-0.5 rounded-full text-[10px] font-black shrink-0 whitespace-nowrap">
              {criticalShortagesCount} Short
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('FINANCIALS')}
          className={`px-3.5 py-2 rounded-2xl text-xs font-black transition flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === 'FINANCIALS'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
          }`}
        >
          <DollarSign className="h-4 w-4 shrink-0" />
          <span>Multi-Store Financials</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('STAFF')}
          className={`px-3.5 py-2 rounded-2xl text-xs font-black transition flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === 'STAFF'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
          }`}
        >
          <Users className="h-4 w-4 shrink-0" />
          <span>National Staff Directory</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('SYSTEM_HEALTH')}
          className={`px-3.5 py-2 rounded-2xl text-xs font-black transition flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === 'SYSTEM_HEALTH'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
          }`}
        >
          <Server className="h-4 w-4 shrink-0" />
          <span>Platform & Broadcasts</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 0: EXECUTIVE COMMAND HUB OVERVIEW */}
      {/* ========================================================================= */}
      {activeTab === 'HUB' && (
        <div className="space-y-6">
          {/* Section 1: Super Admin National Regulatory & Threat Matrix */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: EFDA Active Recalls & POS Locks */}
            <div className="p-5 rounded-3xl bg-slate-900 border border-rose-500/40 text-white space-y-3 shadow-md relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertOctagon className="h-4 w-4 text-rose-400" />
                  <span>EFDA Batch Recalls</span>
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500/30 text-rose-300 border border-rose-400/30">
                  CRITICAL
                </span>
              </div>
              <div>
                <div className="text-2xl font-black font-mono text-rose-200">{criticalRecallsCount} Batches Quarantined</div>
                <p className="text-xs text-rose-200/80 mt-1">1,240 units locked across 6 store POS counters nationwide.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('COMPLIANCE');
                  setComplianceSubTab('RECALLS');
                }}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-300 hover:text-white transition cursor-pointer"
              >
                <span>Inspect recall enforcement</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Card 2: Price Ceiling Surveillance */}
            <div className="p-5 rounded-3xl bg-slate-900 border border-amber-500/40 text-white space-y-3 shadow-md relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldAlert className="h-4 w-4 text-amber-400" />
                  <span>EFDA Price Ceilings</span>
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/30 text-amber-300 border border-amber-400/30">
                  SURVEILLANCE
                </span>
              </div>
              <div>
                <div className="text-2xl font-black font-mono text-amber-200">3 SKUs Exceeding Cap</div>
                <p className="text-xs text-amber-200/80 mt-1">Automated price variance audit active across 1,420 SKUs.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('GLOBAL_CATALOG');
                  setCatalogSubTab('PRICE_CEILINGS');
                }}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-300 hover:text-white transition cursor-pointer"
              >
                <span>Audit ceiling violations</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Card 3: FEFO Expiry Risk Pipeline */}
            <div className="p-5 rounded-3xl bg-slate-900 border border-indigo-500/40 text-white space-y-3 shadow-md relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-indigo-400" />
                  <span>FEFO Expiry Risk</span>
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-500/30 text-indigo-300 border border-indigo-400/30">
                  MONITORED
                </span>
              </div>
              <div>
                <div className="text-2xl font-black font-mono text-indigo-200">ETB 14,200 At Risk</div>
                <p className="text-xs text-indigo-200/80 mt-1">Near-expiry stock tagged for inter-branch replenishment.</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('ANALYTICS')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-300 hover:text-white transition cursor-pointer"
              >
                <span>Review FEFO risk pipeline</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Card 4: Cold-Chain Stability */}
            <div className="p-5 rounded-3xl bg-slate-900 border border-emerald-500/40 text-white space-y-3 shadow-md relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>Cold-Chain Stability</span>
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/30 text-emerald-300 border border-emerald-400/30">
                  OPTIMAL
                </span>
              </div>
              <div>
                <div className="text-2xl font-black font-mono text-emerald-200">6 / 6 Safe (2°C - 8°C)</div>
                <p className="text-xs text-emerald-200/80 mt-1">Zero thermal breaches in insulin & vaccine storage.</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('ANALYTICS')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-300 hover:text-white transition cursor-pointer"
              >
                <span>View sensor telemetry</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Section 2: Executive Pharmacy Fleet Dispensing & GMV Trends Overview */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-indigo-600" />
                  <span>National Pharmacy Network Dispensing Pulse</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    Live Telemetry
                  </span>
                </h3>
                <p className="text-xs text-slate-500">
                  Consolidated 14-day gross dispensing revenues (ETB) and verified prescription orders across all operating stores.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab('ANALYTICS')}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-bold text-xs transition cursor-pointer self-start sm:self-auto"
              >
                <span>Open Full Analytics Suite</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Avg Daily Turnover</span>
                <div className="text-lg font-black font-mono text-slate-900 dark:text-white">ETB 242.8k</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Daily Prescriptions</span>
                <div className="text-lg font-black font-mono text-slate-900 dark:text-white">1,280 Rx/day</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Digital Settlement</span>
                <div className="text-lg font-black font-mono text-emerald-600">90.0% Cashless</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Cold-Chain Excursions</span>
                <div className="text-lg font-black font-mono text-indigo-600">0 Reported</div>
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
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                  <XAxis dataKey="day" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `ETB ${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(v: any) => [formatCurrency(Number(v)), 'GMV']}
                    contentStyle={{ borderRadius: '12px', backgroundColor: '#0f172a', color: '#fff', border: 'none' }}
                  />
                  <Area type="monotone" dataKey="gmv" stroke="#4f46e5" strokeWidth={2.5} fill="url(#hubGmvGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Section 3: Live Real-Time Multi-Store Audit Trail & Governance Event Stream */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Terminal className="h-5 w-5 text-indigo-600" />
                  <span>Immutable Multi-Tenant Governance Audit Stream</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Cryptographically verified real-time stream of regulatory, narcotic, cold-chain, and financial clearinghouse events across all connected pharmacy nodes.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Sync
                </span>
                <button
                  type="button"
                  onClick={() => setIsExportDossierModalOpen(true)}
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Export Log</span>
                </button>
              </div>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {adminAuditTrail.map((ev) => (
                <div key={ev.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="flex items-start sm:items-center gap-3">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black shrink-0 ${
                      ev.severity === 'CRITICAL'
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                        : ev.severity === 'WARNING'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                        : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                    }`}>
                      {ev.category.replace('_', ' ')}
                    </span>

                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        <span>{ev.action}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                        <span className="font-bold text-slate-700 dark:text-slate-300">{ev.facility}</span>
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

          {/* Section 4: Connected Pharmacy Fleet Quick Surveillance Board & Quick Broadcast */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Pharmacy Fleet Nodes List */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <Store className="h-5 w-5 text-indigo-600" />
                    <span>Pharmacy Fleet Operations & Remote Governance</span>
                  </h3>
                  <p className="text-xs text-slate-500">Live operational status, licensing verification, and emergency quarantine controls</p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('NODES')}
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>View All ({pharmacyFleet.length})</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {pharmacyFleet.slice(0, 4).map((node) => (
                  <div key={node.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center font-black text-xs shrink-0">
                        <Store className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                          <span>{node.storeName}</span>
                          {node.status === 'ACTIVE' ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded">
                              <span className="w-1 h-1 rounded-full bg-emerald-500" />
                              LIVE
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-black text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded">
                              {node.status}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                          <span>{node.city}, {node.subcity}</span>
                          <span>•</span>
                          <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">{node.efdaLicense}</span>
                          <span>•</span>
                          <span>{node.activeStaffCount} Staff</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                      <div className="text-left sm:text-right">
                        <div className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                          {formatCurrency(node.monthlyGmv)}
                        </div>
                        <div className="text-[10px] text-slate-400">{node.skuCount} Catalog SKUs</div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setInspectNode(node)}
                          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition cursor-pointer"
                          title="Inspect Pharmacy Facility"
                        >
                          <Eye className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setLockdownTargetNode(node);
                            setIsEmergencyLockdownModalOpen(true);
                          }}
                          className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 transition cursor-pointer"
                          title="Remote POS Lockdown / Quarantine"
                        >
                          <Lock className="h-4 w-4" />
                        </button>

                        {onSwitchToStoreWorkstation && (
                          <button
                            type="button"
                            onClick={() => onSwitchToStoreWorkstation(node.id, 'pos')}
                            className="p-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 transition cursor-pointer"
                            title="Inspect Live Cashier Terminal"
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

            {/* Quick Broadcast Widget */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2.5 text-indigo-600 mb-2">
                  <Radio className="h-5 w-5 animate-pulse" />
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Emergency Network Broadcast</h3>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">
                  Transmit urgent regulatory directives and emergency bulletins directly to all active POS counters and cashier workstations nationwide.
                </p>

                {/* Preset Chips */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {[
                    'EFDA Urgent Recall Alert',
                    'Price Ceiling Audit Notice',
                    'Cold-Chain Temperature Check',
                    'Monthly VAT Settlement Due',
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setBroadcastMessage(`[SUPER ADMIN DIRECTIVE] ${preset}: Immediate verification required at all dispensing stations.`)}
                      className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium transition cursor-pointer"
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
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      Standard
                    </button>
                    <button
                      type="button"
                      onClick={() => setBroadcastPriority('URGENT')}
                      className={`flex-1 py-1.5 rounded-xl text-[10px] font-bold transition cursor-pointer ${
                        broadcastPriority === 'URGENT'
                          ? 'bg-amber-600 text-white'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      Urgent
                    </button>
                    <button
                      type="button"
                      onClick={() => setBroadcastPriority('EMERGENCY')}
                      className={`flex-1 py-1.5 rounded-xl text-[10px] font-bold transition cursor-pointer ${
                        broadcastPriority === 'EMERGENCY'
                          ? 'bg-rose-600 text-white'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
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
                    className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 dark:bg-slate-950 p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-600"
                  />

                  <button
                    type="submit"
                    disabled={isBroadcasting || !broadcastMessage.trim()}
                    className="w-full py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>{isBroadcasting ? 'Broadcasting...' : 'Broadcast to All Nodes'}</span>
                  </button>
                </form>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Total Reach: 6 Connected Stores</span>
                <span className="text-emerald-600 font-bold">100% Mesh Synced</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: PHARMACY NODES & FLEETS DIRECTORY */}
      {/* ========================================================================= */}
      {activeTab === 'NODES' && (
        <div className="space-y-4">
          {/* Sub-tab bar & action toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xs">
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
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                <Building2 className="h-3.5 w-3.5" />
                <span>All Connected Pharmacies ({pharmacyFleet.length})</span>
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
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
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
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Active Nodes ({activeNodesCount})</span>
              </button>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
              {onOpenOwnerRegistration && (
                <button
                  type="button"
                  onClick={onOpenOwnerRegistration}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-xs cursor-pointer"
                >
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span>Onboard New Pharmacy</span>
                </button>
              )}
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xs">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by store name, TIN, EFDA license, or owner..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-800 dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-600"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 dark:bg-slate-950 text-xs px-3 py-2 font-bold text-slate-700 dark:text-slate-200 focus:outline-none focus:border-indigo-600"
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
                    showToast('Pharmacy fleet telemetry synced successfully.', 'success', 'Fleet Synced');
                  }, 400);
                }}
                className="p-2 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-indigo-600 transition cursor-pointer"
                title="Refresh Fleet Status"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Nodes Table */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-950 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100 dark:border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4">Pharmacy Node & License</th>
                    <th className="py-3.5 px-4">Owner & Contact</th>
                    <th className="py-3.5 px-4">Location</th>
                    <th className="py-3.5 px-4">Catalog & Staff</th>
                    <th className="py-3.5 px-4">Monthly GMV</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Master Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredNodes.map((node) => (
                    <tr key={node.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                      {/* Node name & license */}
                      <td className="py-3.5 px-4">
                        <div className="font-extrabold text-slate-900 dark:text-white text-xs">
                          {node.storeName}
                        </div>
                        <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-mono font-bold flex items-center gap-1 mt-0.5">
                          <BadgeCheck className="h-3 w-3" />
                          <span>{node.efdaLicense}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">TIN: {node.tinNumber}</div>
                      </td>

                      {/* Owner */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-800 dark:text-slate-200">{node.ownerName}</div>
                        <div className="text-[10px] text-slate-400">{node.ownerEmail}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{node.ownerPhone}</div>
                      </td>

                      {/* Location */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-700 dark:text-slate-300">{node.city}</div>
                        <div className="text-[10px] text-slate-400">{node.subcity}</div>
                      </td>

                      {/* Catalog & Staff */}
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-slate-800 dark:text-slate-200">
                          {node.skuCount} SKUs
                        </div>
                        <div className="text-[10px] text-slate-400">{node.activeStaffCount} Staff members</div>
                        <div className="flex items-center gap-1 mt-1">
                          {node.coldChainReady && (
                            <span className="bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 text-[9px] font-bold px-1.5 py-0.2 rounded">
                              Cold Chain
                            </span>
                          )}
                          {node.is24Hours && (
                            <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[9px] font-bold px-1.5 py-0.2 rounded">
                              24/7
                            </span>
                          )}
                        </div>
                      </td>

                      {/* GMV */}
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                        {formatCurrency(node.monthlyGmv)}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {node.status === 'ACTIVE' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 whitespace-nowrap shrink-0">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Operational
                          </span>
                        )}
                        {node.status === 'PENDING_REVIEW' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800 whitespace-nowrap shrink-0">
                            <Clock className="h-3 w-3 text-amber-600" />
                            Pending Review
                          </span>
                        )}
                        {node.status === 'MAINTENANCE' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800 whitespace-nowrap shrink-0">
                            <AlertTriangle className="h-3 w-3 text-rose-600" />
                            Suspended
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
                              className="px-2.5 py-1 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:hover:bg-indigo-900 dark:text-indigo-200 font-bold text-[10px] transition flex items-center gap-1 cursor-pointer"
                              title="Inspect this store node profile"
                            >
                              <Eye className="h-3 w-3" />
                              <span>Inspect</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleStartEditNode(node)}
                            className="p-1 rounded-xl text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                            title="Edit Store Profile"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleToggleNodeStatus(node.id)}
                            className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                            title="Toggle Maintenance Mode"
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
      {/* TAB 2: EFDA REGULATORY COMPLIANCE & BATCH RECALLS */}
      {/* ========================================================================= */}
      {activeTab === 'COMPLIANCE' && (
        <div className="space-y-4">
          {/* Sub-tab bar & action toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xs">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              <button
                type="button"
                onClick={() => setComplianceSubTab('LICENSES')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  complianceSubTab === 'LICENSES'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                <FileCheck className="h-3.5 w-3.5" />
                <span>EFDA Facility Licenses & Verification</span>
              </button>

              <button
                type="button"
                onClick={() => setComplianceSubTab('RECALLS')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  complianceSubTab === 'RECALLS'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                <AlertOctagon className="h-3.5 w-3.5" />
                <span>National Batch Recalls ({criticalRecallsCount} Active)</span>
                {criticalRecallsCount > 0 && (
                  <span className="bg-rose-200 text-rose-950 px-1.5 rounded-full text-[9px] font-black">
                    LOCKED
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
              <span>Publish New Recall Notice</span>
            </button>
          </div>

          {/* Sub-view 1: RECALLS */}
          {complianceSubTab === 'RECALLS' && (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <AlertOctagon className="h-5 w-5 text-rose-600" />
                    <span>National Medicine Batch Recall Notices (Active Locks)</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Mandatory nationwide dispensing blocks for contaminated, sub-potent, or unregistered medicine lots.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <span className="text-xs font-bold text-slate-500">Filter:</span>
                {(['ALL', 'ACTIVE', 'RESOLVED'] as const).map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setRecallsFilter(filter)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                      recallsFilter === filter
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    {filter === 'ALL' && `All Recalls (${recalls.length})`}
                    {filter === 'ACTIVE' && `Active Locks (${recalls.filter((r) => r.status === 'ACTIVE_LOCK').length})`}
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
                          ? 'border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/20'
                          : 'border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/30 dark:bg-emerald-950/10'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-extrabold text-slate-900 dark:text-white text-xs">
                            {recall.drugName}
                          </span>
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-black ${
                            recall.status === 'ACTIVE_LOCK'
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200'
                              : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'
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
                        <p className="text-xs text-slate-600 dark:text-slate-300">{recall.issueReason}</p>
                        <div className="text-[11px] text-slate-400">
                          Manufacturer: {recall.manufacturer} • Issued on: {recall.recalledAt} • Affected: {recall.affectedStoresCount} stores
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {recall.status === 'ACTIVE_LOCK' ? (
                          <>
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 whitespace-nowrap shrink-0">
                              <Lock className="h-3.5 w-3.5 shrink-0" />
                              POS Terminal Locked
                            </span>
                            <button
                              type="button"
                              onClick={() => handleToggleRecallStatus(recall.id)}
                              className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition cursor-pointer whitespace-nowrap shrink-0"
                            >
                              Resolve & Lift Lock
                            </button>
                          </>
                        ) : (
                          <>
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 whitespace-nowrap shrink-0">
                              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                              Resolved & Quarantine Cleared
                            </span>
                            <button
                              type="button"
                              onClick={() => handleToggleRecallStatus(recall.id)}
                              className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-rose-200 text-xs font-bold text-rose-600 hover:bg-rose-50 transition cursor-pointer whitespace-nowrap shrink-0"
                            >
                              Re-lock Batch
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
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    EFDA Facility Licensing & Verification Queue
                  </h3>
                  <p className="text-xs text-slate-500">
                    Verify TIN authenticity, pharmacist licenses, and cold-chain compliance before activating public sales.
                  </p>
                </div>
                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded-full text-xs font-bold font-mono">
                  100% Platform Verified
                </span>
              </div>

              <div className="space-y-3">
                {pharmacyFleet.map((node) => (
                  <div
                    key={node.id}
                    className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900 dark:text-white text-xs">
                          {node.storeName}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 font-bold">
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xs">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              <button
                type="button"
                onClick={() => {
                  setCatalogSubTab('ALL');
                  setSearchQuery('');
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  catalogSubTab === 'ALL'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
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
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                <AlertTriangle className="h-3.5 w-3.5" />
                <span>Critical Shortage Alerts</span>
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
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                <DollarSign className="h-3.5 w-3.5" />
                <span>EFDA Price Ceilings</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsAddCatalogModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition shadow-xs cursor-pointer"
              >
                <PlusCircle className="h-3.5 w-3.5" />
                <span>Add Drug to National Index</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                National Essential Drug List (EDL) & Price Ceiling Master
              </h3>
              <p className="text-[11px] text-slate-500">
                Master pharmaceutical catalog synchronized across all {pharmacyFleet.length} connected Ethiopian pharmacies.
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Filter drug, EFDA code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-600"
              />
            </div>
          </div>

          {/* Master Catalog Table */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-950 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100 dark:border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4">Brand / Generic Formulation</th>
                    <th className="py-3.5 px-4">EFDA Registry Code</th>
                    <th className="py-3.5 px-4">Therapeutic Class</th>
                    <th className="py-3.5 px-4">Dosage & Strength</th>
                    <th className="py-3.5 px-4">Price Ceiling (ETB)</th>
                    <th className="py-3.5 px-4">Special Flags</th>
                    <th className="py-3.5 px-4 text-right">Shortage Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
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
                    <tr key={item.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-extrabold text-slate-900 dark:text-white text-xs">
                          {item.brandName}
                        </div>
                        <div className="text-[11px] text-slate-500 italic">{item.genericName}</div>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {item.efdaCode}
                      </td>

                      <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 font-medium">
                        {item.therapeuticClass}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">{item.dosageForm}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{item.strength}</div>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                        {formatCurrency(item.maxRetailPrice)}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1">
                          {item.isControlled && (
                            <span className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 text-[9px] font-bold px-1.5 py-0.5 rounded">
                              Schedule II (Narcotic)
                            </span>
                          )}
                          {item.requiresColdChain && (
                            <span className="bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 text-[9px] font-bold px-1.5 py-0.5 rounded">
                              Cold Chain (2-8°C)
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        {item.nationalShortageRisk === 'CRITICAL' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 whitespace-nowrap shrink-0">
                            <AlertTriangle className="h-3 w-3 text-rose-600 shrink-0" />
                            National Shortage
                          </span>
                        )}
                        {item.nationalShortageRisk === 'LOW' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 whitespace-nowrap shrink-0">
                            Supply Alert
                          </span>
                        )}
                        {item.nationalShortageRisk === 'NONE' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 whitespace-nowrap shrink-0">
                            Adequate
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xs">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              <button
                type="button"
                onClick={() => setFinancialsSubTab('GMV')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  financialsSubTab === 'GMV'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                <DollarSign className="h-3.5 w-3.5" />
                <span>Multi-Store GMV Analytics</span>
              </button>

              <button
                type="button"
                onClick={() => setFinancialsSubTab('SETTLEMENTS')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  financialsSubTab === 'SETTLEMENTS'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                <Smartphone className="h-3.5 w-3.5" />
                <span>Telebirr / CBE Settlements (VAT 15%)</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              {financialsSubTab === 'SETTLEMENTS' && (
                <button
                  type="button"
                  onClick={() => {
                    showToast('Initiated batch digital settlement synchronization with Telebirr & CBE Gateway.', 'info', 'Sync Started');
                  }}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition cursor-pointer"
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
                <span>Export Tax & GMV Audit</span>
              </button>
            </div>
          </div>

          {/* GMV VIEW */}
          {financialsSubTab === 'GMV' && (
            <>
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                      Consolidated Multi-Store GMV & National Turnover
                    </h3>
                    <p className="text-xs text-slate-500">
                      Real-time roll-up across all active branches, regional warehouses, and dispensary nodes in Ethiopia.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400">Total Monthly GMV:</span>
                    <span className="text-lg font-black font-mono text-indigo-600 dark:text-indigo-400">
                      {formatCurrency(totalNetworkGmv)}
                    </span>
                  </div>
                </div>

                {/* Channels Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2">
                  <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 space-y-1">
                    <span className="text-[11px] font-bold text-indigo-900 dark:text-indigo-200">Total Network Revenue</span>
                    <div className="text-xl font-black text-indigo-950 dark:text-indigo-100 font-mono">
                      {formatCurrency(totalNetworkGmv)}
                    </div>
                    <p className="text-[10px] text-indigo-700 dark:text-indigo-300">Across 6 connected pharmacy nodes</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-1">
                    <span className="text-[11px] font-bold text-emerald-900 dark:text-emerald-200">Digital Payments (Telebirr/CBE)</span>
                    <div className="text-xl font-black text-emerald-950 dark:text-emerald-100 font-mono">
                      {formatCurrency(totalNetworkGmv * 0.90)}
                    </div>
                    <p className="text-[10px] text-emerald-700 dark:text-emerald-300">90% cashless transactions</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Over-the-Counter Cash Float</span>
                    <div className="text-xl font-black text-slate-900 dark:text-white font-mono">
                      {formatCurrency(totalNetworkGmv * 0.10)}
                    </div>
                    <p className="text-[10px] text-slate-500">10% manual cash at registers</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 space-y-1">
                    <span className="text-[11px] font-bold text-amber-900 dark:text-amber-200">National VAT (15%) Liability</span>
                    <div className="text-xl font-black text-amber-950 dark:text-amber-100 font-mono">
                      {formatCurrency(totalNetworkGmv * 0.15)}
                    </div>
                    <p className="text-[10px] text-amber-700 dark:text-amber-300">Ministry of Revenue (ERCA) compliant</p>
                  </div>
                </div>
              </div>

              {/* Store-by-Store Financial Leaderboard */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 font-extrabold text-sm text-slate-900 dark:text-white flex items-center justify-between">
                  <span>Branch Dispensing Volume & GMV Leaderboard</span>
                  <span className="text-xs font-semibold text-slate-400">6 Operating Facilities</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-950 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100 dark:border-slate-800">
                      <tr>
                        <th className="py-3 px-4">Pharmacy Store</th>
                        <th className="py-3 px-4">City / Region</th>
                        <th className="py-3 px-4">Monthly GMV</th>
                        <th className="py-3 px-4">Telebirr (62%)</th>
                        <th className="py-3 px-4">CBE (28%)</th>
                        <th className="py-3 px-4">Tax (VAT 15%)</th>
                        <th className="py-3 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {pharmacyFleet.map((node) => (
                        <tr key={node.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                          <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                            {node.storeName}
                          </td>
                          <td className="py-3 px-4 text-slate-500">{node.city}</td>
                          <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                            {formatCurrency(node.monthlyGmv)}
                          </td>
                          <td className="py-3 px-4 font-mono text-emerald-600 font-bold">
                            {formatCurrency(node.monthlyGmv * 0.62)}
                          </td>
                          <td className="py-3 px-4 font-mono text-purple-600 font-bold">
                            {formatCurrency(node.monthlyGmv * 0.28)}
                          </td>
                          <td className="py-3 px-4 font-mono text-indigo-600">
                            {formatCurrency(node.monthlyGmv * 0.15)}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => {
                                setInspectNode(node);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-bold text-[11px] transition cursor-pointer"
                            >
                              Inspect Node
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
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <Smartphone className="h-5 w-5 text-emerald-600" />
                    <span>Telebirr & CBE Mobile Settlements & VAT Reconciliation</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Automated bank and merchant wallet settlement batches with integrated 15% VAT withholding and daily remittance logs.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-emerald-900 dark:text-emerald-200">Telebirr SuperApp Wallet</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-200 text-emerald-900">Auto-Clearing Active</span>
                    </div>
                    <div className="text-xl font-black text-emerald-950 dark:text-emerald-100 font-mono">
                      {formatCurrency(totalNetworkGmv * 0.62)}
                    </div>
                    <p className="text-[10px] text-emerald-700 dark:text-emerald-300">
                      Settled to Commercial Bank Account ending in ••••8492
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-purple-900 dark:text-purple-200">CBE Birr & CBE Mobile</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-200 text-purple-900">Real-time RTGS</span>
                    </div>
                    <div className="text-xl font-black text-purple-950 dark:text-purple-100 font-mono">
                      {formatCurrency(totalNetworkGmv * 0.28)}
                    </div>
                    <p className="text-[10px] text-purple-700 dark:text-purple-300">
                      Direct C2B corporate till deposit
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-indigo-900 dark:text-indigo-200">Total VAT 15% Remitted</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-200 text-indigo-900">ERCA Verified</span>
                    </div>
                    <div className="text-xl font-black text-indigo-950 dark:text-indigo-100 font-mono">
                      {formatCurrency(totalNetworkGmv * 0.15)}
                    </div>
                    <p className="text-[10px] text-indigo-700 dark:text-indigo-300">
                      Automated E-Filing voucher #ETH-VAT-2026-08
                    </p>
                  </div>
                </div>
              </div>

              {/* Settlement Batches Table */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 font-extrabold text-sm text-slate-900 dark:text-white flex items-center justify-between">
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
                    <thead className="bg-slate-50 dark:bg-slate-950 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100 dark:border-slate-800">
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
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {pharmacyFleet.map((node, idx) => (
                        <tr key={node.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                          <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                            SETTLE-ETH-{202600 + idx}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              idx % 2 === 0
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                            }`}>
                              <Smartphone className="h-3 w-3" />
                              {idx % 2 === 0 ? 'Telebirr Merchant' : 'CBE Birr API'}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                            {node.storeName}
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                            {formatCurrency(node.monthlyGmv * 0.62)}
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-500">
                            {formatCurrency(node.monthlyGmv * 0.62 * 0.005)}
                          </td>
                          <td className="py-3 px-4 font-mono text-emerald-600 font-bold">
                            {formatCurrency(node.monthlyGmv * 0.62 * 0.995)}
                          </td>
                          <td className="py-3 px-4 font-mono text-indigo-600">
                            {formatCurrency(node.monthlyGmv * 0.15)}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xs">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              <button
                type="button"
                onClick={() => setStaffSubTab('DIRECTORY')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  staffSubTab === 'DIRECTORY'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                <Users className="h-3.5 w-3.5" />
                <span>Licensed Staff Directory ({globalStaff.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setStaffSubTab('RBAC')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  staffSubTab === 'RBAC'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                <Lock className="h-3.5 w-3.5" />
                <span>Multi-Tenant RBAC Governance</span>
              </button>
            </div>

            <div className="text-xs font-mono font-bold px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              {globalStaff.length} Accounts Synchronized
            </div>
          </div>

          {/* DIRECTORY VIEW */}
          {staffSubTab === 'DIRECTORY' && (
            <div className="space-y-4">
              {/* Search & Role Filter Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="relative w-full sm:w-80">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search staff by name, email, pharmacy..."
                    value={staffSearchQuery}
                    onChange={(e) => setStaffSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-600"
                  />
                </div>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                  <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Filter:</span>
                  {(['ALL', 'SUPER_ADMIN', 'STORE_OWNER', 'PHARMACIST'] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setStaffRoleFilter(r)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                        staffRoleFilter === r
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {r === 'ALL' ? 'All Roles' : r.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-950 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100 dark:border-slate-800">
                      <tr>
                        <th className="py-3.5 px-4">Staff Member</th>
                        <th className="py-3.5 px-4">System Role</th>
                        <th className="py-3.5 px-4">Store Affiliation</th>
                        <th className="py-3.5 px-4">EFDA Pharmacist License</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-4 text-right">Master Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
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
                          <tr key={staff.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                            <td className="py-3.5 px-4">
                              <div className="font-extrabold text-slate-900 dark:text-white text-xs">{staff.name}</div>
                              <div className="text-[10px] text-slate-400">{staff.email} • {staff.phone}</div>
                            </td>

                            <td className="py-3.5 px-4">
                              <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                                staff.role === 'SUPER_ADMIN'
                                  ? 'bg-indigo-100 text-indigo-900 dark:bg-indigo-950 dark:text-indigo-300'
                                  : staff.role === 'STORE_OWNER'
                                  ? 'bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-300'
                                  : 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300'
                              }`}>
                                {staff.role}
                              </span>
                            </td>

                            <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-300">
                              {staff.storeName}
                            </td>

                            <td className="py-3.5 px-4 font-mono text-[11px] text-indigo-600 dark:text-indigo-400 font-bold">
                              {staff.efdaLicenseNumber || '—'}
                            </td>

                            <td className="py-3.5 px-4">
                              {staff.status === 'ACTIVE' && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                                  <CheckCircle2 className="h-3 w-3" /> Active
                                </span>
                              )}
                              {staff.status === 'LOCKED' && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 bg-rose-50 dark:bg-rose-950 px-2 py-0.5 rounded-full">
                                  <Lock className="h-3 w-3" /> Account Locked
                                </span>
                              )}
                              {staff.status === 'PENDING' && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950 px-2 py-0.5 rounded-full">
                                  <Clock className="h-3 w-3" /> Pending Approval
                                </span>
                              )}
                            </td>

                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    showToast(`Password reset link dispatched to ${staff.email}`, 'info', 'Security Action');
                                  }}
                                  className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-[10px] font-bold transition cursor-pointer"
                                >
                                  Reset Credentials
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleToggleStaffStatus(staff.id)}
                                  className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition cursor-pointer ${
                                    staff.status === 'ACTIVE'
                                      ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/60 dark:text-rose-300'
                                      : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300'
                                  }`}
                                >
                                  {staff.status === 'ACTIVE' ? 'Lock' : 'Unlock'}
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

          {/* RBAC GOVERNANCE VIEW (STRICT 3 CHARACTERS) */}
          {staffSubTab === 'RBAC' && (
            <div className="space-y-4">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                      3-Character Role-Based Access Control (RBAC) Matrix
                    </h3>
                    <p className="text-xs text-slate-500">
                      Standardized institutional hierarchy: Super Admin, Drug Store Owner, and Pharmacist.
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                    3 Core Characters Active
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  {/* Super Admin */}
                  <div className="p-5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-indigo-600 text-white uppercase tracking-wider">
                        Tier 1
                      </span>
                      <Shield className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-indigo-950 dark:text-indigo-200 text-sm">Super Admin</h4>
                      <p className="text-xs text-indigo-700 dark:text-indigo-400">Master Platform & Governance</p>
                    </div>
                    <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 pt-1">
                      <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-indigo-600 shrink-0" /> Full National Fleet Oversight</li>
                      <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-indigo-600 shrink-0" /> EFDA Compliance & Batch Recalls</li>
                      <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-indigo-600 shrink-0" /> Platform Financial Settlements & GMV</li>
                      <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-indigo-600 shrink-0" /> Emergency System Broadcasts</li>
                      <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-indigo-600 shrink-0" /> Global Staff & License Auditing</li>
                    </ul>
                  </div>

                  {/* Drug Store Owner */}
                  <div className="p-5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-600 text-white uppercase tracking-wider">
                        Tier 2
                      </span>
                      <Store className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-blue-950 dark:text-blue-200 text-sm">Drug Store Owner</h4>
                      <p className="text-xs text-blue-700 dark:text-blue-400">Business & Store Operations</p>
                    </div>
                    <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 pt-1">
                      <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-blue-600 shrink-0" /> Store Profile & TIN / EFDA Settings</li>
                      <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-blue-600 shrink-0" /> Inventory & FEFO Batch Management</li>
                      <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-blue-600 shrink-0" /> Purchase Orders & Supplier AP</li>
                      <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-blue-600 shrink-0" /> Financial Reports, P&L, & Z-Reports</li>
                      <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-blue-600 shrink-0" /> Staff Credentials & Onboarding</li>
                    </ul>
                  </div>

                  {/* Pharmacist */}
                  <div className="p-5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-600 text-white uppercase tracking-wider">
                        Tier 3
                      </span>
                      <Pill className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-emerald-950 dark:text-emerald-200 text-sm">Pharmacist</h4>
                      <p className="text-xs text-emerald-700 dark:text-emerald-400">Clinical Dispensing & POS</p>
                    </div>
                    <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 pt-1">
                      <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> 3-Sec Touch POS & Thermal Receipts</li>
                      <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> Prescription Verification & Patient Rx</li>
                      <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> Telebirr & CBE Birr Instant QR Sales</li>
                      <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> Shift Cash Handover & X-Reading</li>
                      <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> Stock Search & Expiry Validation</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: PLATFORM INFRASTRUCTURE & BROADCASTS */}
      {/* ========================================================================= */}
      {activeTab === 'SYSTEM_HEALTH' && (
        <div className="space-y-4">
          {/* Sub-tab bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xs">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              <button
                type="button"
                onClick={() => setSystemHealthSubTab('BROADCAST')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  systemHealthSubTab === 'BROADCAST'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                <Radio className="h-3.5 w-3.5" />
                <span>Global Multi-Tenant Broadcaster</span>
              </button>

              <button
                type="button"
                onClick={() => setSystemHealthSubTab('TELEMETRY')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  systemHealthSubTab === 'TELEMETRY'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                <Server className="h-3.5 w-3.5" />
                <span>PostgreSQL Sync & Telemetry</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Broadcaster */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center">
                  <Send className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                    Global Multi-Tenant Broadcaster
                  </h3>
                  <p className="text-xs text-slate-500">
                    Transmit high-priority alert or EFDA regulatory notice to all POS counters in real-time.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSendBroadcast} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Broadcast Priority
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
                              : 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Announcement Message Content
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={broadcastMessage}
                    onChange={(e) => setBroadcastMessage(e.target.value)}
                    placeholder="Type regulatory announcement, batch recall alert, or platform update..."
                    className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 dark:bg-slate-950 p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isBroadcasting || !broadcastMessage.trim()}
                  className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  <Zap className="h-4 w-4 text-amber-300" />
                  <span>{isBroadcasting ? 'Broadcasting...' : `Broadcast [${broadcastPriority}] to All ${pharmacyFleet.length} Nodes`}</span>
                </button>
              </form>

              {/* Live Banner Preview */}
              {broadcastMessage.trim() && (
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Workstation Banner Preview
                  </span>
                  <div className={`p-2.5 rounded-xl text-xs font-semibold flex items-start gap-2 ${
                    broadcastPriority === 'EMERGENCY'
                      ? 'bg-rose-50 text-rose-800 dark:bg-rose-950/80 dark:text-rose-200 border border-rose-200 dark:border-rose-800'
                      : broadcastPriority === 'URGENT'
                      ? 'bg-amber-50 text-amber-800 dark:bg-amber-950/80 dark:text-amber-200 border border-amber-200 dark:border-amber-800'
                      : 'bg-indigo-50 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-800'
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
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                    Recent Transmitted Broadcasts ({broadcastLogs.length})
                  </span>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {broadcastLogs.map((log) => (
                      <div key={log.id} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-[11px] flex items-center justify-between gap-2">
                        <div className="truncate flex-1">
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-black mr-1.5 ${
                            log.priority === 'EMERGENCY' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300' :
                            log.priority === 'URGENT' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' :
                            'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                          }`}>
                            {log.priority}
                          </span>
                          <span className="text-slate-700 dark:text-slate-300">{log.message}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 shrink-0">{log.timestamp}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Infrastructure Health */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center">
                    <Server className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                      Platform Cloud Infrastructure
                    </h3>
                    <p className="text-xs text-slate-500">Live container cluster and database replication status.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRunDiagnostics}
                  disabled={isDiagnosticsRunning}
                  className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isDiagnosticsRunning ? 'animate-spin' : ''}`} />
                  <span>{isDiagnosticsRunning ? 'Testing...' : 'Run Diagnostics'}</span>
                </button>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 flex items-center justify-between border border-slate-100 dark:border-slate-800">
                  <div>
                    <div className="font-bold text-slate-800 dark:text-slate-200">Database Replication</div>
                    <div className="text-[10px] text-slate-400">PostgreSQL Primary & Read-Replicas</div>
                  </div>
                  <span className="text-emerald-600 font-bold flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> 0ms Sync Lag
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 flex items-center justify-between border border-slate-100 dark:border-slate-800">
                  <div>
                    <div className="font-bold text-slate-800 dark:text-slate-200">Offline POS Service Worker Cache</div>
                    <div className="text-[10px] text-slate-400">PWA Offline Mode & IndexedDB Transaction Queue</div>
                  </div>
                  <span className="text-emerald-600 font-bold flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Active (100% Ready)
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 flex items-center justify-between border border-slate-100 dark:border-slate-800">
                  <div>
                    <div className="font-bold text-slate-800 dark:text-slate-200">EFDA Regulatory API Gateway</div>
                    <div className="text-[10px] text-slate-400">TIN & Pharmacist License Verification Hook</div>
                  </div>
                  <span className="text-emerald-600 font-bold flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Connected (200 OK)
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 flex items-center justify-between border border-slate-100 dark:border-slate-800">
                  <div>
                    <div className="font-bold text-slate-800 dark:text-slate-200">Telebirr & CBE Payment Webhooks</div>
                    <div className="text-[10px] text-slate-400">Instant QR Confirmation Dispatcher</div>
                  </div>
                  <span className="text-emerald-600 font-bold flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> 99.98% Success Rate
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
          <div className="relative w-full max-w-2xl rounded-3xl bg-white shadow-2xl border border-slate-200 dark:bg-slate-900 dark:border-slate-800 overflow-hidden my-auto animate-in fade-in zoom-in-95">
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
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                  <span className="text-slate-400 font-bold uppercase text-[10px]">TIN Number</span>
                  <div className="text-sm font-black text-slate-900 dark:text-white font-mono">{inspectNode.tinNumber}</div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                  <span className="text-slate-400 font-bold uppercase text-[10px]">Monthly Dispensing GMV</span>
                  <div className="text-sm font-black text-emerald-600 font-mono">{formatCurrency(inspectNode.monthlyGmv)}</div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <span className="text-slate-400 font-bold uppercase text-[10px] block">Owner & Managing Pharmacist</span>
                <div className="font-extrabold text-slate-900 dark:text-white text-sm">{inspectNode.ownerName}</div>
                <div className="text-slate-500 flex flex-wrap gap-4">
                  <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" /> {inspectNode.ownerEmail}</span>
                  <span className="flex items-center gap-1 font-mono"><Phone className="h-3.5 w-3.5" /> {inspectNode.ownerPhone}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-400 text-[10px] block">Catalog Size</span>
                  <span className="font-black text-sm text-slate-900 dark:text-white font-mono">{inspectNode.skuCount} SKUs</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-400 text-[10px] block">Active Staff</span>
                  <span className="font-black text-sm text-slate-900 dark:text-white font-mono">{inspectNode.activeStaffCount} Licensed</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-400 text-[10px] block">Cold Vault</span>
                  <span className="font-black text-sm text-sky-600">{inspectNode.coldChainReady ? 'Equipped (2-8°C)' : 'None'}</span>
                </div>
              </div>

              {/* Super Admin Audit & Inspection Launchpad */}
              {onSwitchToStoreWorkstation && (
                <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/50 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
                      <ShieldCheck className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                      Direct Workstation Audit & Inspection
                    </span>
                    <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold">
                      Super Admin Read-Write Mode
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
                      className="py-2 px-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 border border-indigo-200 dark:border-indigo-800 text-slate-800 dark:text-slate-200 font-bold text-[11px] transition shadow-xs flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Store className="h-3.5 w-3.5" />
                      <span>POS Counter</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const targetId = inspectNode.id;
                        setInspectNode(null);
                        onSwitchToStoreWorkstation(targetId, 'inventory');
                      }}
                      className="py-2 px-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 border border-indigo-200 dark:border-indigo-800 text-slate-800 dark:text-slate-200 font-bold text-[11px] transition shadow-xs flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Pill className="h-3.5 w-3.5" />
                      <span>Shelf Stock</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const targetId = inspectNode.id;
                        setInspectNode(null);
                        onSwitchToStoreWorkstation(targetId, 'sales');
                      }}
                      className="py-2 px-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 border border-indigo-200 dark:border-indigo-800 text-slate-800 dark:text-slate-200 font-bold text-[11px] transition shadow-xs flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      <span>Invoices</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const targetId = inspectNode.id;
                        setInspectNode(null);
                        onSwitchToStoreWorkstation(targetId, 'reports');
                      }}
                      className="py-2 px-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 border border-indigo-200 dark:border-indigo-800 text-slate-800 dark:text-slate-200 font-bold text-[11px] transition shadow-xs flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <TrendingUp className="h-3.5 w-3.5" />
                      <span>Z-Report</span>
                    </button>
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleNodeStatus(inspectNode.id)}
                    className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                  >
                    {inspectNode.status === 'ACTIVE' ? 'Set to Maintenance' : 'Activate Node'}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const target = inspectNode;
                      setInspectNode(null);
                      handleStartEditNode(target);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Edit className="h-3.5 w-3.5" />
                    <span>Edit Profile</span>
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
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition shadow-md shadow-indigo-600/20 cursor-pointer"
                  >
                    <Store className="h-4 w-4" />
                    <span>Full Store Dashboard</span>
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
          <div className="relative w-full max-w-xl rounded-3xl bg-white shadow-2xl border border-slate-200 dark:bg-slate-900 dark:border-slate-800 overflow-hidden my-auto animate-in fade-in zoom-in-95">
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
                  <h3 className="text-base font-black text-white">Edit Store Node Profile</h3>
                  <p className="text-xs text-sky-100">Update TIN, EFDA License, or contact info for {editingNode.storeName}</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSaveEditNode} className="p-6 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="block text-slate-700 dark:text-slate-300 font-bold">Store / Pharmacy Name</label>
                <input
                  type="text"
                  required
                  value={nodeEditForm.storeName}
                  onChange={(e) => setNodeEditForm({ ...nodeEditForm, storeName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-slate-700 dark:text-slate-300 font-bold">City</label>
                  <input
                    type="text"
                    required
                    value={nodeEditForm.city}
                    onChange={(e) => setNodeEditForm({ ...nodeEditForm, city: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-slate-700 dark:text-slate-300 font-bold">Subcity / District</label>
                  <input
                    type="text"
                    required
                    value={nodeEditForm.subcity}
                    onChange={(e) => setNodeEditForm({ ...nodeEditForm, subcity: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-slate-700 dark:text-slate-300 font-bold">TIN Number (Tax ID)</label>
                  <input
                    type="text"
                    required
                    value={nodeEditForm.tinNumber}
                    onChange={(e) => setNodeEditForm({ ...nodeEditForm, tinNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-slate-700 dark:text-slate-300 font-bold">EFDA Facility License</label>
                  <input
                    type="text"
                    required
                    value={nodeEditForm.efdaLicense}
                    onChange={(e) => setNodeEditForm({ ...nodeEditForm, efdaLicense: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-slate-700 dark:text-slate-300 font-bold">Contact Email</label>
                  <input
                    type="email"
                    required
                    value={nodeEditForm.ownerEmail}
                    onChange={(e) => setNodeEditForm({ ...nodeEditForm, ownerEmail: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-slate-700 dark:text-slate-300 font-bold">Contact Phone</label>
                  <input
                    type="text"
                    required
                    value={nodeEditForm.ownerPhone}
                    onChange={(e) => setNodeEditForm({ ...nodeEditForm, ownerPhone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={nodeEditForm.coldChainReady}
                    onChange={(e) => setNodeEditForm({ ...nodeEditForm, coldChainReady: e.target.checked })}
                    className="rounded text-indigo-600"
                  />
                  <span className="font-bold text-slate-700 dark:text-slate-300">Cold Chain Vault (2°C - 8°C)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={nodeEditForm.is24Hours}
                    onChange={(e) => setNodeEditForm({ ...nodeEditForm, is24Hours: e.target.checked })}
                    className="rounded text-indigo-600"
                  />
                  <span className="font-bold text-slate-700 dark:text-slate-300">24/7 Emergency Service</span>
                </label>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setEditingNode(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition shadow-md shadow-indigo-600/30 flex items-center gap-1.5 cursor-pointer"
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
      {/* ⚠️ MODAL 2: ISSUE EMERGENCY RECALL NOTICE */}
      {/* ========================================================================= */}
      {isNewRecallModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-3xl bg-white shadow-2xl border border-slate-200 dark:bg-slate-900 dark:border-slate-800 overflow-hidden my-auto animate-in fade-in zoom-in-95">
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
                  <h3 className="text-base font-black text-white">Issue Emergency Batch Recall</h3>
                  <p className="text-xs text-rose-100">Instantly locks the batch from dispensing across all stores.</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleCreateRecall} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Medicine Name / Formulation <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Paracetamol Pediatric Syrup 120mg/5ml"
                  value={newRecallForm.drugName}
                  onChange={(e) => setNewRecallForm({ ...newRecallForm, drugName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-rose-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Batch / Lot Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="BATCH-2026-ETH-991"
                    value={newRecallForm.batchNumber}
                    onChange={(e) => setNewRecallForm({ ...newRecallForm, batchNumber: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-rose-500 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Manufacturer Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Local Pharma Corp Ltd"
                    value={newRecallForm.manufacturer}
                    onChange={(e) => setNewRecallForm({ ...newRecallForm, manufacturer: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Reason for Regulatory Recall <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe failure reason, impurities, packaging flaw, or EFDA lab report..."
                  value={newRecallForm.issueReason}
                  onChange={(e) => setNewRecallForm({ ...newRecallForm, issueReason: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setIsNewRecallModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold transition shadow-md shadow-rose-600/30 flex items-center gap-2 cursor-pointer"
                >
                  <AlertOctagon className="h-4 w-4" />
                  <span>Publish Immediate Lock</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 💊 MODAL 3: ADD MASTER MEDICINE SKU */}
      {/* ========================================================================= */}
      {isAddCatalogModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-3xl bg-white shadow-2xl border border-slate-200 dark:bg-slate-900 dark:border-slate-800 overflow-hidden my-auto animate-in fade-in zoom-in-95">
            <div className="bg-indigo-600 text-white p-6 relative">
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
                  <h3 className="text-base font-black text-white">Register National Drug SKU</h3>
                  <p className="text-xs text-indigo-100">Add to National Essential Drug Index & Price Registry.</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleCreateMasterSku} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Brand Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Amoxil 500mg"
                    value={newSkuForm.brandName}
                    onChange={(e) => setNewSkuForm({ ...newSkuForm, brandName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Generic Chemical Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Amoxicillin Trihydrate"
                    value={newSkuForm.genericName}
                    onChange={(e) => setNewSkuForm({ ...newSkuForm, genericName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    EFDA Registry Code
                  </label>
                  <input
                    type="text"
                    placeholder="EFDA-MED-00291"
                    value={newSkuForm.efdaCode}
                    onChange={(e) => setNewSkuForm({ ...newSkuForm, efdaCode: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Therapeutic Class
                  </label>
                  <input
                    type="text"
                    placeholder="Antibiotic / Penicillin"
                    value={newSkuForm.therapeuticClass}
                    onChange={(e) => setNewSkuForm({ ...newSkuForm, therapeuticClass: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Dosage Form
                  </label>
                  <select
                    value={newSkuForm.dosageForm}
                    onChange={(e) => setNewSkuForm({ ...newSkuForm, dosageForm: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="Tablet">Tablet</option>
                    <option value="Capsule">Capsule</option>
                    <option value="Syrup">Syrup</option>
                    <option value="Injectable">Injectable</option>
                    <option value="Ointment">Ointment</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Strength
                  </label>
                  <input
                    type="text"
                    placeholder="500 mg"
                    value={newSkuForm.strength}
                    onChange={(e) => setNewSkuForm({ ...newSkuForm, strength: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Max Price (ETB)
                  </label>
                  <input
                    type="number"
                    value={newSkuForm.maxRetailPrice}
                    onChange={(e) => setNewSkuForm({ ...newSkuForm, maxRetailPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newSkuForm.isControlled}
                    onChange={(e) => setNewSkuForm({ ...newSkuForm, isControlled: e.target.checked })}
                    className="rounded text-indigo-600"
                  />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Schedule II Controlled</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newSkuForm.requiresColdChain}
                    onChange={(e) => setNewSkuForm({ ...newSkuForm, requiresColdChain: e.target.checked })}
                    className="rounded text-indigo-600"
                  />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Cold Chain (2°C - 8°C)</span>
                </label>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddCatalogModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition shadow-md shadow-indigo-600/30 flex items-center gap-2 cursor-pointer"
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>Register Master SKU</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
