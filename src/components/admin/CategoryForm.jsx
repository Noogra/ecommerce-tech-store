import { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';

function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export default function CategoryForm({ category, onSave, onCancel, isSubmitting }) {
  const [name, setName] = useState(category?.name || '');
  const [slug, setSlug] = useState(category?.slug || '');
  const [subcategories, setSubcategories] = useState(category?.subcategories || []);
  const [newSubcategoryName, setNewSubcategoryName] = useState('');
  const [autoSlug, setAutoSlug] = useState(!category);

  useEffect(() => {
    if (autoSlug && name) {
      setSlug(generateSlug(name));
    }
  }, [name, autoSlug]);

  const handleAddSubcategory = () => {
    if (!newSubcategoryName.trim()) return;

    const subSlug = generateSlug(newSubcategoryName);
    const existing = subcategories.find(s => s.slug === subSlug);

    if (existing) {
      alert('A subcategory with this name already exists');
      return;
    }

    setSubcategories([...subcategories, { name: newSubcategoryName.trim(), slug: subSlug }]);
    setNewSubcategoryName('');
  };

  const handleRemoveSubcategory = (slug) => {
    setSubcategories(subcategories.filter(s => s.slug !== slug));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!name.trim()) {
      alert('Category name is required');
      return;
    }

    if (!slug.trim()) {
      alert('Slug is required');
      return;
    }

    onSave({ name: name.trim(), slug: slug.trim(), subcategories });
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white">
          <h2 className="text-xl font-semibold text-primary">
            {category ? 'Edit Category' : 'Add New Category'}
          </h2>
          <button
            onClick={onCancel}
            className="p-2 text-gray-400 hover:text-primary rounded-lg transition-colors"
            disabled={isSubmitting}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Category Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
              placeholder="e.g., Smart Watches"
              disabled={isSubmitting}
              required
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Slug <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value);
                setAutoSlug(false);
              }}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent font-mono"
              placeholder="e.g., smart-watches"
              disabled={isSubmitting}
              required
            />
            <p className="text-xs text-muted mt-1.5">
              {autoSlug ? 'Auto-generated from name' : 'Custom slug (lowercase, hyphens only)'}
            </p>
          </div>

          {/* Subcategories */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subcategories
            </label>

            {/* Existing subcategories */}
            {subcategories.length > 0 && (
              <div className="space-y-2 mb-3">
                {subcategories.map((sub) => (
                  <div
                    key={sub.slug}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="text-sm font-medium text-primary">{sub.name}</p>
                      <p className="text-xs text-muted font-mono">{sub.slug}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveSubcategory(sub.slug)}
                      className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
                      disabled={isSubmitting}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add new subcategory */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newSubcategoryName}
                onChange={(e) => setNewSubcategoryName(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubcategory();
                  }
                }}
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                placeholder="Add subcategory..."
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={handleAddSubcategory}
                className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors flex items-center gap-2"
                disabled={isSubmitting}
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-accent hover:bg-accent-dark text-white font-semibold rounded-xl transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : category ? 'Update Category' : 'Create Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
