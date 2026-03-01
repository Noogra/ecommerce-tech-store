import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const EMPTY = { name: '', contactName: '', phone: '', email: '', address: '', notes: '' };

export default function SupplierModal({ supplier, onSave, onClose }) {
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const { t } = useTranslation();

  useEffect(() => {
    setForm(supplier ? { ...EMPTY, ...supplier } : EMPTY);
    setError('');
  }, [supplier]);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError(t('supplierModal.nameRequired')); return; }
    setSaving(true);
    setError('');
    try {
      await onSave(form);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">
            {supplier ? t('supplierModal.editTitle') : t('supplierModal.addTitle')}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              {t('supplierModal.name')} <span className="text-red-500">*</span>
            </label>
            <input
              value={form.name}
              onChange={set('name')}
              placeholder={t('supplierModal.namePlaceholder')}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">{t('supplierModal.contact')}</label>
              <input
                value={form.contactName}
                onChange={set('contactName')}
                placeholder={t('supplierModal.contactPlaceholder')}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">{t('supplierModal.phone')}</label>
              <input
                value={form.phone}
                onChange={set('phone')}
                placeholder={t('supplierModal.phonePlaceholder')}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">{t('supplierModal.email')}</label>
            <input
              type="email"
              value={form.email}
              onChange={set('email')}
              placeholder={t('supplierModal.emailPlaceholder')}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">{t('supplierModal.address')}</label>
            <input
              value={form.address}
              onChange={set('address')}
              placeholder={t('supplierModal.addressPlaceholder')}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">{t('supplierModal.notes')}</label>
            <textarea
              value={form.notes}
              onChange={set('notes')}
              rows={2}
              placeholder={t('supplierModal.notesPlaceholder')}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-200 text-gray-700 rounded-xl py-2 text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              {t('supplierModal.cancel')}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-accent text-white rounded-xl py-2 text-sm font-medium hover:bg-accent/90 transition-colors disabled:opacity-60"
            >
              {saving
                ? t('supplierModal.saving')
                : supplier
                  ? t('supplierModal.saveBtn')
                  : t('supplierModal.addBtn')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
