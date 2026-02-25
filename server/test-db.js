import db from './db.js';

console.log('Checking tables...');
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log('Tables:', tables.map(t => t.name));

const ordersCount = db.prepare('SELECT COUNT(*) as count FROM orders').get();
console.log('Orders table exists! Row count:', ordersCount.count);

const orderItemsCount = db.prepare('SELECT COUNT(*) as count FROM order_items').get();
console.log('Order items table exists! Row count:', orderItemsCount.count);

process.exit(0);
