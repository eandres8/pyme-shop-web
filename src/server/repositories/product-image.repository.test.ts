import { createPrismaClientMock } from '@/tests/mocks/prisma';
import { PrismaClient } from '@/prisma/generated/prisma/client';
import { ProductImageRepository } from './product-image.repository';
import { DeleteProductImage } from '@/src/core/entities';

const mockClient = createPrismaClientMock();
const repo = ProductImageRepository(mockClient as unknown as PrismaClient);

const mockDeletedImage = {
  id: 'img-1',
  url: 'https://example.com/img.jpg',
  product_id: 'prod-1',
  product: {
    id: 'prod-1',
    title: 'Test Product',
    slug: 'test-product',
  },
};

describe('ProductImageRepository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('deleteImage', () => {
    it('deletes an image and returns DeleteProductImage', async () => {
      mockClient.productImage.delete.mockResolvedValue(mockDeletedImage);

      const result = await repo.deleteImage('img-1');

      expect(mockClient.productImage.delete).toHaveBeenCalledWith({
        where: { id: 'img-1' },
        select: {
          product: {
            select: { id: true, title: true, slug: true },
          },
        },
      });
      expect(result.isOk).toBe(true);
      if (result.isOk) {
        expect(result.data).toBeInstanceOf(DeleteProductImage);
      }
    });

    it('returns Result.failure when prisma throws', async () => {
      mockClient.productImage.delete.mockRejectedValue(new Error('Delete error'));

      const result = await repo.deleteImage('img-1');

      expect(result.isOk).toBe(false);
      if (!result.isOk) {
        expect(result.error.message).toContain('Delete error');
      }
    });
  });
});
