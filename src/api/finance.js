const BASE = '/api/finance';

// ─── Suppliers ─────────────────────────────────────────────────────────────

export async function getSuppliers(token) {
  const res = await fetch(`${BASE}/suppliers`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error((await res.json()).error || 'Failed to load suppliers');
  return res.json();
}

export async function createSupplier(data, token) {
  const res = await fetch(`${BASE}/suppliers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error((await res.json()).error || 'Failed to create supplier');
  return res.json();
}

export async function updateSupplier(id, data, token) {
  const res = await fetch(`${BASE}/suppliers/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error((await res.json()).error || 'Failed to update supplier');
  return res.json();
}

export async function deleteSupplier(id, token) {
  const res = await fetch(`${BASE}/suppliers/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error((await res.json()).error || 'Failed to delete supplier');
  return res.json();
}

// ─── Transactions ───────────────────────────────────────────────────────────

export async function getTransactions(token, { supplierId, type } = {}) {
  const params = new URLSearchParams();
  if (supplierId) params.set('supplierId', supplierId);
  if (type) params.set('type', type);
  const res = await fetch(`${BASE}/transactions?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error((await res.json()).error || 'Failed to load transactions');
  return res.json();
}

export async function createTransaction(data, file, token) {
  const form = new FormData();
  Object.entries(data).forEach(([k, v]) => { if (v !== undefined && v !== null) form.append(k, v); });
  if (file) form.append('file', file);

  const res = await fetch(`${BASE}/transactions`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  if (!res.ok) throw new Error((await res.json()).error || 'Failed to create transaction');
  return res.json();
}

export async function deleteTransaction(id, token) {
  const res = await fetch(`${BASE}/transactions/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error((await res.json()).error || 'Failed to delete transaction');
  return res.json();
}

// ─── AI Document Pipeline ───────────────────────────────────────────────────

export async function analyzeDocument(file, token) {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(`${BASE}/analyze`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to analyze document');
  }
  return res.json();
}

export async function confirmDocument(data, token) {
  const res = await fetch(`${BASE}/confirm`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to confirm document');
  }
  return res.json();
}

// ─── Summary ────────────────────────────────────────────────────────────────

export async function getFinancialSummary(token) {
  const res = await fetch(`${BASE}/summary`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error((await res.json()).error || 'Failed to load financial summary');
  return res.json();
}
