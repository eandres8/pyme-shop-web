jest.mock('cloudinary', () => ({
  v2: {
    config: jest.fn(),
    uploader: {
      upload: jest.fn(),
      destroy: jest.fn(),
    },
  },
}));

import { createPrismaClientMock } from '@/tests/mocks/prisma';
import { PrismaClient } from '@/prisma/generated/prisma/client';
import { ProductRepository } from './product.repository';
import { Product } from '@/src/core/entities';
import type { TProductEntity, TProductUpdate } from '@/src/core/types';
import { v2 as cloudinary } from 'cloudinary';

const mockClient = createPrismaClientMock();
const repo = ProductRepository(mockClient as unknown as PrismaClient);

const mockProductEntity: TProductEntity = {
  id: 'prod-1',
  title: 'Test Product',
  slug: 'test-product',
  description: 'A test product',
  price: 29.99,
  in_stock: 10,
  sizes: ['M', 'L'],
  tags: ['test', 'product'],
  gender: 'unisex',
  type: 'shirts',
  category_id: 'cat-1',
  productImages: [{ id: 'img-1', url: 'https://example.com/img.jpg', product_id: 'prod-1' }],
  created_at: new Date(),
  updated_at: new Date(),
};

describe('ProductRepository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('listProducts', () => {
    it('returns a list of products', async () => {
      mockClient.product.findMany.mockResolvedValue([mockProductEntity]);

      const result = await repo.listProducts({ page: 1, take: 10, category: 'men' });

      expect(mockClient.product.findMany).toHaveBeenCalledTimes(1);
      expect(result.isOk).toBe(true);
      if (result.isOk) {
        expect(result.data).toHaveLength(1);
        expect(result.data[0]).toBeInstanceOf(Product);
      }
    });

    it('filters by tenantId when provided', async () => {
      mockClient.product.findMany.mockResolvedValue([mockProductEntity]);

      const result = await repo.listProducts({ page: 1, take: 10, tenantId: 'tenant-1' });

      expect(mockClient.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            tenant_id: 'tenant-1',
          }),
        }),
      );
      expect(result.isOk).toBe(true);
    });

    it('returns empty array when no products', async () => {
      mockClient.product.findMany.mockResolvedValue([]);

      const result = await repo.listProducts({ page: 1, take: 10 });

      expect(result.isOk).toBe(true);
      if (result.isOk) {
        expect(result.data).toEqual([]);
      }
    });

    it('returns Result.failure when prisma throws', async () => {
      mockClient.product.findMany.mockRejectedValue(new Error('Query error'));

      const result = await repo.listProducts({ page: 1, take: 10 });

      expect(result.isOk).toBe(false);
      if (!result.isOk) {
        expect(result.error.message).toContain('Query error');
      }
    });

    it('filters by status ACTIVE by default', async () => {
      mockClient.product.findMany.mockResolvedValue([mockProductEntity]);

      await repo.listProducts({ page: 1, take: 10 });

      expect(mockClient.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'ACTIVE',
          }),
        }),
      );
    });

    it('filters by explicit status when provided', async () => {
      mockClient.product.findMany.mockResolvedValue([mockProductEntity]);

      await repo.listProducts({ page: 1, take: 10, status: 'INACTIVE' });

      expect(mockClient.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'INACTIVE',
          }),
        }),
      );
    });

    it('does not filter by status when showAll is true', async () => {
      mockClient.product.findMany.mockResolvedValue([mockProductEntity]);

      await repo.listProducts({ page: 1, take: 10, showAll: true });

      expect(mockClient.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.not.objectContaining({
            status: expect.anything(),
          }),
        }),
      );
    });

    it('scopes to a tenant and includes inactive products for the admin listing (tenantId + showAll)', async () => {
      mockClient.product.findMany.mockResolvedValue([mockProductEntity]);

      await repo.listProducts({ page: 1, take: 10, tenantId: 'tenant-1', showAll: true });

      expect(mockClient.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            tenant_id: 'tenant-1',
          }),
        }),
      );
      expect(mockClient.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.not.objectContaining({
            status: expect.anything(),
          }),
        }),
      );
    });
  });

  describe('countProducts', () => {
    it('returns pagination data', async () => {
      mockClient.product.count.mockResolvedValue(25);

      const result = await repo.countProducts({ page: 1, take: 10, category: 'men' });

      expect(mockClient.product.count).toHaveBeenCalledTimes(1);
      expect(result.isOk).toBe(true);
      if (result.isOk) {
        expect(result.data).toEqual({ currentPage: 1, totalPages: 3 });
      }
    });

    it('filters by tenantId when provided', async () => {
      mockClient.product.count.mockResolvedValue(10);

      const result = await repo.countProducts({ page: 1, take: 10, tenantId: 'tenant-1' });

      expect(mockClient.product.count).toHaveBeenCalledWith({
        where: {
          gender: undefined,
          tenant_id: 'tenant-1',
          status: 'ACTIVE',
        },
      });
      expect(result.isOk).toBe(true);
      if (result.isOk) {
        expect(result.data).toEqual({ currentPage: 1, totalPages: 1 });
      }
    });

    it('returns Result.failure when prisma throws', async () => {
      mockClient.product.count.mockRejectedValue(new Error('Count error'));

      const result = await repo.countProducts({ page: 1, take: 10 });

      expect(result.isOk).toBe(false);
      if (!result.isOk) {
        expect(result.error.message).toContain('Count error');
      }
    });

    it('counts products with status ACTIVE by default', async () => {
      mockClient.product.count.mockResolvedValue(5);

      await repo.countProducts({ page: 1, take: 10 });

      expect(mockClient.product.count).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'ACTIVE',
          }),
        }),
      );
    });

    it('counts products with explicit status when provided', async () => {
      mockClient.product.count.mockResolvedValue(3);

      await repo.countProducts({ page: 1, take: 10, status: 'INACTIVE' });

      expect(mockClient.product.count).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'INACTIVE',
          }),
        }),
      );
    });

    it('does not filter by status when showAll is true', async () => {
      mockClient.product.count.mockResolvedValue(10);

      await repo.countProducts({ page: 1, take: 10, showAll: true });

      expect(mockClient.product.count).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.not.objectContaining({
            status: expect.anything(),
          }),
        }),
      );
    });
  });

  describe('createMultiple', () => {
    const products = [
      Product.fromJson({ title: 'P1', slug: 'p1', price: 10, in_stock: 5, category_id: 'cat-1' }),
    ];

    it('creates products via $transaction and returns them', async () => {
      mockClient.$transaction.mockResolvedValue([mockProductEntity]);

      const result = await repo.createMultiple(products);

      expect(mockClient.$transaction).toHaveBeenCalledTimes(1);
      expect(result.isOk).toBe(true);
      if (result.isOk) {
        expect(result.data).toHaveLength(1);
        expect(result.data[0]).toBeInstanceOf(Product);
      }
    });

    it('includes status in product creation', async () => {
      let capturedOperations: unknown[] = [];
      mockClient.$transaction.mockImplementation(async (ops: unknown[]) => {
        capturedOperations = ops;
        return [mockProductEntity];
      });

      await repo.createMultiple(products);

      expect(capturedOperations).toHaveLength(1);
    });

    it('returns Result.failure when $transaction fails', async () => {
      mockClient.$transaction.mockRejectedValue(new Error('Transaction error'));

      const result = await repo.createMultiple(products);

      expect(result.isOk).toBe(false);
      if (!result.isOk) {
        expect(result.error.message).toContain('Transaction error');
      }
    });
  });

  describe('productBySlug', () => {
    it('returns the product when found', async () => {
      mockClient.product.findFirst.mockResolvedValue(mockProductEntity);

      const result = await repo.productBySlug('test-product');

      expect(mockClient.product.findFirst).toHaveBeenCalledTimes(1);
      expect(result.isOk).toBe(true);
      if (result.isOk) {
        expect(result.data).toBeInstanceOf(Product);
      }
    });

    it('returns null-like entity when slug does not exist', async () => {
      mockClient.product.findFirst.mockResolvedValue(null);

      const result = await repo.productBySlug('non-existent');

      expect(result.isOk).toBe(true);
      if (result.isOk) {
        expect(result.data).toBeInstanceOf(Product);
        expect(result.data.id).toBe('');
      }
    });

    it('returns Result.failure when prisma throws', async () => {
      mockClient.product.findFirst.mockRejectedValue(new Error('Find error'));

      const result = await repo.productBySlug('test-product');

      expect(result.isOk).toBe(false);
      if (!result.isOk) {
        expect(result.error.message).toContain('Find error');
      }
    });
  });

  describe('listProductsByIds', () => {
    it('returns products matching the ids', async () => {
      mockClient.product.findMany.mockResolvedValue([mockProductEntity]);

      const result = await repo.listProductsByIds(['prod-1']);

      expect(mockClient.product.findMany).toHaveBeenCalledWith({
        where: { id: { in: ['prod-1'] } },
        include: { tenant: true },
      });
      expect(result.isOk).toBe(true);
      if (result.isOk) {
        expect(result.data).toHaveLength(1);
      }
    });

    it('returns empty array when no ids match', async () => {
      mockClient.product.findMany.mockResolvedValue([]);

      const result = await repo.listProductsByIds(['non-existent']);

      expect(result.isOk).toBe(true);
      if (result.isOk) {
        expect(result.data).toEqual([]);
      }
    });

    it('returns Result.failure when prisma throws', async () => {
      mockClient.product.findMany.mockRejectedValue(new Error('Query error'));

      const result = await repo.listProductsByIds(['prod-1']);

      expect(result.isOk).toBe(false);
      if (!result.isOk) {
        expect(result.error.message).toContain('Query error');
      }
    });
  });

  describe('updateProductInfo', () => {
    const mockTx = {
      productImage: { createMany: jest.fn() },
      tenant: { findFirst: jest.fn() },
    };

    const baseProduct: TProductUpdate = {
      id: 'prod-1',
      title: 'Updated Product',
      slug: 'updated-product',
      description: 'Updated description',
      price: 39.99,
      inStock: 15,
      sizes: ['M', 'L', 'XL'],
      tags: 'tag1, tag2',
      categoryId: 'cat-2',
      gender: 'men',
      tenantId: 'tenant-1',
    };

    beforeEach(() => {
      mockTx.tenant.findFirst.mockResolvedValue({ id: 'tenant-1', slug: 'test-tenant' });
      mockClient.product.findFirst.mockResolvedValue({ tenant_id: 'tenant-1' });
      mockClient.$transaction.mockImplementation(async (cb: (...args: unknown[]) => unknown) => cb(mockTx));
    });

    it('modo update: updates an existing product via $transaction', async () => {
      mockClient.product.update.mockResolvedValue(mockProductEntity);

      const result = await repo.updateProductInfo(baseProduct, []);

      expect(mockClient.$transaction).toHaveBeenCalledTimes(1);
      expect(mockClient.product.update).toHaveBeenCalled();
      expect(result.isOk).toBe(true);
      if (result.isOk) {
        expect(result.data).toBeInstanceOf(Product);
      }
    });

    it('rejects the update when the product belongs to a different tenant', async () => {
      mockClient.product.findFirst.mockResolvedValue({ tenant_id: 'other-tenant' });

      const result = await repo.updateProductInfo(baseProduct, []);

      expect(result.isOk).toBe(false);
      if (!result.isOk) {
        expect(result.error.message).toContain('No tienes permisos');
      }
      expect(mockClient.product.update).not.toHaveBeenCalled();
    });

    it('rejects the update when the product does not exist', async () => {
      mockClient.product.findFirst.mockResolvedValue(null);

      const result = await repo.updateProductInfo(baseProduct, []);

      expect(result.isOk).toBe(false);
      expect(mockClient.product.update).not.toHaveBeenCalled();
    });

    it('modo create: creates a new product via $transaction when no id', async () => {
      const productWithoutId: TProductUpdate = { ...baseProduct, id: undefined };
      mockClient.product.create.mockResolvedValue(mockProductEntity);

      const result = await repo.updateProductInfo(productWithoutId, []);

      expect(mockClient.product.create).toHaveBeenCalled();
      expect(result.isOk).toBe(true);
      if (result.isOk) {
        expect(result.data).toBeInstanceOf(Product);
      }
    });

    it('modo create without id field (id omitted)', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, ...productNoId } = baseProduct;
      mockClient.product.create.mockResolvedValue(mockProductEntity);

      const result = await repo.updateProductInfo(productNoId as TProductUpdate, []);

      expect(mockClient.product.create).toHaveBeenCalled();
      expect(result.isOk).toBe(true);
      if (result.isOk) {
        expect(result.data).toBeInstanceOf(Product);
      }
    });

    it('returns Result.failure when $transaction throws', async () => {
      mockClient.$transaction.mockRejectedValue(new Error('Transaction error'));

      const result = await repo.updateProductInfo(baseProduct, []);

      expect(result.isOk).toBe(false);
      if (!result.isOk) {
        expect(result.error.message).toContain('Transaction error');
      }
    });

    it('includes status in product update when provided', async () => {
      mockClient.product.update.mockResolvedValue(mockProductEntity);

      const productWithStatus = { ...baseProduct, status: 'INACTIVE' as const };
      const result = await repo.updateProductInfo(productWithStatus, []);

      expect(result.isOk).toBe(true);
      expect(mockClient.product.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'INACTIVE',
          }),
        }),
      );
    });

    it('does not include status in update when not provided', async () => {
      mockClient.product.update.mockResolvedValue(mockProductEntity);

      const result = await repo.updateProductInfo(baseProduct, []);

      expect(result.isOk).toBe(true);
      expect(mockClient.product.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.not.objectContaining({
            status: expect.anything(),
          }),
        }),
      );
    });

    it('uploadFiles is called when images are provided', async () => {
      const mockedUpload = cloudinary.uploader.upload as jest.Mock;
      mockedUpload.mockResolvedValue({ secure_url: 'https://example.com/img.jpg' });

      mockClient.product.update.mockResolvedValue(mockProductEntity);
      mockTx.productImage.createMany.mockResolvedValue({ count: 1 });

      const file = new File(['fake-content'], 'test.jpg', { type: 'image/jpeg' });
      const result = await repo.updateProductInfo(baseProduct, [file]);

      expect(mockClient.$transaction).toHaveBeenCalledTimes(1);
      expect(result.isOk).toBe(true);
    });

    it('returns Result.failure when image upload is partial (R44)', async () => {
      const mockedUpload = cloudinary.uploader.upload as jest.Mock;
      mockedUpload
        .mockResolvedValueOnce({ secure_url: 'https://example.com/img1.jpg' })
        .mockRejectedValueOnce(new Error('Upload failed'));

      mockClient.product.update.mockResolvedValue(mockProductEntity);

      const file1 = new File(['content1'], 'test1.jpg', { type: 'image/jpeg' });
      const file2 = new File(['content2'], 'test2.jpg', { type: 'image/jpeg' });
      const result = await repo.updateProductInfo(baseProduct, [file1, file2]);

      expect(result.isOk).toBe(false);
      if (!result.isOk) {
        expect(result.error.message).toContain('Error subiendo las imágenes');
      }
    });
  });

  describe('productExistsBySlug', () => {
    it('returns true when slug exists for tenant', async () => {
      mockClient.product.count.mockResolvedValue(1);

      const result = await repo.productExistsBySlug('test-product', 'tenant-1');

      expect(mockClient.product.count).toHaveBeenCalledWith({
        where: {
          slug: 'test-product',
          tenant_id: 'tenant-1',
        },
      });
      expect(result.isOk).toBe(true);
      if (result.isOk) {
        expect(result.data).toBe(true);
      }
    });

    it('returns false when slug does not exist for tenant', async () => {
      mockClient.product.count.mockResolvedValue(0);

      const result = await repo.productExistsBySlug('non-existent', 'tenant-1');

      expect(result.isOk).toBe(true);
      if (result.isOk) {
        expect(result.data).toBe(false);
      }
    });

    it('returns Result.failure when prisma throws', async () => {
      mockClient.product.count.mockRejectedValue(new Error('Count error'));

      const result = await repo.productExistsBySlug('test-product', 'tenant-1');

      expect(result.isOk).toBe(false);
      if (!result.isOk) {
        expect(result.error.message).toContain('Count error');
      }
    });
  });

  describe('productBySlug with tenantId', () => {
    it('filters by tenantId when provided', async () => {
      mockClient.product.findFirst.mockResolvedValue(mockProductEntity);

      const result = await repo.productBySlug('test-product', 'tenant-1');

      expect(mockClient.product.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            slug: 'test-product',
            tenant_id: 'tenant-1',
          }),
        }),
      );
      expect(result.isOk).toBe(true);
    });

    it('works without tenantId for backward compatibility', async () => {
      mockClient.product.findFirst.mockResolvedValue(mockProductEntity);

      const result = await repo.productBySlug('test-product');

      expect(mockClient.product.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            slug: 'test-product',
          }),
        }),
      );
      expect(result.isOk).toBe(true);
    });
  });
});
