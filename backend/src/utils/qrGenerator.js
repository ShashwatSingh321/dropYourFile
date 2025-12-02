const QRCode = require('qrcode');

const generateQRCode = async (text) => {
  try {
    const qrDataURL = await QRCode.toDataURL(text);
    return qrDataURL;
  } catch (error) {
    console.error('QR Generation Error:', error);
    throw error;
  }
};

module.exports = { generateQRCode };