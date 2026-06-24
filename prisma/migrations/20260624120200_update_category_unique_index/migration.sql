-- DropExistingUniqueIndex
DROP INDEX IF EXISTS "categories_name_key";

-- CreateCompositeUniqueIndex
CREATE UNIQUE INDEX "categories_name_tenant_id_key" ON "categories"("name", "tenant_id");