const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true,
  },
  originalName: {
    type: String,
    required: true,
  },
  fileType: {
    type: String,
    required: true,
    enum: ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'txt'],
  },
  fileSize: {
    type: Number,
    required: true,
  },
  uploadTime: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 20 * 60 * 1000), // 20 minutes from upload
    index: { expireAfterSeconds: 0 },
  },
  studentName: {
    type: String,
    default: 'Anonymous',
  },
  status: {
    type: String,
    enum: ['pending', 'printing', 'printed', 'cancelled'],
    default: 'pending',
  },
  printCopies: {
    type: Number,
    default: 1,
    min: 1,
    max: 10,
  },
  printSettings: {
    color: {
      type: Boolean,
      default: false,
    },
    doubleSided: {
      type: Boolean,
      default: false,
    },
    pages: {
      type: String,
      default: 'all',
    },
  },
});

// Create TTL index for automatic deletion
fileSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('File', fileSchema);