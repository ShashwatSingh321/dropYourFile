const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const fileController = require('../controllers/fileController');

// Upload file
router.post('/upload', upload.single('file'), fileController.uploadFile);

// Get all files
router.get('/', fileController.getAllFiles);

// Get file info
router.get('/:id', fileController.getFileInfo);

// Update file status
router.patch('/:id/status', fileController.updateFileStatus);

// Delete file
router.delete('/:id', fileController.deleteFile);

module.exports = router;