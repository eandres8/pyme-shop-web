import { Category } from "@/src/core/entities";
import { Result } from "@/src/core/utils";

export interface ICategoryRepository {
  createCategories(categories: string[]): Promise<Result<Category[]>>;
  listCategories(tenantId?: string): Promise<Result<Category[]>>;
}
