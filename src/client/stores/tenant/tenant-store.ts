import { create } from 'zustand';

type State = {
  name: string;
  slug: string;

  setTenant: (tenant: { name: string; slug: string }) => void;
  resetTenant: () => void;
};

const initialState = {
  name: '',
  slug: '',
};

export const useTenantStore = create<State>((set) => ({
  ...initialState,
  setTenant: ({ name, slug }) => set({ name, slug }),
  resetTenant: () => set(initialState),
}));
