import { MedicineRepository } from './medicine.repository.js';

export type OrderStatus = 'PENDING_DISPENSATION' | 'CONFIRMED' | 'DISPENSED' | 'CANCELLED';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED';

export interface OrderItem {
  medicineId: string;
  medicineName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface StoreOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  phone: string;
  address: string;
  items: OrderItem[];
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  createdAt: string;
  updatedAt?: string;
}

const ordersStore: StoreOrder[] = [];

// Valid state machine transitions
const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING_DISPENSATION: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['DISPENSED', 'CANCELLED'],
  DISPENSED: [], // Terminal state
  CANCELLED: [], // Terminal state
};

export const OrderRepository = {
  list(limit = 100): StoreOrder[] {
    return ordersStore.slice(0, limit);
  },

  findById(id: string): StoreOrder | undefined {
    return ordersStore.find((o) => o.id === id || o.orderNumber === id);
  },

  createOrder(data: {
    customerName?: string;
    phone?: string;
    address?: string;
    items: Array<{ medicineId: string; quantity: number }>;
    paymentMethod?: string;
  }): StoreOrder {
    if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
      throw new Error('Order must contain at least one item.');
    }

    if (data.items.length > 50) {
      throw new Error('Order exceeds maximum allowed items (50).');
    }

    let calculatedTotal = 0;
    const processedItems: OrderItem[] = [];

    for (const item of data.items) {
      if (!item || !item.medicineId || typeof item.medicineId !== 'string') {
        throw new Error('Invalid item: medicineId is required.');
      }
      if (
        typeof item.quantity !== 'number' ||
        !Number.isInteger(item.quantity) ||
        item.quantity <= 0 ||
        item.quantity > 1000
      ) {
        throw new Error('Item quantity must be a positive integer between 1 and 1,000.');
      }

      const medicine = MedicineRepository.findById(item.medicineId);
      if (!medicine || (medicine as any).isActive === false) {
        throw new Error(`Medicine with ID ${item.medicineId} not found or inactive.`);
      }

      // Catalog selling price
      const unitPrice = medicine.sellingPrice || 0;
      if (unitPrice <= 0) {
        throw new Error(`Medicine ${medicine.name} has no valid catalog price.`);
      }

      const lineTotal = Math.round(unitPrice * item.quantity * 100) / 100;
      calculatedTotal += lineTotal;

      processedItems.push({
        medicineId: medicine.id,
        medicineName: medicine.name,
        quantity: item.quantity,
        unitPrice,
        totalPrice: lineTotal,
      });
    }

    const newOrder: StoreOrder = {
      id: `ord-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      orderNumber: `KZ-ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: data.customerName?.trim() || 'Walk-in Customer',
      phone: data.phone?.trim() || '',
      address: data.address?.trim() || 'Addis Ababa',
      items: processedItems,
      totalAmount: Math.round(calculatedTotal * 100) / 100,
      paymentMethod: data.paymentMethod || 'CASH_ON_DELIVERY',
      paymentStatus: 'PENDING',
      orderStatus: 'PENDING_DISPENSATION',
      createdAt: new Date().toISOString(),
    };

    ordersStore.unshift(newOrder);
    return newOrder;
  },

  updateStatus(
    id: string,
    updates: { orderStatus?: OrderStatus; paymentStatus?: PaymentStatus }
  ): StoreOrder {
    const order = this.findById(id);
    if (!order) {
      throw new Error('Order not found.');
    }

    if (updates.orderStatus && updates.orderStatus !== order.orderStatus) {
      const allowedNext = VALID_TRANSITIONS[order.orderStatus] || [];
      if (!allowedNext.includes(updates.orderStatus)) {
        throw new Error(
          `Invalid order status transition from ${order.orderStatus} to ${updates.orderStatus}.`
        );
      }
      order.orderStatus = updates.orderStatus;
      order.updatedAt = new Date().toISOString();
    }

    if (updates.paymentStatus) {
      order.paymentStatus = updates.paymentStatus;
      order.updatedAt = new Date().toISOString();
    }

    return order;
  },
};
