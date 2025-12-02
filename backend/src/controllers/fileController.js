const File = require('../models/File');
const fs = require('fs');
const path = require('path');

// Upload file
exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { studentName = 'Anonymous', printCopies = 1, color = false, doubleSided = false, pages = 'all' } = req.body;

    // Simple file type detection
    const getFileType = (originalName) => {
      const extension = originalName.split('.').pop().toLowerCase();
      
      const typeMap = {
        'pdf': 'pdf',
        'doc': 'doc',
        'docx': 'docx',
        'jpg': 'jpg',
        'jpeg': 'jpg',
        'png': 'png',
        'txt': 'txt'
      };

      return typeMap[extension] || 'doc';
    };

    const file = new File({
      filename: req.file.filename,
      originalName: req.file.originalname,
      fileType: getFileType(req.file.originalname),
      fileSize: req.file.size,
      studentName,
      printCopies,
      printSettings: {
        color: color === 'true',
        doubleSided: doubleSided === 'true',
        pages,
      },
    });

    await file.save();

    res.status(201).json({
      message: 'File uploaded successfully',
      file: {
        id: file._id,
        originalName: file.originalName,
        fileType: file.fileType,
        fileSize: file.fileSize,
        uploadTime: file.uploadTime,
        expiresAt: file.expiresAt,
        studentName: file.studentName,
        status: file.status,
      },
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
};

// Get all files
exports.getAllFiles = async (req, res) => {
  try {
    const files = await File.find().sort({ uploadTime: -1 });
    res.json(files);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch files' });
  }
};

// Update file status
exports.updateFileStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const file = await File.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    res.json({ message: 'Status updated successfully', file });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update status' });
  }
};

// Delete file
exports.deleteFile = async (req, res) => {
  try {
    const { id } = req.params;
    const file = await File.findById(id);

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Delete physical file
    const filePath = path.join(__dirname, '../../uploads', file.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete from database
    await File.findByIdAndDelete(id);

    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete file' });
  }
};

// Get file info - THIS WAS MISSING!
exports.getFileInfo = async (req, res) => {
  try {
    const { id } = req.params;
    const file = await File.findById(id);

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    res.json(file);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch file info' });
  }
};