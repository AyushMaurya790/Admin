import React, { useState, useEffect } from 'react';
import styles from './SubscriptionPlan.module.css';



const SubscriptionPlan = () => {
  const [plans, setPlans] = useState([]);
  const [form, setForm] = useState({
    planName: '', price: '', durationDays: '', currency: '', isActive: true, features: '', isMostPopular: false, startDate: '', endDate: ''
  });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [editingId, setEditingId] = useState(null);

  // Fetch all plans
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await fetch('http://test.soheru.me:5000/api/subscriptions/plans/admin');
        const data = await res.json();
        setPlans(Array.isArray(data) ? data : []);
        setError('');
      } catch (err) {
        setError('Failed to fetch plans. Please try again later.');
      }
    };
    fetchPlans();
  }, []);

  // Handle Delete
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this plan?')) {
      setDeletingId(id);
      try {
        const res = await fetch(`http://test.soheru.me:5000/api/subscriptions/plans/admin/${id}`, { method: 'DELETE' });
        if (res.ok) {
          setPlans(plans.filter((p) => p._id !== id));
          setError('');
        } else {
          setError('Failed to delete plan.');
        }
      } catch (err) {
        setError('Failed to delete plan. Please try again.');
      } finally {
        setDeletingId(null);
      }
    }
  };

  // Handle Edit
  const handleEdit = async (plan) => {
    const newPlanName = prompt('Enter new plan name:', plan.planName);
    const newPrice = prompt('Enter new price:', plan.price);
    const newDuration = prompt('Enter new duration days:', plan.durationDays);
    const newCurrency = prompt('Enter new currency:', plan.currency || '');
    const newIsActive = window.confirm('Is the plan active? (OK = Yes, Cancel = No)');
    const newFeatures = prompt('Enter features (comma separated):', Array.isArray(plan.features) ? plan.features.join(', ') : '');
    const newIsMostPopular = window.confirm('Is this the most popular plan? (OK = Yes, Cancel = No)');
    const newStartDate = prompt('Enter new start date (YYYY-MM-DD):', plan.startDate ? plan.startDate.slice(0,10) : '');
    const newEndDate = prompt('Enter new end date (YYYY-MM-DD):', plan.endDate ? plan.endDate.slice(0,10) : '');
    if (newPlanName && newPrice && newDuration && newStartDate && newEndDate) {
      setEditingId(plan._id);
      try {
        const res = await fetch(`http://test.soheru.me:5000/api/subscriptions/plans/admin/${plan._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            planName: newPlanName,
            price: newPrice,
            durationDays: newDuration,
            currency: newCurrency,
            isActive: newIsActive,
            features: newFeatures.split(',').map(f => f.trim()).filter(Boolean),
            isMostPopular: newIsMostPopular,
            startDate: newStartDate,
            endDate: newEndDate
          })
        });
        if (res.ok) {
          setPlans(plans.map(p => p._id === plan._id ? { ...p, planName: newPlanName, price: newPrice, durationDays: newDuration, currency: newCurrency, isActive: newIsActive, features: newFeatures.split(',').map(f => f.trim()).filter(Boolean), isMostPopular: newIsMostPopular, startDate: newStartDate, endDate: newEndDate } : p));
          setError('');
        } else {
          setError('Failed to update plan.');
        }
      } catch (err) {
        setError('Failed to update plan. Please try again.');
      } finally {
        setEditingId(null);
      }
    } else {
      setError('All fields are required to update the plan.');
    }
  };

  // Handle Add
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');
    try {
      // Remove userId from the POST body
      const { userId, ...postData } = form;
      const res = await fetch('http://test.soheru.me:5000/api/subscriptions/plans/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...postData,
          features: form.features.split(',').map(f => f.trim()).filter(Boolean)
        })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(data.message || 'Plan created successfully!');
        setPlans([...plans, data.plan]);
        setForm({ planName: '', price: '', durationDays: '', currency: '', isActive: true, features: '', isMostPopular: false, startDate: '', endDate: '' });
      } else {
        setError(data.error || 'Failed to create plan.');
      }
    } catch (err) {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.subscriptionPlanContainer}>
      <h2 className={styles.subscriptionPlanTitle}>Subscription Plans</h2>
      <form onSubmit={handleSubmit}>
        <label>Plan Name*<input name="planName" value={form.planName} onChange={handleChange} required className={styles.inputField} /></label>
        <label>Price*<input name="price" type="number" value={form.price} onChange={handleChange} required className={styles.inputField} /></label>
        <label>Duration Days*<input name="durationDays" type="number" value={form.durationDays} onChange={handleChange} required className={styles.inputField} /></label>
        <label>Currency<input name="currency" value={form.currency} onChange={handleChange} className={styles.inputField} /></label>
        <label>Is Active<input name="isActive" type="checkbox" checked={form.isActive} onChange={handleChange} className={styles.checkbox} /></label>
        <label>Features (comma separated)<input name="features" value={form.features} onChange={handleChange} className={styles.inputField} /></label>
        <label>Most Popular<input name="isMostPopular" type="checkbox" checked={form.isMostPopular} onChange={handleChange} className={styles.checkbox} /></label>
        <label>Start Date*<input name="startDate" type="date" value={form.startDate} onChange={handleChange} required className={styles.inputField} /></label>
        <label>End Date*<input name="endDate" type="date" value={form.endDate} onChange={handleChange} required className={styles.inputField} /></label>
        <button type="submit" disabled={loading} className={styles.editButton}>{loading ? 'Adding...' : 'Add Plan'}</button>
      </form>
      {message && <div style={{ color: 'green', marginTop: 10 }}>{message}</div>}
      {error && <div style={{ color: 'red', marginTop: 10 }}>{error}</div>}
      <div className={styles.tableWrapper}>
        <table className={styles.subscriptionPlanTable}>
          <thead>
            <tr className={styles.tableHeader}>
              <th className={styles.tableCell}>Plan Name</th>
              <th className={styles.tableCell}>Price</th>
              <th className={styles.tableCell}>Duration</th>
              <th className={styles.tableCell}>Start</th>
              <th className={styles.tableCell}>End</th>
              <th className={styles.tableCell}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {plans.length === 0 ? (
              <tr>
                <td colSpan="6" className={styles.noData}>No plans found.</td>
              </tr>
            ) : (
              plans.map((plan) => (
                <tr key={plan._id} className={styles.tableRow}>
                  <td className={styles.tableCell}>{plan.planName}</td>
                  <td className={styles.tableCell}>{plan.price}</td>
                  <td className={styles.tableCell}>{plan.durationDays}</td>
                  <td className={styles.tableCell}>{plan.startDate ? plan.startDate.slice(0,10) : ''}</td>
                  <td className={styles.tableCell}>{plan.endDate ? plan.endDate.slice(0,10) : ''}</td>
                  <td className={styles.tableCell}>
                    <button
                      onClick={() => handleEdit(plan)}
                      className={styles.editButton}
                      disabled={editingId === plan._id || deletingId === plan._id}
                    >
                      {editingId === plan._id ? 'Editing...' : 'Edit'}
                    </button>
                    <button
                      onClick={() => handleDelete(plan._id)}
                      className={styles.deleteButton}
                      disabled={editingId === plan._id || deletingId === plan._id}
                    >
                      {deletingId === plan._id ? 'Deleting...' : 'Delete'}
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

export default SubscriptionPlan;
