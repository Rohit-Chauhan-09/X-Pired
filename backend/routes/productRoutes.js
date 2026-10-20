const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  syncOfflineBatch,
  updateProduct,
  applyDiscount,
  markAsSold,
  disposeProduct,
  deleteProduct,
  getOverstockWarnings,
} = require('../controllers/productController');
const { protect } = require('../middleware/auth');

router.get('/overstock-warnings', protect, getOverstockWarnings);
router.post('/sync-offline', protect, syncOfflineBatch);

router.route('/')
  .get(protect, getProducts)
  .post(protect, createProduct);

router.route('/:id')
  .get(protect, getProductById)
  .put(protect, updateProduct)
  .delete(protect, deleteProduct);

router.patch('/:id/discount', protect, applyDiscount);
router.post('/:id/sold', protect, markAsSold);
router.post('/:id/dispose', protect, disposeProduct);

module.exports = router;
