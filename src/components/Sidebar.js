import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Sidebar.module.css';

const Sidebar = ({ setActiveSection, activeSection, isOpen, toggleSidebar }) => {
  const sections = ["Dashboard", "Leads", "Subscriptions", "Notifications", "Payments", "Orders", "Subscription Plan", "Uploads"];

  return (
    <div className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
      <div className={styles.header}>
        <span className={styles.title}>AI Admin</span>
        <button className={styles.hamburger} onClick={toggleSidebar} aria-label={isOpen ? 'Close sidebar' : 'Open sidebar'}>
          <svg className={styles.hamburgerIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
            />
          </svg>
        </button>
      </div>
      <nav className={styles.nav}>
        {sections.map((section) => (
          <Link
            key={section}
            to={`/${section.toLowerCase()}`}
            className={`${styles.navItem} ${activeSection === section.toLowerCase() ? styles.active : ''}`}
            onClick={() => {
              setActiveSection(section.toLowerCase());
             // Close sidebar on link click for all screens
            }}
          >
            <span className={styles.navText}>{section}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;