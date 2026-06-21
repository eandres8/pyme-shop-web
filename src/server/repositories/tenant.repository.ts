import { PrismaClient } from '@/prisma/generated/prisma/client';
import { Tenant, TenantUser } from '@/src/core/entities';
import { Logger, Result, to } from '@/src/core/utils';
import type { ITenantRepository } from '../interfaces';
import type { TTenantUserRole } from '@/src/core/types';

export function TenantRepository(client: PrismaClient): ITenantRepository {
  const logger = Logger('TenantRepository');

  const create = async (tenant: Tenant): Promise<Result<Tenant>> => {
    const [data, error] = await to(
      client.tenant.create({
        data: {
          name: tenant.name,
          slug: tenant.slug,
        },
      }),
    );

    if (error) {
      logger.log({ error });
      return Result.failure(
        new Error(error?.message || 'Error creando tenant'),
      );
    }

    return Result.success(Tenant.fromEntity(data));
  };

  const findById = async (id: string): Promise<Result<Tenant>> => {
    const [data, error] = await to(
      client.tenant.findUnique({ where: { id } }),
    );

    if (error) {
      logger.log({ error });
      return Result.failure(
        new Error(error?.message || 'Error consultando tenant'),
      );
    }

    if (!data) {
      return Result.failure(new Error('Tenant no encontrado'));
    }

    return Result.success(Tenant.fromEntity(data));
  };

  const findBySlug = async (slug: string): Promise<Result<Tenant>> => {
    const [data, error] = await to(
      client.tenant.findUnique({ where: { slug } }),
    );

    if (error) {
      logger.log({ error });
      return Result.failure(
        new Error(error?.message || 'Error consultando tenant'),
      );
    }

    if (!data) {
      return Result.failure(new Error('Tenant no encontrado'));
    }

    return Result.success(Tenant.fromEntity(data));
  };

  const createWithAdmin = async (
    tenant: Tenant,
    adminUserId: string,
  ): Promise<Result<Tenant>> => {
    const [data, error] = await to(
      client.$transaction(async (tx) => {
        const newTenant = await tx.tenant.create({
          data: {
            name: tenant.name,
            slug: tenant.slug,
          },
        });

        await tx.tenantUser.create({
          data: {
            user_id: adminUserId,
            tenant_id: newTenant.id,
            role: 'owner',
          },
        });

        return newTenant;
      }),
    );

    if (error) {
      logger.log({ error });
      return Result.failure(
        new Error(error?.message || 'Error creando tenant con admin'),
      );
    }

    return Result.success(Tenant.fromEntity(data));
  };

  const addUser = async (
    tenantId: string,
    userId: string,
    role: string,
  ): Promise<Result<TenantUser>> => {
    const [data, error] = await to(
      client.tenantUser.create({
        data: {
          tenant_id: tenantId,
          user_id: userId,
          role: role as TTenantUserRole,
        },
      }),
    );

    if (error) {
      logger.log({ error });
      return Result.failure(
        new Error(error?.message || 'Error agregando usuario al tenant'),
      );
    }

    return Result.success(TenantUser.fromEntity(data));
  };

  const listUsers = async (tenantId: string): Promise<Result<TenantUser[]>> => {
    const [data, error] = await to(
      client.tenantUser.findMany({
        where: { tenant_id: tenantId },
        include: { user: true },
      }),
    );

    if (error) {
      logger.log({ error });
      return Result.failure(
        new Error(error?.message || 'Error listando usuarios del tenant'),
      );
    }

    return Result.success(data.map((tu) => TenantUser.fromEntity(tu)));
  };

  const removeUser = async (
    tenantId: string,
    userId: string,
  ): Promise<Result<number>> => {
    const [data, error] = await to(
      client.tenantUser.deleteMany({
        where: {
          tenant_id: tenantId,
          user_id: userId,
        },
      }),
    );

    if (error) {
      logger.log({ error });
      return Result.failure(
        new Error(error?.message || 'Error removiendo usuario del tenant'),
      );
    }

    return Result.success(data.count);
  };

  return {
    create,
    findById,
    findBySlug,
    createWithAdmin,
    addUser,
    listUsers,
    removeUser,
  };
}
