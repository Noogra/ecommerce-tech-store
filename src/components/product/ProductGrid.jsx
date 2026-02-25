import { useState, useMemo } from 'react';
import ProductCard from './ProductCard';
import FilterBar from './FilterBar';
import { PackageSearch } from 'lucide-react';

export default function ProductGrid({ products, subcategories = [], initialFilter = 'all' }) {
  const [activeFilter, setActiveFilter] = useState(initialFilter);
  const [sortBy, setSortBy] = useState('featured');

  const filters = [
    { name: 'All', slug: 'all' },
    ...subcategories.map(sub => ({ name: sub.name, slug: sub.slug })),
  ];

  const filtered = useMemo(() => {
    let result = [...products];

    if (activeFilter !== 'all') {
      result = result.filter(p => p.subcategory === activeFilter);
    }

    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'name-asc':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      default:
        result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }

    return result;
  }, [products, activeFilter, sortBy]);

  return (
    <div>
      {subcategories.length > 0 && (
        <FilterBar
          filters={filters}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />
      )}

      {subcategories.length === 0 && (
        <div className="flex justify-end mb-6">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
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
      )}

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <PackageSearch className="w-16 h-16 text-gray-200 mx-auto" />
          <p className="text-lg font-medium text-primary mt-4">No products found</p>
          <p className="text-sm text-muted mt-1">Try a different filter</p>
        </div>
      )}
    </div>
  );
}
