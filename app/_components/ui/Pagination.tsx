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
    <div className="flex justify-end">
      <div className="join custom-btn">
        <button
          className="join-item btn btn-sm"
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </button>
        {pages.map((currentPage, index) => (
          <button
            key={currentPage}
            className={`join-item btn btn-sm ${
              currentPage === page ? "btn-active" : ""
            }`}
            onClick={() => onPageChange(currentPage)}
          >
            {currentPage}
          </button>
        ))}

        <button
          className="join-item btn btn-sm "
          disabled={page === totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
