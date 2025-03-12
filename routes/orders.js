const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrderById,
  updateOrder,
  deleteOrder,
  addOrderItem,
  updateOrderItem,
  deleteOrderItem
} = require('../controllers/orderController');

// Order routes
router.route('/')
  .post(createOrder);

router.route('/:id')
  .get(getOrderById)
  .put(updateOrder)
  .delete(deleteOrder);

// Order item routes
router.route('/:id/items')
  .post(addOrderItem);

router.route('/:id/items/:itemId')
  .put(updateOrderItem)
  .delete(deleteOrderItem);

module.exports = router;
