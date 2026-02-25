import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export default function MegaMenu({ category, onClose }) {
  if (!category) return null;

  const hasSubcategories = category.subcategories && category.subcategories.length > 0;

  return (
    <div
      className="w-full bg-white border-b border-gray-100 shadow-lg z-50 animate-in fade-in duration-200"
    >
      <div className="max-w-7xl mx-auto px-6 py-8">
        {hasSubcategories ? (
          <div className="grid grid-cols-3 gap-8">
            {category.subcategories.map((sub) => (
              <Link
                key={sub.slug}
                to={`/category/${category.slug}?sub=${sub.slug}`}
                onClick={onClose}
                className="group flex items-center gap-3 p-4 rounded-xl hover:bg-surface transition-colors"
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-primary group-hover:text-accent transition-colors">
                    {sub.name}
                  </h3>
                  <p className="text-sm text-muted mt-1">
                    Browse {sub.name}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted group-hover:text-accent transition-colors" />
              </Link>
            ))}
          </div>
        ) : (
          <Link
            to={`/category/${category.slug}`}
            onClick={onClose}
            className="group flex items-center gap-3 p-4 rounded-xl hover:bg-surface transition-colors inline-flex"
          >
            <div>
              <h3 className="font-semibold text-primary group-hover:text-accent transition-colors">
                Browse All {category.name}
              </h3>
              <p className="text-sm text-muted mt-1">
                View our full collection
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted group-hover:text-accent transition-colors" />
          </Link>
        )}

        <div className="mt-6 pt-6 border-t border-gray-100">
          <Link
            to={`/category/${category.slug}`}
            onClick={onClose}
            className="text-sm font-medium text-accent hover:text-accent-dark transition-colors"
          >
            View all {category.name} →
          </Link>
        </div>
      </div>
    </div>
  );
}
