import {
  User,
  Category,
  Medicine,
  MedicineBatch,
  InventoryTransaction,
  Supplier,
  Purchase,
  Sale,
  AuditLog,
  DashboardSummary,
  ProfitReportData,
  PharmacyStoreProfile,
  RegisteredPharmacyNode,
} from '../types';

// Seed Registered Pharmacies & Drug Stores across Ethiopia
const registeredPharmacies: RegisteredPharmacyNode[] = [
  {
    id: 'node-01',
    storeName: 'Kaziniya Flagship Pharmacy & Health Center',
    storeNameAmharic: 'ካዚኒያ ዋና ፋርማሲና የጤና ማዕከል',
    storeType: 'COMMUNITY_DRUG_STORE',
    tinNumber: '0098234123',
    efdaLicense: 'EFDA/DISP/AA/2024/8492',
    efdaLicenseExpiry: '2027-12-31',
    ownerName: 'Dr. Alemu Tadesse',
    ownerTitle: 'Chief Pharmacist & Medical Director',
    ownerPhone: '+251 911 234 567',
    ownerEmail: 'admin@kaziniya.com',
    city: 'Addis Ababa',
    subcity: 'Bole Subcity',
    woreda: 'Woreda 03',
    streetAddress: 'Bole Medhanealem Road, Swaziland St, Next to Edna Mall',
    landmark: 'Opposite Central Healthcare Plaza',
    latitude: 9.0018,
    longitude: 38.7845,
    phone: '+251 11 661 2345 / +251 911 234 567',
    email: 'contact@kaziniyapharmacy.et',
    operatingHours: 'Open 24/7 (365 Days Emergency Service)',
    is24Hours: true,
    coldChainAvailable: true,
    deliveryAvailable: true,
    activeStaffCount: 8,
    status: 'ACTIVE',
    skuCount: 420,
    monthlyGmv: 1845000,
    servicesOffered: ['Prescription Dispensing', 'Cold-Chain Biologicals & Vaccines', 'Blood Glucose / BP Screening', 'Compounding', 'Emergency Oxygen', 'Telebirr & CBE POS'],
    rating: 4.9,
    logoUrl: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=200&auto=format&fit=crop&q=80',
    registeredAt: '2026-01-01T08:00:00Z',
  },
  {
    id: 'node-02',
    storeName: 'Selam Community Pharmacy & Biologicals',
    storeNameAmharic: 'ሰላም የማህበረሰብ ፋርማሲ',
    storeType: 'COMMUNITY_DRUG_STORE',
    tinNumber: '0047812903',
    efdaLicense: 'EFDA/DISP/AA/2025/1042',
    efdaLicenseExpiry: '2028-06-30',
    ownerName: 'Dr. Yohannes Tadesse, Pharm.D',
    ownerTitle: 'Supervising Pharmacist',
    ownerPhone: '+251 911 889 001',
    ownerEmail: 'yohannes@selampharmacy.et',
    city: 'Addis Ababa',
    subcity: 'Yeka Subcity',
    woreda: 'Woreda 08',
    streetAddress: 'Megenagna Roundabout, Marathon Motor Bldg, Ground Floor',
    landmark: 'Behind Zefmesh Grand Mall',
    latitude: 9.0223,
    longitude: 38.8021,
    phone: '+251 11 662 9900',
    email: 'info@selampharmacy.et',
    operatingHours: '7:30 AM – 10:00 PM (Daily)',
    is24Hours: false,
    coldChainAvailable: true,
    deliveryAvailable: true,
    activeStaffCount: 5,
    status: 'ACTIVE',
    skuCount: 310,
    monthlyGmv: 980000,
    servicesOffered: ['Prescription Dispensing', 'Cold-Chain Insulin Storage', 'Chronic Disease Refill Club', 'Free Blood Pressure Check'],
    rating: 4.8,
    logoUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200&auto=format&fit=crop&q=80',
    registeredAt: '2026-02-14T09:30:00Z',
  },
  {
    id: 'node-03',
    storeName: 'Arada Clinical & Emergency Pharmacy',
    storeNameAmharic: 'አራዳ ክሊኒካል እና ድንገተኛ ፋርማሲ',
    storeType: 'SPECIALTY_PHARMACY',
    tinNumber: '0032901844',
    efdaLicense: 'EFDA/DISP/AA/2026/0411',
    efdaLicenseExpiry: '2028-12-31',
    ownerName: 'Pharm. Meron Haile',
    ownerTitle: 'Clinical Specialist & Proprietor',
    ownerPhone: '+251 922 456 789',
    ownerEmail: 'meron@aradapharm.et',
    city: 'Addis Ababa',
    subcity: 'Arada Subcity',
    woreda: 'Woreda 02',
    streetAddress: 'Piazza, Churchill Avenue, Near Eliana Hotel',
    landmark: 'Adjacent to St. George Cathedral Square',
    latitude: 9.0345,
    longitude: 38.7521,
    phone: '+251 11 155 7788',
    email: 'care@aradapharm.et',
    operatingHours: 'Open 24/7 (365 Days Emergency Service)',
    is24Hours: true,
    coldChainAvailable: true,
    deliveryAvailable: true,
    activeStaffCount: 6,
    status: 'ACTIVE',
    skuCount: 380,
    monthlyGmv: 1240000,
    servicesOffered: ['24/7 Emergency Dispensing', 'Oncology & Specialized Biologicals', 'First Aid Supplies', 'Extemporaneous Compounding'],
    rating: 4.9,
    logoUrl: 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=200&auto=format&fit=crop&q=80',
    registeredAt: '2026-03-10T11:00:00Z',
  },
  {
    id: 'node-04',
    storeName: 'Hawassa Central Medical Dispensary',
    storeNameAmharic: 'ሀዋሳ ማዕከላዊ የህክምና መድኃኒት መደብር',
    storeType: 'COMMUNITY_DRUG_STORE',
    tinNumber: '0089123456',
    efdaLicense: 'EFDA/DISP/SNNPR/2026/9021',
    efdaLicenseExpiry: '2027-09-30',
    ownerName: 'Dr. Dawit Bekele',
    ownerTitle: 'Managing Druggist',
    ownerPhone: '+251 946 789 012',
    ownerEmail: 'dawit@hawassamed.et',
    city: 'Hawassa',
    subcity: 'Piazza District',
    woreda: 'Menehariya Zone',
    streetAddress: 'Main Commercial Avenue, Near Lake View Hospital',
    landmark: 'Opposite Central Bus Station Plaza',
    latitude: 7.0504,
    longitude: 38.4763,
    phone: '+251 46 220 5432',
    email: 'contact@hawassamed.et',
    operatingHours: '8:00 AM – 9:00 PM (Mon - Sat)',
    is24Hours: false,
    coldChainAvailable: true,
    deliveryAvailable: false,
    activeStaffCount: 4,
    status: 'ACTIVE',
    skuCount: 260,
    monthlyGmv: 620000,
    servicesOffered: ['Essential Medications', 'Maternal & Child Care Products', 'Rapid Diagnostic Kits', 'Veterinary & Human Antibiotics'],
    rating: 4.7,
    logoUrl: 'https://images.unsplash.com/photo-1576602976047-174e57a47881?w=200&auto=format&fit=crop&q=80',
    registeredAt: '2026-08-18T14:15:00Z',
  },
  {
    id: 'node-05',
    storeName: 'Adama Express Rx & Vaccines Depot',
    storeNameAmharic: 'አዳማ ኤክስፕረስ ፋርማሲና ክትባት ዲፖ',
    storeType: 'HOSPITAL_PHARMACY',
    tinNumber: '0071239088',
    efdaLicense: 'EFDA/DISP/OROMIA/2026/3310',
    efdaLicenseExpiry: '2028-04-15',
    ownerName: 'Pharm. Tigist Assefa',
    ownerTitle: 'Lead Clinical Pharmacist',
    ownerPhone: '+251 933 567 890',
    ownerEmail: 'tigist@adamaexpress.et',
    city: 'Adama',
    subcity: 'Hospital Road',
    woreda: 'Kebele 04',
    streetAddress: 'Adama Referral Hospital Gate 2, Expressway Junction',
    landmark: 'Next to Rift Valley University Campus',
    latitude: 8.5400,
    longitude: 39.2700,
    phone: '+251 22 111 8877',
    email: 'orders@adamaexpress.et',
    operatingHours: 'Open 24/7 (365 Days Emergency Service)',
    is24Hours: true,
    coldChainAvailable: true,
    deliveryAvailable: true,
    activeStaffCount: 7,
    status: 'ACTIVE',
    skuCount: 340,
    monthlyGmv: 1650000,
    servicesOffered: ['Trauma & Emergency Rx', 'Vaccines & Cold-Chain Biologicals', 'Telebirr QR Instant POS', 'Direct Hospital Delivery'],
    rating: 4.9,
    logoUrl: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=200&auto=format&fit=crop&q=80',
    registeredAt: '2026-04-05T08:00:00Z',
  },
  {
    id: 'node-06',
    storeName: 'Bahir Dar Tana Healthcare Drug Store',
    storeNameAmharic: 'ባህር ዳር ጣና የጤና እንክብካቤ መድኃኒት ቤት',
    storeType: 'COMMUNITY_DRUG_STORE',
    tinNumber: '0056123490',
    efdaLicense: 'EFDA/DISP/AMHARA/2025/7102',
    efdaLicenseExpiry: '2028-02-28',
    ownerName: 'Dr. Girma Kassahun',
    ownerTitle: 'Druggist in Charge',
    ownerPhone: '+251 918 765 432',
    ownerEmail: 'girma@tanapharm.et',
    city: 'Bahir Dar',
    subcity: 'Gish Abay District',
    woreda: 'Kebele 06',
    streetAddress: 'Lake Tana Boulevard, Near Felege Hiwot Specialized Hospital',
    landmark: 'Beside Commercial Bank of Ethiopia Tana Branch',
    latitude: 11.5936,
    longitude: 37.3908,
    phone: '+251 58 220 1234',
    email: 'contact@tanapharm.et',
    operatingHours: '8:00 AM – 9:30 PM (Daily)',
    is24Hours: false,
    coldChainAvailable: true,
    deliveryAvailable: true,
    activeStaffCount: 5,
    status: 'ACTIVE',
    skuCount: 290,
    monthlyGmv: 890000,
    servicesOffered: ['Prescription Dispensing', 'Surgical Supplies', 'Blood Pressure & Diabetes Checks', 'Nebulizer Therapy Support'],
    rating: 4.8,
    logoUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200&auto=format&fit=crop&q=80',
    registeredAt: '2026-05-12T10:00:00Z',
  },
  {
    id: 'node-07',
    storeName: 'Dire Dawa Gari Medical & Biologicals',
    storeNameAmharic: 'ድሬዳዋ ጋሪ ሜዲካል እና ባዮሎጂካልስ',
    storeType: 'WHOLESALE_DISPENSARY',
    tinNumber: '0062345910',
    efdaLicense: 'EFDA/DISP/DD/2026/1944',
    efdaLicenseExpiry: '2028-11-30',
    ownerName: 'Pharm. Abdulwahid Kedir',
    ownerTitle: 'Operations Director',
    ownerPhone: '+251 925 123 456',
    ownerEmail: 'abdul@garimed.et',
    city: 'Dire Dawa',
    subcity: 'Kezira Commercial Hub',
    woreda: 'Woreda 01',
    streetAddress: 'Kezira Railway Station Road, Near Ras Hotel',
    landmark: 'Dire Dawa Trade Center Annex',
    latitude: 9.6009,
    longitude: 41.8501,
    phone: '+251 25 111 4321',
    email: 'sales@garimed.et',
    operatingHours: '7:30 AM – 8:30 PM (Daily)',
    is24Hours: false,
    coldChainAvailable: true,
    deliveryAvailable: true,
    activeStaffCount: 6,
    status: 'ACTIVE',
    skuCount: 450,
    monthlyGmv: 1420000,
    servicesOffered: ['Wholesale Pooling & Bulk Supply', 'Cold-Chain Insulin & Serums', 'Hospital Order Fulfillment', 'Electronic Invoicing'],
    rating: 4.8,
    logoUrl: 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=200&auto=format&fit=crop&q=80',
    registeredAt: '2026-06-01T09:00:00Z',
  },
  {
    id: 'node-08',
    storeName: 'Gondar Royal Care Pharmacy',
    storeNameAmharic: 'ጎንደር ሮያል ኬር ፋርማሲ',
    storeType: 'COMMUNITY_DRUG_STORE',
    tinNumber: '0041239855',
    efdaLicense: 'EFDA/DISP/AMHARA/2026/5520',
    efdaLicenseExpiry: '2027-10-31',
    ownerName: 'Dr. Solomon Mengistu',
    ownerTitle: 'Lead Druggist',
    ownerPhone: '+251 918 112 233',
    ownerEmail: 'solomon@gondarroyalcare.et',
    city: 'Gondar',
    subcity: 'Maraki Zone',
    woreda: 'Kebele 03',
    streetAddress: 'University of Gondar Referral Hospital Road',
    landmark: 'Near Fasilades Castle Tourism Corridor',
    latitude: 12.6075,
    longitude: 37.4589,
    phone: '+251 58 111 8899',
    email: 'care@gondarroyalcare.et',
    operatingHours: 'Open 24/7 (Emergency Service)',
    is24Hours: true,
    coldChainAvailable: true,
    deliveryAvailable: true,
    activeStaffCount: 5,
    status: 'ACTIVE',
    skuCount: 310,
    monthlyGmv: 780000,
    servicesOffered: ['24/7 Urgent Care Dispensary', 'University Student Health Discounts', 'Pediatric Antibiotics', 'EFDA Batch Verifications'],
    rating: 4.9,
    logoUrl: 'https://images.unsplash.com/photo-1576602976047-174e57a47881?w=200&auto=format&fit=crop&q=80',
    registeredAt: '2026-07-20T12:00:00Z',
  },
];

// Default / Active Pharmacy Profile
let pharmacyProfile: PharmacyStoreProfile = {
  id: 'store-kaziniya-01',
  storeName: 'Kaziniya Drug Store',
  storeType: 'COMMUNITY_DRUG_STORE',
  tinNumber: '0098234123',
  efdaLicense: 'EFDA/PH/2026/08912',
  vatNumber: 'ET-98234-2026',
  logoUrl: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=200&auto=format&fit=crop&q=80',
  ownerName: 'Dr. Alemu Tadesse',
  ownerEmail: 'admin@kaziniya.com',
  ownerPhone: '+251 911 234 567',
  ownerNationalId: 'ETH-ID-8829104',
  ownerPharmacistLicense: 'EFDA-PRO-08129',
  city: 'Addis Ababa',
  subcity: 'Bole Subcity',
  woreda: 'Woreda 03',
  streetAddress: 'Bole Medhanealem Road, Next to Edna Mall, Swaziland St.',
  landmark: 'Opposite Central Healthcare Plaza',
  phone: '+251 11 661 2345 / +251 911 889 001',
  email: 'contact@kaziniyapharmacy.et',
  operatingHours: 'Open 24/7 (365 Days Emergency Service)',
  is24Hours: true,
  receiptFooterMessage: 'Thank you for trusting our pharmacy. Keep medications stored below 25°C.',
  registeredAt: '2026-01-01T08:00:00Z',
};

// Seed Users - Strictly 3 Characters / Roles: Super Admin, Drug Store Owner, Pharmacist
const users: User[] = [
  {
    id: 'u-superadmin',
    name: 'Atronos Sisay',
    email: 'athronos21@gmail.com',
    role: 'SUPER_ADMIN',
    phone: '+251 911 000 000',
    employeeId: 'SYS-ADMIN-001',
    department: 'Whole System Administration & Governance',
    isActive: true,
    isOwner: false,
    isSuperAdmin: true,
    tinNumber: '0098234123',
    nationalId: 'ETH-SYS-ADMIN-01',
    pharmacyName: 'Central Healthcare & Pharmacy Network',
    mustChangePassword: false,
    password: '12242144',
    pin: '2144',
    status: 'ACTIVE',
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'u-1',
    name: 'Dr. Alemu Tadesse',
    email: 'admin@kaziniya.com',
    role: 'STORE_OWNER',
    phone: '+251 911 234 567',
    employeeId: 'KZN-OWNER-001',
    department: 'Drug Store Owner & Business Operations',
    isActive: true,
    isOwner: true,
    isSuperAdmin: false,
    tinNumber: '0098234123',
    nationalId: 'ETH-ID-8829104',
    pharmacistLicense: 'EFDA-PRO-08129',
    pharmacyName: 'Kaziniya Drug Store',
    storeAddress: 'Bole Medhanealem Road, Addis Ababa',
    mustChangePassword: false,
    password: 'Admin#2026',
    pin: '1234',
    status: 'ACTIVE',
    createdAt: '2026-01-01T08:00:00Z',
  },
  {
    id: 'u-2',
    name: 'Pharm. Solomon Bekele',
    email: 'pharmacist@kaziniya.com',
    role: 'PHARMACIST',
    phone: '+251 933 456 789',
    employeeId: 'KZN-PH-002',
    department: 'Clinical Dispensing & POS Counter',
    isActive: true,
    isOwner: false,
    isSuperAdmin: false,
    pharmacistLicense: 'EFDA-DISP-0982',
    mustChangePassword: false,
    password: 'Pharma#2026',
    pin: '3456',
    status: 'ACTIVE',
    createdAt: '2026-01-03T08:00:00Z',
  },
  {
    id: 'u-3',
    name: 'Pharm. Bethlehem Worku',
    email: 'bethlehem@kaziniya.com',
    role: 'PHARMACIST',
    phone: '+251 922 345 678',
    employeeId: 'KZN-PH-003',
    department: 'Prescription Verification & Dispensing',
    isActive: true,
    isOwner: false,
    isSuperAdmin: false,
    pharmacistLicense: 'EFDA-DISP-1140',
    mustChangePassword: true,
    temporaryPassword: 'Temp#Pharma2026',
    password: 'Temp#Pharma2026',
    pin: '4567',
    status: 'PENDING_FIRST_LOGIN',
    createdAt: '2026-01-04T08:00:00Z',
  },
];

// Seed Categories
const categories: Category[] = [
  { id: 'cat-1', name: 'Pain Relief & Analgesics', description: 'Pain killers, anti-inflammatory drugs', createdAt: '2026-01-01T08:00:00Z' },
  { id: 'cat-2', name: 'Antibiotics & Anti-Infectives', description: 'Antibacterial, antifungal, antiviral medications', createdAt: '2026-01-01T08:00:00Z' },
  { id: 'cat-3', name: 'Antimalarial', description: 'Malaria prevention and treatment', createdAt: '2026-01-01T08:00:00Z' },
  { id: 'cat-4', name: 'Vitamins & Minerals', description: 'Supplements, immune boosters, multivitamin blends', createdAt: '2026-01-01T08:00:00Z' },
  { id: 'cat-5', name: 'Gastrointestinal', description: 'Antacids, PPIs, anti-diarrheal remedies', createdAt: '2026-01-01T08:00:00Z' },
  { id: 'cat-6', name: 'Respiratory & Cold', description: 'Cough syrups, bronchodilators, antihistamines', createdAt: '2026-01-01T08:00:00Z' },
  { id: 'cat-7', name: 'Cardiovascular & Diabetes', description: 'Hypertension, blood sugar management', createdAt: '2026-01-01T08:00:00Z' },
];

// Seed Suppliers
const suppliers: Supplier[] = [
  {
    id: 'sup-1',
    name: 'MedPharm Wholesale Ltd',
    contactPerson: 'Abebe Molla',
    phone: '+251 115 512 345',
    email: 'orders@medpharm.com.et',
    address: 'Bole Subcity, Woreda 03, Addis Ababa',
    licenseNumber: 'EFDA/LIC/2024/0912',
    isActive: true,
    createdAt: '2026-01-01T08:00:00Z',
  },
  {
    id: 'sup-2',
    name: 'Global Health Supplies PLC',
    contactPerson: 'Tigist Hailu',
    phone: '+251 116 634 890',
    email: 'sales@globalhealth.et',
    address: 'Merkato Pharma Complex, Addis Ababa',
    licenseNumber: 'EFDA/LIC/2023/1844',
    isActive: true,
    createdAt: '2026-01-02T08:00:00Z',
  },
  {
    id: 'sup-3',
    name: 'East Africa Pharma Distributors',
    contactPerson: 'Dawit Cherenet',
    phone: '+251 114 420 111',
    email: 'info@eapharm.com',
    address: 'Gotera Industrial Zone, Addis Ababa',
    licenseNumber: 'EFDA/LIC/2025/0022',
    isActive: true,
    createdAt: '2026-01-03T08:00:00Z',
  },
];

// Seed Medicines (120 Total Medicines matching Kaziniya Drug Store Database and Screenshot)
const exactScreenshotMedicines = [
  {
    id: 'med-1',
    barcode: '74138E2757580BB2',
    sku: '74138E2757580BB2',
    name: 'Ceftriaxone for injection usp 1gm VIAL in Iv',
    genericName: 'Avixone',
    brandName: 'Avixone',
    categoryId: 'cat-2',
    dosageForm: 'IV',
    strength: '1GM',
    unit: 'VIAL',
    manufacturer: 'Avixone Labs',
    description: 'Third-generation cephalosporin broad-spectrum antibiotic injection.',
    prescriptionRequired: true,
    reorderLevel: 15,
    stockQty: 40,
    sellingPrice: 115.0,
    purchasePrice: 92.0,
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=120&auto=format&fit=crop&q=80',
  },
  {
    id: 'med-2',
    barcode: 'DE9F4611BC2B8D7F',
    sku: 'DE9F4611BC2B8D7F',
    name: 'Flame Xtra Each in Condom',
    genericName: 'Male Condom',
    brandName: 'Flame Xtra',
    categoryId: 'cat-1',
    dosageForm: 'CONDOM',
    strength: 'EACH',
    unit: 'Each',
    manufacturer: 'DKT Ethiopia',
    description: 'Premium latex lubricated barrier contraceptive.',
    prescriptionRequired: false,
    reorderLevel: 15,
    stockQty: 36,
    sellingPrice: 45.0,
    purchasePrice: 30.0,
    imageUrl: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=120&auto=format&fit=crop&q=80',
  },
  {
    id: 'med-3',
    barcode: '6212A3220DC24E8B',
    sku: '6212A3220DC24E8B',
    name: 'Flame Xtacy Condom Packet',
    genericName: 'Condom of 3 pcs',
    brandName: 'Flame Xtacy',
    categoryId: 'cat-1',
    dosageForm: 'PACKET',
    strength: 'CONDOM',
    unit: 'Packet',
    manufacturer: 'DKT Ethiopia',
    description: '3-piece textured lubricated prophylactic packet.',
    prescriptionRequired: false,
    reorderLevel: 15,
    stockQty: 36,
    sellingPrice: 95.0,
    purchasePrice: 70.0,
    imageUrl: 'https://images.unsplash.com/photo-1628771065518-0d82f1938462?w=120&auto=format&fit=crop&q=80',
  },
  {
    id: 'med-4',
    barcode: 'B9B0CBF98C70260E',
    sku: 'B9B0CBF98C70260E',
    name: 'Gentian violet solution 30 ml in Bottle',
    genericName: 'Gentian violet solution',
    brandName: 'Gentian Violet',
    categoryId: 'cat-1',
    dosageForm: 'BOTTLE',
    strength: '30',
    unit: 'Bottle',
    manufacturer: 'EPHARM',
    description: 'Topical antiseptic antiseptic antimicrobial dye solution 30ml.',
    prescriptionRequired: false,
    reorderLevel: 10,
    stockQty: 30,
    sellingPrice: 55.0,
    purchasePrice: 38.0,
    imageUrl: 'https://images.unsplash.com/photo-1512069772995-ec65ed45afd6?w=120&auto=format&fit=crop&q=80',
  },
  {
    id: 'med-5',
    barcode: 'A0EA519879FC5A7A',
    sku: 'A0EA519879FC5A7A',
    name: 'Elastic crepe bandages 12.5cmx5m pc',
    genericName: 'Elastic crepe bandages',
    brandName: 'Crepe Bandage',
    categoryId: 'cat-1',
    dosageForm: 'BANDAGE',
    strength: '12.5CMx5M',
    unit: 'PC',
    manufacturer: 'SurgiCare',
    description: 'High-stretch orthopedic compression crepe bandage.',
    prescriptionRequired: false,
    reorderLevel: 10,
    stockQty: 12,
    sellingPrice: 85.0,
    purchasePrice: 60.0,
    imageUrl: 'https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=120&auto=format&fit=crop&q=80',
  },
  {
    id: 'med-6',
    barcode: 'B771830EAE903A6C',
    sku: 'B771830EAE903A6C',
    name: 'METRONIDAZOLE 0.5 % in injection',
    genericName: 'METRONIDAZOLE',
    brandName: 'Metronidazole Infusion',
    categoryId: 'cat-2',
    dosageForm: 'INJECTION',
    strength: '0.5',
    unit: 'Bottle',
    manufacturer: 'Cadila Pharma',
    description: 'Intravenous antiprotozoal and anaerobic antibiotic infusion 100ml.',
    prescriptionRequired: true,
    reorderLevel: 12,
    stockQty: 10,
    sellingPrice: 65.0,
    purchasePrice: 48.0,
    imageUrl: 'https://images.unsplash.com/photo-1579165466741-7f35e4755660?w=120&auto=format&fit=crop&q=80',
  },
  {
    id: 'med-7',
    barcode: '257C2C0331481C28',
    sku: '257C2C0331481C28',
    name: 'CAZITHRO 200/5 mg/ml in suspension',
    genericName: 'Azithromycin',
    brandName: 'Cazithro',
    categoryId: 'cat-2',
    dosageForm: 'SUSPENSION',
    strength: '200/5',
    unit: 'Bottle',
    manufacturer: 'Cadila Pharma',
    description: 'Oral macrolide pediatric antibiotic dry powder for suspension.',
    prescriptionRequired: true,
    reorderLevel: 10,
    stockQty: 20,
    sellingPrice: 180.0,
    purchasePrice: 140.0,
    imageUrl: 'https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=120&auto=format&fit=crop&q=80',
  },
  {
    id: 'med-8',
    barcode: 'E4C07A71D575836D',
    sku: 'E4C07A71D575836D',
    name: 'Azithromycin Tablet 500 mg',
    genericName: 'Azithromycin Dihydrate',
    brandName: 'Azithromycin',
    categoryId: 'cat-2',
    dosageForm: 'TABLET',
    strength: '500MG',
    unit: 'Box',
    manufacturer: 'EPHARM',
    description: 'Broad-spectrum macrolide antibiotic tablets 3-day treatment pack.',
    prescriptionRequired: true,
    reorderLevel: 10,
    stockQty: 20,
    sellingPrice: 220.0,
    purchasePrice: 175.0,
    imageUrl: 'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=120&auto=format&fit=crop&q=80',
  },
  {
    id: 'med-9',
    barcode: '84398209178F2535',
    sku: '84398209178F2535',
    name: 'H2O2 3%',
    genericName: 'Hydrogen peroxide',
    brandName: 'Hydrogen Peroxide 3%',
    categoryId: 'cat-1',
    dosageForm: '%',
    strength: '3%',
    unit: 'Bottle',
    manufacturer: 'MedPharm',
    description: 'Topical antiseptic wound cleanser effervescent solution 100ml.',
    prescriptionRequired: false,
    reorderLevel: 25,
    stockQty: 100,
    sellingPrice: 40.0,
    purchasePrice: 25.0,
    imageUrl: 'https://images.unsplash.com/photo-1512069772995-ec65ed45afd6?w=120&auto=format&fit=crop&q=80',
  },
  {
    id: 'med-10',
    barcode: 'D1439584CAC4CAA9',
    sku: 'D1439584CAC4CAA9',
    name: 'BACTIGEN EYE/EAR DROPS 0.3% Tub',
    genericName: 'Gentamicin eye drop',
    brandName: 'Bactigen',
    categoryId: 'cat-2',
    dosageForm: 'EYE/EAR DROP',
    strength: '0.3%',
    unit: 'Tub',
    manufacturer: 'Bactigen Labs',
    description: 'Sterile ophthalmic & otic antibacterial gentamicin solution.',
    prescriptionRequired: true,
    reorderLevel: 15,
    stockQty: 25,
    sellingPrice: 75.0,
    purchasePrice: 52.0,
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=120&auto=format&fit=crop&q=80',
  },
  {
    id: 'med-11',
    barcode: 'D92AADD3EC971035',
    sku: 'D92AADD3EC971035',
    name: 'Tetracycline Hydrochloride 1% 4 g Tube in ointment',
    genericName: 'TETRACYCLINE EYE OINTMENT',
    brandName: 'Tetracycline',
    categoryId: 'cat-2',
    dosageForm: 'OINTMENT',
    strength: '4G',
    unit: 'Tube',
    manufacturer: 'EPHARM',
    description: 'Sterile ophthalmic antibacterial ointment 4g tube.',
    prescriptionRequired: true,
    reorderLevel: 20,
    stockQty: 50,
    sellingPrice: 35.0,
    purchasePrice: 22.0,
    imageUrl: 'https://images.unsplash.com/photo-1563213126-a4273aed2016?w=120&auto=format&fit=crop&q=80',
  },
  {
    id: 'med-12',
    barcode: 'CD3499656AFA06F2',
    sku: 'CD3499656AFA06F2',
    name: 'Omeprazole 40mg VIAL in injection',
    genericName: 'Omeprazole 40mg injection',
    brandName: 'Omeprazole IV',
    categoryId: 'cat-5',
    dosageForm: 'INJECTION',
    strength: '40MG',
    unit: 'VIAL',
    manufacturer: 'Cadila Pharma',
    description: 'Proton pump inhibitor lyophilized powder for IV infusion.',
    prescriptionRequired: true,
    reorderLevel: 15,
    stockQty: 10,
    sellingPrice: 145.0,
    purchasePrice: 110.0,
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=120&auto=format&fit=crop&q=80',
  },
  {
    id: 'med-13',
    barcode: '27577B7F67813D7F',
    sku: '27577B7F67813D7F',
    name: 'VERMOREX 30ml in Shurp',
    genericName: 'Mebendazole',
    brandName: 'Vermorex',
    categoryId: 'cat-5',
    dosageForm: 'SHURP',
    strength: '30ML',
    unit: 'Bottle',
    manufacturer: 'MedPharm',
    description: 'Broad spectrum anthelmintic syrup 100mg/5ml for worms.',
    prescriptionRequired: false,
    reorderLevel: 12,
    stockQty: 27,
    sellingPrice: 80.0,
    purchasePrice: 58.0,
    imageUrl: 'https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=120&auto=format&fit=crop&q=80',
  },
  {
    id: 'med-14',
    barcode: '453F1EAE44AF7D74',
    sku: '453F1EAE44AF7D74',
    name: 'Omepil-20 20mg Capsule',
    genericName: 'Omeprazole',
    brandName: 'Omepil-20',
    categoryId: 'cat-5',
    dosageForm: 'CAPSULE',
    strength: '20MG',
    unit: 'Box',
    manufacturer: 'Bilim Pharma',
    description: 'Delayed-release enteric coated gastro-resistant capsules.',
    prescriptionRequired: false,
    reorderLevel: 15,
    stockQty: 19,
    sellingPrice: 120.0,
    purchasePrice: 88.0,
    imageUrl: 'https://images.unsplash.com/photo-1628771065518-0d82f1938462?w=120&auto=format&fit=crop&q=80',
  },
  {
    id: 'med-15',
    barcode: '3A9810F7220AB911',
    sku: '3A9810F7220AB911',
    name: 'Parakant 120mg/5ml Bottle in solution',
    genericName: 'Paracetamol Paediatric',
    brandName: 'Parakant',
    categoryId: 'cat-1',
    dosageForm: 'SOLUTION',
    strength: '120MG/5ML',
    unit: 'Bottle',
    manufacturer: 'Kant Pharma',
    description: 'Sugar-free analgesic antipyretic oral liquid for infants.',
    prescriptionRequired: false,
    reorderLevel: 20,
    stockQty: 35,
    sellingPrice: 65.0,
    purchasePrice: 45.0,
    imageUrl: 'https://images.unsplash.com/photo-1512069772995-ec65ed45afd6?w=120&auto=format&fit=crop&q=80',
  },
  {
    id: 'med-16',
    barcode: '848F679143AFEE94',
    sku: '848F679143AFEE94',
    name: 'miconazole cream BP 15g 2%w/w',
    genericName: 'Miconazole nitrate BP',
    brandName: 'Miconazole',
    categoryId: 'cat-2',
    dosageForm: 'CREAM',
    strength: '15G',
    unit: 'Tube',
    manufacturer: 'EPHARM',
    description: 'Broad spectrum antifungal dermatological cream 15g.',
    prescriptionRequired: false,
    reorderLevel: 12,
    stockQty: 20,
    sellingPrice: 90.0,
    purchasePrice: 65.0,
    imageUrl: 'https://images.unsplash.com/photo-1563213126-a4273aed2016?w=120&auto=format&fit=crop&q=80',
  },
  {
    id: 'med-17',
    barcode: 'B3EAD7BCF6EB5F33',
    sku: 'B3EAD7BCF6EB5F33',
    name: 'KETOCONAZOLE 2 % in cream',
    genericName: 'KETOCONAZOLE',
    brandName: 'Ketoconazole',
    categoryId: 'cat-2',
    dosageForm: 'CREAM',
    strength: '2%',
    unit: 'Tube',
    manufacturer: 'Global Health',
    description: 'Topical imidazole antifungal cream for fungal skin infections.',
    prescriptionRequired: false,
    reorderLevel: 15,
    stockQty: 40,
    sellingPrice: 110.0,
    purchasePrice: 80.0,
    imageUrl: 'https://images.unsplash.com/photo-1563213126-a4273aed2016?w=120&auto=format&fit=crop&q=80',
  },
  {
    id: 'med-18',
    barcode: 'E27BCB2E151BB549',
    sku: 'E27BCB2E151BB549',
    name: 'HYDROCORTISONE ACETATE OINTMENT 1% w/w in 15gm tube',
    genericName: 'Hydrocortisone acetate ointment',
    brandName: 'Hydrocortisone',
    categoryId: 'cat-1',
    dosageForm: '15GM TUBE',
    strength: '1%',
    unit: 'Tube',
    manufacturer: 'EPHARM',
    description: 'Anti-inflammatory anti-pruritic topical corticosteroid ointment.',
    prescriptionRequired: true,
    reorderLevel: 10,
    stockQty: 20,
    sellingPrice: 85.0,
    purchasePrice: 60.0,
    imageUrl: 'https://images.unsplash.com/photo-1563213126-a4273aed2016?w=120&auto=format&fit=crop&q=80',
  },
  {
    id: 'med-19',
    barcode: '1EA6DEC61DFB3B05',
    sku: '1EA6DEC61DFB3B05',
    name: 'whitfield ointement 20G in ointment',
    genericName: 'Whitfield',
    brandName: 'Whitfield',
    categoryId: 'cat-2',
    dosageForm: 'OINTMENT',
    strength: '20G',
    unit: 'Tube',
    manufacturer: 'EPHARM',
    description: 'Compound benzoic acid & salicylic acid keratolytic antifungal ointment.',
    prescriptionRequired: false,
    reorderLevel: 10,
    stockQty: 20,
    sellingPrice: 75.0,
    purchasePrice: 50.0,
    imageUrl: 'https://images.unsplash.com/photo-1563213126-a4273aed2016?w=120&auto=format&fit=crop&q=80',
  },
  {
    id: 'med-20',
    barcode: 'F76101FF789DB188',
    sku: 'F76101FF789DB188',
    name: 'Clotrimazole 1% Tube in cream',
    genericName: 'Clotrimazole 1%',
    brandName: 'Clotrimazole',
    categoryId: 'cat-2',
    dosageForm: 'CREAM',
    strength: '1%',
    unit: 'Tube',
    manufacturer: 'Bayer / EPHARM',
    description: 'Broad-spectrum antimycotic cream for cutaneous candidiasis.',
    prescriptionRequired: false,
    reorderLevel: 10,
    stockQty: 20,
    sellingPrice: 95.0,
    purchasePrice: 70.0,
    imageUrl: 'https://images.unsplash.com/photo-1563213126-a4273aed2016?w=120&auto=format&fit=crop&q=80',
  },
];

// Additional mock inventory names to reach exactly 120 medicines
const additionalMedicinesCatalog = [
  { name: 'Paracetamol 500mg Tablets', generic: 'PARACETAMOL', form: 'TABLET', strength: '500MG', cat: 'cat-1' },
  { name: 'Coartem 20/120 Dispersible', generic: 'ARTEMETHER + LUMEFANTRINE', form: 'TABLET', strength: '20/120MG', cat: 'cat-3' },
  { name: 'Ciprofloxacin 500mg Film-Coated', generic: 'CIPROFLOXACIN HCL', form: 'TABLET', strength: '500MG', cat: 'cat-2' },
  { name: 'Vitamin C 1000mg Effervescent', generic: 'ASCORBIC ACID', form: 'TABLET', strength: '1000MG', cat: 'cat-4' },
  { name: 'Salbutamol Inhaler 100mcg', generic: 'SALBUTAMOL SULFATE', form: 'INHALER', strength: '100MCG', cat: 'cat-6' },
  { name: 'Metformin 850mg Tablets', generic: 'METFORMIN HYDROCHLORIDE', form: 'TABLET', strength: '850MG', cat: 'cat-7' },
  { name: 'Atorvastatin 20mg Tablets', generic: 'ATORVASTATIN CALCIUM', form: 'TABLET', strength: '20MG', cat: 'cat-7' },
  { name: 'Enalapril 10mg Tablets', generic: 'ENALAPRIL MALEATE', form: 'TABLET', strength: '10MG', cat: 'cat-7' },
  { name: 'Losartan Potassium 50mg', generic: 'LOSARTAN POTASSIUM', form: 'TABLET', strength: '50MG', cat: 'cat-7' },
  { name: 'Glibenclamide 5mg Tablets', generic: 'GLIBENCLAMIDE', form: 'TABLET', strength: '5MG', cat: 'cat-7' },
  { name: 'Dexamethasone 0.5mg Tablets', generic: 'DEXAMETHASONE', form: 'TABLET', strength: '0.5MG', cat: 'cat-1' },
  { name: 'Prednisolone 5mg Tablets', generic: 'PREDNISOLONE', form: 'TABLET', strength: '5MG', cat: 'cat-1' },
  { name: 'Cetirizine 10mg Tablets', generic: 'CETIRIZINE DIHYDROCHLORIDE', form: 'TABLET', strength: '10MG', cat: 'cat-6' },
  { name: 'Loratadine 10mg Tablets', generic: 'LORATADINE', form: 'TABLET', strength: '10MG', cat: 'cat-6' },
  { name: 'Albendazole 400mg Chewable', generic: 'ALBENDAZOLE', form: 'CHEWABLE', strength: '400MG', cat: 'cat-5' },
  { name: 'Oral Rehydration Salts (ORS) Sachet', generic: 'SODIUM CHLORIDE + GLUCOSE', form: 'SACHET', strength: '20.5G', cat: 'cat-5' },
  { name: 'Zinc Sulfate 20mg Dispersible', generic: 'ZINC SULFATE MONOHYDRATE', form: 'TABLET', strength: '20MG', cat: 'cat-4' },
  { name: 'Calcium + Vitamin D3 Tablets', generic: 'CALCIUM CARBONATE + CHOLECALCIFEROL', form: 'TABLET', strength: '600MG/400IU', cat: 'cat-4' },
  { name: 'Chloramphenicol 1% Eye Ointment', generic: 'CHLORAMPHENICOL', form: 'OINTMENT', strength: '1%', cat: 'cat-2' },
  { name: 'Loperamide 2mg Capsules', generic: 'LOPERAMIDE HCL', form: 'CAPSULE', strength: '2MG', cat: 'cat-5' },
  { name: 'Ranitidine 150mg Film-Coated', generic: 'RANITIDINE HCL', form: 'TABLET', strength: '150MG', cat: 'cat-5' },
  { name: 'Cefuroxime Axetil 500mg', generic: 'CEFUROXIME AXETIL', form: 'TABLET', strength: '500MG', cat: 'cat-2' },
  { name: 'Tramadol 50mg Capsules', generic: 'TRAMADOL HYDROCHLORIDE', form: 'CAPSULE', strength: '50MG', cat: 'cat-1' },
  { name: 'Meloxicam 15mg Tablets', generic: 'MELOXICAM', form: 'TABLET', strength: '15MG', cat: 'cat-1' },
  { name: 'Piroxicam 20mg Capsules', generic: 'PIROXICAM', form: 'CAPSULE', strength: '20MG', cat: 'cat-1' },
  { name: 'Propranolol 40mg Tablets', generic: 'PROPRANOLOL HCL', form: 'TABLET', strength: '40MG', cat: 'cat-7' },
  { name: 'Atenolol 50mg Tablets', generic: 'ATENOLOL', form: 'TABLET', strength: '50MG', cat: 'cat-7' },
  { name: 'Hydrochlorothiazide 25mg', generic: 'HYDROCHLOROTHIAZIDE', form: 'TABLET', strength: '25MG', cat: 'cat-7' },
  { name: 'Furosemide 40mg Tablets', generic: 'FUROSEMIDE', form: 'TABLET', strength: '40MG', cat: 'cat-7' },
  { name: 'Spironolactone 25mg Tablets', generic: 'SPIRONOLACTONE', form: 'TABLET', strength: '25MG', cat: 'cat-7' },
];

// Combine to produce exactly 120 Medicines (52 In Stock, 68 Low Stock, 0 Out of Stock)
const medicines: Medicine[] = [
  ...exactScreenshotMedicines.map((m) => ({
    id: m.id,
    barcode: m.barcode,
    sku: m.sku,
    name: m.name,
    genericName: m.genericName,
    brandName: m.brandName,
    categoryId: m.categoryId,
    dosageForm: m.dosageForm,
    strength: m.strength,
    unit: m.unit,
    manufacturer: m.manufacturer,
    description: m.description,
    prescriptionRequired: m.prescriptionRequired,
    reorderLevel: m.reorderLevel,
    isActive: true,
    imageUrl: m.imageUrl,
    branchName: 'Kaziniya Drug store',
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-08-10T10:00:00Z',
  })),
  ...Array.from({ length: 100 }, (_, i) => {
    const idx = i + 21;
    const catItem = additionalMedicinesCatalog[i % additionalMedicinesCatalog.length];
    const name = `${catItem.name}${idx > 50 ? ` Batch-${idx}` : ''}`;
    const hexQr = (0x1000000000000000n + BigInt(idx) * 0x765432101234n).toString(16).toUpperCase().substring(0, 16);
    
    // We need 52 in stock and 68 low stock across 120 items
    // First 20 items:
    // med-1 to med-4: 4 items In Stock (40, 36, 36, 30)
    // med-5, med-6: 2 items Low Stock (12, 10)
    // med-7 to med-11: 5 items In Stock (20, 20, 100, 25, 50)
    // med-12: 1 item Low Stock (10)
    // med-13 to med-17: 5 items In Stock (27, 19, 35, 20, 40)
    // med-18 to med-20: 3 items In Stock (20, 20, 20)
    // So out of first 20 items, 17 are In Stock, 3 are Low Stock!
    // Therefore, in remaining 100 items:
    // We want 52 - 17 = 35 more In Stock items
    // And 68 - 3 = 65 more Low Stock items!
    // Total = 35 + 65 = 100 items!
    const isLow = i >= 35; // First 35 are in stock, remaining 65 are low stock!

    return {
      id: `med-${idx}`,
      barcode: hexQr,
      sku: hexQr,
      name,
      genericName: catItem.generic,
      brandName: `${catItem.generic.split(' ')[0]} Care`,
      categoryId: catItem.cat,
      dosageForm: catItem.form,
      strength: catItem.strength,
      unit: 'Box',
      manufacturer: 'MedPharm Wholesale Ltd',
      description: 'Standard therapeutic agent for licensed dispensary stock.',
      prescriptionRequired: i % 2 === 0,
      reorderLevel: 20,
      isActive: true,
      imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=120&auto=format&fit=crop&q=80',
      branchName: 'Kaziniya Drug store',
      createdAt: '2026-01-10T10:00:00Z',
      updatedAt: '2026-08-10T10:00:00Z',
    };
  }),
];

// Seed Batches (120 Batches corresponding to 120 Medicines)
const medicineBatches: MedicineBatch[] = medicines.map((med, i) => {
  const idx = i + 1;
  const isExpiring = idx === 6 || idx === 12;

  let qty = 20;
  let purchasePrice = 60.0;
  let sellingPrice = 85.0;

  if (i < exactScreenshotMedicines.length) {
    const item = exactScreenshotMedicines[i];
    qty = item.stockQty;
    purchasePrice = item.purchasePrice;
    sellingPrice = item.sellingPrice;
  } else {
    // For items 21-120: first 35 items have qty > reorderLevel (25 units), remaining 65 have qty <= reorderLevel (9 units)
    const isLow = (i - 20) >= 35;
    qty = isLow ? 8 : 28;
    purchasePrice = 75.0 + (i % 20) * 3;
    sellingPrice = Math.round(purchasePrice * 1.3 * 100) / 100;
  }

  return {
    id: `bat-${idx}`,
    medicineId: med.id,
    batchNumber: `KZ-BATCH-2026-${String(idx).padStart(3, '0')}`,
    manufacturingDate: '2025-01-10',
    expiryDate: isExpiring ? '2026-09-01' : '2028-06-30',
    purchasePrice,
    sellingPrice,
    initialQuantity: qty + 15,
    currentQuantity: qty,
    supplierId: 'sup-1',
    createdAt: '2025-01-15T10:00:00Z',
    updatedAt: '2026-08-01T10:00:00Z',
  };
});

// Seed Inventory Transactions
const inventoryTransactions: InventoryTransaction[] = [
  {
    id: 'tx-1',
    medicineId: 'med-1',
    batchId: 'bat-1',
    transactionType: 'INITIAL_STOCK',
    quantity: 200,
    previousQuantity: 0,
    newQuantity: 200,
    performedBy: 'u-5',
    performedByName: 'Yonas Girma',
    notes: 'Initial inventory load for Paracetamol',
    createdAt: '2025-01-20T10:00:00Z',
  },
  {
    id: 'tx-2',
    medicineId: 'med-2',
    batchId: 'bat-3',
    transactionType: 'INITIAL_STOCK',
    quantity: 100,
    previousQuantity: 0,
    newQuantity: 100,
    performedBy: 'u-5',
    performedByName: 'Yonas Girma',
    notes: 'Initial inventory load for Amoxicillin',
    createdAt: '2024-09-10T10:00:00Z',
  },
  {
    id: 'tx-3',
    medicineId: 'med-1',
    batchId: 'bat-1',
    transactionType: 'SALE',
    quantity: -10,
    previousQuantity: 200,
    newQuantity: 190,
    referenceId: 'inv-1001',
    referenceType: 'SALE',
    performedBy: 'u-4',
    performedByName: 'Hana Kebede',
    notes: 'Counter sale invoice #KS-001001',
    createdAt: '2026-08-10T14:20:00Z',
  },
];

// Seed Purchases
const purchases: Purchase[] = [
  {
    id: 'pur-101',
    supplierId: 'sup-1',
    supplierName: 'MedPharm Wholesale Ltd',
    invoiceNumber: 'SUP-INV-8891',
    purchaseDate: '2026-01-10',
    totalAmount: 1815.00,
    status: 'COMPLETED',
    createdBy: 'u-5',
    createdByName: 'Yonas Girma',
    items: [
      {
        id: 'pi-1',
        purchaseId: 'pur-101',
        medicineId: 'med-1',
        medicineName: 'Paracetamol 500mg',
        batchNumber: 'KZ-PAR-2025-01',
        mfgDate: '2025-01-15',
        expDate: '2027-08-15',
        quantity: 200,
        unitCost: 1.20,
        sellingPrice: 2.50,
        totalCost: 240.00,
      },
      {
        id: 'pi-2',
        purchaseId: 'pur-101',
        medicineId: 'med-5',
        medicineName: 'Ciprofloxacin 500mg',
        batchNumber: 'KZ-CIP-2026-01',
        mfgDate: '2026-01-10',
        expDate: '2028-06-30',
        quantity: 150,
        unitCost: 10.50,
        sellingPrice: 20.00,
        totalCost: 1575.00,
      },
    ],
    createdAt: '2026-01-10T11:00:00Z',
  },
];

// Seed Sales
const sales: Sale[] = [
  {
    id: 'inv-1001',
    invoiceNumber: 'KS-001001',
    customerName: 'Abebe Kebede (Walk-in)',
    subtotal: 65.00,
    discount: 0,
    tax: 0,
    totalAmount: 65.00,
    paymentMethod: 'CASH',
    paymentStatus: 'PAID',
    soldBy: 'u-4',
    soldByName: 'Hana Kebede',
    items: [
      {
        id: 'si-1',
        saleId: 'inv-1001',
        medicineId: 'med-1',
        medicineName: 'Paracetamol 500mg',
        batchId: 'bat-1',
        batchNumber: 'KZ-PAR-2025-01',
        quantity: 10,
        unitPrice: 2.50,
        discount: 0,
        totalPrice: 25.00,
        unitCost: 1.20,
      },
      {
        id: 'si-2',
        saleId: 'inv-1001',
        medicineId: 'med-2',
        medicineName: 'Amoxicillin 500mg',
        batchId: 'bat-3',
        batchNumber: 'KZ-AMX-2024-09',
        quantity: 2,
        unitPrice: 15.00,
        discount: 0,
        totalPrice: 30.00,
        unitCost: 8.00,
      },
      {
        id: 'si-3',
        saleId: 'inv-1001',
        medicineId: 'med-4',
        medicineName: 'Omeprazole 20mg',
        batchId: 'bat-6',
        batchNumber: 'KZ-OMP-2024-08',
        quantity: 1,
        unitPrice: 12.00,
        discount: 2.00,
        totalPrice: 10.00,
        unitCost: 6.00,
      },
    ],
    createdAt: '2026-08-10T14:20:00Z',
  },
  {
    id: 'inv-1002',
    invoiceNumber: 'KS-001002',
    customerName: 'Makeda Tadesse',
    subtotal: 125.00,
    discount: 5.00,
    tax: 0,
    totalAmount: 120.00,
    paymentMethod: 'MOBILE_MONEY',
    paymentStatus: 'PAID',
    soldBy: 'u-3',
    soldByName: 'Pharm. Solomon Bekele',
    items: [
      {
        id: 'si-4',
        saleId: 'inv-1002',
        medicineId: 'med-3',
        medicineName: 'Coartem 20/120',
        batchId: 'bat-5',
        batchNumber: 'KZ-ART-2025-05',
        quantity: 1,
        unitPrice: 80.00,
        discount: 0,
        totalPrice: 80.00,
        unitCost: 45.00,
      },
      {
        id: 'si-5',
        saleId: 'inv-1002',
        medicineId: 'med-7',
        medicineName: 'Vitamin C 1000mg Effervescent',
        batchId: 'bat-10',
        batchNumber: 'KZ-VIT-2026-01',
        quantity: 1,
        unitPrice: 45.00,
        discount: 5.00,
        totalPrice: 40.00,
        unitCost: 25.00,
      },
    ],
    createdAt: '2026-08-11T09:15:00Z',
  },
];

// Seed Audit Logs
const auditLogs: AuditLog[] = [
  {
    id: 'log-1',
    userId: 'u-1',
    userName: 'Dr. Alemu Tadesse',
    action: 'SYSTEM_INIT',
    entityType: 'SYSTEM',
    entityId: 'kaziniya-core',
    oldData: null,
    newData: { status: 'INITIALIZED' },
    ipAddress: '127.0.0.1',
    createdAt: '2026-01-01T08:00:00Z',
  },
  {
    id: 'log-2',
    userId: 'u-5',
    userName: 'Yonas Girma',
    action: 'PURCHASE_CREATED',
    entityType: 'PURCHASE',
    entityId: 'pur-101',
    oldData: null,
    newData: { invoiceNumber: 'SUP-INV-8891', totalAmount: 1815.00 },
    ipAddress: '192.168.1.45',
    createdAt: '2026-01-10T11:00:00Z',
  },
  {
    id: 'log-3',
    userId: 'u-4',
    userName: 'Hana Kebede',
    action: 'SALE_COMPLETED',
    entityType: 'SALE',
    entityId: 'inv-1001',
    oldData: null,
    newData: { invoiceNumber: 'KS-001001', totalAmount: 65.00, itemsCount: 3 },
    ipAddress: '192.168.1.12',
    createdAt: '2026-08-10T14:20:00Z',
  },
];

// HELPER COMPUTATIONS
export function getCalculatedMedicines(): Medicine[] {
  const todayStr = new Date().toISOString().split('T')[0];

  return medicines.map((med) => {
    const medBatches = medicineBatches.filter((b) => b.medicineId === med.id);
    const totalStock = medBatches.reduce((acc, b) => acc + b.currentQuantity, 0);

    // Filter active (non-expired) batches to find earliest expiry and standard selling price
    const activeBatches = medBatches.filter((b) => b.expiryDate >= todayStr && b.currentQuantity > 0);
    activeBatches.sort((a, b) => a.expiryDate.localeCompare(b.expiryDate));

    const earliestExpiry = activeBatches.length > 0 ? activeBatches[0].expiryDate : (medBatches.length > 0 ? medBatches[0].expiryDate : undefined);
    const sellingPrice = activeBatches.length > 0 ? activeBatches[0].sellingPrice : (medBatches.length > 0 ? medBatches[0].sellingPrice : 0);

    const category = categories.find((c) => c.id === med.categoryId);

    return {
      ...med,
      categoryName: category?.name || 'MEDICINE',
      branchName: med.branchName || 'Kaziniya Drug store',
      imageUrl: med.imageUrl,
      totalStock,
      earliestExpiry,
      sellingPrice,
    };
  });
}

export function getBatchesWithStatus(): MedicineBatch[] {
  const today = new Date();
  const ninetyDaysFromNow = new Date();
  ninetyDaysFromNow.setDate(today.getDate() + 90);

  const todayStr = today.toISOString().split('T')[0];
  const ninetyStr = ninetyDaysFromNow.toISOString().split('T')[0];

  return medicineBatches.map((b) => {
    const med = medicines.find((m) => m.id === b.medicineId);
    const sup = suppliers.find((s) => s.id === b.supplierId);

    let status: 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED' | 'OUT_OF_STOCK' = 'ACTIVE';
    if (b.currentQuantity <= 0) {
      status = 'OUT_OF_STOCK';
    } else if (b.expiryDate < todayStr) {
      status = 'EXPIRED';
    } else if (b.expiryDate <= ninetyStr) {
      status = 'EXPIRING_SOON';
    }

    return {
      ...b,
      medicineName: med?.name || 'Unknown Medicine',
      supplierName: sup?.name || 'Direct',
      status,
    };
  });
}

// FEFO ALGORITHM: FIRST EXPIRY, FIRST OUT
export interface FefoAllocationResult {
  medicineId: string;
  medicineName: string;
  requestedQty: number;
  allocatedBatches: Array<{
    batchId: string;
    batchNumber: string;
    expiryDate: string;
    qtyDeducted: number;
    unitCost: number;
    unitPrice: number;
  }>;
  totalAllocated: number;
  unitPrice: number;
}

export function allocateFefoStock(medicineId: string, quantityNeeded: number): FefoAllocationResult {
  const todayStr = new Date().toISOString().split('T')[0];
  const med = medicines.find((m) => m.id === medicineId);
  if (!med) throw new Error(`Medicine with ID ${medicineId} not found.`);

  // Find all available batches for this medicine that are NOT expired and have stock > 0
  const availableBatches = medicineBatches.filter(
    (b) => b.medicineId === medicineId && b.currentQuantity > 0 && b.expiryDate >= todayStr
  );

  // Sort strictly by Expiry Date ascending (FEFO)
  availableBatches.sort((a, b) => a.expiryDate.localeCompare(b.expiryDate));

  const totalAvailable = availableBatches.reduce((acc, b) => acc + b.currentQuantity, 0);
  if (totalAvailable < quantityNeeded) {
    throw new Error(
      `Insufficient stock for "${med.name}". Requested: ${quantityNeeded}, Available non-expired: ${totalAvailable}`
    );
  }

  let remainingToDeduct = quantityNeeded;
  const allocatedBatches: FefoAllocationResult['allocatedBatches'] = [];

  for (const batch of availableBatches) {
    if (remainingToDeduct <= 0) break;

    const deductFromThisBatch = Math.min(batch.currentQuantity, remainingToDeduct);
    allocatedBatches.push({
      batchId: batch.id,
      batchNumber: batch.batchNumber,
      expiryDate: batch.expiryDate,
      qtyDeducted: deductFromThisBatch,
      unitCost: batch.purchasePrice,
      unitPrice: batch.sellingPrice,
    });

    remainingToDeduct -= deductFromThisBatch;
  }

  const defaultPrice = allocatedBatches.length > 0 ? allocatedBatches[0].unitPrice : 0;

  return {
    medicineId: med.id,
    medicineName: med.name,
    requestedQty: quantityNeeded,
    allocatedBatches,
    totalAllocated: quantityNeeded,
    unitPrice: defaultPrice,
  };
}

// ATOMIC SALE PROCESSOR
export function processSaleTransaction(
  saleData: {
    items: Array<{ medicineId: string; quantity: number; unitPrice?: number; discount?: number }>;
    paymentMethod: Sale['paymentMethod'];
    customerName?: string;
    discount?: number;
    soldByUserId: string;
  }
): Sale {
  const seller = users.find((u) => u.id === saleData.soldByUserId) || users[3]; // Default Cashier
  const now = new Date();
  const invoiceNumber = `KS-${Math.floor(100000 + Math.random() * 900000)}`;

  let subtotal = 0;
  const processedSaleItems: Sale['items'] = [];
  const inventoryTxLogs: InventoryTransaction[] = [];

  // Step 1: Pre-validate all items and allocate via FEFO atomically
  const fefoAllocations = saleData.items.map((item) => {
    return allocateFefoStock(item.medicineId, item.quantity);
  });

  // Step 2: Perform stock deductions & create sale items
  fefoAllocations.forEach((allocation, idx) => {
    const inputItem = saleData.items[idx];
    const discount = inputItem.discount || 0;

    allocation.allocatedBatches.forEach((alloc) => {
      // Find batch and deduct currentQuantity
      const targetBatch = medicineBatches.find((b) => b.id === alloc.batchId);
      if (!targetBatch) throw new Error(`Batch ${alloc.batchId} missing during transaction execution.`);

      const prevQty = targetBatch.currentQuantity;
      targetBatch.currentQuantity -= alloc.qtyDeducted;
      targetBatch.updatedAt = now.toISOString();

      const itemPrice = inputItem.unitPrice || alloc.unitPrice;
      const lineTotal = alloc.qtyDeducted * itemPrice - discount;
      subtotal += lineTotal;

      processedSaleItems.push({
        id: `si-${Math.random().toString(36).substr(2, 9)}`,
        saleId: invoiceNumber,
        medicineId: allocation.medicineId,
        medicineName: allocation.medicineName,
        batchId: alloc.batchId,
        batchNumber: alloc.batchNumber,
        expiryDate: alloc.expiryDate,
        quantity: alloc.qtyDeducted,
        unitPrice: itemPrice,
        discount: discount,
        totalPrice: lineTotal,
        unitCost: alloc.unitCost,
      });

      // Create transaction record
      const tx: InventoryTransaction = {
        id: `tx-${Math.random().toString(36).substr(2, 9)}`,
        medicineId: allocation.medicineId,
        medicineName: allocation.medicineName,
        batchId: alloc.batchId,
        batchNumber: alloc.batchNumber,
        transactionType: 'SALE',
        quantity: -alloc.qtyDeducted,
        previousQuantity: prevQty,
        newQuantity: targetBatch.currentQuantity,
        referenceId: invoiceNumber,
        referenceType: 'SALE',
        performedBy: seller.id,
        performedByName: seller.name,
        notes: `Sale invoice #${invoiceNumber}`,
        createdAt: now.toISOString(),
      };
      inventoryTransactions.unshift(tx);
    });
  });

  const overallDiscount = saleData.discount || 0;
  const totalAmount = Math.max(0, subtotal - overallDiscount);

  const newSale: Sale = {
    id: `inv-${Date.now()}`,
    invoiceNumber,
    customerName: saleData.customerName || 'Walk-in Customer',
    subtotal,
    discount: overallDiscount,
    tax: 0,
    totalAmount,
    paymentMethod: saleData.paymentMethod,
    paymentStatus: 'PAID',
    soldBy: seller.id,
    soldByName: seller.name,
    items: processedSaleItems,
    createdAt: now.toISOString(),
  };

  sales.unshift(newSale);

  // Add Audit Log
  auditLogs.unshift({
    id: `log-${Date.now()}`,
    userId: seller.id,
    userName: seller.name,
    action: 'SALE_COMPLETED',
    entityType: 'SALE',
    entityId: newSale.id,
    newData: { invoiceNumber, totalAmount, itemsCount: processedSaleItems.length },
    ipAddress: '127.0.0.1',
    createdAt: now.toISOString(),
  });

  return newSale;
}

// ATOMIC STOCK ADJUSTMENT
export function adjustStock(data: {
  medicineId: string;
  batchId: string;
  transactionType: 'ADJUSTMENT' | 'DAMAGED' | 'EXPIRED';
  quantityDelta: number; // Positive for addition, negative for reduction
  notes: string;
  performedByUserId: string;
}): InventoryTransaction {
  const batch = medicineBatches.find((b) => b.id === data.batchId);
  if (!batch) throw new Error('Target batch not found');

  const med = medicines.find((m) => m.id === data.medicineId);
  if (!med) throw new Error('Target medicine not found');

  const performer = users.find((u) => u.id === data.performedByUserId) || users[0];

  const prevQty = batch.currentQuantity;
  const newQty = prevQty + data.quantityDelta;

  if (newQty < 0) {
    throw new Error(`Stock adjustment would result in negative stock (${newQty}). Action blocked.`);
  }

  batch.currentQuantity = newQty;
  batch.updatedAt = new Date().toISOString();

  const tx: InventoryTransaction = {
    id: `tx-${Date.now()}`,
    medicineId: med.id,
    medicineName: med.name,
    batchId: batch.id,
    batchNumber: batch.batchNumber,
    transactionType: data.transactionType,
    quantity: data.quantityDelta,
    previousQuantity: prevQty,
    newQuantity: newQty,
    performedBy: performer.id,
    performedByName: performer.name,
    notes: data.notes,
    createdAt: new Date().toISOString(),
  };

  inventoryTransactions.unshift(tx);

  auditLogs.unshift({
    id: `log-${Date.now()}`,
    userId: performer.id,
    userName: performer.name,
    action: `STOCK_${data.transactionType}`,
    entityType: 'BATCH',
    entityId: batch.id,
    oldData: { quantity: prevQty },
    newData: { quantity: newQty, reason: data.notes },
    ipAddress: '127.0.0.1',
    createdAt: new Date().toISOString(),
  });

  return tx;
}

// ATOMIC PURCHASE CREATION & BATCH REPLENISHMENT
export function createPurchaseOrder(data: {
  supplierId: string;
  invoiceNumber: string;
  purchaseDate: string;
  createdByUserId: string;
  items: Array<{
    medicineId: string;
    batchNumber: string;
    mfgDate: string;
    expDate: string;
    quantity: number;
    unitCost: number;
    sellingPrice: number;
  }>;
}): Purchase {
  const supplier = suppliers.find((s) => s.id === data.supplierId);
  if (!supplier) throw new Error('Supplier not found');

  const creator = users.find((u) => u.id === data.createdByUserId) || users[4];
  const now = new Date().toISOString();

  let totalAmount = 0;
  const purchaseItems: Purchase['items'] = [];

  data.items.forEach((item) => {
    const med = medicines.find((m) => m.id === item.medicineId);
    if (!med) throw new Error(`Medicine ID ${item.medicineId} not found`);

    const lineCost = item.quantity * item.unitCost;
    totalAmount += lineCost;

    // Check if batch exists or create a new batch
    let batch = medicineBatches.find(
      (b) => b.medicineId === item.medicineId && b.batchNumber === item.batchNumber
    );

    if (batch) {
      const prevQty = batch.currentQuantity;
      batch.currentQuantity += item.quantity;
      batch.purchasePrice = item.unitCost;
      batch.sellingPrice = item.sellingPrice;
      batch.updatedAt = now;

      inventoryTransactions.unshift({
        id: `tx-${Date.now()}-${Math.random()}`,
        medicineId: med.id,
        medicineName: med.name,
        batchId: batch.id,
        batchNumber: batch.batchNumber,
        transactionType: 'PURCHASE',
        quantity: item.quantity,
        previousQuantity: prevQty,
        newQuantity: batch.currentQuantity,
        referenceId: data.invoiceNumber,
        referenceType: 'PURCHASE',
        performedBy: creator.id,
        performedByName: creator.name,
        notes: `Stock purchase replenishment from ${supplier.name}`,
        createdAt: now,
      });
    } else {
      // Create new batch
      const newBatch: MedicineBatch = {
        id: `bat-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        medicineId: med.id,
        medicineName: med.name,
        batchNumber: item.batchNumber,
        manufacturingDate: item.mfgDate,
        expiryDate: item.expDate,
        purchasePrice: item.unitCost,
        sellingPrice: item.sellingPrice,
        initialQuantity: item.quantity,
        currentQuantity: item.quantity,
        supplierId: supplier.id,
        supplierName: supplier.name,
        createdAt: now,
        updatedAt: now,
      };
      medicineBatches.push(newBatch);

      inventoryTransactions.unshift({
        id: `tx-${Date.now()}-${Math.random()}`,
        medicineId: med.id,
        medicineName: med.name,
        batchId: newBatch.id,
        batchNumber: newBatch.batchNumber,
        transactionType: 'PURCHASE',
        quantity: item.quantity,
        previousQuantity: 0,
        newQuantity: item.quantity,
        referenceId: data.invoiceNumber,
        referenceType: 'PURCHASE',
        performedBy: creator.id,
        performedByName: creator.name,
        notes: `New batch received via purchase from ${supplier.name}`,
        createdAt: now,
      });
    }

    purchaseItems.push({
      id: `pi-${Math.random().toString(36).substr(2, 9)}`,
      purchaseId: '',
      medicineId: med.id,
      medicineName: med.name,
      batchNumber: item.batchNumber,
      mfgDate: item.mfgDate,
      expDate: item.expDate,
      quantity: item.quantity,
      unitCost: item.unitCost,
      sellingPrice: item.sellingPrice,
      totalCost: lineCost,
    });
  });

  const newPurchase: Purchase = {
    id: `pur-${Date.now()}`,
    supplierId: supplier.id,
    supplierName: supplier.name,
    invoiceNumber: data.invoiceNumber,
    purchaseDate: data.purchaseDate,
    totalAmount,
    status: 'COMPLETED',
    createdBy: creator.id,
    createdByName: creator.name,
    items: purchaseItems,
    createdAt: now,
  };

  purchases.unshift(newPurchase);

  auditLogs.unshift({
    id: `log-${Date.now()}`,
    userId: creator.id,
    userName: creator.name,
    action: 'PURCHASE_COMPLETED',
    entityType: 'PURCHASE',
    entityId: newPurchase.id,
    newData: { supplier: supplier.name, invoiceNumber: data.invoiceNumber, totalAmount },
    ipAddress: '127.0.0.1',
    createdAt: now,
  });

  return newPurchase;
}

// DASHBOARD SUMMARY COMPUTATION
export function getDashboardSummary(): DashboardSummary {
  const todayStr = new Date().toISOString().split('T')[0];
  const calculatedMeds = getCalculatedMedicines();
  const batchesWithStatus = getBatchesWithStatus();

  // Today's Sales
  const todaySales = sales.filter((s) => s.createdAt.startsWith(todayStr));
  const todayRevenue = todaySales.reduce((sum, s) => sum + s.totalAmount, 0);

  // Total inventory metrics
  const totalInventoryUnits = calculatedMeds.reduce((acc, m) => acc + (m.totalStock || 0), 0);
  const totalInventoryValue = medicineBatches.reduce(
    (acc, b) => acc + b.currentQuantity * b.purchasePrice,
    0
  );

  // Low stock medicines
  const lowStockCount = calculatedMeds.filter((m) => (m.totalStock || 0) <= m.reorderLevel).length;

  // Expiring soon & Expired count
  const expiringSoonCount = batchesWithStatus.filter((b) => b.status === 'EXPIRING_SOON').length;
  const expiredCount = batchesWithStatus.filter((b) => b.status === 'EXPIRED').length;

  // Last 7 days trend
  const salesTrend: DashboardSummary['salesTrend'] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];

    const daySales = sales.filter((s) => s.createdAt.startsWith(dateStr));
    const dayRev = daySales.reduce((acc, s) => acc + s.totalAmount, 0);

    salesTrend.push({
      date: dateStr,
      revenue: dayRev,
      salesCount: daySales.length,
    });
  }

  // Top selling medicines
  const medicineSalesMap: Record<string, { medicineName: string; unitsSold: number; totalRevenue: number }> = {};
  sales.forEach((sale) => {
    sale.items.forEach((item) => {
      if (!medicineSalesMap[item.medicineId]) {
        medicineSalesMap[item.medicineId] = {
          medicineName: item.medicineName || 'Medicine',
          unitsSold: 0,
          totalRevenue: 0,
        };
      }
      medicineSalesMap[item.medicineId].unitsSold += item.quantity;
      medicineSalesMap[item.medicineId].totalRevenue += item.totalPrice;
    });
  });

  const topSellingMedicines = Object.values(medicineSalesMap)
    .sort((a, b) => b.unitsSold - a.unitsSold)
    .slice(0, 5);

  return {
    todaySalesCount: todaySales.length,
    todayRevenue,
    totalMedicinesCount: medicines.length,
    totalInventoryUnits,
    totalInventoryValue,
    lowStockCount,
    expiringSoonCount,
    expiredCount,
    recentSales: sales.slice(0, 5),
    recentTransactions: inventoryTransactions.slice(0, 5),
    salesTrend,
    topSellingMedicines,
  };
}

// PROFIT COMPUTATION BASED ON ACTUAL BATCH COGS
export function getProfitReport(): ProfitReportData {
  let totalRevenue = 0;
  let cogs = 0;

  const medMap: Record<
    string,
    { medicineId: string; medicineName: string; unitsSold: number; revenue: number; cost: number }
  > = {};

  sales.forEach((s) => {
    totalRevenue += s.totalAmount;
    s.items.forEach((item) => {
      const itemCost = (item.unitCost || 0) * item.quantity;
      cogs += itemCost;

      if (!medMap[item.medicineId]) {
        medMap[item.medicineId] = {
          medicineId: item.medicineId,
          medicineName: item.medicineName || 'Medicine',
          unitsSold: 0,
          revenue: 0,
          cost: 0,
        };
      }
      medMap[item.medicineId].unitsSold += item.quantity;
      medMap[item.medicineId].revenue += item.totalPrice;
      medMap[item.medicineId].cost += itemCost;
    });
  });

  const grossProfit = totalRevenue - cogs;
  const profitMarginPercent = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

  const breakdownByMedicine = Object.values(medMap).map((item) => {
    const gp = item.revenue - item.cost;
    const margin = item.revenue > 0 ? (gp / item.revenue) * 100 : 0;
    return {
      ...item,
      grossProfit: gp,
      profitMargin: margin,
    };
  });

  return {
    totalRevenue,
    cogs,
    grossProfit,
    profitMarginPercent,
    breakdownByMedicine,
  };
}

// PHARMACY STORE PROFILE ACCESSORS
export function getPharmacyProfile(): PharmacyStoreProfile {
  return { ...pharmacyProfile };
}

export function updatePharmacyProfile(updates: Partial<PharmacyStoreProfile>): PharmacyStoreProfile {
  pharmacyProfile = {
    ...pharmacyProfile,
    ...updates,
  };
  return { ...pharmacyProfile };
}

// REGISTERED PHARMACY FLEET ACCESSORS
export function getRegisteredPharmacies(): RegisteredPharmacyNode[] {
  return [...registeredPharmacies];
}

export function addRegisteredPharmacy(node: RegisteredPharmacyNode): RegisteredPharmacyNode {
  registeredPharmacies.unshift(node);
  return node;
}

export function updateRegisteredPharmacyStatus(id: string, status: RegisteredPharmacyNode['status']): RegisteredPharmacyNode | null {
  const node = registeredPharmacies.find((p) => p.id === id);
  if (node) {
    node.status = status;
    return { ...node };
  }
  return null;
}

// EXPORT STORE ENTITIES ACCESSORS
export const db = {
  users,
  categories,
  suppliers,
  medicines,
  medicineBatches,
  inventoryTransactions,
  purchases,
  sales,
  auditLogs,
  registeredPharmacies,
  getPharmacyProfile,
  updatePharmacyProfile,
  getRegisteredPharmacies,
  addRegisteredPharmacy,
  updateRegisteredPharmacyStatus,
  getCalculatedMedicines,
  getBatchesWithStatus,
  allocateFefoStock,
  processSaleTransaction,
  adjustStock,
  createPurchaseOrder,
  getDashboardSummary,
  getProfitReport,
};
