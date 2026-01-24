import React, { JSX } from "react";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  page,
  totalPages,
  onPageChange,
}: PaginationProps): JSX.Element {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  
  return (
    <div className="flex items-center gap-1">
      {/* Previous Button */}
      <button
        className={`px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
          page === 1
            ? 'text-gray-400 bg-white border-gray-200 cursor-not-allowed'
            : 'text-gray-700 bg-white border-gray-300 hover:bg-gray-50 hover:border-gray-400'
        }`}
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
      >
        Previous
      </button>

      {/* Page Numbers */}
      {pages.map((currentPage) => (
        <button
          key={currentPage}
          className={`px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
            currentPage === page
              ? 'text-white bg-[#7F56D9] border-[#7F56D9]' // Purple active state
              : 'text-gray-700 bg-white border-gray-300 hover:bg-gray-50 hover:border-gray-400'
          }`}
          onClick={() => onPageChange(currentPage)}
        >
          {currentPage}
        </button>
      ))}

      {/* Next Button */}
      <button
        className={`px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
          page === totalPages
            ? 'text-gray-400 bg-white border-gray-200 cursor-not-allowed'
            : 'text-gray-700 bg-white border-gray-300 hover:bg-gray-50 hover:border-gray-400'
        }`}
        disabled={page === totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        Next
      </button>
    </div>
  );
}
