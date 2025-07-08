// Image service to handle CORS issues and provide fallbacks

export const defaultImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHZpZXdCb3g9IjAgMCA1MCA1MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjUwIiBoZWlnaHQ9IjUwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNSAyMEwyNSAxNUwzNSAyMFYzNUgxNVYyMFoiIGZpbGw9IiNEMUQ1REIiLz4KPGNpcmNsZSBjeD0iMjIiIGN5PSIyNyIgcj0iMyIgZmlsbD0iI0QxRDVEQiIvPgo8L3N2Zz4K';

export const defaultProfile = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHZpZXdCb3g9IjAgMCA1MCA1MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjUiIGN5PSIyNSIgcj0iMjUiIGZpbGw9IiNGM0Y0RjYiLz4KPGNpcmNsZSBjeD0iMjUiIGN5PSIyMCIgcj0iNyIgZmlsbD0iI0QxRDVEQiIvPgo8cGF0aCBkPSJNMTAgNDBDMTAgMzMuMzcgMTcuNSAzMCAyNSAzMEMzMi41IDMwIDQwIDMzLjM3IDQwIDQwVjQwSDEwVjQwWiIgZmlsbD0iI0QxRDVEQiIvPgo8L3N2Zz4K';

// Cache for failed URLs to avoid repeated attempts
const failedUrls = new Set();

export const getImageUrl = (url, isProfile = false) => {
  if (!url || url === 'https://example.com/profile.jpg' || url === 'N/A') {
    return isProfile ? defaultProfile : defaultImage;
  }
  
  // If it's already a data URI, return as is
  if (url.startsWith('data:')) {
    return url;
  }
  
  // Check if this URL has already failed
  if (failedUrls.has(url)) {
    return isProfile ? defaultProfile : defaultImage;
  }
  
  // Handle URLs that we know will cause CORS issues - return fallback immediately
  if (url.includes('test.soheru.me:5000') || 
      url.includes('soheru.me') ||
      url.includes('data/user/') || 
      url.includes('cache/') ||
      url.includes('android_asset/') ||
      url.includes('uploads/')) {
    console.log(`🚫 Blocking potential CORS URL: ${url}`);
    failedUrls.add(url);
    return isProfile ? defaultProfile : defaultImage;
  }
  
  // For external URLs that might work (not from our backend), allow them
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // Default fallback for any unhandled cases
  return isProfile ? defaultProfile : defaultImage;
};

// Function to mark URL as failed
export const markUrlAsFailed = (url) => {
  failedUrls.add(url);
};

// Function to check if URL has failed before
export const hasUrlFailed = (url) => {
  return failedUrls.has(url);
};
