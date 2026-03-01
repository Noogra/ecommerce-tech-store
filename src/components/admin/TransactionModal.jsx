import { useState, useEffect } from 'react';
import { X, Upload, FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const today = () => new Date().toISOString().slice(0, 10);

const EMPTY = {
  type: 'invoice',
  supplierId: '',
  amount: '',
  description: '',
  referenceNumber: '',
  transactionDate: today(),
};

export default function TransactionModal({ suppliers, onSave, onClose }) {
  const [form, setForm] = useState(EMPTY);
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const { t } = useTranslation();

  useEffect(() => {
    setForm({ ...EMPTY, transactionDate: today() });
    setFile(null);
    setError('');
  }, []);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (f && f.size > 10 * 1024 * 1024) { setError(t('transactionModal.fileTooLarge')); return; }
    setFile(f || null);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.supplierId) { setError(t('transactionModal.supplierRequired')); return; }
    if (!form.amount || parseFloat(form.amount) <= 0) { setError(t('transactionModal.amountPositive')); return; }
    setSaving(true);
    setError('');
    try {
      await onSave(form, file);
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
          <h2 className="text-base font-semibold text-gray-900">{t('transactionModal.title')}</h2>
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

          {/* Type toggle */}
          <div className="flex rounded-xl overflow-hidden border border-gray-200">
            {['invoice', 'payment'].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setForm((f) => ({ ...f, type }))}
                className={`flex-1 py-2 text-sm font-medium capitalize transition-colors ${
                  form.type === type
                    ? type === 'invoice'
                      ? 'bg-red-500 text-white'
                      : 'bg-green-500 text-white'
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                {type === 'invoice' ? t('transactionModal.typeInvoice') : t('transactionModal.typePayment')}
              </button>
            ))}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              {t('transactionModal.supplier')} <span className="text-red-500">*</span>
            </label>
            <select
              value={form.supplierId}
              onChange={set('supplierId')}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent bg-white"
            >
              <option value="">{t('transactionModal.selectSupplier')}</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                {t('transactionModal.amount')} <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={form.amount}
                onChange={set('amount')}
                placeholder={t('transactionModal.amountPlaceholder')}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">{t('transactionModal.date')}</label>
              <input
                type="date"
                value={form.transactionDate}
                onChange={set('transactionDate')}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">{t('transactionModal.description')}</label>
            <input
              value={form.description}
              onChange={set('description')}
              placeholder={t('transactionModal.descPlaceholder')}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">{t('transactionModal.reference')}</label>
            <input
              value={form.referenceNumber}
              onChange={set('referenceNumber')}
              placeholder={t('transactionModal.refPlaceholder')}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
            />
          </div>

          {/* File upload */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">{t('transactionModal.attachDoc')}</label>
            <label className="flex items-center gap-2 border border-dashed border-gray-300 rounded-lg px-3 py-3 cursor-pointer hover:border-accent hover:bg-accent/5 transition-colors">
              {file ? (
                <>
                  <FileText className="w-4 h-4 text-accent flex-shrink-0" />
                  <span className="text-sm text-gray-700 truncate">{file.name}</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className="text-sm text-gray-400">{t('transactionModal.uploadHint')}</span>
                </>
              )}
              <input type="file" className="hidden" accept=".pdf,.png,.jpg,.jpeg,.webp" onChange={handleFile} />
            </label>
            {file && (
              <button
                type="button"
                onClick={() => setFile(null)}
                className="text-xs text-red-500 hover:underline mt-1"
              >
                {t('transactionModal.removeFile')}
              </button>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-200 text-gray-700 rounded-xl py-2 text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              {t('transactionModal.cancel')}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-accent text-white rounded-xl py-2 text-sm font-medium hover:bg-accent/90 transition-colors disabled:opacity-60"
            >
              {saving ? t('transactionModal.saving') : t('transactionModal.logBtn')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
