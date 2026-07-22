'use client';

import { useEffect } from "react";

import { useTenantStore } from "@/src/client/stores";

type Props = {
  name: string;
  slug: string;
};

export const TenantProvider: React.FC<Props> = ({ name, slug }) => {
  const setTenant = useTenantStore((state) => state.setTenant);
  const resetTenant = useTenantStore((state) => state.resetTenant);

  useEffect(() => {
    setTenant({ name, slug });

    return () => {
      resetTenant();
    };
  }, [name, slug, setTenant, resetTenant]);

  return null;
};
