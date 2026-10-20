const express = require('express');
const router = express.Router();
const { getSettings, updateSettings, triggerEmailScan } = require('../controllers/settingController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, getSettings);
router.put('/', protect, authorize('owner'), updateSettings);
router.post('/trigger-email', protect, triggerEmailScan);

module.exports = router;
