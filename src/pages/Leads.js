import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import styles from './Leads.module.css';

// Default placeholder image as base64
const DEFAULT_PROFILE_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHZpZXdCb3g9IjAgMCA1MCA1MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjUwIiBoZWlnaHQ9IjUwIiByeD0iMjUiIGZpbGw9IiNFMEUwRTAiLz4KPHBhdGggZD0iTTI1IDI1QzI3Ljc2MTQgMjUgMzAgMjIuNzYxNCAzMCAyMEMzMCAxNy4yMzg2IDI3Ljc2MTQgMTUgMjUgMTVDMjIuMjM4NiAxNSAyMCAxNy4yMzg2IDIwIDIwQzIwIDIyLjc2MTQgMjIuMjM4NiAyNSAyNSAyNVoiIGZpbGw9IiM5OTk5OTkiLz4KPHBhdGggZD0iTTM1IDM1QzM1IDMxLjY4NjMgMzAuNTIyOCAyOSAyNSAyOUMxOS40NzcyIDI5IDE1IDMxLjY4NjMgMTUgMzVWMzZIMzVWMzVaIiBmaWxsPSIjOTk5OTk5Ii8+Cjwvc3ZnPg==';

// Enhanced image component that handles CORS errors gracefully
const SafeImage = ({ src, alt, className, onError, isProfile = false }) => {
  const [imageSrc, setImageSrc] = useState(DEFAULT_PROFILE_IMAGE);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);

    // Handle null, undefined, empty string, or 'N/A' cases
    if (!src || src === 'N/A' || src === 'null' || (typeof src === 'string' && src.trim() === '')) {
      setImageSrc(DEFAULT_PROFILE_IMAGE);
      setIsLoading(false);
      return;
    }

    // Process the image URL
    let processedSrc = src;
    
    // If it's already a full URL, use it as is
    if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('data:')) {
      processedSrc = src;
    } else {
      // Build the full URL for relative paths
      if (src.startsWith('/')) {
        processedSrc = `http://test.soheru.me:5000${src}`;
      } else if (src.startsWith('uploads/')) {
        processedSrc = `http://test.soheru.me:5000/${src}`;
      } else {
        processedSrc = `http://test.soheru.me:5000/uploads/${src}`;
      }
    }

    // Try to load the image
    const img = new Image();
    img.onload = () => {
      setImageSrc(processedSrc);
      setIsLoading(false);
    };
    img.onerror = () => {
      console.log(`Failed to load image: ${processedSrc}`);
      setImageSrc(DEFAULT_PROFILE_IMAGE);
      setIsLoading(false);
      if (onError) onError();
    };
    img.src = processedSrc;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src, onError]);

  return (
    <div style={{ position: 'relative', width: '50px', height: '50px' }}>
      {isLoading && (
        <div 
          style={{
            position: 'absolute',
            width: '50px',
            height: '50px',
            backgroundColor: '#f0f0f0',
            border: '1px solid #ddd',
            borderRadius: isProfile ? '50%' : '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '8px',
            color: '#999',
            zIndex: 1
          }}
        >
          Loading...
        </div>
      )}
      <img
        src={imageSrc}
        alt={alt}
        className={className}
        style={{
          width: '50px',
          height: '50px',
          objectFit: 'cover',
          borderRadius: isProfile ? '50%' : '4px',
          border: '1px solid #ddd',
          display: 'block',
          backgroundColor: '#f0f0f0'
        }}
      />
    </div>
  );
};

const Leads = () => {
  const { isAuthenticated, logout } = useAuth();
  const [leads, setLeads] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    lastname: '',
    email: '',
    password: '',
    age: '',
    phone: '',
    description: '',
    profileImage: '',
    role: 'user',
    subscription: {
      plan: 'none',
      startDate: '',
      endDate: '',
      isActive: false,
    },
    paymentMethods: '',
  });

  const fetchLeads = async () => {
    try {
      setError('');
      setSuccess('');
      
      console.log('🔄 Fetching leads...');
      const token = localStorage.getItem('adminToken');
      console.log('🔑 Current token in localStorage:', token ? token.substring(0, 20) + '...' : 'NO TOKEN');
      console.log('👤 Current user: bhoomitechzones');
      console.log('🕐 Fetch time: ' + new Date().toISOString());
      
      let response;
      // Try different endpoints to get users
      try {
        console.log('📡 Trying GET /api/users');
        response = await api.get('/users');
        console.log('✅ GET /api/users succeeded');
      } catch (firstError) {
        console.log('❌ GET /api/users failed:', firstError.message);
        try {
          console.log('📡 Trying GET /api/admin/users');
          response = await api.get('/admin/users');
          console.log('✅ GET /api/admin/users succeeded');
        } catch (secondError) {
          console.log('❌ GET /api/admin/users failed:', secondError.message);
          console.log('📡 Trying GET /api/users/all');
          response = await api.get('/users/all');
          console.log('✅ GET /api/users/all succeeded');
        }
      }

      console.log('📊 Full API Response:', JSON.stringify(response.data, null, 2));
      
      // Handle different response formats
      let userData = response.data;
      if (userData.users) {
        userData = userData.users;
        console.log('📋 Using userData.users');
      } else if (userData.data) {
        userData = userData.data;
        console.log('📋 Using userData.data');
      } else if (Array.isArray(userData)) {
        console.log('📋 Using userData directly (array)');
      } else {
        console.warn('⚠️ Unexpected response format:', typeof userData);
      }
      
      if (!Array.isArray(userData)) {
        throw new Error('Response data is not an array');
      }
      
      console.log(`📋 Processing ${userData.length} user records`);
      
      const formattedLeads = userData.map(profile => {
        // Process profile image - handle null, undefined, and empty values
        let profileImage = profile.profileImage || profile.image || profile.profilePicture || profile.avatar;
        
        // Log the original image path for debugging
        if (profileImage) {
          console.log(`🖼️ Processing image for ${profile.name}: ${profileImage}`);
        }
        
        // Check if profileImage is valid
        if (profileImage && 
            profileImage !== 'null' && 
            profileImage !== 'N/A' && 
            typeof profileImage === 'string' && 
            profileImage.trim() !== '') {
          // Keep the image path as is - let SafeImage component handle the URL construction
          console.log(`✅ Valid image path for ${profile.name}: ${profileImage}`);
        } else {
          profileImage = null;
          console.log(`❌ No valid image for ${profile.name}`);
        }

        return {
          id: profile._id || 'N/A',
          name: profile.name || '',
          lastname: profile.lastname || '',
          email: profile.email || '',
          phone: profile.phone || 'N/A',
          age: profile.age || 'N/A',
          description: profile.description || '',
          profileImage: profileImage,
          role: profile.role || 'user',
          subscriptionPlan: profile.subscription?.plan || 'N/A',
          subscriptionStartDate: profile.subscription?.startDate || 'N/A',
          subscriptionEndDate: profile.subscription?.endDate || 'N/A',
          subscriptionIsActive: profile.subscription?.isActive || false,
          paymentMethods: profile.paymentMethods || [],
        };
      });

      setLeads(formattedLeads);
      setError('');
      setSuccess(`✅ Successfully loaded ${formattedLeads.length} profiles.`);
      console.log(`✅ Successfully processed ${formattedLeads.length} profiles at ${new Date().toISOString()}`);
    } catch (err) {
      console.error('💥 Error fetching profiles:', err);
      const errorMsg = err.response?.data?.message || err.message;
      setError(`Failed to fetch profiles: ${errorMsg}. Please try again later.`);
      setLeads([]);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleEditClick = (lead) => {
    if (!lead.id || lead.id === 'N/A') {
      setError('Invalid user ID. Cannot edit this profile.');
      return;
    }
    setEditingId(lead.id);
    setEditFormData({
      name: lead.name,
      lastname: lead.lastname || '',
      email: lead.email,
      password: '',
      age: lead.age || '',
      phone: lead.phone || '',
      description: lead.description || '',
      profileImage: lead.profileImage || '',
      role: lead.role || 'user',
      subscription: {
        plan: lead.subscriptionPlan || 'none',
        startDate: lead.subscriptionStartDate || '',
        endDate: lead.subscriptionEndDate || '',
        isActive: lead.subscriptionIsActive || false,
      },
      paymentMethods: lead.paymentMethods?.join(', ') || '',
    });
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('subscription.')) {
      const subField = name.split('.')[1];
      setEditFormData({
        ...editFormData,
        subscription: {
          ...editFormData.subscription,
          [subField]: value,
        },
      });
    } else {
      setEditFormData({ ...editFormData, [name]: value });
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    const updateData = {
      name: editFormData.name,
      lastname: editFormData.lastname,
      email: editFormData.email,
      ...(editFormData.password && { password: editFormData.password }),
      age: editFormData.age ? parseInt(editFormData.age) : null,
      phone: editFormData.phone,
      description: editFormData.description,
      profileImage: editFormData.profileImage || null,
      role: editFormData.role,
      subscription: {
        plan: editFormData.subscription.plan,
        startDate: editFormData.subscription.startDate || null,
        endDate: editFormData.subscription.endDate || null,
        isActive: editFormData.subscription.isActive === 'true' || editFormData.subscription.isActive,
      },
      paymentMethods: editFormData.paymentMethods ? editFormData.paymentMethods.split(',').map(m => m.trim()) : [],
    };

    console.log('PUT API Payload:', JSON.stringify(updateData, null, 2));

    try {
      let response;
      // Try different update endpoints
      try {
        response = await api.put(`/users/${editingId}`, updateData);
      } catch (firstError) {
        console.log('First update endpoint failed, trying alternative:', firstError.message);
        try {
          response = await api.put(`/users/profile/${editingId}`, updateData);
        } catch (secondError) {
          console.log('Second update endpoint failed, trying third:', secondError.message);
          response = await api.put(`/admin/users/${editingId}`, updateData);
        }
      }

      console.log('PUT API Response:', JSON.stringify(response.data, null, 2));

      if (response.status === 200 || response.status === 204) {
        await fetchLeads();
        setSuccess('Profile updated successfully.');
        setError('');
        setEditingId(null);
        setEditFormData({
          name: '',
          lastname: '',
          email: '',
          password: '',
          age: '',
          phone: '',
          description: '',
          profileImage: '',
          role: 'user',
          subscription: {
            plan: 'none',
            startDate: '',
            endDate: '',
            isActive: false,
          },
          paymentMethods: '',
        });
      } else {
        setError(`Unexpected error: ${response.status}`);
      }
    } catch (err) {
      console.error('Error updating profile:', err.response?.data || err.message);
      if (err.response?.status === 400) {
        setError(`Validation error: ${err.response.data.errors?.map(e => e.msg).join(', ') || 'Invalid data.'}`);
      } else if (err.response?.status === 404) {
        setError('User not found. The profile may have been deleted or the ID is incorrect.');
      } else {
        setError(`Failed to update profile: ${err.response?.data?.message || err.message}. Please try again.`);
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditFormData({
      name: '',
      lastname: '',
      email: '',
      password: '',
      age: '',
      phone: '',
      description: '',
      profileImage: '',
      role: 'user',
      subscription: {
        plan: 'none',
        startDate: '',
        endDate: '',
        isActive: false,
      },
      paymentMethods: '',
    });
  };

  const handleDeleteClick = async (id) => {
    if (!id || id === 'N/A') {
      setError('Invalid user ID. Cannot delete this profile.');
      return;
    }
    if (!window.confirm('Are you sure you want to delete this profile?')) {
      return;
    }

    try {
      console.log('🗑️ Sending DELETE request for user ID:', id);
      
      const response = await api.delete(`/users/profile/${id}`);
      
      console.log('✅ Delete API Response:', response.data);
      
      setLeads(prevLeads => prevLeads.filter(lead => lead.id !== id));
      setSuccess('Profile deleted successfully.');
      setError('');
      
      setTimeout(() => {
        setSuccess('');
      }, 3000);
      
    } catch (err) {
      console.error('❌ Error deleting profile:', err.response || err);
      
      if (err.response?.status === 404) {
        setError('Profile not found. It may have already been deleted.');
        setLeads(prevLeads => prevLeads.filter(lead => lead.id !== id));
      } else if (err.response?.status === 401) {
        setError('Unauthorized. Your session may have expired. Please login again.');
      } else if (err.response?.status === 403) {
        setError('Forbidden. You do not have permission to delete this profile.');
      } else if (err.response?.status === 500) {
        setError('Server error occurred. Please try again later.');
      } else {
        const errorMsg = err.response?.data?.message || err.message || 'Unknown error occurred';
        setError(`Failed to delete profile: ${errorMsg}`);
      }
      
      setTimeout(() => {
        setError('');
      }, 5000);
    }
  };

  return (
    <div className={styles.root}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 className={styles.title}>Profiles</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={fetchLeads}
            className={styles.editButton}
          >
            🔄 Refresh
          </button>
          <button
            onClick={logout}
            className={styles.deleteButton}
          >
            🚪 Logout
          </button>
        </div>
      </div>
      {error && <div className={`${styles.alert} ${styles.alertError}`}>{error}</div>}
      {success && <div className={`${styles.alert} ${styles.alertSuccess}`}>{success}</div>}

      {editingId ? (
        <div className={styles.formContainer}>
          <h3 className="text-xl font-bold mb-4">Edit Profile</h3>
          <form onSubmit={handleEditSubmit}>
            <div className="mb-4">
              <label className={styles.formContainerLabel}>Name</label>
              <input
                type="text"
                name="name"
                value={editFormData.name}
                onChange={handleEditInputChange}
                className={styles.formContainerInput}
                required
              />
            </div>
            <div className="mb-4">
              <label className={styles.formContainerLabel}>Last Name</label>
              <input
                type="text"
                name="lastname"
                value={editFormData.lastname}
                onChange={handleEditInputChange}
                className={styles.formContainerInput}
              />
            </div>
            <div className="mb-4">
              <label className={styles.formContainerLabel}>Email</label>
              <input
                type="email"
                name="email"
                value={editFormData.email}
                onChange={handleEditInputChange}
                className={styles.formContainerInput}
                required
              />
            </div>
            <div className="mb-4">
              <label className={styles.formContainerLabel}>Password (optional)</label>
              <input
                type="password"
                name="password"
                value={editFormData.password}
                onChange={handleEditInputChange}
                className={styles.formContainerInput}
              />
            </div>
            <div className="mb-4">
              <label className={styles.formContainerLabel}>Age</label>
              <input
                type="number"
                name="age"
                value={editFormData.age}
                onChange={handleEditInputChange}
                className={styles.formContainerInput}
              />
            </div>
            <div className="mb-4">
              <label className={styles.formContainerLabel}>Phone</label>
              <input
                type="text"
                name="phone"
                value={editFormData.phone}
                onChange={handleEditInputChange}
                className={styles.formContainerInput}
              />
            </div>
            <div className="mb-4">
              <label className={styles.formContainerLabel}>Description</label>
              <textarea
                name="description"
                value={editFormData.description}
                onChange={handleEditInputChange}
                className={styles.formContainerInput}
              />
            </div>
            <div className="mb-4">
              <label className={styles.formContainerLabel}>Profile Image Path</label>
              <input
                type="text"
                name="profileImage"
                value={editFormData.profileImage}
                onChange={handleEditInputChange}
                className={styles.formContainerInput}
                placeholder="e.g., uploads/profile.jpg or /uploads/profile.jpg"
              />
            </div>
            <div className="mb-4">
              <label className={styles.formContainerLabel}>Role</label>
              <select
                name="role"
                value={editFormData.role}
                onChange={handleEditInputChange}
                className={styles.formContainerInput}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="mb-4">
              <label className={styles.formContainerLabel}>Subscription Plan</label>
              <select
                name="subscription.plan"
                value={editFormData.subscription.plan}
                onChange={handleEditInputChange}
                className={styles.formContainerInput}
              >
                <option value="none">None</option>
                <option value="starter">Starter</option>
                <option value="pro">Pro</option>
                <option value="lifetime">Lifetime</option>
              </select>
            </div>
            <div className="mb-4">
              <label className={styles.formContainerLabel}>Subscription Start Date</label>
              <input
                type="date"
                name="subscription.startDate"
                value={editFormData.subscription.startDate}
                onChange={handleEditInputChange}
                className={styles.formContainerInput}
              />
            </div>
            <div className="mb-4">
              <label className={styles.formContainerLabel}>Subscription End Date</label>
              <input
                type="date"
                name="subscription.endDate"
                value={editFormData.subscription.endDate}
                onChange={handleEditInputChange}
                className={styles.formContainerInput}
              />
            </div>
            <div className="mb-4">
              <label className={styles.formContainerLabel}>Subscription Active</label>
              <input
                type="checkbox"
                name="subscription.isActive"
                checked={editFormData.subscription.isActive}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    subscription: {
                      ...editFormData.subscription,
                      isActive: e.target.checked,
                    },
                  })
                }
                className="border rounded"
              />
            </div>
            <div className="mb-4">
              <label className={styles.formContainerLabel}>Payment Methods (comma-separated)</label>
              <input
                type="text"
                name="paymentMethods"
                value={editFormData.paymentMethods}
                onChange={handleEditInputChange}
                className={styles.formContainerInput}
                placeholder="e.g., card_visa, paypal"
              />
            </div>
            <div className="flex space-x-4">
              <button type="submit" className={styles.editButton}>
                Save
              </button>
              <button type="button" onClick={handleCancelEdit} className={styles.deleteButton}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead className={styles.tableHeader}>
              <tr>
                <th className={styles.tableCell}>ID</th>
                <th className={styles.tableCell}>Name</th>
                <th className={styles.tableCell}>Email</th>
                <th className={styles.tableCell}>Phone</th>
                <th className={styles.tableCell}>Age</th>
                <th className={styles.tableCell}>Role</th>
                <th className={styles.tableCell}>Profile Image</th>
                <th className={styles.tableCell}>Plan</th>
                <th className={styles.tableCell}>Start</th>
                <th className={styles.tableCell}>End</th>
                <th className={styles.tableCell}>Active</th>
                <th className={styles.tableCell}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {leads.length === 0 ? (
                <tr>
                  <td colSpan="12" className={styles.noData}>
                    No profiles available.
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr key={lead.id} className={styles.tableRow}>
                    <td className={styles.tableCell}>{lead.id}</td>
                    <td className={styles.tableCell}>{lead.name}</td>
                    <td className={styles.tableCell}>{lead.email}</td>
                    <td className={styles.tableCell}>{lead.phone}</td>
                    <td className={styles.tableCell}>{lead.age || 'N/A'}</td>
                    <td className={styles.tableCell}>{lead.role || 'N/A'}</td>
                    <td className={styles.tableCell}>
                      <SafeImage
                        src={lead.profileImage}
                        alt={`Profile image for ${lead.name}`}
                        isProfile={true}
                        onError={() => {
                          if (lead.profileImage && lead.profileImage !== 'null') {
                            console.log(`Failed to load profile image for ${lead.name}: ${lead.profileImage}`);
                          }
                        }}
                      />
                    </td>
                    <td className={styles.tableCell}>{lead.subscriptionPlan || 'N/A'}</td>
                    <td className={styles.tableCell}>{lead.subscriptionStartDate || 'N/A'}</td>
                    <td className={styles.tableCell}>{lead.subscriptionEndDate || 'N/A'}</td>
                    <td className={styles.tableCell}>{lead.subscriptionIsActive ? 'Yes' : 'No'}</td>
                    <td className={styles.tableCell}>
                      <div className="flex space-x-4">
                        <button
                          onClick={() => handleEditClick(lead)}
                          className={styles.editButton}
                          disabled={lead.id === 'N/A'}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteClick(lead.id)}
                          className={styles.deleteButton}
                          disabled={lead.id === 'N/A'}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Leads;