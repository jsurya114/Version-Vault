export interface FilterOption {
  label: string;
  value: string;
}

export interface SortOption {
  label: string;
  value: string;
}

export interface TableFilterConfig {
  value: string;
  options: FilterOption[];
  onChange: (value: string) => void;
}

export interface TableFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  filterValue?: string;
  filterOptions?: FilterOption[];
  onFilterChange?: (value: string) => void;
  extraFilters?: TableFilterConfig[];
  sortField?: string;
  sortOptions?: SortOption[];
  onSortFieldChange?: (value: string) => void;
  sortOrder?: 'asc' | 'desc';
  onSortOrderChange?: (value: 'asc' | 'desc') => void;
  searchPlaceholder?: string;
}
