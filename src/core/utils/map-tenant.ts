import { envs } from "@/src/config/envs";

export function mapTenant(slug: string) {
  const [tenant] = slug.split('.');
  if (envs.BACKLIST_KEY_WORDS.includes(tenant)) {
    return '';
  }

  return tenant;
}