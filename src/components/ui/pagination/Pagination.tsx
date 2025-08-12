import React from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const getPaginationItems = (): (number | "...")[] => {
    const pages: (number | "...")[] = [];
    const totalVisiblePages = 10;

    let startPage = Math.max(1, currentPage - Math.floor(totalVisiblePages / 2));
    let endPage = startPage + totalVisiblePages - 1;

    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(1, endPage - totalVisiblePages + 1);
    }

    if (startPage > 1) pages.push(1);
    if (startPage > 2) pages.push("...");

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    if (endPage < totalPages - 1) pages.push("...");
    if (endPage < totalPages) pages.push(totalPages);

    return pages;
  };

  const handlePrevious = () => {
    if (currentPage > 1) onPageChange(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) onPageChange(currentPage + 1);
  };

  return (
    <div className="flex justify-center sm:justify-end items-center gap-2 w-full mt-4">
      <button
        onClick={handlePrevious}
        disabled={currentPage === 1}
        className={`px-3 py-1 rounded-md border text-sm font-medium transition-all duration-150 ${
          currentPage === 1
            ? "bg-gray-200 text-gray-500 cursor-not-allowed"
            : "bg-white hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 border-gray-300 text-gray-700 dark:text-white"
        }`}
      >
        Previous
      </button>

      {getPaginationItems().map((page, index) =>
        typeof page === "number" ? (
          <button
            key={`page-${page}-${index}`}
            onClick={() => onPageChange(page)}
            className={`px-3 py-1 rounded-md border text-sm font-medium transition-all duration-150 ${
              page === currentPage
                ? "bg-blue-900 text-white border-blue-800"
                : "bg-white hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 border-gray-300 text-gray-700 dark:text-white"
            }`}
          >
            {page}
          </button>
        ) : (
          <span
            key={`dots-${index}`}
            className="px-3 py-1 text-sm text-gray-500 dark:text-gray-400"
          >
            ...
          </span>
        )
      )}

      <button
        onClick={handleNext}
        disabled={currentPage === totalPages}
        className={`px-3 py-1 rounded-md border text-sm font-medium transition-all duration-150 ${
          currentPage === totalPages
            ? "bg-gray-200 text-gray-500 cursor-not-allowed"
            : "bg-white hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 border-gray-300 text-gray-700 dark:text-white"
        }`}
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
