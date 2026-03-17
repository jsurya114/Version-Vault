import { PaginationProps } from './paginationTypes';

const Pagination = ({ page, totalPages, total, limit, onPageChange }: PaginationProps) => {
  return (
    <div className="border-t border-gray-800 px-4 py-3 flex items-center justify-between">
      <p className="text-gray-500 text-xs">
        Showing {total === 0 ? 0 : (page - 1) * limit + 1}–{Math.min(page * limit, total)} of{' '}
        {total} results
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page === 1}
          className="text-gray-400 hover:text-white text-sm px-3 py-1 rounded border border-gray-700 hover:bg-gray-800 transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <span className="text-gray-500 text-xs">
          Page {page} of {totalPages || 1}
        </span>
        <button
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page >= totalPages}
          className="text-gray-400 hover:text-white text-sm px-3 py-1 rounded border border-gray-700 hover:bg-gray-800 transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Pagination;
