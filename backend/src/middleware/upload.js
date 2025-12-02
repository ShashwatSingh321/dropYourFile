const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

// Enhanced file filter with proper DOCX support
const fileFilter = (req, file, cb) => {
  // Allowed file extensions
  const allowedExtensions = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png', '.txt'];
  
  // Get file extension
  const fileExtension = path.extname(file.originalname).toLowerCase();
  
  // Check if extension is allowed
  if (allowedExtensions.includes(fileExtension)) {
    // Special handling for Office files
    if (fileExtension === '.docx') {
      // DOCX files can have various MIME types
      const allowedDocxMimeTypes = [
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/octet-stream',
        'application/zip',
        'application/msword',
        'application/vnd.ms-word'
      ];
      
      if (allowedDocxMimeTypes.includes(file.mimetype) || 
          file.mimetype.includes('word') || 
          file.mimetype.includes('document')) {
        return cb(null, true);
      }
    }
    
    // For other files, check MIME type loosely
    const fileType = file.mimetype.toLowerCase();
    
    if (
      fileExtension === '.pdf' && fileType.includes('pdf') ||
      fileExtension === '.doc' && (fileType.includes('msword') || fileType.includes('word')) ||
      fileExtension === '.jpg' && fileType.includes('jpeg') ||
      fileExtension === '.jpeg' && fileType.includes('jpeg') ||
      fileExtension === '.png' && fileType.includes('png') ||
      fileExtension === '.txt' && fileType.includes('text')
    ) {
      return cb(null, true);
    }
    
    // If extension is valid but MIME type is weird, still allow it
    console.log(`Allowing ${file.originalname} with MIME type ${file.mimetype}`);
    return cb(null, true);
  }
  
  cb(new Error(`File type ${fileExtension} not allowed. Allowed: ${allowedExtensions.join(', ')}`));
};

const upload = multer({
  storage: storage,
  limits: { 
    fileSize: 50 * 1024 * 1024, // 50MB limit
    files: 1
  },
  fileFilter: fileFilter,
});

module.exports = upload;