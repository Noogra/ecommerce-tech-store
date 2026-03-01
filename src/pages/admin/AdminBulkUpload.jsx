import { useState } from 'react';
import { ChevronDown, ChevronRight, Download, Copy, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { bulkUploadProducts } from '../../api/products';
import { useAuth } from '../../context/AuthContext';
import FileUpload from '../../components/admin/FileUpload';
import { useTranslation } from 'react-i18next';

const SAMPLE_TEMPLATE = {
  products: [
    {
      name: 'iPhone 16 Pro',
      brand: 'Apple',
      category: 'mobile-phones',
      subcategory: 'iphone',
      price: 999,
      originalPrice: 1099,
      image: 'https://picsum.photos/seed/iphone16/400/400',
      specs: ['6.3" OLED', 'A18 Pro', '128GB'],
      detailedSpecs: {
        Display: '6.3" Super Retina XDR',
        Processor: 'Apple A18 Pro',
        Storage: '128GB'
      },
      rating: 4.8,
      inStock: true,
      featured: false
    },
    {
      name: 'Samsung Galaxy S25',
      brand: 'Samsung',
      category: 'mobile-phones',
      subcategory: 'samsung',
      price: 899,
      originalPrice: 999,
      image: 'https://picsum.photos/seed/galaxys25/400/400',
      specs: ['6.2" AMOLED', 'Snapdragon 8 Elite', '256GB'],
      detailedSpecs: {
        Display: '6.2" Dynamic AMOLED',
        Processor: 'Snapdragon 8 Elite',
        Storage: '256GB'
      },
      rating: 4.7,
      inStock: true,
      featured: true
    }
  ]
};

export default function AdminBulkUpload() {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [showTemplate, setShowTemplate] = useState(false);
  const [expandedErrors, setExpandedErrors] = useState(new Set());
  const [toast, setToast] = useState(null);
  const { token } = useAuth();
  const { t } = useTranslation();

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile);
    setResult(null);
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setResult(null);

    try {
      const text = await file.text();
      let data;

      try {
        data = JSON.parse(text);
      } catch (err) {
        setResult({
          success: 0,
          failed: 0,
          errors: [{
            index: -1,
            product: {},
            errors: `Invalid JSON format: ${err.message}`
          }]
        });
        setIsUploading(false);
        return;
      }

      const uploadResult = await bulkUploadProducts(data, token);
      setResult(uploadResult);

      if (uploadResult.success > 0 && uploadResult.failed === 0) {
        showToast(t('bulkUpload.successAll', { count: uploadResult.success }));
      } else if (uploadResult.failed > 0) {
        showToast(t('bulkUpload.partialSuccess', { success: uploadResult.success, fail: uploadResult.failed }), 'warning');
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCopyTemplate = () => {
    navigator.clipboard.writeText(JSON.stringify(SAMPLE_TEMPLATE, null, 2));
    showToast(t('bulkUpload.copied'));
  };

  const handleDownloadTemplate = () => {
    const blob = new Blob([JSON.stringify(SAMPLE_TEMPLATE, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'product-upload-template.json';
    a.click();
    URL.revokeObjectURL(url);
    showToast(t('bulkUpload.downloaded'));
  };

  const handleDownloadErrorReport = () => {
    if (!result || !result.errors || result.errors.length === 0) return;

    const blob = new Blob([JSON.stringify({ errors: result.errors }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'upload-errors.json';
    a.click();
    URL.revokeObjectURL(url);
    showToast(t('bulkUpload.errorDownloaded'));
  };

  const toggleErrorExpand = (index) => {
    const newExpanded = new Set(expandedErrors);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedErrors(newExpanded);
  };

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-primary">{t('bulkUpload.title')}</h1>
        <p className="text-sm text-muted mt-1">{t('bulkUpload.subtitle')}</p>
      </div>

      {/* File Upload Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="text-lg font-semibold text-primary mb-4">{t('bulkUpload.uploadJson')}</h2>
        <FileUpload
          onFileSelect={handleFileSelect}
          accept=".json"
          maxSizeMB={5}
          disabled={isUploading}
        />

        {file && (
          <button
            onClick={handleUpload}
            disabled={isUploading}
            className="mt-4 w-full bg-accent hover:bg-accent-dark text-white font-semibold py-3 rounded-xl transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isUploading ? t('bulkUpload.uploading') : t('bulkUpload.uploadBtn')}
          </button>
        )}
      </div>

      {/* Results Section */}
      {result && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-semibold text-primary mb-4">{t('bulkUpload.results')}</h2>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-green-50 rounded-xl border border-green-200">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <p className="text-sm font-medium text-green-900">{t('bulkUpload.successful')}</p>
              </div>
              <p className="text-2xl font-bold text-green-600">{result.success}</p>
            </div>

            <div className="p-4 bg-red-50 rounded-xl border border-red-200">
              <div className="flex items-center gap-2 mb-1">
                <XCircle className="w-5 h-5 text-red-600" />
                <p className="text-sm font-medium text-red-900">{t('bulkUpload.failed')}</p>
              </div>
              <p className="text-2xl font-bold text-red-600">{result.failed}</p>
            </div>
          </div>

          {result.errors && result.errors.length > 0 && (
            <>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-red-700">{t('bulkUpload.validationErrors')}</h3>
                <button
                  onClick={handleDownloadErrorReport}
                  className="text-sm text-accent hover:text-accent-dark font-medium flex items-center gap-1.5"
                >
                  <Download className="w-4 h-4" />
                  {t('bulkUpload.downloadErrors')}
                </button>
              </div>

              <div className="space-y-2">
                {result.errors.map((error, idx) => (
                  <div key={idx} className="border border-red-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => toggleErrorExpand(idx)}
                      className="w-full flex items-center justify-between p-3 bg-red-50 hover:bg-red-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                        <div className="text-start">
                          <p className="text-sm font-medium text-red-900">
                            {error.index >= 0
                              ? t('bulkUpload.productNum', { index: error.index + 1 })
                              : t('bulkUpload.jsonParseError')}
                            {error.product?.name && `: ${error.product.name}`}
                          </p>
                        </div>
                      </div>
                      {expandedErrors.has(idx) ? (
                        <ChevronDown className="w-4 h-4 text-red-600" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-red-600 rtl:rotate-180" />
                      )}
                    </button>

                    {expandedErrors.has(idx) && (
                      <div className="p-3 bg-white border-t border-red-200">
                        <p className="text-sm text-red-700 font-mono whitespace-pre-wrap">{error.errors}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Template Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-primary">{t('bulkUpload.template')}</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyTemplate}
              className="text-sm text-accent hover:text-accent-dark font-medium flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-accent/5 transition-colors"
            >
              <Copy className="w-4 h-4" />
              {t('bulkUpload.copy')}
            </button>
            <button
              onClick={handleDownloadTemplate}
              className="text-sm text-accent hover:text-accent-dark font-medium flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-accent/5 transition-colors"
            >
              <Download className="w-4 h-4" />
              {t('bulkUpload.download')}
            </button>
            <button
              onClick={() => setShowTemplate(!showTemplate)}
              className="text-sm text-gray-600 font-medium flex items-center gap-1.5"
            >
              {showTemplate
                ? <ChevronDown className="w-4 h-4" />
                : <ChevronRight className="w-4 h-4 rtl:rotate-180" />}
              {showTemplate ? t('bulkUpload.hide') : t('bulkUpload.show')}
            </button>
          </div>
        </div>

        {showTemplate && (
          <pre className="bg-gray-50 rounded-xl p-4 overflow-x-auto text-xs font-mono border border-gray-200">
            {JSON.stringify(SAMPLE_TEMPLATE, null, 2)}
          </pre>
        )}

        <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">{t('bulkUpload.fieldRequirements')}</h3>
          <ul className="text-xs text-blue-800 space-y-1.5">
            <li><strong>{t('bulkUpload.required')}</strong> name, brand, category, price</li>
            <li><strong>{t('bulkUpload.optional')}</strong> subcategory, originalPrice, image, specs, detailedSpecs, rating, inStock, featured</li>
            <li><strong>category:</strong> {t('bulkUpload.categoryNote')}</li>
            <li><strong>subcategory:</strong> {t('bulkUpload.subcategoryNote')}</li>
            <li><strong>price:</strong> {t('bulkUpload.priceNote')}</li>
            <li><strong>rating:</strong> {t('bulkUpload.ratingNote')}</li>
            <li><strong>{t('bulkUpload.maxProducts')}</strong> 1000</li>
          </ul>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 end-6 z-50 animate-in slide-in-from-bottom duration-300">
          <div
            className={`px-6 py-4 rounded-xl shadow-lg ${
              toast.type === 'error'
                ? 'bg-red-600 text-white'
                : toast.type === 'warning'
                ? 'bg-yellow-600 text-white'
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
