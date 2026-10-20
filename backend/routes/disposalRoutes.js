const express = require('express');
const router = express.Router();
const { getDisposals, getDisposalById } = require('../controllers/disposalController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getDisposals);
router.get('/:id', protect, getDisposalById);

module.exports = router;
