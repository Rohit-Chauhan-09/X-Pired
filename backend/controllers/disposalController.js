const Disposal = require('../models/Disposal');
const { getScopedUserQuery } = require('../utils/userFilter');

// @desc    Get all disposal history records
// @route   GET /api/disposals
const getDisposals = async (req, res) => {
  try {
    const { search, category, reason } = req.query;
    const userScope = getScopedUserQuery(req.user);
    const andClauses = [userScope];

    if (search) {
      andClauses.push({
        $or: [
          { productName: { $regex: search, $options: 'i' } },
          { batchNumber: { $regex: search, $options: 'i' } },
          { disposalCertificateNo: { $regex: search, $options: 'i' } },
          { disposedByName: { $regex: search, $options: 'i' } },
        ],
      });
    }

    if (category && category !== 'All') {
      andClauses.push({ category });
    }

    if (reason && reason !== 'All') {
      andClauses.push({ reason });
    }

    const records = await Disposal.find({ $and: andClauses }).sort({ createdAt: -1 });

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
