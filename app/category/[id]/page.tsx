import { redirect } from "next/navigation";

/**
 * Legacy `/category/<id>` URLs have no owning tenant — the "category" is the
 * global `gender` taxonomy (men/women/kid), not a tenant-owned resource
 * (see design D5). Without a store context they fall back to the landing.
 * The supported, tenant-scoped form is `/<store-slug>/category/<id>`.
 */
export default function LegacyCategoryRedirect() {
  redirect("/");
}
