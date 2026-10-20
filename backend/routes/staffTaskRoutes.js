const express = require('express');
const router = express.Router();
const { getStaffTasks, toggleTaskComplete, createStaffTask } = require('../controllers/staffTaskController');
const { protect } = require('../middleware/auth');

router.route('/')
  .get(protect, getStaffTasks)
  .post(protect, createStaffTask);

router.patch('/:id/toggle', protect, toggleTaskComplete);

module.exports = router;
