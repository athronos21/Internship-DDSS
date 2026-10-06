import { describe, expect, it } from 'bun:test';
import { computeMLDemandForecast } from '../src/utils/mlForecasting';
import { Medicine, Sale } from '../src/types';

describe('ML Demand Forecasting Suite', () => {
  const dummyMedicines: Medicine[] = [
    {
      id: 'med-test-1',
      name: 'Amoxicillin 500mg',
      genericName: 'Amoxicillin Trihydrate',
      categoryId: 'cat-antibiotics',
      categoryName: 'Antibiotics',
      dosageForm: 'Capsule',
      strength: '500mg',
      unitOfMeasure: 'Capsule',
      reorderLevel: 20,
      totalStock: 50,
      averageCost: 4.5,
      sellingPrice: 7.0,
      isPrescriptionRequired: true,
      status: 'ACTIVE',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    },
    {
      id: 'med-test-2',
      name: 'Paracetamol 500mg',
      genericName: 'Acetaminophen',
      categoryId: 'cat-analgesics',
      categoryName: 'Pain & Fever Relief',
      dosageForm: 'Tablet',
      strength: '500mg',
      unitOfMeasure: 'Tablet',
      reorderLevel: 50,
      totalStock: 5, // critically low!
      averageCost: 1.0,
      sellingPrice: 2.0,
      isPrescriptionRequired: false,
      status: 'ACTIVE',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    },
  ];

  const now = new Date();
  const dummySales: Sale[] = [
    {
      id: 'sale-1',
      invoiceNumber: 'INV-101',
      customerName: 'Test Customer',
      subtotal: 70,
      discount: 0,
      tax: 0,
      totalAmount: 70,
      paymentMethod: 'CASH',
      paymentStatus: 'PAID',
      soldBy: 'u-1',
      soldByName: 'Cashier',
      createdAt: now.toISOString(),
      items: [
        {
          id: 'item-1',
          saleId: 'INV-101',
          medicineId: 'med-test-1',
          medicineName: 'Amoxicillin 500mg',
          batchId: 'bat-1',
          batchNumber: 'B101',
          expiryDate: '2027-12-31',
          quantity: 10,
          unitPrice: 7.0,
          discount: 0,
          totalPrice: 70,
          unitCost: 4.5,
        },
        {
          id: 'item-2',
          saleId: 'INV-101',
          medicineId: 'med-test-2',
          medicineName: 'Paracetamol 500mg',
          batchId: 'bat-2',
          batchNumber: 'B102',
          expiryDate: '2027-12-31',
          quantity: 25,
          unitPrice: 2.0,
          discount: 0,
          totalPrice: 50,
          unitCost: 1.0,
        },
      ],
    },
  ];

  it('computes demand forecasts and returns structured summary', () => {
    const forecast = computeMLDemandForecast({
      medicines: dummyMedicines,
      sales: dummySales,
      leadTimeDays: 7,
      serviceLevelPercent: 95,
      targetHorizonDays: 30,
    });

    expect(forecast).toBeDefined();
    expect(forecast.items.length).toBe(2);
    expect(forecast.forecastHorizonDays).toBe(30);
    expect(typeof forecast.totalSuggestedReorderUnits).toBe('number');
    expect(typeof forecast.totalEstimatedReorderCost).toBe('number');
    expect(typeof forecast.criticalStockoutCount).toBe('number');
    expect(Array.isArray(forecast.categoryForecastTotals)).toBe(true);
  });

  it('correctly calculates safety stock and flags critically low stock items', () => {
    const forecast = computeMLDemandForecast({
      medicines: dummyMedicines,
      sales: dummySales,
      leadTimeDays: 7,
    });

    // Med-test-2 has totalStock = 5, but reorderLevel = 50 and high demand
    const med2Forecast = forecast.items.find((f) => f.medicineId === 'med-test-2');
    expect(med2Forecast).toBeDefined();
    expect(med2Forecast!.currentStock).toBe(5);
    expect(med2Forecast!.safetyStock).toBeGreaterThan(0);
    expect(med2Forecast!.suggestedReorderQuantity).toBeGreaterThan(0);
    expect(['CRITICAL_STOCKOUT', 'LOW_STOCK_RISK']).toContain(med2Forecast!.riskLevel);
  });

  it('generates 30-day daily predictions with trend and confidence bounds', () => {
    const forecast = computeMLDemandForecast({
      medicines: dummyMedicines,
      sales: dummySales,
      targetHorizonDays: 14,
    });

    const item = forecast.items[0];
    expect(item.dailyPredictions).toBeDefined();
    expect(item.dailyPredictions.length).toBe(14);
    item.dailyPredictions.forEach((dp) => {
      expect(dp.predictedDemand).toBeGreaterThanOrEqual(0);
      expect(dp.upperBound).toBeGreaterThanOrEqual(dp.predictedDemand);
      expect(dp.lowerBound).toBeLessThanOrEqual(dp.predictedDemand);
    });
  });

  it('handles empty sales array gracefully using baseline heuristics', () => {
    const forecast = computeMLDemandForecast({
      medicines: dummyMedicines,
      sales: [],
      leadTimeDays: 5,
    });

    expect(forecast.items.length).toBe(2);
    expect(forecast.items[0].forecastedDemand30d).toBeGreaterThan(0);
  });
});
