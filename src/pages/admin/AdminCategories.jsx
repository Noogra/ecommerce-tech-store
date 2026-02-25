import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Tag, PlusCircle, X } from 'lucide-react';
import { fetchCategories, createCategory, updateCategory, deleteCategory, addSubcategory, deleteSubcategory } from '../../api/categories';
import { useAuth } from '../../context/AuthContext';
import CategoryForm from '../../components/admin/CategoryForm';
import ConfirmDialog from '../../components/admin/ConfirmDialog';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, category: null, force: false });
  const [toast, setToast] = useState(null);
  const { token } = useAuth();

  const loadCategories = () => {
    setLoading(true);
    fetchCategories()
      .then(setCategories)
      .catch(err => showToast(err.message, 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(loadCategories, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleCreateOrUpdate = async (data) => {
    setIsSubmitting(true);
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, data, token);
        showToast('Category updated successfully');
      } else {
        await createCategory(data, token);
        showToast('Category created successfully');
      }
      loadCategories();
      setShowForm(false);
      setEditingCategory(null);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (force = false) => {
    const { category } = deleteDialog;
    if (!category) return;

    try {
      const result = await deleteCategory(category.id, token, force);
      if (result.productsDeleted > 0) {
        showToast(`Category and ${result.productsDeleted} products deleted`);
      } else {
        showToast('Category deleted successfully');
      }
      loadCategories();
      setDeleteDialog({ isOpen: false, category: null, force: false });
    } catch (err) {
      if (err.message.includes('Cannot delete category with')) {
        // Show force delete option
        setDeleteDialog({ ...deleteDialog, force: true });
      } else {
        showToast(err.message, 'error');
        setDeleteDialog({ isOpen: false, category: null, force: false });
      }
    }
  };

  const handleDeleteSubcategory = async (category, subcategory) => {
    if (!window.confirm(`Delete subcategory "${subcategory.name}"? Products using this subcategory will have it removed.`)) {
      return;
    }

    try {
      const result = await deleteSubcategory(category.id, subcategory.slug, token);
      showToast(`Subcategory deleted. ${result.productsAffected} products updated.`);
      loadCategories();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-primary">Categories</h1>
          <p className="text-sm text-muted mt-1">Manage product categories and subcategories</p>
        </div>
        <button
          onClick={() => {
            setEditingCategory(null);
            setShowForm(true);
          }}
          className="inline-flex items-center gap-2 bg-accent hover:bg-accent-dark text-white font-medium text-sm px-5 py-2.5 rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-50 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="p-12 text-center text-muted">
            <Tag className="w-12 h-12 mx-auto mb-4 text-gray-200" />
            <p className="text-lg font-medium">No categories yet</p>
            <p className="text-sm mt-1">Create your first category to organize products.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {categories.map((cat) => (
              <div key={cat.id} className="p-6 hover:bg-gray-50/50 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-primary">{cat.name}</h3>
                    <p className="text-sm text-muted font-mono mt-0.5">{cat.slug}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditingCategory(cat);
                        setShowForm(true);
                      }}
                      className="p-2 text-gray-400 hover:text-accent rounded-lg transition-colors"
                      title="Edit category"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteDialog({ isOpen: true, category: cat, force: false })}
                      className="p-2 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
                      title="Delete category"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Subcategories */}
                {cat.subcategories && cat.subcategories.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {cat.subcategories.map((sub) => (
                      <div
                        key={sub.slug}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg text-sm text-gray-700 group"
                      >
                        <span>{sub.name}</span>
                        <button
                          onClick={() => handleDeleteSubcategory(cat, sub)}
                          className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all"
                          title="Remove subcategory"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted italic">No subcategories</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Category Form Modal */}
      {showForm && (
        <CategoryForm
          category={editingCategory}
          onSave={handleCreateOrUpdate}
          onCancel={() => {
            setShowForm(false);
            setEditingCategory(null);
          }}
          isSubmitting={isSubmitting}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        title={deleteDialog.force ? 'Force Delete Category?' : 'Delete Category?'}
        message={
          deleteDialog.force
            ? `This category has products. Deleting it will also delete all associated products. This cannot be undone.`
            : `Are you sure you want to delete "${deleteDialog.category?.name}"? This cannot be undone.`
        }
        confirmText={deleteDialog.force ? 'Delete Anyway' : 'Delete'}
        confirmVariant="danger"
        onConfirm={() => handleDelete(deleteDialog.force)}
        onCancel={() => setDeleteDialog({ isOpen: false, category: null, force: false })}
      />

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom duration-300">
          <div
            className={`px-6 py-4 rounded-xl shadow-lg ${
              toast.type === 'error'
                ? 'bg-red-600 text-white'
                : 'bg-green-600 text-white'
            }`}
          >
            <p className="font-medium">{toast.message}</p>
          </div>
        </div>
      )}
    </div>
  );
}
