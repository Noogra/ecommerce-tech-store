import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, ArrowLeft } from 'lucide-react';
import { fetchProduct, createProduct, updateProduct } from '../../api/products';
import { fetchCategories } from '../../api/categories';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';

const emptyForm = {
  name: '',
  brand: '',
  category: '',
  subcategory: '',
  price: '',
  originalPrice: '',
  image: '',
  specs: '',
  detailedSpecs: '{}',
  rating: '',
  stock_quantity: '0',
  inStock: true,
  featured: false,
};

export default function AdminProductForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { token } = useAuth();
  const { t } = useTranslation();

  const [form, setForm] = useState(emptyForm);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCategories().then(setCategories);

    if (isEdit) {
      fetchProduct(id)
        .then(p => {
          setForm({
            name: p.name,
            brand: p.brand,
            category: p.category,
            subcategory: p.subcategory,
            price: String(p.price),
            originalPrice: String(p.originalPrice),
            image: p.image,
            specs: p.specs.join(', '),
            detailedSpecs: JSON.stringify(p.detailedSpecs, null, 2),
            rating: String(p.rating),
            stock_quantity: String(p.stock_quantity || 0),
            inStock: p.inStock,
            featured: p.featured,
          });
        })
        .catch(() => setError('Failed to load product'))
        .finally(() => setLoading(false));
    }
  }, [id, isEdit]);

  const selectedCategory = categories.find(c => c.slug === form.category);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
      ...(name === 'category' ? { subcategory: '' } : {}),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      let parsedSpecs;
      try {
        parsedSpecs = JSON.parse(form.detailedSpecs);
      } catch {
        throw new Error(t('productForm.detailedSpecsError'));
      }

      const payload = {
        name: form.name,
        brand: form.brand,
        category: form.category,
        subcategory: form.subcategory,
        price: parseFloat(form.price),
        originalPrice: parseFloat(form.originalPrice) || parseFloat(form.price),
        image: form.image,
        specs: form.specs.split(',').map(s => s.trim()).filter(Boolean),
        detailedSpecs: parsedSpecs,
        rating: parseFloat(form.rating) || 0,
        stock_quantity: parseInt(form.stock_quantity) || 0,
        inStock: form.inStock,
        featured: form.featured,
      };

      if (isEdit) {
        await updateProduct(id, payload, token);
      } else {
        await createProduct(payload, token);
      }

      navigate('/admin/products');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl space-y-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <button
        onClick={() => navigate('/admin/products')}
        className="inline-flex items-center gap-2 text-muted hover:text-primary text-sm mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
        {t('productForm.backToProducts')}
      </button>

      <h1 className="text-2xl font-bold text-primary mb-8">
        {isEdit ? t('productForm.editTitle') : t('productForm.addTitle')}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('productForm.name')} *</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
            placeholder="e.g. iPhone 16 Pro Max"
          />
        </div>

        {/* Brand */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('productForm.brand')} *</label>
          <input
            name="brand"
            value={form.brand}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
            placeholder="e.g. Apple"
          />
        </div>

        {/* Category & Subcategory */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('productForm.category')} *</label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent bg-white"
            >
              <option value="">{t('productForm.selectCategory')}</option>
              {categories.map(c => (
                <option key={c.slug} value={c.slug}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('productForm.subcategory')}</label>
            <select
              name="subcategory"
              value={form.subcategory}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent bg-white"
            >
              <option value="">{t('productForm.noneSubcategory')}</option>
              {selectedCategory?.subcategories.map(s => (
                <option key={s.slug} value={s.slug}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Price */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('productForm.price')} *</label>
            <input
              name="price"
              type="number"
              step="0.01"
              min="0"
              value={form.price}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
              placeholder="999"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('productForm.originalPrice')}</label>
            <input
              name="originalPrice"
              type="number"
              step="0.01"
              min="0"
              value={form.originalPrice}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
              placeholder="1099"
            />
          </div>
        </div>

        {/* Image URL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('productForm.imageUrl')}</label>
          <input
            name="image"
            value={form.image}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
            placeholder="https://picsum.photos/seed/myproduct/400/400"
          />
        </div>

        {/* Rating & Stock Quantity */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('productForm.rating')}</label>
            <input
              name="rating"
              type="number"
              step="0.1"
              min="0"
              max="5"
              value={form.rating}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
              placeholder="4.5"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('productForm.stock')} *</label>
            <input
              name="stock_quantity"
              type="number"
              min="0"
              max="10000"
              value={form.stock_quantity}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
              placeholder="50"
            />
          </div>
        </div>

        {/* Specs (comma-separated) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            {t('productForm.quickSpecs')} <span className="text-muted font-normal">{t('productForm.quickSpecsSub')}</span>
          </label>
          <input
            name="specs"
            value={form.specs}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
            placeholder='6.9" OLED, A18 Pro, 256GB, Titanium'
          />
        </div>

        {/* Detailed Specs (JSON) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            {t('productForm.detailedSpecs')} <span className="text-muted font-normal">{t('productForm.detailedSpecsSub')}</span>
          </label>
          <textarea
            name="detailedSpecs"
            value={form.detailedSpecs}
            onChange={handleChange}
            rows={8}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
            placeholder='{ "Display": "6.9\" OLED", "Processor": "A18 Pro" }'
          />
        </div>

        {/* Checkboxes */}
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              name="inStock"
              type="checkbox"
              checked={form.inStock}
              onChange={handleChange}
              className="w-4 h-4 rounded border-gray-300 text-accent focus:ring-accent"
            />
            <span className="text-sm font-medium text-gray-700">{t('productForm.inStock')}</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              name="featured"
              type="checkbox"
              checked={form.featured}
              onChange={handleChange}
              className="w-4 h-4 rounded border-gray-300 text-accent focus:ring-accent"
            />
            <span className="text-sm font-medium text-gray-700">{t('productForm.featured')}</span>
          </label>
        </div>

        {/* Error */}
        {error && (
          <p className="text-sm text-red-500 bg-red-50 px-4 py-3 rounded-xl">{error}</p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 bg-accent hover:bg-accent-dark text-white font-semibold px-8 py-3 rounded-xl transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving
            ? t('productForm.saving')
            : isEdit
              ? t('productForm.updateBtn')
              : t('productForm.createBtn')}
        </button>
      </form>
    </div>
  );
}
