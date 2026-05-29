'use client'

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { IoChevronBackOutline, IoChevronForwardOutline } from "react-icons/io5";
import clsx from "clsx";

import { generatePaginationNumbers } from "@/src/shared/utils";

type Props = {
  totalPages: number;
  currentPage: number;
};

export const Pagination: React.FC<Props> = ({ totalPages }) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get('page') || 1);

  const allPages = generatePaginationNumbers(currentPage, totalPages);

  const createPageUrl = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams);

    if (pageNumber === '...') {
      return `${pathname}?${params.toString()}`;
    }

    if (Number(pageNumber) <= 0) {
      return `${pathname}`;
    }

    if (Number(pageNumber) > totalPages) {
      return `${pathname}?${params.toString()}`;
    }

    params.set('page', pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  }

  return (
    <div className="flex text-center justify-center mt-10 mb-32">
      <nav aria-label="Page navigation example">
        <ul className="flex items-center list-style-none">
          <li className={
            clsx(
              "page-item",
              {
                'disabled': currentPage === 1,
              },
            )
          }>
            <Link
              className="page-link relative block py-1.5 px-3 rounded border-0 bg-transparent outline-none transition-all duration-300 text-gray-800 hover:text-gray-800 hover:bg-gray-200 focus:shadow-none"
              href={createPageUrl(currentPage - 1)}
              aria-disabled={currentPage === 1}
            >
              <IoChevronBackOutline size={30} />
            </Link>
          </li>
          {
            allPages.map((page, idx) => (
              <li className="page-item" key={`${page}:${idx}`}>
                <Link
                  className={
                    clsx(
                      "page-link relative block py-1.5 px-3 rounded border-0 outline-none transition-all duration-300 text-gray-800 hover:text-gray-800 hover:bg-gray-200 focus:shadow-none",
                      {
                        'bg-blue-500 shadow-sm text-white hover:text-white hover:bg-blue-400': page === currentPage
                      }
                    )
                  }
                  href={createPageUrl(page)}
                >
                  {page}
                </Link>
              </li>
            ))
          }
          <li className={
            clsx(
              "page-item",
              {
                'disabled': currentPage === totalPages,
              },
            )
          }>
            <Link
              className="page-link relative block py-1.5 px-3 rounded border-0 bg-transparent outline-none transition-all duration-300 text-gray-800 hover:text-gray-800 hover:bg-gray-200 focus:shadow-none"
              href={createPageUrl(currentPage + 1)}
              aria-disabled={currentPage === totalPages}
            >
              <IoChevronForwardOutline size={30} />
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};
