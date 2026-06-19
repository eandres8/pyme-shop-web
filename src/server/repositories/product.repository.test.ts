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

    it('returns Result.failure when prisma throws', async () => {
      mockClient.product.count.mockRejectedValue(new Error('Count error'));

      const result = await repo.countProducts({ page: 1, take: 10 });

      expect(result.isOk).toBe(false);
      if (!result.isOk) {
        expect(result.error.message).toContain('Count error');
      }
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
    };

    beforeEach(() => {
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
});
