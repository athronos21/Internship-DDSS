export type UserRole = 'SUPER_ADMIN' | 'STORE_OWNER' | 'PHARMACIST' | 'CUSTOMER';

export interface PharmacyStoreProfile {
  id: string;
  storeName: string;
  storeNameAmharic?: string;
  storeType: 'COMMUNITY_DRUG_STORE' | 'RETAIL_PHARMACY' | 'SPECIALTY_PHARMACY' | 'WHOLESALE_DISPENSARY' | 'HOSPITAL_PHARMACY';
  tinNumber: string;
  efdaLicense: string;
  efdaLicenseExpiry?: string;
  tradeLicenseNumber?: string;
  vatTotType?: 'VAT_15' | 'TOT_2' | 'TOT_10' | 'EXEMPT';
  vatNumber?: string;
  logoUrl: string;
  storeSlogan?: string;
  
  // Owner info
  ownerName: string;
  ownerTitle?: string;
  ownerEmail: string;
  ownerPhone: string;
  ownerSecondaryPhone?: string;
  ownerNationalId?: string;
  ownerPharmacistLicense?: string;
  ownerPharmacistLicenseExpiry?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;

  // Location & Address
  city: string;
  subcity: string;
  woreda?: string;
  kebele?: string;
  houseNumber?: string;
  streetAddress: string;
  landmark?: string;
  gpsCoordinates?: string;
  
  // Contacts & Operations
  phone: string;
  email: string;
  operatingHours: string;
  is24Hours?: boolean;
  coldChainAvailable?: boolean;
  deliveryAvailable?: boolean;
  
  // Banking & Payment settlement
  telebirrMerchantId?: string;
  cbeAccountNumber?: string;
  cbeAccountName?: string;
  bankName?: string;
  bankAccountNumber?: string;
  
  // POS & Thermal Receipt
  receiptHeaderMessage?: string;
  receiptFooterMessage?: string;
  openingCashFloat?: number;
  
  // Feature flags
  enableBarcodeSystem?: boolean;
  registeredAt: string;
}

export interface RegisteredPharmacyNode {
  id: string;
  storeName: string;
  storeNameAmharic?: string;
  storeType: 'COMMUNITY_DRUG_STORE' | 'RETAIL_PHARMACY' | 'SPECIALTY_PHARMACY' | 'WHOLESALE_DISPENSARY' | 'HOSPITAL_PHARMACY';
  tinNumber: string;
  efdaLicense: string;
  efdaLicenseExpiry?: string;
  ownerName: string;
  ownerTitle?: string;
  ownerPhone: string;
  ownerEmail: string;
  city: string;
  subcity: string;
  woreda?: string;
  kebele?: string;
  houseNumber?: string;
  streetAddress: string;
  landmark?: string;
  latitude: number;
  longitude: number;
  phone: string;
  email: string;
  operatingHours: string;
  is24Hours: boolean;
  coldChainAvailable: boolean;
  deliveryAvailable: boolean;
  activeStaffCount: number;
  status: 'ACTIVE' | 'PENDING_REVIEW' | 'VERIFIED' | 'MAINTENANCE';
  skuCount: number;
  monthlyGmv?: number;
  servicesOffered: string[];
  rating: number;
  logoUrl?: string;
  registeredAt: string;
}

export interface PharmacyOwnerRegistration {
  // Owner Personal & Professional Info
  ownerTitle?: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  ownerSecondaryPhone?: string;
  ownerNationalId: string;
  ownerPharmacistLicense?: string;
  ownerPharmacistLicenseExpiry?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  password: string;
  confirmPassword?: string;
  pin?: string;

  // Pharmacy / Drug Store Info
  storeName: string;
  storeNameAmharic?: string;
  storeType: 'COMMUNITY_DRUG_STORE' | 'RETAIL_PHARMACY' | 'SPECIALTY_PHARMACY' | 'WHOLESALE_DISPENSARY' | 'HOSPITAL_PHARMACY';
  tinNumber: string;
  efdaLicense: string;
  efdaLicenseExpiry?: string;
  tradeLicenseNumber?: string;
  vatTotType?: 'VAT_15' | 'TOT_2' | 'TOT_10' | 'EXEMPT';
  vatNumber?: string;
  logoUrl?: string;
  storeSlogan?: string;

  // Store Address & Location
  city: string;
  subcity: string;
  woreda?: string;
  kebele?: string;
  houseNumber?: string;
  streetAddress: string;
  landmark?: string;
  gpsCoordinates?: string;
  storePhone?: string;
  storeEmail?: string;
  operatingHours?: string;
  is24Hours?: boolean;
  coldChainAvailable?: boolean;
  deliveryAvailable?: boolean;

  // Banking & Financial Setup
  telebirrMerchantId?: string;
  cbeAccountNumber?: string;
  cbeAccountName?: string;
  bankName?: string;
  bankAccountNumber?: string;
  openingCashFloat?: number;
  receiptFooterMessage?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  employeeId?: string;
  department?: string;
  isActive: boolean;
  mustChangePassword?: boolean;
  temporaryPassword?: string;
  password?: string;
  pin?: string;
  lastPasswordChange?: string;
  status?: 'ACTIVE' | 'PENDING_FIRST_LOGIN' | 'SUSPENDED';
  isOwner?: boolean;
  isSuperAdmin?: boolean;
  tinNumber?: string;
  nationalId?: string;
  pharmacistLicense?: string;
  pharmacyName?: string;
  pharmacyLogo?: string;
  storeAddress?: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  createdAt: string;
}

export interface Medicine {
  id: string;
  barcode: string;
  sku: string;
  name: string;
  genericName: string;
  brandName: string;
  categoryId: string;
  categoryName?: string;
  dosageForm: string;
  strength: string;
  unit: string;
  unitOfMeasure?: string;
  manufacturer: string;
  description: string;
  prescriptionRequired: boolean;
  isPrescriptionRequired?: boolean;
  reorderLevel: number;
  isActive: boolean;
  status?: string;
  createdAt: string;
  updatedAt: string;
  totalStock?: number;
  earliestExpiry?: string;
  sellingPrice?: number;
  averageCost?: number;
  imageUrl?: string;
  branchName?: string;
}

export interface MedicineBatch {
  id: string;
  medicineId: string;
  medicineName?: string;
  batchNumber: string;
  manufacturingDate: string;
  expiryDate: string;
  purchasePrice: number;
  sellingPrice: number;
  initialQuantity: number;
  currentQuantity: number;
  supplierId: string;
  supplierName?: string;
  status?: 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED' | 'OUT_OF_STOCK';
  createdAt: string;
  updatedAt: string;
}

export type TransactionType =
  | 'INITIAL_STOCK'
  | 'PURCHASE'
  | 'SALE'
  | 'SALE_RETURN'
  | 'PURCHASE_RETURN'
  | 'ADJUSTMENT'
  | 'DAMAGED'
  | 'EXPIRED'
  | 'TRANSFER';

export interface InventoryTransaction {
  id: string;
  medicineId: string;
  medicineName?: string;
  batchId: string;
  batchNumber?: string;
  transactionType: TransactionType;
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  referenceId?: string;
  referenceType?: string;
  performedBy: string;
  performedByName?: string;
  notes?: string;
  createdAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  licenseNumber: string;
  isActive: boolean;
  createdAt: string;
}

export interface PurchaseItem {
  id: string;
  purchaseId: string;
  medicineId: string;
  medicineName?: string;
  batchNumber: string;
  mfgDate: string;
  expDate: string;
  quantity: number;
  unitCost: number;
  sellingPrice: number;
  totalCost: number;
}

export interface Purchase {
  id: string;
  supplierId: string;
  supplierName?: string;
  invoiceNumber: string;
  purchaseDate: string;
  totalAmount: number;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  createdBy: string;
  createdByName?: string;
  items: PurchaseItem[];
  createdAt: string;
}

export interface CartItem {
  medicine: Medicine;
  selectedBatch?: MedicineBatch;
  quantity: number;
  unitPrice: number;
  discount: number;
  totalPrice: number;
  autoFefoBatches?: Array<{
    batchId: string;
    batchNumber: string;
    expiryDate: string;
    qtyDeducted: number;
    unitCost: number;
    unitPrice: number;
  }>;
}

export interface SaleItem {
  id: string;
  saleId: string;
  medicineId: string;
  medicineName?: string;
  batchId: string;
  batchNumber?: string;
  expiryDate?: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  totalPrice: number;
  unitCost?: number;
}

export type PaymentMethod = 'CASH' | 'CARD' | 'MOBILE_MONEY' | 'TELEBIRR' | 'CBE_BIRR' | 'BANK_TRANSFER' | 'OTHER';

export interface Sale {
  id: string;
  invoiceNumber: string;
  customerId?: string;
  customerName?: string;
  subtotal: number;
  discount: number;
  tax: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: 'PAID' | 'REFUNDED' | 'PARTIALLY_REFUNDED';
  soldBy: string;
  soldByName?: string;
  items: SaleItem[];
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName?: string;
  action: string;
  entityType: string;
  entityId: string;
  oldData?: any;
  newData?: any;
  details?: string;
  ipAddress?: string;
  createdAt: string;
}

export interface DashboardSummary {
  todaySalesCount: number;
  todayRevenue: number;
  totalMedicinesCount: number;
  totalInventoryUnits: number;
  totalInventoryValue: number;
  lowStockCount: number;
  expiringSoonCount: number;
  expiredCount: number;
  recentSales: Sale[];
  recentTransactions: InventoryTransaction[];
  salesTrend: Array<{ date: string; revenue: number; salesCount: number }>;
  topSellingMedicines: Array<{ medicineName: string; unitsSold: number; totalRevenue: number }>;
}

export interface ProfitReportData {
  totalRevenue: number;
  cogs: number; // Cost of Goods Sold based on actual batch costs
  grossProfit: number;
  profitMarginPercent: number;
  breakdownByMedicine: Array<{
    medicineId: string;
    medicineName: string;
    unitsSold: number;
    revenue: number;
    cost: number;
    grossProfit: number;
    profitMargin: number;
  }>;
}

export type MLForecastModel =
  | 'HYBRID_EXPONENTIAL'
  | 'LINEAR_REGRESSION'
  | 'WEIGHTED_MOVING_AVG'
  | 'HIGH_SERVICE_BUFFER';

export type ForecastRiskLevel =
  | 'CRITICAL_STOCKOUT'
  | 'LOW_STOCK_RISK'
  | 'BALANCED'
  | 'OVERSTOCKED';

export interface DailyPredictionPoint {
  day: number;
  date: string;
  predictedDemand: number;
  lowerBound: number;
  upperBound: number;
  projectedStockLevel: number;
}

export interface ProductForecastItem {
  medicineId: string;
  medicineName: string;
  genericName: string;
  categoryName: string;
  currentStock: number;
  reorderLevel: number;
  unitCost: number;
  sellingPrice: number;
  avgDailySales: number;
  salesVelocityTrend: number; // % change gradient
  historicalSales30d: number;
  forecastedDemand30d: number;
  dailyPredictions: DailyPredictionPoint[];
  safetyStock: number;
  suggestedReorderQuantity: number;
  estimatedReorderCost: number;
  daysInventoryRemaining: number;
  stockoutDay: number | null;
  riskLevel: ForecastRiskLevel;
  confidenceScore: number;
  preferredSupplierId?: string;
  preferredSupplierName?: string;
}

export interface MLForecastSummary {
  generatedAt: string;
  forecastHorizonDays: number;
  totalSuggestedReorderUnits: number;
  totalEstimatedReorderCost: number;
  criticalStockoutCount: number;
  leadTimeDays: number;
  serviceLevelPercent: number;
  modelType: MLForecastModel;
  aiExecutiveSummary?: string;
  aiProcurementRecommendations?: string[];
  categoryForecastTotals: Array<{
    categoryName: string;
    currentStock: number;
    forecastedDemand: number;
    suggestedReorder: number;
    cost: number;
  }>;
  items: ProductForecastItem[];
}

