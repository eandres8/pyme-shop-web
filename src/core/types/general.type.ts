export type TLayoutProps = { children: React.ReactNode };

export type TPagination = {
  currentPage: number;
  totalPages: number;
};

export type TPaginateData<T> = {
  data: T;
} & TPagination;

export type TActionResponse<T> =
  | {
      success: true;
      data: T;
    }
  | { success: false; message: string };
