import { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './Notifications.module.css';

const Notifications = () => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [notificationHistory, setNotificationHistory] = useState([]);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    const mockHistory = [
      {
        id: 1,
        title: 'Welcome!',
        message: 'This is a test message for all users',
        sentAt: '2025-01-01 10:00:00',
      },
    ];
    setNotificationHistory(mockHistory);
  }, []);

  const sendNotification = async () => {
    if (!title.trim() || !message.trim()) {
      alert('Please enter both title and message');
      return;
    }

    setSending(true);

    try {
      const res = await axios.post('http://test.soheru.me:5000/api/notifications/send-notification', {
        title,
        message,
      });

      console.log('Notification sent:', res.data);

      const newNotification = {
        id: notificationHistory.length + 1,
        title,
        message,
        sentAt: new Date().toISOString(),
      };

      setNotificationHistory([newNotification, ...notificationHistory]);

      setTitle('');
      setMessage('');
      setShowPreview(false);

      alert(`Notification sent to ${res.data.successCount || 'all'} users!`);
    } catch (error) {
      console.error('Send error:', error);
      alert('Failed to send notification.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>🔔 Push Notifications</h1>
        <p className={styles.subtitle}>Send messages to all subscribed users</p>
      </header>

      <div className={styles.card}>
        <div className={styles.form}>
          <label htmlFor="title" className={styles.label}>
            Title *
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={styles.input}
            maxLength={100}
            placeholder="Enter notification title"
            aria-required="true"
          />

          <label htmlFor="message" className={styles.label}>
            Message *
          </label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className={styles.textarea}
            rows="4"
            maxLength={500}
            placeholder="Enter notification message"
            aria-required="true"
          />

          <div className={styles.actions}>
            <button
              onClick={() => setShowPreview(true)}
              className={styles.previewButton}
              disabled={!title.trim() || !message.trim()}
              aria-label="Preview notification"
            >
              👁️ Preview
            </button>
            <button
              onClick={sendNotification}
              disabled={sending || !title.trim() || !message.trim()}
              className={styles.sendButton}
              aria-label="Send notification"
            >
              {sending ? 'Sending...' : '📤 Send Notification'}
            </button>
          </div>
        </div>
      </div>

      {showPreview && (
        <div className={styles.previewModal}>
          <div className={styles.previewContent}>
            <h3 className={styles.previewTitle}>Notification Preview</h3>
            <div className={styles.previewCard}>
              <strong>{title || 'No Title'}</strong>
              <p>{message || 'No Message'}</p>
            </div>
            <button
              onClick={() => setShowPreview(false)}
              className={styles.closeButton}
              aria-label="Close preview"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <div className={styles.historyCard}>
        <h2 className={styles.historyTitle}>Notification History</h2>
        {notificationHistory.length === 0 ? (
          <p className={styles.noHistory}>No notifications sent yet.</p>
        ) : (
          <ul className={styles.historyList}>
            {notificationHistory.map((n) => (
              <li key={n.id} className={styles.historyItem}>
                <strong>{n.title}</strong>
                <p>{n.message}</p>
                <small>Sent: {new Date(n.sentAt).toLocaleString()}</small>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Notifications;
