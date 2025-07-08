import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './Orders.module.css';

const Orders = () => {
  // State for orders data, raw API response, error, and loading
  const [orders, setOrders] = useState([]);
  const [rawOrders, setRawOrders] = useState([]); // Store raw API response for debugging
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [editingId, setEditingId] = useState(null);

  // Fetch orders from API on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const ordersResponse = await axios.get('http://test.soheru.me:5000/api/orders', {
          headers: { 'Content-Type': 'application/json' },
        });
        console.log('Raw orders response:', ordersResponse.data);
        console.log('Orders field names:', ordersResponse.data.length > 0 ? Object.keys(ordersResponse.data[0]) : 'No data');
        
        // Store raw response for debug table
        setRawOrders(ordersResponse.data);
        
        // Map orders, trying various field names
        const formattedOrders = ordersResponse.data.map(order => ({
          id: order._id || order.id || 'unknown',
          user: order.user || order.User || order.userId || order.userName || order.customer || order.customerId || order.customerName || 'unknown',
          product: order.product || order.Product || order.productId || order.productName || order.item || order.itemName || 'unknown',
          date: order.date || order.Date || order.orderDate || 'N/A',
        }));
        setOrders(formattedOrders);
        console.log('Formatted orders:', formattedOrders);

        setError('');
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to fetch orders. Showing fallback data.');
        setOrders([
          { id: '1', user: 'Ayush', product: 'AI Course', date: '2024-06-01' },
          { id: '2', user: 'Ayush', product: 'eBook', date: '2024-06-02' },
          { id: '3', user: 'Amna', product: 'GPT Tool', date: '2024-06-03' },
        ]);
        setRawOrders([
          { _id: '1', user: 'Ayush', product: 'AI Course', date: '2024-06-01' },
          { _id: '2', user: 'Ayush', product: 'eBook', date: '2024-06-02' },
          { _id: '3', user: 'Amna', product: 'GPT Tool', date: '2024-06-03' },
        ]);
      }
    };
    fetchData();
  }, []);

  // Handle Delete
  const handleDelete = async (id) => {
    if (id === 'unknown') {
      setError('Cannot delete order with unknown ID.');
      return;
    }
    if (window.confirm('Are you sure you want to delete this order?')) {
      setDeletingId(id);
      try {
        const response = await axios.delete(`http://test.soheru.me:5000/api/orders/${id}`, {
          headers: { 'Content-Type': 'application/json' },
        });
        if (response.status === 200 || response.status === 204) {
          setOrders(orders.filter((order) => order.id !== id));
          setRawOrders(rawOrders.filter((order) => order._id !== id));
          setError('');
        } else {
          throw new Error(`Unexpected response status: ${response.status}`);
        }
      } catch (err) {
        console.error('Error deleting order:', err);
        if (err.response?.status === 404) {
          setError('Order not found. It may have already been deleted.');
        } else if (err.response?.status === 500) {
          setError('Server error. Please try again later.');
        } else {
          setError('Failed to delete order. Please try again.');
        }
      } finally {
        setDeletingId(null);
      }
    }
  };

  // Handle Edit
  const handleEdit = async (order) => {
    if (order.id === 'unknown') {
      setError('Cannot edit order with unknown ID.');
      return;
    }
    const newUser = prompt('Enter new user:', order.user !== 'unknown' ? order.user : '');
    const newProduct = prompt('Enter new product:', order.product !== 'unknown' ? order.product : '');
    const newDate = prompt('Enter new date (YYYY-MM-DD):', order.date !== 'N/A' ? order.date : '');
    if (newUser && newProduct && newDate) {
      setEditingId(order.id);
      try {
        const response = await axios.put(`http://test.soheru.me:5000/api/orders/${order.id}`, {
          user: newUser,
          product: newProduct,
          date: newDate,
        }, {
          headers: { 'Content-Type': 'application/json' },
        });
        if (response.status === 200 || response.status === 204) {
          setOrders(orders.map(o => o.id === order.id ? { ...o, user: newUser, product: newProduct, date: newDate } : o));
          setRawOrders(rawOrders.map(o => o._id === order.id ? { ...o, user: newUser, product: newProduct, date: newDate } : o));
          setError('');
        } else {
          throw new Error(`Unexpected response status: ${response.status}`);
        }
      } catch (err) {
        console.error('Error updating order:', err);
        if (err.response?.status === 404) {
          setError('Order not found. It may have been deleted.');
        } else if (err.response?.status === 400) {
          setError('Invalid data provided. Please check the user, product, or date.');
        } else if (err.response?.status === 500) {
          setError('Server error. Please try again later.');
        } else {
          setError('Failed to update order. Please try again.');
        }
      } finally {
        setEditingId(null);
      }
    } else {
      setError('User, product, and date are required to update the order.');
    }
  };

  return (
    <div className={styles.ordersContainer}>
      <h2 className={styles.ordersTitle}>Orders</h2>
      {error && (
        <div className={styles.errorMessage}>
          {error}
        </div>
      )}
      <div className={styles.tableWrapper}>
        <h3>Main Orders Table</h3>
        <table className={styles.ordersTable}>
          <thead>
            <tr className={styles.tableHeader}>
              <th className={styles.tableCell}>ID</th>
              <th className={styles.tableCell}>User</th>
              <th className={styles.tableCell}>Product</th>
              <th className={styles.tableCell}>Date</th>
              <th className={styles.tableCell}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan="5" className={styles.noData}>
                  No orders available
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className={styles.tableRow}>
                  <td className={styles.tableCell}>{order.id}</td>
                  <td className={styles.tableCell}>{order.user === 'unknown' ? 'Unknown User' : order.user}</td>
                  <td className={styles.tableCell}>{order.product === 'unknown' ? 'Unknown Product' : order.product}</td>
                  <td className={styles.tableCell}>{order.date}</td>
                  <td className={styles.tableCell}>
                    <button
                      onClick={() => handleEdit(order)}
                      className={styles.editButton}
                      disabled={editingId === order.id || deletingId === order.id}
                    >
                      {editingId === order.id ? 'Editing...' : 'Edit'}
                    </button>
                    <button
                      onClick={() => handleDelete(order.id)}
                      className={styles.deleteButton}
                      disabled={editingId === order.id || deletingId === order.id}
                    >
                      {deletingId === order.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Debug Table for Raw API Response */}
      {/* <div className={styles.tableWrapper}>
        <h3>Raw API Response (Debug)</h3>
        <table className={styles.ordersTable}>
          <thead>
            <tr className={styles.tableHeader}>
              <th className={styles.tableCell}>Raw Data</th>
            </tr>
          </thead>
          <tbody>
            {rawOrders.length === 0 ? (
              <tr>
                <td className={styles.noData}>No raw data available</td>
              </tr>
            ) : (
              rawOrders.map((order, index) => (
                <tr key={index} className={styles.tableRow}>
                  <td className={styles.tableCell}>
                    {JSON.stringify(order, null, 2)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div> */}
    </div>
  );
};

export default Orders;