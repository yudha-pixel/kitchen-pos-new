/**
 * Unit Tests for FIFO Deduction Logic (Feature 3)
 * 
 * Tests verify that FIFO deduction correctly diminishes the oldest batch first
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { prisma } from '../lib/prisma';
import { deductStockFIFO } from '../lib/inventoryService';

describe('FIFO Deduction Logic', () => {
  let ingredientId: string;
  let batch1Id: string;
  let batch2Id: string;
  let batch3Id: string;

  beforeEach(async () => {
    // Create a test ingredient
    const ingredient = await prisma.ingredient.create({
      data: {
        name: 'Test Ingredient for FIFO',
        current_stock: 0,
        unit: 'kg',
        min_stock: 5,
        restock_quantity: 10,
        unit_price: 100,
      },
    });
    ingredientId = ingredient.id;

    // Create test batches with different creation times
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const twoDaysAgo = new Date(now);
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    // Batch 1 (oldest) - 10 kg
    const batch1 = await prisma.stockBatch.create({
      data: {
        ingredient_id: ingredientId,
        batch_code: 'BATCH-001',
        quantity: 10,
        cost_price: 100,
        expiry_date: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        created_at: twoDaysAgo,
      },
    });
    batch1Id = batch1.id;

    // Batch 2 (middle) - 15 kg
    const batch2 = await prisma.stockBatch.create({
      data: {
        ingredient_id: ingredientId,
        batch_code: 'BATCH-002',
        quantity: 15,
        cost_price: 110,
        expiry_date: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
        created_at: yesterday,
      },
    });
    batch2Id = batch2.id;

    // Batch 3 (newest) - 20 kg
    const batch3 = await prisma.stockBatch.create({
      data: {
        ingredient_id: ingredientId,
        batch_code: 'BATCH-003',
        quantity: 20,
        cost_price: 120,
        expiry_date: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
        created_at: now,
      },
    });
    batch3Id = batch3.id;

    // Update ingredient current_stock to match total batch quantity
    await prisma.ingredient.update({
      where: { id: ingredientId },
      data: { current_stock: 45 }, // 10 + 15 + 20
    });
  });

  afterEach(async () => {
    // Clean up test data
    await prisma.stockBatch.deleteMany({ where: { ingredient_id: ingredientId } });
    await prisma.ingredient.delete({ where: { id: ingredientId } });
  });

  it('should deduct from oldest batch first when quantity fits in first batch', async () => {
    const result = await deductStockFIFO(ingredientId, 5);

    expect(result.success).toBe(true);
    expect(result.deductedQuantity).toBe(5);
    expect(result.remainingQuantity).toBe(0);
    expect(result.usedBatches).toHaveLength(1);
    expect(result.usedBatches[0].batchId).toBe(batch1Id);
    expect(result.usedBatches[0].deductedQuantity).toBe(5);
    expect(result.usedBatches[0].remainingQuantity).toBe(5);

    // Verify batch quantities
    const batch1 = await prisma.stockBatch.findUnique({ where: { id: batch1Id } });
    const batch2 = await prisma.stockBatch.findUnique({ where: { id: batch2Id } });
    const batch3 = await prisma.stockBatch.findUnique({ where: { id: batch3Id } });

    expect(batch1?.quantity).toBe(5); // 10 - 5
    expect(batch2?.quantity).toBe(15); // unchanged
    expect(batch3?.quantity).toBe(20); // unchanged
  });

  it('should deduct from multiple batches when quantity exceeds first batch', async () => {
    const result = await deductStockFIFO(ingredientId, 20);

    expect(result.success).toBe(true);
    expect(result.deductedQuantity).toBe(20);
    expect(result.remainingQuantity).toBe(0);
    expect(result.usedBatches).toHaveLength(2);

    // First batch should be fully depleted
    expect(result.usedBatches[0].batchId).toBe(batch1Id);
    expect(result.usedBatches[0].deductedQuantity).toBe(10);
    expect(result.usedBatches[0].remainingQuantity).toBe(0);

    // Second batch should have 10 deducted
    expect(result.usedBatches[1].batchId).toBe(batch2Id);
    expect(result.usedBatches[1].deductedQuantity).toBe(10);
    expect(result.usedBatches[1].remainingQuantity).toBe(5);

    // Verify batch quantities
    const batch1 = await prisma.stockBatch.findUnique({ where: { id: batch1Id } });
    const batch2 = await prisma.stockBatch.findUnique({ where: { id: batch2Id } });
    const batch3 = await prisma.stockBatch.findUnique({ where: { id: batch3Id } });

    expect(batch1?.quantity).toBe(0); // fully depleted
    expect(batch2?.quantity).toBe(5); // 15 - 10
    expect(batch3?.quantity).toBe(20); // unchanged
  });

  it('should deduct from all three batches when quantity is large', async () => {
    const result = await deductStockFIFO(ingredientId, 40);

    expect(result.success).toBe(true);
    expect(result.deductedQuantity).toBe(40);
    expect(result.remainingQuantity).toBe(0);
    expect(result.usedBatches).toHaveLength(3);

    // Verify all batches were used
    expect(result.usedBatches[0].batchId).toBe(batch1Id);
    expect(result.usedBatches[0].deductedQuantity).toBe(10);
    expect(result.usedBatches[0].remainingQuantity).toBe(0);

    expect(result.usedBatches[1].batchId).toBe(batch2Id);
    expect(result.usedBatches[1].deductedQuantity).toBe(15);
    expect(result.usedBatches[1].remainingQuantity).toBe(0);

    expect(result.usedBatches[2].batchId).toBe(batch3Id);
    expect(result.usedBatches[2].deductedQuantity).toBe(15);
    expect(result.usedBatches[2].remainingQuantity).toBe(5);

    // Verify batch quantities
    const batch1 = await prisma.stockBatch.findUnique({ where: { id: batch1Id } });
    const batch2 = await prisma.stockBatch.findUnique({ where: { id: batch2Id } });
    const batch3 = await prisma.stockBatch.findUnique({ where: { id: batch3Id } });

    expect(batch1?.quantity).toBe(0);
    expect(batch2?.quantity).toBe(0);
    expect(batch3?.quantity).toBe(5); // 20 - 15
  });

  it('should fail when quantity exceeds total available stock', async () => {
    const result = await deductStockFIFO(ingredientId, 50);

    expect(result.success).toBe(false);
    expect(result.deductedQuantity).toBe(45); // total available
    expect(result.remainingQuantity).toBe(5); // 50 - 45
    expect(result.error).toBe('Insufficient stock across all batches');
    expect(result.usedBatches).toHaveLength(3);

    // Verify all batches were depleted
    const batch1 = await prisma.stockBatch.findUnique({ where: { id: batch1Id } });
    const batch2 = await prisma.stockBatch.findUnique({ where: { id: batch2Id } });
    const batch3 = await prisma.stockBatch.findUnique({ where: { id: batch3Id } });

    expect(batch1?.quantity).toBe(0);
    expect(batch2?.quantity).toBe(0);
    expect(batch3?.quantity).toBe(0);
  });

  it('should skip depleted batches', async () => {
    // Deplete batch 1 first
    await deductStockFIFO(ingredientId, 10);

    // Now try to deduct 5 more - should skip batch 1 and use batch 2
    const result = await deductStockFIFO(ingredientId, 5);

    expect(result.success).toBe(true);
    expect(result.deductedQuantity).toBe(5);
    expect(result.usedBatches).toHaveLength(1);
    expect(result.usedBatches[0].batchId).toBe(batch2Id); // Should skip batch 1
  });

  it('should skip expired batches', async () => {
    // Create an expired batch
    const expiredDate = new Date();
    expiredDate.setDate(expiredDate.getDate() - 1);

    const expiredBatch = await prisma.stockBatch.create({
      data: {
        ingredient_id: ingredientId,
        batch_code: 'BATCH-EXPIRED',
        quantity: 100,
        cost_price: 50,
        expiry_date: expiredDate,
        created_at: new Date('2020-01-01'), // Very old
      },
    });

    // Try to deduct - should skip expired batch
    const result = await deductStockFIFO(ingredientId, 5);

    expect(result.success).toBe(true);
    expect(result.usedBatches).toHaveLength(1);
    expect(result.usedBatches[0].batchId).toBe(batch1Id); // Should use batch 1, not expired

    // Clean up expired batch
    await prisma.stockBatch.delete({ where: { id: expiredBatch.id } });
  });

  it('should fail when no active batches are available', async () => {
    // Deplete all batches
    await deductStockFIFO(ingredientId, 45);

    // Try to deduct more
    const result = await deductStockFIFO(ingredientId, 5);

    expect(result.success).toBe(false);
    expect(result.deductedQuantity).toBe(0);
    expect(result.remainingQuantity).toBe(5);
    expect(result.error).toBe('No active batches available for this ingredient');
  });

  it('should fail when quantity to deduct is zero or negative', async () => {
    const result1 = await deductStockFIFO(ingredientId, 0);
    expect(result1.success).toBe(false);
    expect(result1.error).toBe('Quantity to deduct must be positive');

    const result2 = await deductStockFIFO(ingredientId, -5);
    expect(result2.success).toBe(false);
    expect(result2.error).toBe('Quantity to deduct must be positive');
  });

  it('should update ingredient current_stock correctly', async () => {
    const initialStock = await prisma.ingredient.findUnique({
      where: { id: ingredientId },
      select: { current_stock: true },
    });

    expect(initialStock?.current_stock).toBe(45);

    await deductStockFIFO(ingredientId, 10);

    const updatedStock = await prisma.ingredient.findUnique({
      where: { id: ingredientId },
      select: { current_stock: true },
    });

    expect(updatedStock?.current_stock).toBe(35); // 45 - 10
  });
});
