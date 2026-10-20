const Disposal = require('../models/Disposal');

// @desc    Get all disposal history records
// @route   GET /api/disposals
const getDisposals = async (req, res) => {
  try {
    const { search, category, reason } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { productName: { $regex: search, $options: 'i' } },
        { batchNumber: { $regex: search, $options: 'i' } },
        { disposalCertificateNo: { $regex: search, $options: 'i' } },
        { disposedByName: { $regex: search, $options: 'i' } },
      ];
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    if (reason && reason !== 'All') {
      query.reason = reason;
    }

    const records = await Disposal.find(query).sort({ createdAt: -1 });

    // Aggregate statistics
    const totalCostLoss = records.reduce((acc, curr) => acc + (curr.costLoss || 0), 0);
    const totalQuantity = records.reduce((acc, curr) => acc + (curr.quantityDisposed || 0), 0);

    res.json({
      totalCount: records.length,
      totalCostLoss: Math.round(totalCostLoss),
      totalQuantity,
      records,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single disposal audit certificate
// @route   GET /api/disposals/:id
const getDisposalById = async (req, res) => {
  try {
    const record = await Disposal.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ message: 'Disposal certificate not found' });
    }
    res.json(record);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getDisposals, getDisposalById };
