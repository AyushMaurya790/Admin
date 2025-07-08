import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './Subscriptions.module.css';

const Subscriptions = () => {
  // State for subscriptions data, error, and loading
  const [subscriptions, setSubscriptions] = useState([]);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [editingId, setEditingId] = useState(null); // Track which subscription is being edited

  // Fetch subscriptions from API on component mount
  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        const response = await axios.get('http://test.soheru.me:5000/api/subscriptions/all', {
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const formattedSubscriptions = response.data.map(sub => ({
          id: sub._id,
          user: sub.User,
          plan: sub.Plan,
          status: sub.Status,
        }));
        setSubscriptions(formattedSubscriptions);
        setError('');
      } catch (err) {
        console.error('Error fetching subscriptions:', err);
        setError('Failed to fetch subscriptions. Please try again later.');
        setSubscriptions([
          { id: '685d1ab405b237184d5571c9', user: 'Raj', plan: 'Pro', status: 'Active' },
          { id: '685d1ab405b237184d5571c0', user: 'Sunny', plan: 'Pro', status: 'Active' },
          { id: '685d1ab405b237184d5571c1', user: 'Priya', plan: 'Pro', status: 'Active' },
        ]);
      }
    };
    fetchSubscriptions();
  }, []);

  // Handle Delete
 // Handle Delete
const handleDelete = async (id) => {
  if (window.confirm('Are you sure you want to delete this subscription?')) {
    setDeletingId(id);
    try {
      const response = await axios.delete(`http://test.soheru.me:5000/api/subscriptions/delete-subscription/${id}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.status === 200 || response.status === 204) {
        setSubscriptions(subscriptions.filter((sub) => sub.id !== id));
        setError('');
      } else {
        throw new Error(`Unexpected response status: ${response.status}`);
      }
    } catch (err) {
      console.error('Error deleting subscription:', err);
      if (err.response?.status === 404) {
        setError('Subscription not found. It may have already been deleted.');
      } else if (err.response?.status === 500) {
        setError('Server error. Please try again later.');
      } else {
        setError('Failed to delete subscription. Please try again.');
      }
    } finally {
      setDeletingId(null);
    }
  }
};
  // Handle Edit
  const handleEdit = async (sub) => {
    const newUser = prompt('Enter new user:', sub.user);
    const newPlan = prompt('Enter new plan:', sub.plan);
    const newStatus = prompt('Enter new status (Active/Expired):', sub.status);
    if (newUser && newPlan && newStatus) {
      setEditingId(sub.id);
      try {
        const response = await axios.put(`http://test.soheru.me:5000/api/subscriptions/all/${sub.id}`, {
          User: newUser,
          Plan: newPlan,
          Status: newStatus,
        }, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
        if (response.status === 200 || response.status === 204) {
          setSubscriptions(subscriptions.map(s => s.id === sub.id ? { ...s, user: newUser, plan: newPlan, status: newStatus } : s));
          setError('');
        } else {
          throw new Error(`Unexpected response status: ${response.status}`);
        }
      } catch (err) {
        console.error('Error updating subscription:', err);
        if (err.response?.status === 404) {
          setError('Subscription not found. It may have been deleted.');
        } else if (err.response?.status === 400) {
          setError('Invalid data provided. Please check the user, plan, or status.');
        } else if (err.response?.status === 500) {
          setError('Server error. Please try again later.');
        } else {
          setError('Failed to update subscription. Please try again.');
        }
      } finally {
        setEditingId(null);
      }
    } else {
      setError('User, plan, and status are required to update the subscription.');
    }
  };

  return (
    <div className={styles.subscriptionsContainer}>
      <h2 className={styles.subscriptionsTitle}>Subscribers Soch AI</h2>
      {error && (
        <div className={styles.errorMessage}>
          {error}
        </div>
      )}
      <div className={styles.tableWrapper}>
        <table className={styles.subscriptionsTable}>
          <thead>
            <tr className={styles.tableHeader}>
              <th className={styles.tableCell}>ID</th>
              <th className={styles.tableCell}>User</th>
              <th className={styles.tableCell}>Plan</th>
              <th className={styles.tableCell}>Status</th>
              <th className={styles.tableCell}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {subscriptions.length === 0 ? (
              <tr>
                <td colSpan="5" className={styles.noData}>
                  No subscriptions available
                </td>
              </tr>
            ) : (
              subscriptions.map((sub) => (
                <tr key={sub.id} className={styles.tableRow}>
                  <td className={styles.tableCell}>{sub.id}</td>
                  <td className={styles.tableCell}>{sub.user}</td>
                  <td className={styles.tableCell}>{sub.plan}</td>
                  <td className={styles.tableCell}>
                    <span
                      className={
                        sub.status === 'Active'
                          ? styles.statusActive
                          : styles.statusExpired
                      }
                    >
                      {sub.status}
                    </span>
                  </td>
                  <td className={styles.tableCell}>
                    <button
                      onClick={() => handleEdit(sub)}
                      className={styles.editButton}
                      disabled={editingId === sub.id || deletingId === sub.id}
                    >
                      {editingId === sub.id ? 'Editing...' : 'Edit'}
                    </button>
                    <button
                      onClick={() => handleDelete(sub.id)}
                      className={styles.deleteButton}
                      disabled={editingId === sub.id || deletingId === sub.id}
                    >
                      {deletingId === sub.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Subscriptions;