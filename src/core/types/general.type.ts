
export type TLayoutProps = { children: React.ReactNode };

export type TPagination = {
  currentPage: number;
  totalPages: number;
};

export type TPaginateData<T> = {
  data: T;
} & TPagination;