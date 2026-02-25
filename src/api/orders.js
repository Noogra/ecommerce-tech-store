const BASE = '/api/orders';

export async function createOrder(orderData) {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to create order');
  }
  return res.json();
}

export async function fetchOrders(filters = {}, token) {
  const params = new URLSearchParams();
  if (filters.status) params.set('status', filters.status);
  if (filters.startDate) params.set('startDate', filters.startDate);
  if (filters.endDate) params.set('endDate', filters.endDate);
  if (filters.email) params.set('email', filters.email);

  const query = params.toString();
  const res = await fetch(`${BASE}${query ? `?${query}` : ''}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch orders');
  return res.json();
}

export async function fetchOrderStats(token) {
  const res = await fetch(`${BASE}/stats`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch order stats');
  return res.json();
}

export async function fetchOrder(id, token) {
  const res = await fetch(`${BASE}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch order');
  return res.json();
}

export async function updateOrderStatus(id, status, token) {
  const res = await fetch(`${BASE}/${id}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to update order status');
  }
  return res.json();
}

export async function markOrderAsRead(id, token) {
  const res = await fetch(`${BASE}/${id}/read`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to mark order as read');
  return res.json();
}

export async function markAllOrdersAsRead(token) {
  const res = await fetch(`${BASE}/read-all`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to mark orders as read');
  return res.json();
}

export async function cancelOrder(id, token) {
  const res = await fetch(`${BASE}/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to cancel order');
  }
  return res.json();
}

// Sales reporting functions
export async function fetchSalesStats(token) {
  const res = await fetch(`${BASE}/sales/stats`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error('Failed to fetch sales stats');
  return res.json();
}

export async function fetchSalesTrends(days = 7, token) {
  const res = await fetch(`${BASE}/sales/trends?days=${days}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error('Failed to fetch sales trends');
  return res.json();
}
