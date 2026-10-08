/**
 * Comprehensive Database Entity Models & Types Specification
 * Kaziniya Drug Store & Digital Dispensary Platform
 */

export type StoreType =
  | 'COMMUNITY_DRUG_STORE'
  | 'RETAIL_PHARMACY'
  | 'SPECIALTY_PHARMACY'
  | 'WHOLESALE_DISPENSARY'
  | 'HOSPITAL_PHARMACY';

export type VatTotType = 'VAT_15' | 'TOT_2' | 'TOT_10' | 'EXEMPT';

export type NodeStatus = 'ACTIVE' | 'PENDING_REVIEW' | 'VERIFIED' | 'MAINTENANCE';

export type UserRole = 'SUPER_ADMIN' | 'STORE_OWNER' | 'PHARMACIST' | 'CUSTOMER';

export interface PharmacyStoreProfile {
  id: string;
  storeName: string;
  storeNameAmharic?: string;
  storeType: StoreType;
  tinNumber: string;
  efdaLicense: string;
  efdaLicenseExpiry?: string;
  tradeLicenseNumber?: string;
  vatTotType?: VatTotType;
  vatNumber?: string;
  logoUrl?: string;
  storeSlogan?: string;
  
  // Owner personal & license info
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

  // Physical Location
  city: string;
  subcity: string;
  woreda?: string;
  kebele?: string;
  houseNumber?: string;
  streetAddress: string;
  landmark?: string;
  latitude?: number;
  longitude?: number;

  // Operational contacts & capabilities
  phone?: string;
  email?: string;
  operatingHours: string;
  is24Hours: boolean;
  coldChainAvailable: boolean;
  deliveryAvailable: boolean;
  activeStaffCount?: number;

  // Financial & Bank settlement
  telebirrMerchantId?: string;
  cbeAccountNumber?: string;
  cbeAccountName?: string;
  bankName?: string;
  bankAccountNumber?: string;

  // Thermal Receipt Customization
  receiptHeaderMessage?: string;
  receiptFooterMessage?: string;
  openingCashFloat?: number;

  // Feature Toggles (Controlled by Drug Store Owner)
  enableBarcodeSystem: boolean;

  status: NodeStatus;
  registeredAt: string;
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
  manufacturer: string;
  atcCode?: string;
  description: string;
  prescriptionRequired: boolean;
  reorderLevel: number;
  shelfLocation?: string;
  coverImage?: string;
  image?: string;
  galleryImages?: string[];
  isActive: boolean;
  status?: string;
  createdAt: string;
  updatedAt: string;

  // Computed runtime fields
  totalStock?: number;
  earliestExpiry?: string;
  sellingPrice?: number;
  averageCost?: number;
  branchName?: string;
}

export type BatchStatus = 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED' | 'OUT_OF_STOCK';

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
  status?: BatchStatus;
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
  | 'TRANSFER'
  | 'DISCARD';

export interface InventoryTransaction {
  id: string;
  medicineId: string;
  medicineName: string;
  batchId?: string;
  batchNumber?: string;
  transactionType: TransactionType;
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  unitCost?: number;
  unitPrice?: number;
  performedBy: string;
  reason?: string;
  referenceId?: string;
  createdAt: string;
}

export interface StockAdjustment {
  id: string;
  medicineId: string;
  batchId?: string;
  systemQuantity: number;
  countedQuantity: number;
  difference: number;
  reason: string;
  performedBy: string;
  createdAt: string;
}

export interface StockRequest {
  id: string;
  medicineId: string;
  medicineName: string;
  requestType: 'REQUISITION' | 'TRANSFER' | 'RESTOCK';
  requestedQuantity: number;
  fromBranch?: string;
  toBranch?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'FULFILLED';
  requestedBy: string;
  approvedBy?: string;
  createdAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  tinNumber?: string;
  address: string;
  creditLimit?: number;
  paymentTerms?: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
}

export interface PurchaseOrderItem {
  medicineId: string;
  medicineName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  status: 'DRAFT' | 'ORDERED' | 'RECEIVED' | 'CANCELLED';
  totalAmount: number;
  orderDate: string;
  expectedDeliveryDate?: string;
  items: PurchaseOrderItem[];
  createdAt: string;
}

export type PaymentMethod = 'CASH' | 'TELEBIRR' | 'CBE_BIRR' | 'CREDIT_CARD' | 'INSURANCE';
export type PaymentStatus = 'PAID' | 'PENDING' | 'REFUNDED' | 'PARTIAL';

export interface SaleItem {
  medicineId: string;
  medicineName: string;
  batchId?: string;
  batchNumber?: string;
  expiryDate?: string;
  quantity: number;
  unitPrice: number;
  unitCost?: number;
  totalPrice: number;
}

export interface Sale {
  id: string;
  invoiceNumber: string;
  customerId?: string;
  customerName?: string;
  cashierId: string;
  cashierName?: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  subtotal: number;
  discount: number;
  taxAmount?: number;
  totalAmount: number;
  items: SaleItem[];
  createdAt: string;
}

export interface ShiftRecord {
  id: string;
  cashierId: string;
  cashierName?: string;
  openingCashFloat: number;
  closingCashFloat?: number;
  expectedCash?: number;
  discrepancy?: number;
  totalSalesAmount?: number;
  status: 'OPEN' | 'CLOSED';
  openedAt: string;
  closedAt?: string;
  notes?: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  oldData?: any;
  newData?: any;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export interface RegisteredPharmacyNode extends PharmacyStoreProfile {
  skuCount?: number;
  monthlyGmv?: number;
  servicesOffered?: string[];
  rating?: number;
}
