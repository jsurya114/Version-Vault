import { FilterOption, SortOption, TableFiltersProps } from './tableFiltersTypes';

const TableFilters = ({
  search,
  onSearchChange,
  filterValue,
  filterOptions,
  onFilterChange,
  sortField,
  sortOptions,
  onSortFieldChange,
  sortOrder,
  onSortOrderChange,
  searchPlaceholder = 'Search...',
}: TableFiltersProps) => {
  return (
    <div className="flex items-center gap-3 mb-4">
      {/* Search */}
      <input
        type="text"
        placeholder={searchPlaceholder}
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="flex-1 bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-gray-600 transition"
      />

      {/* Filter */}
      {filterOptions && onFilterChange && (
        <select
          value={filterValue}
          onChange={(e) => onFilterChange(e.target.value)}
          className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none"
        >
          {filterOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      )}

      {/* Sort Field */}
      {sortOptions && onSortFieldChange && (
        <select
          value={sortField}
          onChange={(e) => onSortFieldChange(e.target.value)}
          className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none"
        >
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      )}

      {/* Sort Order */}
      {onSortOrderChange && (
        <select
          value={sortOrder}
          onChange={(e) => onSortOrderChange(e.target.value as 'asc' | 'desc')}
          className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none"
        >
          <option value="desc">Descending</option>
          <option value="asc">Ascending</option>
        </select>
      )}
    </div>
  );
};

export default TableFilters;
