const cron = require('node-cron');
const File = require('../models/File');
const fs = require('fs');
const path = require('path');

// Run every hour to clean up orphaned files
const cleanupJob = cron.schedule('0 * * * *', async () => {
  try {
    console.log('Running cleanup job...');
    
    // Find files that should have expired but weren't deleted
    const expiredFiles = await File.find({
      expiresAt: { $lt: new Date() }
    });

    for (const file of expiredFiles) {
      // Delete physical file
      const filePath = path.join(__dirname, '../../uploads', file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      // Delete from database
      await File.findByIdAndDelete(file._id);
    }

    console.log(`Cleanup completed. Removed ${expiredFiles.length} files.`);
  } catch (error) {
    console.error('Cleanup job error:', error);
  }
});

module.exports = cleanupJob;