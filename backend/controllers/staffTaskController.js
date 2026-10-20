const StaffTask = require('../models/StaffTask');
const Product = require('../models/Product');
const { analyzeOverstockRisk } = require('../utils/overstockEngine');
const { getScopedUserQuery, isDemoUser } = require('../utils/userFilter');

// @desc    Get today's staff suggestion tasks (or auto-generate if none exist)
// @route   GET /api/staff-tasks
const getStaffTasks = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const userScope = getScopedUserQuery(req.user);
    const isDemo = isDemoUser(req.user);

    let tasks = await StaffTask.find({
      $and: [
        userScope,
        { date: today },
      ],
    }).sort({ priority: 1, createdAt: 1 });

    // If no tasks generated for today, auto-generate from active inventory
    if (tasks.length === 0) {
      const now = new Date();
      const products = await Product.find({
        $and: [
          userScope,
          { status: 'active', quantity: { $gt: 0 } },
        ],
      }).sort({ expiryDate: 1 });
      const newTasks = [];

      for (const p of products) {
        const diffTime = new Date(p.expiryDate).setHours(23, 59, 59, 999) - now.getTime();
        const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (days <= 0) {
          // Expired removal task
          newTasks.push({
            title: `Remove Expired: ${p.name}`,
            description: `Batch ${p.batchNumber} expired on ${new Date(p.expiryDate).toLocaleDateString()}. Pull ${p.quantity} ${p.unit} from ${p.shelfLocation?.rack || 'Rack'}, ${p.shelfLocation?.shelf || 'Shelf'} and log in Secure Disposal History.`,
            priority: 'critical',
            taskType: 'disposal_removal',
            product: p._id,
            productName: p.name,
            batchNumber: p.batchNumber,
            shelfLocation: p.shelfLocation,
            date: today,
            user: req.user?._id,
            isDemo,
          });
        } else if (days <= 3) {
          // Urgent discount & front placement
          newTasks.push({
            title: `Apply Clearance Discount: ${p.name}`,
            description: `Only ${days} day(s) left for Batch ${p.batchNumber}. Check Rack ${p.shelfLocation?.rack}, Shelf ${p.shelfLocation?.shelf}. Print clearance poster or affix discount badge.`,
            priority: 'critical',
            taskType: 'clearance_discount',
            product: p._id,
            productName: p.name,
            batchNumber: p.batchNumber,
            shelfLocation: p.shelfLocation,
            date: today,
            user: req.user?._id,
            isDemo,
          });
        } else if (days <= 7) {
          // FEFO rotation
          newTasks.push({
            title: `FEFO Rotation: Move ${p.name} to Front`,
            description: `Batch ${p.batchNumber} (${days} days left). Ensure this older batch is positioned at the very front of ${p.shelfLocation?.rack}, ${p.shelfLocation?.shelf} ahead of newer stock.`,
            priority: 'high',
            taskType: 'fefo_rotation',
            product: p._id,
            productName: p.name,
            batchNumber: p.batchNumber,
            shelfLocation: p.shelfLocation,
            date: today,
            user: req.user?._id,
            isDemo,
          });
        }

        // Check overstock risk
        const risk = analyzeOverstockRisk(p);
        if (risk.isOverstocked && newTasks.length < 10) {
          newTasks.push({
            title: `Overstock Alert: Review ${p.name} Quantity`,
            description: `High quantity alert: ${p.quantity} units in ${p.shelfLocation?.rack}. Unlikely to sell out in ${days} days. Consider placing near cash register or aisle end-cap.`,
            priority: 'medium',
            taskType: 'overstock_check',
            product: p._id,
            productName: p.name,
            batchNumber: p.batchNumber,
            shelfLocation: p.shelfLocation,
            date: today,
            user: req.user?._id,
            isDemo,
          });
        }

        if (newTasks.length >= 10) break; // Keep suggestions focused and manageable
      }

      // Add general closing shift reminder only if user has products
      if (products.length > 0) {
        newTasks.push({
          title: 'End of Day: Mark Sold Items & Inventory Sync',
          description: 'Update the system with items sold today so accurate lifespan tracking and alerts are maintained.',
          priority: 'high',
          taskType: 'routine_shelf_audit',
          date: today,
          user: req.user?._id,
          isDemo,
        });
      }

      if (newTasks.length > 0) {
        tasks = await StaffTask.insertMany(newTasks);
      }
    }

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle task completion status
// @route   PATCH /api/staff-tasks/:id/toggle
const toggleTaskComplete = async (req, res) => {
  try {
    const task = await StaffTask.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const isNowCompleted = task.status !== 'completed';
    task.status = isNowCompleted ? 'completed' : 'pending';
    task.completedBy = isNowCompleted ? req.user?._id : null;
    task.completedByName = isNowCompleted ? (req.user?.name || 'Store Staff') : null;
    task.completedAt = isNowCompleted ? new Date() : null;

    await task.save();
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create manual custom task
// @route   POST /api/staff-tasks
const createStaffTask = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const isDemo = isDemoUser(req.user);
    const task = await StaffTask.create({
      ...req.body,
      date: req.body.date || today,
      user: req.user?._id,
      isDemo,
    });
    res.status(201).json(task);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { getStaffTasks, toggleTaskComplete, createStaffTask };
