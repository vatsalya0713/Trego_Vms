function generateBatchNumber(medicineName, batchId) {
  const year = new Date().getFullYear();

  const prefix = medicineName.replace(/\s+/g, "").substring(0, 4).toUpperCase();

  return `${prefix}-${year}-${batchId}`;
}

module.exports = generateBatchNumber;
