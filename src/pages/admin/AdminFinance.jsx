import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Upload, Sparkles, CheckCircle2, XCircle, RefreshCw,
  TrendingDown, TrendingUp, Users, FileText,
  ExternalLink, Trash2, AlertCircle, ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  getSuppliers, getTransactions, deleteTransaction,
  getFinancialSummary, analyzeDocument, confirmDocument,
} from '../../api/finance';
import { useTranslation } from 'react-i18next';

// ─── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (n) =>
  `$${Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const fmtDate = (d) =>
  new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const ACCEPTED = '.pdf,.jpg,.jpeg,.png,.webp';
const MAX_MB = 10;

// ─── Subcomponents ────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, color }) {
  const colors = {
    red: 'bg-red-50 text-red-600',
    green: 'bg-green-50 text-green-600',
    blue: 'bg-blue-50 text-blue-600',
    amber: 'bg-amber-50 text-amber-600',
  };
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <span className="text-sm text-muted">{label}</span>
      </div>
      <p className="text-2xl font-bold text-primary">{value}</p>
    </div>
  );
}

// ── Drag-and-drop upload zone ──────────────────────────────────────────────────
function UploadZone({ onFile, analyzing }) {
  const [dragging, setDragging] = useState(false);
  const [fileError, setFileError] = useState('');
  const inputRef = useRef(null);
  const { t } = useTranslation();

  const validate = (file) => {
    if (!file) return false;
    const ext = file.name.split('.').pop().toLowerCase();
    if (!['pdf', 'jpg', 'jpeg', 'png', 'webp'].includes(ext)) {
      setFileError(t('finance.unsupportedFormat'));
      return false;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      setFileError(t('finance.fileTooLarge', { maxMB: MAX_MB }));
      return false;
    }
    setFileError('');
    return true;
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (validate(file)) onFile(file);
  };

  const handleInput = (e) => {
    const file = e.target.files[0];
    if (file && validate(file)) onFile(file);
    e.target.value = '';
  };

  if (analyzing) {
    return (
      <div className="bg-white rounded-2xl border-2 border-accent/30 p-10 flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center">
          <Sparkles className="w-8 h-8 text-accent animate-pulse" />
        </div>
        <div className="text-center">
          <p className="text-base font-semibold text-primary">{t('finance.aiReading')}</p>
          <p className="text-sm text-muted mt-1">{t('finance.aiIdentifying')}</p>
        </div>
        <div className="flex gap-1.5 mt-2">
          {[0, 1, 2].map(i => (
            <div key={i} className="w-2 h-2 rounded-full bg-accent animate-bounce"
              style={{ animationDelay: `${i * 150}ms` }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={`bg-white rounded-2xl border-2 border-dashed p-10 flex flex-col items-center gap-4 cursor-pointer transition-all select-none ${
        dragging ? 'border-accent bg-accent/5 scale-[1.01]' : 'border-gray-200 hover:border-accent/50 hover:bg-gray-50/50'
      }`}
    >
      <input ref={inputRef} type="file" accept={ACCEPTED} onChange={handleInput} className="hidden" />
      <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center">
        <Upload className="w-8 h-8 text-muted" />
      </div>
      <div className="text-center">
        <p className="text-base font-semibold text-primary">{t('finance.dropInvoice')}</p>
        <p className="text-sm text-muted mt-1">{t('finance.or')} <span className="text-accent font-medium">{t('finance.clickBrowse')}</span></p>
        <p className="text-xs text-gray-400 mt-2">{t('finance.uploadHint', { maxMB: MAX_MB })}</p>
      </div>
      {fileError && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-4 py-2 rounded-xl">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {fileError}
        </div>
      )}
    </div>
  );
}

// ── AI Result Confirmation Card ────────────────────────────────────────────────
function ConfirmCard({ result, onConfirm, onCancel, confirming }) {
  const [form, setForm] = useState({
    supplierName: result.supplierName || '',
    contactName: result.contactName || '',
    contactEmail: result.contactEmail || '',
    contactPhone: result.contactPhone || '',
    contactAddress: result.contactAddress || '',
    documentType: result.documentType === 'payment' ? 'payment' : 'invoice',
    amount: result.amount != null ? String(result.amount) : '',
    date: result.date || new Date().toISOString().slice(0, 10),
    referenceNumber: result.referenceNumber || '',
    description: result.description || '',
  });
  const { t } = useTranslation();

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const confidence = Math.round((result.confidence || 0.8) * 100);
  const confidenceColor = confidence >= 85 ? 'text-green-600 bg-green-50' : confidence >= 60 ? 'text-amber-600 bg-amber-50' : 'text-red-600 bg-red-50';

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm({
      ...form,
      amount: parseFloat(form.amount),
      tempFilename: result.tempFilename,
      originalName: result.originalName,
    });
  };

  return (
    <div className="bg-white rounded-2xl border-2 border-accent/40 shadow-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-accent/5 border-b border-accent/20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-primary">{t('finance.aiComplete')}</p>
            <p className="text-xs text-muted">{t('finance.aiReview')}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${confidenceColor}`}>
            {confidence}% {t('finance.confidence')}
          </span>
          <button onClick={onCancel} className="p-1.5 rounded-lg hover:bg-gray-100 text-muted transition-colors">
            <XCircle className="w-5 h-5" />
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        {/* Document Type toggle */}
        <div>
          <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">{t('finance.docType')}</label>
          <div className="flex gap-2">
            {[
              { val: 'invoice', label: t('finance.typeInvoice'), desc: t('finance.typeInvoiceSub'), cls: 'border-red-400 bg-red-50 text-red-700' },
              { val: 'payment', label: t('finance.typePayment'), desc: t('finance.typePaymentSub'), cls: 'border-green-400 bg-green-50 text-green-700' },
            ].map(({ val, label, desc, cls }) => (
              <button
                key={val}
                type="button"
                onClick={() => set('documentType', val)}
                className={`flex-1 text-start px-4 py-3 rounded-xl border-2 transition-all ${
                  form.documentType === val ? cls : 'border-gray-200 text-muted hover:border-gray-300'
                }`}
              >
                <p className="text-sm font-semibold">{label}</p>
                <p className="text-xs opacity-70 mt-0.5">{desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Two-column grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
              {t('finance.supplierName')} *
            </label>
            <input
              value={form.supplierName}
              onChange={e => set('supplierName', e.target.value)}
              required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
              placeholder="Supplier company name"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">{t('finance.amount')} *</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={form.amount}
              onChange={e => set('amount', e.target.value)}
              required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
              placeholder={t('finance.descPlaceholder')}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">{t('finance.date')} *</label>
            <input
              type="date"
              value={form.date}
              onChange={e => set('date', e.target.value)}
              required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">{t('finance.reference')}</label>
            <input
              value={form.referenceNumber}
              onChange={e => set('referenceNumber', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
              placeholder={t('finance.refPlaceholder')}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">{t('finance.contactEmail')}</label>
            <input
              type="email"
              value={form.contactEmail}
              onChange={e => set('contactEmail', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
              placeholder={t('finance.emailPlaceholder')}
            />
          </div>

          <div className="col-span-2">
            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">{t('finance.description')}</label>
            <input
              value={form.description}
              onChange={e => set('description', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
              placeholder={t('finance.descPlaceholder')}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={confirming}
            className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {t('finance.cancel')}
          </button>
          <button
            type="submit"
            disabled={confirming}
            className="flex-1 flex items-center justify-center gap-2 bg-accent hover:bg-accent-dark text-white py-3 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
          >
            {confirming ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                {t('finance.saving')}
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                {t('finance.confirmBtn')}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function AdminFinance() {
  const { token } = useAuth();
  const { t } = useTranslation();

  // Data state
  const [suppliers, setSuppliers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [dataLoading, setDataLoading] = useState(true);

  // Upload state machine: idle | analyzing | review | confirming
  const [phase, setPhase] = useState('idle');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [uploadError, setUploadError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const loadAll = useCallback(async () => {
    setDataLoading(true);
    try {
      const [sup, tx, sum] = await Promise.all([
        getSuppliers(token),
        getTransactions(token),
        getFinancialSummary(token),
      ]);
      setSuppliers(sup);
      setTransactions(tx);
      setSummary(sum);
    } catch { /* silent — UI shows empty state */ }
    finally { setDataLoading(false); }
  }, [token]);

  useEffect(() => { loadAll(); }, [loadAll]);

  // ── Upload pipeline ──────────────────────────────────────────────────────────
  const handleFile = async (file) => {
    setPhase('analyzing');
    setUploadError('');
    try {
      const result = await analyzeDocument(file, token);
      setAnalysisResult(result);
      setPhase('review');
    } catch (err) {
      setUploadError(err.message);
      setPhase('idle');
    }
  };

  const handleConfirm = async (data) => {
    setPhase('confirming');
    try {
      const { isNewSupplier, supplier, transaction } = await confirmDocument(data, token);
      setPhase('idle');
      setAnalysisResult(null);
      const typeLabel = transaction.type === 'invoice' ? t('finance.invoice') : t('finance.payment');
      const newLabel = isNewSupplier ? ` — new supplier "${supplier.name}" created` : '';
      setSuccessMsg(`${typeLabel} of ${fmt(transaction.amount)} from ${supplier.name} recorded.${newLabel}`);
      setTimeout(() => setSuccessMsg(''), 6000);
      await loadAll();
    } catch (err) {
      setUploadError(err.message);
      setPhase('review'); // stay on review so user can try again
    }
  };

  const handleCancelUpload = () => {
    setPhase('idle');
    setAnalysisResult(null);
    setUploadError('');
  };

  const handleDeleteTx = async (tx) => {
    if (!window.confirm(t('finance.deleteConfirm', { type: tx.type, amount: fmt(tx.amount), supplier: tx.supplierName }))) return;
    try {
      await deleteTransaction(tx.id, token);
      await loadAll();
    } catch { /* ignore */ }
  };

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">{t('finance.title')}</h1>
          <p className="text-sm text-muted mt-0.5">{t('finance.subtitle')}</p>
        </div>
        <button
          onClick={loadAll}
          disabled={dataLoading}
          className="p-2 border border-gray-200 rounded-xl text-muted hover:bg-gray-50 transition-colors disabled:opacity-40"
          title={t('finance.refresh')}
        >
          <RefreshCw className={`w-4 h-4 ${dataLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={TrendingDown} label={t('finance.totalDebt')} value={fmt(summary?.totalDebt)} color="red" />
        <StatCard icon={TrendingUp} label={t('finance.totalPaid')} value={fmt(summary?.totalPaid)} color="green" />
        <StatCard icon={Users} label={t('finance.suppliersLabel')} value={suppliers.length} color="blue" />
        <StatCard icon={FileText} label={t('finance.transactionsLabel')} value={transactions.length} color="amber" />
      </div>

      {/* Success Banner */}
      {successMsg && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-800 px-5 py-3.5 rounded-2xl text-sm font-medium">
          <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
          {successMsg}
        </div>
      )}

      {/* Error Banner */}
      {uploadError && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-5 py-3.5 rounded-2xl text-sm font-medium">
          <AlertCircle className="w-5 h-5 shrink-0" />
          {uploadError}
          <button onClick={() => setUploadError('')} className="ms-auto text-red-400 hover:text-red-600">
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── AI Upload / Confirmation Zone ── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-accent" />
          <h2 className="text-sm font-semibold text-primary">{t('finance.aiProcessor')}</h2>
        </div>

        {phase === 'idle' && (
          <UploadZone onFile={handleFile} analyzing={false} />
        )}
        {phase === 'analyzing' && (
          <UploadZone onFile={() => {}} analyzing={true} />
        )}
        {(phase === 'review' || phase === 'confirming') && analysisResult && (
          <ConfirmCard
            result={analysisResult}
            onConfirm={handleConfirm}
            onCancel={handleCancelUpload}
            confirming={phase === 'confirming'}
          />
        )}
      </div>

      {/* ── Bottom Two Columns ── */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Supplier Ledger */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-primary">{t('finance.supplierLedger')}</h2>
            <span className="text-xs text-muted">{t('finance.suppliersCount', { count: suppliers.length })}</span>
          </div>

          {dataLoading ? (
            <div className="p-5 space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-10 bg-gray-50 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : suppliers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-muted">
              <Users className="w-8 h-8 mb-2 opacity-40" />
              <p className="text-sm">{t('finance.noSuppliers')}</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50 max-h-80 overflow-y-auto">
              {suppliers.map((s) => (
                <div key={s.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50/50 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-primary">{s.name}</p>
                    {s.email && <p className="text-xs text-muted mt-0.5">{s.email}</p>}
                  </div>
                  <div className="text-end">
                    <p className={`text-sm font-bold ${s.currentBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {s.currentBalance > 0 ? `−${fmt(s.currentBalance)}` : t('finance.settled')}
                    </p>
                    {s.currentBalance > 0 && (
                      <p className="text-xs text-muted">{t('finance.outstanding')}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-primary">{t('finance.recentActivity')}</h2>
            <span className="text-xs text-muted">{t('finance.transactionsCount', { count: transactions.length })}</span>
          </div>

          {dataLoading ? (
            <div className="p-5 space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-10 bg-gray-50 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-muted">
              <FileText className="w-8 h-8 mb-2 opacity-40" />
              <p className="text-sm">{t('finance.noTransactions')}</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50 max-h-80 overflow-y-auto">
              {transactions.slice(0, 20).map((tx) => (
                <div key={tx.id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50/50 transition-colors group">
                  {/* Type indicator */}
                  <div className={`w-1.5 h-8 rounded-full shrink-0 ${tx.type === 'invoice' ? 'bg-red-400' : 'bg-green-400'}`} />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        tx.type === 'invoice' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
                      }`}>
                        {tx.type === 'invoice' ? t('finance.invoice') : t('finance.payment')}
                      </span>
                      <span className="text-xs text-muted">{fmtDate(tx.transactionDate)}</span>
                    </div>
                    <p className="text-sm font-medium text-primary mt-0.5 truncate">{tx.supplierName}</p>
                    {tx.referenceNumber && (
                      <p className="text-xs text-muted truncate">{tx.referenceNumber}</p>
                    )}
                  </div>

                  <div className="text-end shrink-0 flex items-center gap-2">
                    <div>
                      <p className={`text-sm font-bold ${tx.type === 'invoice' ? 'text-red-600' : 'text-green-600'}`}>
                        {tx.type === 'invoice' ? '−' : '+'}{fmt(tx.amount)}
                      </p>
                      {tx.filePath && (
                        <a
                          href={`/api/finance/file/${tx.filePath.split('/').pop()}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={e => e.stopPropagation()}
                          className="flex items-center gap-1 text-xs text-accent hover:underline justify-end mt-0.5"
                        >
                          <ExternalLink className="w-3 h-3" />
                          {t('finance.doc')}
                        </a>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteTx(tx)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-muted hover:text-red-500 hover:bg-red-50 transition-all"
                      title={t('finance.deleteTitle')}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
              {transactions.length > 20 && (
                <div className="px-5 py-3 text-center">
                  <span className="text-xs text-muted flex items-center justify-center gap-1">
                    <ChevronRight className="w-3 h-3 rtl:rotate-180" />
                    {t('finance.moreTransactions', { count: transactions.length - 20 })}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
