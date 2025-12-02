import React, { useState, useEffect } from 'react';
import { FiPrinter, FiTrash2, FiCheck, FiX, FiDownload, FiClock, FiUser } from 'react-icons/fi';
import { getAllFiles, updateFileStatus, deleteFile } from '../services/api';
import './GlobalDashboard.css';

const GlobalDashboard = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFiles();
    const interval = setInterval(fetchFiles, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchFiles = async () => {
    try {
      const response = await getAllFiles();
      setFiles(response.data);
    } catch (error) {
      console.error('Error fetching files:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await updateFileStatus(id, status);
      fetchFiles();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handlePrintFile = async (file) => {
    try {
      await updateFileStatus(file._id, 'printing');
      
      const fileUrl = `http://localhost:5000/uploads/${file.filename}`;
      const newWindow = window.open(fileUrl, '_blank');
      
      if (newWindow) {
        setTimeout(() => {
          try {
            newWindow.print();
            alert('Print dialog opened!');
          } catch (error) {
            const manualPrint = confirm(
              'Browser blocked auto-print.\n\n' +
              'MANUAL STEPS:\n' +
              '1. Switch to PDF tab\n' +
              '2. Press Ctrl+P\n' +
              '3. Select settings and Print'
            );
            if (manualPrint) newWindow.focus();
          }
        }, 800);
      } else {
        alert('Popup blocked! Please allow popups.');
        await updateFileStatus(file._id, 'pending');
      }
      
      fetchFiles();
      
    } catch (error) {
      console.error('Print error:', error);
      alert('Error: ' + (error.message || 'Failed to print'));
      await updateFileStatus(file._id, 'pending');
      fetchFiles();
    }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm('Delete ALL files? This cannot be undone.')) return;
    
    try {
      const files = await getAllFiles();
      
      let deletedCount = 0;
      for (const file of files.data) {
        try {
          await deleteFile(file._id);
          deletedCount++;
        } catch (error) {
          console.error(`Failed to delete file ${file._id}:`, error);
        }
      }
      
      alert(`Deleted ${deletedCount} files`);
      fetchFiles();
    } catch (error) {
      console.error('Error deleting all files:', error);
      alert('Failed to delete all files');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this file?')) {
      try {
        await deleteFile(id);
        fetchFiles();
      } catch (error) {
        console.error('Error deleting file:', error);
      }
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getTimeRemaining = (expiresAt) => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diffMs = expires - now;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins <= 0) return 'Expired';
    return `${diffMins} min`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'status-pending';
      case 'printing': return 'status-printing';
      case 'printed': return 'status-printed';
      case 'cancelled': return 'status-cancelled';
      default: return '';
    }
  };

  const downloadFile = (file) => {
    window.open(`http://localhost:5000/uploads/${file.filename}`, '_blank');
  };

  return (
    <div className="global-dashboard">
      <header className="dashboard-header">
        <h1><FiPrinter /> Print Shop Dashboard</h1>
        <div className="dashboard-stats">
          <span className="stat pending">{files.filter(f => f.status === 'pending').length} Pending</span>
          <span className="stat printing">{files.filter(f => f.status === 'printing').length} Printing</span>
          <span className="stat total">{files.length} Total Files</span>
        </div>
      </header>

      <div className="dashboard-controls">
        <button onClick={fetchFiles} className="refresh-btn">
          Refresh
        </button>
        
        <button 
          onClick={handleDeleteAll}
          className="delete-all-btn"
          disabled={files.length === 0}
        >
          <FiTrash2 /> Delete All
        </button>
        
        <div className="auto-refresh">
          <span>Auto-refresh: Every 5 seconds</span>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading files...</div>
      ) : files.length === 0 ? (
        <div className="empty-state">
          <FiPrinter size={64} />
          <h3>No files in queue</h3>
          <p>Waiting for student uploads...</p>
        </div>
      ) : (
        <div className="files-grid">
          {files.map((file) => (
            <div key={file._id} className={`file-card ${getStatusColor(file.status)}`}>
              <div className="file-header">
                <div className="file-type">{file.fileType.toUpperCase()}</div>
                <div className="file-time">
                  <FiClock /> {formatTime(file.uploadTime)}
                </div>
              </div>

              <div className="file-info">
                <h3 className="file-name" title={file.originalName}>
                  {file.originalName.length > 30 
                    ? file.originalName.substring(0, 30) + '...' 
                    : file.originalName}
                </h3>
                
                <div className="file-meta">
                  <span><FiUser /> {file.studentName}</span>
                  <span>Size: {formatFileSize(file.fileSize)}</span>
                </div>

                <div className="print-details">
                  <div className="detail">Copies: {file.printCopies}</div>
                  <div className="detail">{file.printSettings.color ? 'Color' : 'B/W'}</div>
                  <div className="detail">{file.printSettings.doubleSided ? '2-Sided' : '1-Sided'}</div>
                </div>

                <div className="time-remaining">
                  <FiClock /> Auto-delete in: {getTimeRemaining(file.expiresAt)}
                </div>
              </div>

              <div className="file-actions">
                <div className="status-buttons">
                  {file.status === 'pending' && (
                    <>
                      <button 
                        onClick={() => handlePrintFile(file)}
                        className="btn printing-btn"
                      >
                        <FiPrinter /> Start Print
                      </button>
                      <button 
                        onClick={() => handleStatusUpdate(file._id, 'cancelled')}
                        className="btn cancel-btn"
                      >
                        <FiX /> Cancel
                      </button>
                    </>
                  )}
                  
                  {file.status === 'printing' && (
                    <>
                      <button 
                        onClick={() => handleStatusUpdate(file._id, 'printed')}
                        className="btn complete-btn"
                      >
                        <FiCheck /> Mark Printed
                      </button>
                      <button 
                        onClick={() => handleStatusUpdate(file._id, 'cancelled')}
                        className="btn cancel-btn"
                      >
                        <FiX /> Cancel
                      </button>
                    </>
                  )}

                  {file.status === 'printed' && (
                    <span className="status-badge printed">Printed ✓</span>
                  )}

                  {file.status === 'cancelled' && (
                    <span className="status-badge cancelled">Cancelled</span>
                  )}
                </div>

                <div className="action-buttons">
                  <button 
                    onClick={() => downloadFile(file)}
                    className="btn download-btn"
                    title="Download file"
                  >
                    <FiDownload />
                  </button>
                  
                  <button 
                    onClick={() => handleDelete(file._id)}
                    className="btn delete-btn"
                    title="Delete file"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="dashboard-footer">
        <div className="legend">
          <div className="legend-item">
            <span className="status-indicator pending"></span> Pending
          </div>
          <div className="legend-item">
            <span className="status-indicator printing"></span> Printing
          </div>
          <div className="legend-item">
            <span className="status-indicator printed"></span> Printed
          </div>
          <div className="legend-item">
            <span className="status-indicator cancelled"></span> Cancelled
          </div>
        </div>
        <p className="footer-note">
          ⚠️ Files are automatically deleted after 20 minutes of upload
        </p>
      </div>
    </div>
  );
};

export default GlobalDashboard;