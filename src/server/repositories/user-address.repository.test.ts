import { createPrismaClientMock } from '@/tests/mocks/prisma';
import { PrismaClient } from '@/prisma/generated/prisma/client';
import { UserAddressRepository } from './user-address.repository';
import { UserAddress } from '@/src/core/entities';

const mockClient = createPrismaClientMock();
const repo = UserAddressRepository(mockClient as unknown as PrismaClient);

const mockAddressEntity = {
  id: 'addr-1',
  address: '123 Test St',
  city: 'Test City',
  phone: '555-0000',
  first_name: 'John',
  last_name: 'Doe',
  address_info: null,
  postal_code: '12345',
  is_active: true,
  created_at: new Date(),
  updated_at: new Date(),
  country_id: 'country-1',
  user_id: 'user-1',
};

describe('UserAddressRepository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findByUserId', () => {
    it('returns the user address when found', async () => {
      mockClient.userAddress.findUnique.mockResolvedValue(mockAddressEntity);

      const result = await repo.findByUserId('user-1');

      expect(mockClient.userAddress.findUnique).toHaveBeenCalledWith({
        where: { user_id: 'user-1', is_active: true },
      });
      expect(result.isOk).toBe(true);
      if (result.isOk) {
        expect(result.data).toBeInstanceOf(UserAddress);
      }
    });

    it('returns Result.failure when prisma throws', async () => {
      mockClient.userAddress.findUnique.mockRejectedValue(new Error('Query error'));

      const result = await repo.findByUserId('user-1');

      expect(result.isOk).toBe(false);
      if (!result.isOk) {
        expect(result.error.message).toContain('Query error');
      }
    });
  });

  describe('create', () => {
    it('creates an address and returns it', async () => {
      mockClient.userAddress.create.mockResolvedValue(mockAddressEntity);

      const address = UserAddress.fromJson({
        firstName: 'John',
        lastName: 'Doe',
        address: '123 Test St',
        city: 'Test City',
        phone: '555-0000',
        postalCode: '12345',
        userId: 'user-1',
        countryId: 'country-1',
      });

      const result = await repo.create(address);

      expect(mockClient.userAddress.create).toHaveBeenCalledTimes(1);
      expect(result.isOk).toBe(true);
      if (result.isOk) {
        expect(result.data).toBeInstanceOf(UserAddress);
      }
    });

    it('returns Result.failure when prisma throws', async () => {
      mockClient.userAddress.create.mockRejectedValue(new Error('Create error'));

      const address = UserAddress.fromJson({
        firstName: 'John',
        lastName: 'Doe',
        address: '123 Test St',
        userId: 'user-1',
      });

      const result = await repo.create(address);

      expect(result.isOk).toBe(false);
      if (!result.isOk) {
        expect(result.error.message).toContain('Create error');
      }
    });
  });

  describe('update', () => {
    it('updates the address and returns it', async () => {
      mockClient.userAddress.update.mockResolvedValue(mockAddressEntity);

      const address = UserAddress.fromJson({
        id: 'addr-1',
        firstName: 'John',
        lastName: 'Doe',
        address: '456 Updated St',
        city: 'Test City',
        phone: '555-0000',
        postalCode: '12345',
        userId: 'user-1',
        countryId: 'country-1',
      });

      const result = await repo.update(address);

      expect(mockClient.userAddress.update).toHaveBeenCalledTimes(1);
      expect(result.isOk).toBe(true);
      if (result.isOk) {
        expect(result.data).toBeInstanceOf(UserAddress);
      }
    });

    it('returns Result.failure when prisma throws', async () => {
      mockClient.userAddress.update.mockRejectedValue(new Error('Update error'));

      const address = UserAddress.fromJson({
        userId: 'user-1',
        address: '456 Updated St',
      });

      const result = await repo.update(address);

      expect(result.isOk).toBe(false);
      if (!result.isOk) {
        expect(result.error.message).toContain('Update error');
      }
    });
  });

  describe('remove', () => {
    it('deletes the address and returns it', async () => {
      mockClient.userAddress.delete.mockResolvedValue(mockAddressEntity);

      const result = await repo.remove('user-1');

      expect(mockClient.userAddress.delete).toHaveBeenCalledWith({
        where: { user_id: 'user-1' },
      });
      expect(result.isOk).toBe(true);
      if (result.isOk) {
        expect(result.data).toBeInstanceOf(UserAddress);
      }
    });

    it('returns Result.failure when prisma throws', async () => {
      mockClient.userAddress.delete.mockRejectedValue(new Error('Delete error'));

      const result = await repo.remove('user-1');

      expect(result.isOk).toBe(false);
      if (!result.isOk) {
        expect(result.error.message).toContain('Delete error');
      }
    });
  });
});
