import React, { useState } from 'react';
import styles from './Payments.module.css';

const Payments = () => {
  // State for payments data
  const [payments, setPayments] = useState([
    { id: 1, user: 'Ayush', amount: '₹199', date: '2024-06-01' },
    { id: 2, user: 'Ravi', amount: '₹299', date: '2024-06-10' },
    { id: 3, user: 'Anjali', amount: '₹99', date: '2024-06-20' },
  ]);

  // Handle Delete
  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this payment?')) {
      setPayments(payments.filter((p) => p.id !== id));
    }
  };

  // Handle Edit (Simulated with alert)
  const handleEdit = (payment) => {
    alert(`Editing payment for ${payment.user} (${payment.amount}, ${payment.date})`);
    // In a real app, this could open a modal with a form to edit payment details
    console.log('Edit payment:', payment);
  };

  return (
    <div className={styles.paymentsContainer}>
      <h2 className={styles.paymentsTitle}>Payments</h2>
      <div className={styles.tableWrapper}>
        <table className={styles.paymentsTable}>
          <thead>
            <tr className={styles.tableHeader}>
              <th className={styles.tableCell}>ID</th>
              <th className={styles.tableCell}>User</th>
              <th className={styles.tableCell}>Amount</th>
              <th className={styles.tableCell}>Date</th>
   
            </tr>
          </thead>
          <tbody>
            {payments.length === 0 ? (
              <tr>
                <td colSpan="5" className={styles.noData}>
                  No payments available
                </td>
              </tr>
            ) : (
              payments.map((p) => (
                <tr key={p.id} className={styles.tableRow}>
                  <td className={styles.tableCell}>{p.id}</td>
                  <td className={styles.tableCell}>{p.user}</td>
                  <td className={styles.tableCell}>{p.amount}</td>
                  <td className={styles.tableCell}>{p.date}</td>
               
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Payments;