import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { updateProductStock } from '../../api/products';
import { useTranslation } from 'react-i18next';

export default function EditableStockCell({ productId, initialValue, onSave }) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(initialValue);
  const [saving, setSaving] = useState(false);
  const { token } = useAuth();
  const { t } = useTranslation();
  const inputRef = useRef(null);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = async () => {
    const numValue = parseInt(value);

    // No change - just close
    if (numValue === initialValue) {
      setIsEditing(false);
      return;
    }

    // Validation
    if (isNaN(numValue) || numValue < 0) {
      alert(t('editStock.notNegative'));
      setValue(initialValue);
      setIsEditing(false);
      return;
    }

    if (numValue > 10000) {
      alert(t('editStock.tooLarge'));
      setValue(initialValue);
      setIsEditing(false);
      return;
    }

    setSaving(true);
    try {
      await updateProductStock(productId, numValue, token);
      setIsEditing(false);
      if (onSave) onSave();
    } catch (error) {
      alert(error.message || t('editStock.failed'));
      setValue(initialValue);
      setIsEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    }
    if (e.key === 'Escape') {
      setValue(initialValue);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="number"
          min="0"
          max="10000"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          disabled={saving}
          className="w-20 px-2 py-1 border border-accent rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 disabled:bg-gray-100"
        />
        {saving && (
          <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        )}
      </div>
    );
  }

  return (
    <button
      onClick={() => setIsEditing(true)}
      className="px-3 py-1 text-sm font-medium text-primary hover:bg-gray-100 rounded-lg transition-colors"
      title={t('editStock.clickToEdit')}
    >
      {initialValue}
    </button>
  );
}
