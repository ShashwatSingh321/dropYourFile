import React, { useState, useRef } from 'react';
import { FiUpload, FiPrinter, FiCheck, FiInfo } from 'react-icons/fi';
import { uploadFile } from '../services/api';
import './MobileUpload.css';

const MobileUpload = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Validate file type
      const validTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg',
        'image/png',
        'image/jpg',
        'text/plain'
      ];
      
      if (!validTypes.includes(selectedFile.type)) {
        setError('Please select a PDF, Word, Image, or Text file');
        return;
      }

      // Validate file size (50MB)
      if (selectedFile.size > 50 * 1024 * 1024) {
        setError('File size should be less than 50MB');
        return;
      }

      setFile(selectedFile);
      setError('');
      setUploadSuccess(false);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('studentName', 'Student');
      formData.append('printCopies', 1);
      formData.append('color', false);
      formData.append('doubleSided', false);

      await uploadFile(formData);
      setUploadSuccess(true);
      setFile(null);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Auto-hide success message after 5 seconds
      setTimeout(() => setUploadSuccess(false), 5000);
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.response?.data?.error || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="mobile-upload-container">
      {/* Header */}
      <div className="upload-header">
        <div className="logo">
          <FiPrinter className="logo-icon" />
          <h1>PrintUpload</h1>
        </div>
        <p className="tagline">Upload files for printing at college shop</p>
      </div>

      {/* Main Upload Card */}
      <div className="upload-main-card">
        {uploadSuccess && (
          <div className="success-message">
            <FiCheck className="success-icon" />
            <div>
              <h3>Upload Successful!</h3>
              <p>Your file is now in the print queue</p>
            </div>
          </div>
        )}

        {error && (
          <div className="error-message">
            <FiInfo className="error-icon" />
            <span>{error}</span>
          </div>
        )}

        {/* Upload Area */}
        <div 
          className={`upload-area ${file ? 'has-file' : ''}`}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="upload-icon">
            <FiUpload />
          </div>
          
          {file ? (
            <div className="file-selected">
              <div className="file-icon">📄</div>
              <div className="file-details">
                <h3>{file.name}</h3>
                <p>{formatFileSize(file.size)} • {file.type.split('/')[1].toUpperCase()}</p>
              </div>
            </div>
          ) : (
            <>
              <h3>Select File to Upload</h3>
              <p>Drag & drop or click to browse</p>
              <div className="supported-formats">
                <span>PDF</span>
                <span>DOC</span>
                <span>DOCX</span>
                <span>JPG</span>
                <span>PNG</span>
                <span>TXT</span>
              </div>
            </>
          )}
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
            style={{ display: 'none' }}
          />
        </div>

        {/* Upload Button */}
        <button 
          onClick={handleUpload} 
          disabled={uploading || !file}
          className={`upload-button ${uploading ? 'uploading' : ''}`}
        >
          {uploading ? (
            <>
              <div className="spinner"></div>
              Uploading...
            </>
          ) : (
            <>
              <FiUpload />
              Upload for Printing
            </>
          )}
        </button>

        {/* Quick Info */}
        <div className="quick-info">
          <div className="info-item">
            <div className="info-icon">⏱️</div>
            <div>
              <strong>Auto-delete</strong>
              <p>Files delete after 20 min</p>
            </div>
          </div>
          <div className="info-item">
            <div className="info-icon">📱</div>
            <div>
              <strong>Shop Dashboard</strong>
              <p>Check status at shop</p>
            </div>
          </div>
        </div>
      </div>

      {/* Important Notes */}
      <div className="notes-card">
        <h3><FiInfo /> Important Notes</h3>
        <ul>
          <li>✅ Files automatically delete after 20 minutes</li>
          <li>✅ Maximum file size: 50MB</li>
          <li>✅ Supported formats: PDF, DOC, DOCX, JPG, PNG, TXT</li>
          <li>✅ Your file will appear on the shop's dashboard</li>
          <li>✅ No login required - upload directly</li>
        </ul>
      </div>

      {/* Footer */}
      <div className="upload-footer">
        <p className="footer-text">
          Go to the print shop and show your file on the dashboard
        </p>
        <div className="qr-placeholder">
          {/* QR Code would go here */}
          <div className="qr-box">
            <div className="qr-grid">
              {Array(25).fill().map((_, i) => (
                <div key={i} className="qr-cell"></div>
              ))}
            </div>
            <p>Scan at shop</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileUpload;