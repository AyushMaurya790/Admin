import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './Uploads.module.css';

// Global image loading queue to prevent rate limiting
const imageQueue = [];
let isProcessingQueue = false;

const processImageQueue = () => {
  if (isProcessingQueue || imageQueue.length === 0) return;
  
  isProcessingQueue = true;
  const { loadFn, delay } = imageQueue.shift();
  
  setTimeout(() => {
    loadFn();
    isProcessingQueue = false;
    processImageQueue(); // Process next image in queue
  }, delay);
};

// Smart image component with queue-based loading to prevent rate limiting
const SmartImage = ({ src, alt = "Image", width = 50, isProfile = false, className = "", delay = 0, onLoad = null, onError = null, imageId = null }) => {
  const [imageState, setImageState] = useState('waiting'); // 'waiting', 'loading', 'loaded', 'error'
  const [actualSrc, setActualSrc] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [hasReported, setHasReported] = useState(false);

  useEffect(() => {
    if (!src) {
      setImageState('error');
      if (!hasReported && onError) {
        onError(imageId);
        setHasReported(true);
      }
      return;
    }

    const loadImage = (attemptNumber = 0) => {
      const img = new Image();
      
      img.onload = () => {
        setActualSrc(src);
        setImageState('loaded');
        if (!hasReported && onLoad) {
          onLoad(imageId);
          setHasReported(true);
        }
        console.log(`✅ Image loaded successfully: ${src}`);
      };
      
      img.onerror = (error) => {
        console.warn(`❌ Image failed to load: ${src} (attempt ${attemptNumber + 1})`);
        
        // Only retry once to avoid overwhelming the server
        if (attemptNumber < 1) {
          const retryDelay = 5000; // 5 second delay for retry
          console.log(`🔄 Retrying image in ${retryDelay}ms: ${src}`);
          setTimeout(() => {
            loadImage(attemptNumber + 1);
          }, retryDelay);
          setRetryCount(attemptNumber + 1);
        } else {
          setImageState('error');
          if (!hasReported && onError) {
            onError(imageId);
            setHasReported(true);
          }
          console.error(`💥 Image failed after 2 attempts: ${src}`);
        }
      };
      
      setImageState('loading');
      img.src = src;
    };

    // Add to queue instead of loading immediately
    imageQueue.push({
      loadFn: loadImage,
      delay: Math.max(delay, 500) // Minimum 500ms delay between images
    });
    
    processImageQueue();
  }, [src, delay, onLoad, onError, imageId, hasReported]);

  const baseStyle = {
    width: `${width}px`,
    height: `${width}px`,
    borderRadius: isProfile ? '50%' : '4px',
    marginRight: '5px',
    marginBottom: '5px',
    objectFit: 'cover',
    display: 'inline-block',
    border: '1px solid #dee2e6'
  };

  if (imageState === 'loaded' && actualSrc) {
    return (
      <img
        src={actualSrc}
        alt={alt}
        style={baseStyle}
        className={className}
        title={`${alt} - Loaded from backend`}
      />
    );
  }

  // Show placeholder with loading/error state
  const placeholderStyle = {
    ...baseStyle,
    backgroundColor: imageState === 'loading' ? '#e3f2fd' : imageState === 'waiting' ? '#f3e5f5' : '#ffebee',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '10px',
    color: imageState === 'loading' ? '#1976d2' : imageState === 'waiting' ? '#7b1fa2' : '#c62828',
    textAlign: 'center',
    fontWeight: 'bold',
    cursor: 'pointer'
  };

  return (
    <div 
      style={placeholderStyle}
      className={className} 
      title={
        imageState === 'loading' 
          ? `Loading ${alt}... (Retry ${retryCount + 1}/2)` 
          : imageState === 'waiting'
          ? `Waiting in queue to load ${alt}...`
          : `${alt} - Failed to load after ${retryCount + 1} attempts`
      }
      onClick={() => {
        if (imageState === 'error') {
          console.log(`🔄 Manual retry for: ${src}`);
          setImageState('waiting');
          setRetryCount(0);
          setHasReported(false);
          
          // Add back to queue for retry
          imageQueue.push({
            loadFn: () => {
              const img = new Image();
              img.onload = () => {
                setActualSrc(src);
                setImageState('loaded');
                if (!hasReported && onLoad) {
                  onLoad(imageId);
                  setHasReported(true);
                }
              };
              img.onerror = () => {
                setImageState('error');
                if (!hasReported && onError) {
                  onError(imageId);
                  setHasReported(true);
                }
              };
              setImageState('loading');
              img.src = src;
            },
            delay: 1000
          });
          processImageQueue();
        }
      }}
    >
      {imageState === 'loading' ? (
        <div style={{ textAlign: 'center' }}>
          <div>⏳</div>
          <div style={{ fontSize: '8px' }}>Loading</div>
        </div>
      ) : imageState === 'waiting' ? (
        <div style={{ textAlign: 'center' }}>
          <div>⏸️</div>
          <div style={{ fontSize: '8px' }}>Waiting</div>
        </div>
      ) : (
        <div style={{ textAlign: 'center' }}>
          <div>{isProfile ? '👤' : '🖼️'}</div>
          <div style={{ fontSize: '8px' }}>Click to retry</div>
        </div>
      )}
    </div>
  );
};

const Uploads = () => {
  const [uploads, setUploads] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [rateLimited, setRateLimited] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState(0);
  const [totalImages, setTotalImages] = useState(0);
  const [loadedImageIds, setLoadedImageIds] = useState(new Set());

  const API_URL = 'http://test.soheru.me:5000/api';

  // Helper function to handle image loading/error callbacks
  const handleImageLoad = (imageId) => {
    if (imageId && !loadedImageIds.has(imageId)) {
      setLoadedImageIds(prev => new Set([...prev, imageId]));
      setImagesLoaded(prev => prev + 1);
    }
  };

  const handleImageError = (imageId) => {
    if (imageId && !loadedImageIds.has(imageId)) {
      setLoadedImageIds(prev => new Set([...prev, imageId]));
      setImagesLoaded(prev => prev + 1);
    }
  };

  // Function to get proper image URL from backend with multiple fallbacks
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    
    // Skip problematic URLs that cause issues
    if (imagePath.includes('data/user/') || 
        imagePath.includes('cache/') || 
        imagePath.includes('android_asset/') ||
        imagePath.includes('file://') ||
        imagePath.includes('content://')) {
      console.log(`🚫 Skipping problematic image path: ${imagePath}`);
      return null;
    }
    
    // If it's already a full URL, use it directly
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    
    // Clean the path
    const cleanPath = imagePath.replace(/^\/+/, ''); // Remove leading slashes
    
    // Try different URL formats
    const baseUrl = 'http://test.soheru.me:5000';
    
    // If it starts with uploads/, use as is
    if (cleanPath.startsWith('uploads/')) {
      return `${baseUrl}/${cleanPath}`;
    }
    
    // Default case - assume it's a filename in uploads directory
    return `${baseUrl}/uploads/${cleanPath}`;
  };

  const fetchUploads = async (retryCount = 0) => {
    setLoading(true);
    setRateLimited(false);
    const token = localStorage.getItem('adminToken');

    try {
      // Add a delay before making the request to avoid rate limiting
      // Increase delay with each retry
      const delay = Math.min(1000 * (retryCount + 1), 5000);
      await new Promise(resolve => setTimeout(resolve, delay));
      
      const response = await axios.get(`${API_URL}/upload`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        timeout: 15000, // Increase timeout
      });

      const data = Array.isArray(response.data)
        ? response.data
        : response.data.uploads || response.data.data || [];

      console.log('📊 Uploads data:', data);
      console.log('📊 Sample upload structure:', data[0]);
      
      // Calculate total images for progress tracking - count ALL images
      const totalImageCount = data.reduce((count, upload) => {
        let imageCount = 0;
        if (upload.user?.avatar || upload.owner?.avatar) imageCount++;
        if (upload.bannerImage) imageCount++;
        if (upload.appicon) imageCount++;
        if (upload.thumbnail) imageCount++;
        if (upload.logo) imageCount++;
        if (upload.icon) imageCount++;
        if (upload.image) imageCount++;
        if (upload.profilePicture) imageCount++;
        if (Array.isArray(upload.screenshots)) imageCount += upload.screenshots.length; // Show ALL screenshots
        if (Array.isArray(upload.images)) imageCount += upload.images.length; // Show ALL images
        if (Array.isArray(upload.gallery)) imageCount += upload.gallery.length; // Show ALL gallery images
        return count + imageCount;
      }, 0);
      
      setTotalImages(totalImageCount);
      setImagesLoaded(0);
      setLoadedImageIds(new Set()); // Reset loaded images tracking
      setUploads(data);
      setError(null); // Clear any previous error
      
      // Log successful fetch
      console.log(`✅ Successfully fetched ${data.length} uploads`);
    } catch (err) {
      console.error('🔥 Upload fetch error:', err);
      const status = err.response?.status;
      
      if (status === 429) {
        setRateLimited(true);
        
        // Auto-retry up to 2 times for rate limiting
        if (retryCount < 2) {
          const waitTime = 15 + retryCount * 10; // 15s, 25s
          console.log(`🔄 Rate limited, retrying in ${waitTime}s (attempt ${retryCount + 1}/2)`);
          setError(`⏳ Server busy - automatically retrying in ${waitTime} seconds...`);
          setTimeout(() => {
            fetchUploads(retryCount + 1);
          }, waitTime * 1000);
          return; // Don't finish loading state yet
        } else {
          setError('⚠️ Server is temporarily busy. Please wait a moment and click refresh.');
          setRateLimited(false); // Stop showing rate limit indicator after max retries
        }
        
        // Don't clear uploads on rate limit - keep existing data if available
      } else {
        // Handle different error types more gracefully
        const errorMessage = err.code === 'ERR_NETWORK'
          ? '🌐 Network error - Backend may be offline'
          : status === 401
          ? '🔐 Authentication required - Please log in again'
          : status === 403
          ? '🚫 Access forbidden - Check permissions'
          : status === 404
          ? '📂 Upload API endpoint not found'
          : status === 500
          ? '⚠️ Server error - Please try again later'
          : `❌ Error ${status || 'Unknown'} - Please try refreshing`;
          
        setError(errorMessage);
        setUploads([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Debug: Check if token exists
    const token = localStorage.getItem('adminToken');
    console.log('🔑 Admin token exists:', !!token);
    console.log('🌐 API URL:', API_URL);
    
    fetchUploads();
  }, []);

  return (
    <div className={styles.container}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2>All Uploads</h2>
        <button 
          onClick={() => {
            setError(null);
            setRateLimited(false);
            setImagesLoaded(0);
            setLoadedImageIds(new Set());
            imageQueue.length = 0; // Clear image queue
            isProcessingQueue = false; // Reset queue processing
            fetchUploads(0);
          }} 
          disabled={loading}
          className={styles.refreshButton}
          style={{
            padding: '8px 16px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1
          }}
        >
          {loading ? '🔄 Loading...' : '🔄 Refresh'}
        </button>
      </div>
      
      <div className={styles.note}>
        <small>📝 Note: Images are loaded one at a time in a queue to prevent server overload. Purple = waiting in queue, Blue = loading, Green = loaded successfully, Red = failed to load.</small>
        {totalImages > 0 && (
          <div style={{ marginTop: '8px' }}>
            <small>🖼️ Loading progress: {imagesLoaded} / {totalImages} images processed</small>
            <div style={{ width: '100%', height: '4px', backgroundColor: '#e0e0e0', borderRadius: '2px', marginTop: '4px' }}>
              <div 
                style={{ 
                  width: `${totalImages > 0 ? (imagesLoaded / totalImages) * 100 : 0}%`, 
                  height: '100%', 
                  backgroundColor: imagesLoaded === totalImages ? '#28a745' : '#007bff', 
                  borderRadius: '2px',
                  transition: 'width 0.3s ease'
                }}
              />
            </div>
            {imagesLoaded === totalImages && (
              <small style={{ color: '#28a745', display: 'block', marginTop: '4px' }}>
                ✅ All images processed successfully
              </small>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className={styles.error}>
          {error}
        </div>
      )}
      {loading ? (
        <div className={styles.info}>Loading uploads...</div>
      ) : uploads.length === 0 && !error ? (
        <div className={styles.info}>
          <div>📂 No uploads found</div>
          <small style={{ color: '#666', marginTop: '8px', display: 'block' }}>
            This could mean the database is empty or the uploads haven't been created yet.
          </small>
        </div>
      ) : uploads.length === 0 && error ? (
        <div className={styles.info}>
          Unable to load uploads. Please try refreshing.
        </div>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Type</th>
              <th>Title</th>
              <th>Category</th>
              <th>Owner</th>
              <th>Images</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {uploads.map((upload, uploadIndex) => (
              <tr key={`${upload.type}-${upload._id}`}>
                <td>{upload.type || 'Unknown'}</td>
                <td>{upload.name || upload.apptitle || upload.websitetitle || upload.productTitle || 'Untitled'}</td>
                <td>{upload.category?.name || upload.category || 'N/A'}</td>
                <td>
                  {upload.user?.name || upload.owner?.name || 'Unknown'}
                  <br />
                  <SmartImage
                    src={getImageUrl(upload.user?.avatar || upload.owner?.avatar)}
                    alt="Owner Profile"
                    width={50}
                    isProfile={true}
                    className={styles.roundImage}
                    delay={uploadIndex * 1000} // Much larger delay
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                    imageId={`${upload._id}-avatar`}
                  />
                </td>
                <td className={styles.imageGroup}>
                  <div style={{ marginBottom: '8px', fontSize: '11px', fontWeight: 'bold', color: '#666' }}>
                    Main Images:
                  </div>
                  {upload.bannerImage && (
                    <SmartImage
                      src={getImageUrl(upload.bannerImage)}
                      alt="Banner Image"
                      width={50}
                      isProfile={false}
                      delay={uploadIndex * 1000 + 500}
                      onLoad={handleImageLoad}
                      onError={handleImageError}
                      imageId={`${upload._id}-banner`}
                    />
                  )}
                  {upload.appicon && (
                    <SmartImage
                      src={getImageUrl(upload.appicon)}
                      alt="App Icon"
                      width={50}
                      isProfile={false}
                      delay={uploadIndex * 1000 + 1000}
                      onLoad={handleImageLoad}
                      onError={handleImageError}
                      imageId={`${upload._id}-appicon`}
                    />
                  )}
                  {upload.thumbnail && (
                    <SmartImage
                      src={getImageUrl(upload.thumbnail)}
                      alt="Thumbnail"
                      width={50}
                      isProfile={false}
                      delay={uploadIndex * 1000 + 1500}
                      onLoad={handleImageLoad}
                      onError={handleImageError}
                      imageId={`${upload._id}-thumbnail`}
                    />
                  )}
                  {upload.logo && (
                    <SmartImage
                      src={getImageUrl(upload.logo)}
                      alt="Logo"
                      width={50}
                      isProfile={false}
                      delay={uploadIndex * 1000 + 2000}
                      onLoad={handleImageLoad}
                      onError={handleImageError}
                      imageId={`${upload._id}-logo`}
                    />
                  )}
                  {upload.icon && (
                    <SmartImage
                      src={getImageUrl(upload.icon)}
                      alt="Icon"
                      width={50}
                      isProfile={false}
                      delay={uploadIndex * 1000 + 2500}
                      onLoad={handleImageLoad}
                      onError={handleImageError}
                      imageId={`${upload._id}-icon`}
                    />
                  )}
                  {upload.image && (
                    <SmartImage
                      src={getImageUrl(upload.image)}
                      alt="Main Image"
                      width={50}
                      isProfile={false}
                      delay={uploadIndex * 1000 + 3000}
                      onLoad={handleImageLoad}
                      onError={handleImageError}
                      imageId={`${upload._id}-image`}
                    />
                  )}
                  {upload.profilePicture && (
                    <SmartImage
                      src={getImageUrl(upload.profilePicture)}
                      alt="Profile Picture"
                      width={50}
                      isProfile={true}
                      delay={uploadIndex * 1000 + 3500}
                      onLoad={handleImageLoad}
                      onError={handleImageError}
                      imageId={`${upload._id}-profile`}
                    />
                  )}
                  
                  {Array.isArray(upload.screenshots) && upload.screenshots.length > 0 && (
                    <>
                      <div style={{ marginTop: '8px', marginBottom: '4px', fontSize: '11px', fontWeight: 'bold', color: '#666' }}>
                        Screenshots ({upload.screenshots.length}):
                      </div>
                      {upload.screenshots.map((url, index) => (
                        <SmartImage
                          key={index}
                          src={getImageUrl(url)}
                          alt={`Screenshot ${index + 1}`}
                          width={50}
                          isProfile={false}
                          delay={uploadIndex * 1000 + 4000 + (index * 1000)}
                          onLoad={handleImageLoad}
                          onError={handleImageError}
                          imageId={`${upload._id}-screenshot-${index}`}
                        />
                      ))}
                    </>
                  )}
                  
                  {Array.isArray(upload.images) && upload.images.length > 0 && (
                    <>
                      <div style={{ marginTop: '8px', marginBottom: '4px', fontSize: '11px', fontWeight: 'bold', color: '#666' }}>
                        Additional Images ({upload.images.length}):
                      </div>
                      {upload.images.map((url, index) => (
                        <SmartImage
                          key={`img-${index}`}
                          src={getImageUrl(url)}
                          alt={`Image ${index + 1}`}
                          width={50}
                          isProfile={false}
                          delay={uploadIndex * 1000 + 5000 + (index * 1000)}
                          onLoad={handleImageLoad}
                          onError={handleImageError}
                          imageId={`${upload._id}-image-${index}`}
                        />
                      ))}
                    </>
                  )}
                  
                  {Array.isArray(upload.gallery) && upload.gallery.length > 0 && (
                    <>
                      <div style={{ marginTop: '8px', marginBottom: '4px', fontSize: '11px', fontWeight: 'bold', color: '#666' }}>
                        Gallery ({upload.gallery.length}):
                      </div>
                      {upload.gallery.map((url, index) => (
                        <SmartImage
                          key={`gallery-${index}`}
                          src={getImageUrl(url)}
                          alt={`Gallery ${index + 1}`}
                          width={50}
                          isProfile={false}
                          delay={uploadIndex * 1000 + 6000 + (index * 1000)}
                          onLoad={handleImageLoad}
                          onError={handleImageError}
                          imageId={`${upload._id}-gallery-${index}`}
                        />
                      ))}
                    </>
                  )}
                </td>
                <td>
                  <a href={`/admin/uploads/${upload.type}/${upload._id}`} className={styles.viewButton}>
                    View
                  </a>
                </td>
              </tr>
            ))} 
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Uploads;
