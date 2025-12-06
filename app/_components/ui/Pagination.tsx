'use client';

import { useState } from 'react';

interface PaginationProps {
  totalPages?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
}

export default function Pagination({
  totalPages = 8,
  currentPage: controlledPage,
  onPageChange
}: PaginationProps) {
  const [internalPage, setInternalPage] = useState(1);
  
  const currentPage = controlledPage !== undefined ? controlledPage : internalPage;

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    
    if (controlledPage === undefined) {
      setInternalPage(page);
    }
    onPageChange?.(page);
  };

  const handlePrevious = () => {
    handlePageChange(currentPage - 1);
  };

  const handleNext = () => {
    handlePageChange(currentPage + 1);
  };

  // Generate page numbers with ellipsis
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    
    if (totalPages <= 7) {
      // Show all pages if 7 or fewer
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      if (currentPage > 3) {
        pages.push('...');
      }
      
      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) {
          pages.push(i);
        }
      }
      
      if (currentPage < totalPages - 2) {
        pages.push('...');
      }
      
      // Always show last page
      if (!pages.includes(totalPages)) {
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div
      className="w-full max-w-[1075px]"
      style={{
        height: '68px',
        borderTop: '1px solid #EAECF0',
        padding: '12px 24px 16px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      {/* Button Group - responsive width */}
      <div
        className="w-full"
        style={{
          maxWidth: 'fit-content',
          height: '40px',
          border: '1px solid #D0D5DD',
          borderRadius: '8px',
          display: 'flex',
          boxShadow: '0px 1px 2px rgba(16, 24, 40, 0.05)'
        }}
      >
        {/* Previous Button */}
        <button
          onClick={handlePrevious}
          disabled={currentPage === 1}
          className="hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            width: '120px',
            height: '40px',
            background: '#FFFFFF',
            borderRight: '1px solid #D0D5DD',
            padding: '10px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
          aria-label="Previous page"
        >
          {/* Arrow Left Icon */}
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M15.8334 10H4.16669M4.16669 10L10 15.8333M4.16669 10L10 4.16667"
              stroke="#344054"
              strokeWidth="1.67"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span
            style={{
              fontSize: '14px',
              fontWeight: 600,
              color: '#344054'
            }}
          >
            Previous
          </span>
        </button>

        {/* Page Numbers */}
        {pageNumbers.map((page, index) => {
          if (page === '...') {
            return (
              <div
                key={`ellipsis-${index}`}
                style={{
                  width: '40px',
                  height: '40px',
                  background: '#FFFFFF',
                  borderRight: '1px solid #D0D5DD',
                  padding: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <span
                  style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#344054'
                  }}
                >
                  ...
                </span>
              </div>
            );
          }
          
          const pageNum = page as number;
          return (
            <button
              key={pageNum}
              onClick={() => handlePageChange(pageNum)}
              className="hover:bg-gray-50 transition-colors"
              style={{
                width: '40px',
                height: '40px',
                background: pageNum === currentPage ? '#F9FAFB' : '#FFFFFF',
                borderRight: '1px solid #D0D5DD',
                padding: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              aria-label={`Page ${pageNum}`}
              aria-current={pageNum === currentPage ? 'page' : undefined}
            >
              <span
                style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: pageNum === currentPage ? '#1D2939' : '#344054'
                }}
              >
                {pageNum}
              </span>
            </button>
          );
        })}

        {/* Next Button */}
        <button
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className="hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            width: '93px',
            height: '40px',
            background: '#FFFFFF',
            padding: '10px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
          aria-label="Next page"
        >
          <span
            style={{
              fontSize: '14px',
              fontWeight: 600,
              color: '#344054'
            }}
          >
            Next
          </span>
          {/* Arrow Right Icon */}
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M4.16669 10H15.8334M15.8334 10L10 4.16667M15.8334 10L10 15.8333"
              stroke="#344054"
              strokeWidth="1.67"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
