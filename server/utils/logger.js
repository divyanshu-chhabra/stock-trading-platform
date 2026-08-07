exports.logInfo = (message) => {
  console.log(`[INFO] ${new Date().toISOString()}: ${message}`);
};

exports.logError = (message) => {
  console.error(`[ERROR] ${new Date().toISOString()}: ${message}`);
};