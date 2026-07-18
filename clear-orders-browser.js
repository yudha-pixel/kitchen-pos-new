// Copy and paste this script into the browser console (F12 -> Console)
// This will clear all orders from IndexedDB

(async function clearOrders() {
  try {
    const request = indexedDB.open('kitchen-pos-db', 1);
    
    request.onsuccess = async (event) => {
      const db = event.target.result;
      
      // Clear orders table
      const ordersTx = db.transaction('orders', 'readwrite');
      const ordersStore = ordersTx.objectStore('orders');
      await new Promise((resolve, reject) => {
        const request = ordersStore.clear();
        request.onsuccess = resolve;
        request.onerror = reject;
      });
      console.log('✅ Orders table cleared');
      
      // Clear order_items table
      const itemsTx = db.transaction('order_items', 'readwrite');
      const itemsStore = itemsTx.objectStore('order_items');
      await new Promise((resolve, reject) => {
        const request = itemsStore.clear();
        request.onsuccess = resolve;
        request.onerror = reject;
      });
      console.log('✅ Order items table cleared');
      
      db.close();
      console.log('✅ All transaction data cleared successfully');
      console.log('✅ Refresh the page to see the changes');
    };
    
    request.onerror = (event) => {
      console.error('❌ Error opening database:', event.target.error);
    };
  } catch (error) {
    console.error('❌ Error:', error);
  }
})();
