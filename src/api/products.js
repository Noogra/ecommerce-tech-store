const BASE = '/api/products';

export async function fetchProducts(filters = {}) {
  const params = new URLSearchParams();
  if (filters.category) params.set('category', filters.category);
  if (filters.subcategory) params.set('subcategory', filters.subcategory);
  if (filters.featured) params.set('featured', 'true');
  const query = params.toString();
  const res = await fetch(`${BASE}${query ? `?${query}` : ''}`);
  if (!res.ok) throw new Error('Failed to fetch products');
  return res.json();
}

export async function fetchProduct(id) {
  const res = await fetch(`${BASE}/${id}`);
  if (!res.ok) throw new Error('Failed to fetch product');
  return res.json();
}

export async function createProduct(product, token) {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(product),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to create product');
  }
  return res.json();
}

export async function updateProduct(id, product, token) {
  const res = await fetch(`${BASE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(product),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to update product');
  }
  return res.json();
}

export async function deleteProduct(id, token) {
  const res = await fetch(`${BASE}/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to delete product');
  return res.json();
}

export async function bulkUploadProducts(productsData, token) {
  const res = await fetch(`${BASE}/bulk`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(productsData),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to upload products');
  }
  return res.json();
}

// Inventory management functions
export async function updateProductStock(id, stock_quantity, token) {
  const res = await fetch(`${BASE}/${id}/stock`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ stock_quantity }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to update stock');
  }

  return res.json();
}

export async function fetchInventory(token) {
  const res = await fetch(`${BASE}/inventory`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error('Failed to fetch inventory');
  return res.json();
}
