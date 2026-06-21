import { PrismaClient } from '@/prisma/generated/prisma/client';

type PrismaModelDelegate = {
  findMany?: (...args: unknown[]) => Promise<unknown>;
  findFirst?: (...args: unknown[]) => Promise<unknown>;
  findUnique?: (...args: unknown[]) => Promise<unknown>;
  count?: (...args: unknown[]) => Promise<unknown>;
  create?: (...args: unknown[]) => Promise<unknown>;
  createMany?: (...args: unknown[]) => Promise<unknown>;
  update?: (...args: unknown[]) => Promise<unknown>;
  updateMany?: (...args: unknown[]) => Promise<unknown>;
  delete?: (...args: unknown[]) => Promise<unknown>;
  deleteMany?: (...args: unknown[]) => Promise<unknown>;
};

function wrapFindMethods(model: PrismaModelDelegate, tenantId: string) {
  const findMethods = ['findMany', 'findFirst', 'findUnique', 'count'] as const;

  for (const method of findMethods) {
    if (model[method]) {
      const original = model[method]!.bind(model);
      model[method] = async (...args: unknown[]) => {
        const params = (args[0] || {}) as Record<string, unknown>;
        params.where = { ...(params.where as Record<string, unknown> || {}), tenant_id: tenantId };
        return original(params);
      };
    }
  }
}

function wrapMutateMethods(model: PrismaModelDelegate, tenantId: string) {
  if (model.create) {
    const original = model.create.bind(model);
    model.create = async (...args: unknown[]) => {
      const params = (args[0] || {}) as Record<string, unknown>;
      params.data = { ...(params.data as Record<string, unknown> || {}), tenant_id: tenantId };
      return original(params);
    };
  }

  if (model.createMany) {
    const original = model.createMany.bind(model);
    model.createMany = async (...args: unknown[]) => {
      const params = (args[0] || {}) as Record<string, unknown>;
      const data = params.data;
      if (Array.isArray(data)) {
        params.data = data.map((item) => ({ ...item, tenant_id: tenantId }));
      } else if (data) {
        params.data = { ...(data as Record<string, unknown>), tenant_id: tenantId };
      }
      return original(params);
    };
  }

  if (model.update) {
    const original = model.update.bind(model);
    model.update = async (...args: unknown[]) => {
      const params = (args[0] || {}) as Record<string, unknown>;
      params.data = { ...(params.data as Record<string, unknown> || {}), tenant_id: tenantId };
      return original(params);
    };
  }

  if (model.updateMany) {
    const original = model.updateMany.bind(model);
    model.updateMany = async (...args: unknown[]) => {
      const params = (args[0] || {}) as Record<string, unknown>;
      params.where = { ...(params.where as Record<string, unknown> || {}), tenant_id: tenantId };
      return original(params);
    };
  }

  if (model.delete) {
    const original = model.delete.bind(model);
    model.delete = async (...args: unknown[]) => {
      const params = (args[0] || {}) as Record<string, unknown>;
      params.where = { ...(params.where as Record<string, unknown> || {}), tenant_id: tenantId };
      return original(params);
    };
  }

  if (model.deleteMany) {
    const original = model.deleteMany.bind(model);
    model.deleteMany = async (...args: unknown[]) => {
      const params = (args[0] || {}) as Record<string, unknown>;
      params.where = { ...(params.where as Record<string, unknown> || {}), tenant_id: tenantId };
      return original(params);
    };
  }
}

export function createTenantClient(baseClient: PrismaClient, tenantId: string) {
  wrapFindMethods(baseClient.product as unknown as PrismaModelDelegate, tenantId);
  wrapMutateMethods(baseClient.product as unknown as PrismaModelDelegate, tenantId);

  wrapFindMethods(baseClient.category as unknown as PrismaModelDelegate, tenantId);
  wrapMutateMethods(baseClient.category as unknown as PrismaModelDelegate, tenantId);

  wrapFindMethods(baseClient.order as unknown as PrismaModelDelegate, tenantId);
  wrapMutateMethods(baseClient.order as unknown as PrismaModelDelegate, tenantId);

  return baseClient;
}
