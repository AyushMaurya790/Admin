import React from 'react';

const ImagePlaceholder = ({ alt = "Image", width = 50, isProfile = false, className = "" }) => {
  const placeholderStyle = {
    width: `${width}px`,
    height: `${width}px`,
    backgroundColor: '#f8f9fa',
    border: '1px solid #dee2e6',
    borderRadius: isProfile ? '50%' : '4px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '10px',
    color: '#6c757d',
    textAlign: 'center',
    flexShrink: 0,
    marginRight: '5px',
    marginBottom: '5px',
    verticalAlign: 'top'
  };

  const iconStyle = {
    fontSize: '16px',
    color: '#adb5bd',
    lineHeight: 1
  };

  return (
    <div style={placeholderStyle} className={className} title={alt}>
      {isProfile ? (
        <span style={iconStyle}>👤</span>
      ) : (
        <span style={iconStyle}>🖼️</span>
      )}
    </div>
  );
};

export default ImagePlaceholder;
