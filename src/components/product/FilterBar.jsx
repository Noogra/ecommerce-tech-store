import { SlidersHorizontal } from 'lucide-react';

export default function FilterBar({ filters, activeFilter, onFilterChange, sortBy, onSortChange }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      {/* Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
        <SlidersHorizontal className="w-4 h-4 text-muted flex-shrink-0" />
        {filters.map((filter) => (
          <button
            key={filter.slug}
            onClick={() => onFilterChange(filter.slug)}
            className={`min-h-[44px] px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap transition-all ${
              activeFilter === filter.slug
                ? 'bg-accent text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {filter.name}
          </button>
        ))}
      </div>

      {/* Sort Dropdown */}
      <select
        value={sortBy}
        onChange={(e) => onSortChange(e.target.value)}
        className="px-4 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
      >
        <option value="featured">Featured</option>
        <option value="price-asc">Price: Low to High</option>
        <option value="price-desc">Price: High to Low</option>
        <option value="name-asc">Name: A–Z</option>
        <option value="name-desc">Name: Z–A</option>
        <option value="rating">Top Rated</option>
      </select>
    </div>
  );
}
