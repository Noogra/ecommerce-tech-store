const testOrder = {
  customerFirstName: 'John',
  customerLastName: 'Doe',
  customerEmail: 'john@example.com',
  shippingAddress: '123 Main St',
  shippingCity: 'New York',
  shippingZip: '10001',
  paymentMethod: 'card',
  items: [
    {
      id: 1,
      name: 'Test Product',
      brand: 'Test Brand',
      price: 100,
      image: 'https://via.placeholder.com/150',
      quantity: 2,
      category: 'mobile-phones',
      specs: ['6.1" display', '128GB']
    }
  ],
  subtotal: 200,
  tax: 20,
  shipping: 0,
  total: 220,
  customerNote: 'Test order'
};

fetch('http://localhost:3001/api/orders', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(testOrder)
})
  .then(res => res.json())
  .then(data => {
    console.log('✅ Order created successfully!');
    console.log('Order Number:', data.orderNumber);
    console.log('Order ID:', data.id);
    console.log('Customer:', data.customerFirstName, data.customerLastName);
  })
  .catch(err => {
    console.error('❌ Failed to create order:', err.message);
  });
