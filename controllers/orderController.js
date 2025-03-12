const OrderHeader = require('../models/OrderHeader');
const OrderItem = require('../models/OrderItem');
const { StatusCodes } = require('http-status-codes');
const mongoose = require('mongoose');

// @desc    Create a new order with items
// @route   POST /orders
// @access  Public
exports.createOrder = async (req, res, next) => {
    try {
      const { order_date, customer_id, shipping_contact_mech_id, billing_contact_mech_id, order_items } = req.body;
  
      // Validate that the provided IDs are valid ObjectIds
      if (
        !mongoose.Types.ObjectId.isValid(customer_id) ||
        !mongoose.Types.ObjectId.isValid(shipping_contact_mech_id) ||
        !mongoose.Types.ObjectId.isValid(billing_contact_mech_id)
      ) {
        return res.status(400).json({ error: 'One or more provided IDs are invalid. Please use valid ObjectId values.' });
      }
  
      // Create order header
      const orderHeader = await OrderHeader.create({
        order_date: order_date || Date.now(),
        customer: customer_id,
        shipping_contact_mech: shipping_contact_mech_id,
        billing_contact_mech: billing_contact_mech_id
      });
  
      // Create order items if any
      if (order_items && order_items.length > 0) {
        const orderItemPromises = order_items.map(item => {
          if (!mongoose.Types.ObjectId.isValid(item.product_id)) {
            throw new Error('Invalid product_id provided.');
          }
          return OrderItem.create({
            order: orderHeader._id,
            product: item.product_id,
            quantity: item.quantity,
            status: item.status || 'Pending'
          });
        });
        await Promise.all(orderItemPromises);
      }
  
      // Populate and return the order
      const populatedOrder = await OrderHeader.findById(orderHeader._id)
        .populate('customer')
        .populate('shipping_contact_mech')
        .populate('billing_contact_mech');
      const orderItems = await OrderItem.find({ order: orderHeader._id }).populate('product');
  
      res.status(201).json({
        success: true,
        data: {
          ...populatedOrder.toObject(),
          order_items: orderItems
        }
      });
    } catch (error) {
      next(error);
    }
  };
  

// @desc    Get a specific order with details
// @route   GET /orders/:id
// @access  Public
exports.getOrderById = async (req, res, next) => {
  try {
    const orderHeader = await OrderHeader.findById(req.params.id)
      .populate('customer')
      .populate('shipping_contact_mech')
      .populate('billing_contact_mech');

    if (!orderHeader) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: `No order found with id ${req.params.id}`
      });
    }

    const orderItems = await OrderItem.find({ order: orderHeader._id })
      .populate('product');

    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        ...orderHeader.toObject(),
        order_items: orderItems
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update an order
// @route   PUT /orders/:id
// @access  Public
exports.updateOrder = async (req, res, next) => {
  try {
    const { shipping_contact_mech_id, billing_contact_mech_id } = req.body;

    const updateData = {};
    if (shipping_contact_mech_id) updateData.shipping_contact_mech = shipping_contact_mech_id;
    if (billing_contact_mech_id) updateData.billing_contact_mech = billing_contact_mech_id;

    const orderHeader = await OrderHeader.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('customer')
      .populate('shipping_contact_mech')
      .populate('billing_contact_mech');

    if (!orderHeader) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: `No order found with id ${req.params.id}`
      });
    }

    const orderItems = await OrderItem.find({ order: orderHeader._id })
      .populate('product');

    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        ...orderHeader.toObject(),
        order_items: orderItems
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete an order
// @route   DELETE /orders/:id
// @access  Public
exports.deleteOrder = async (req, res, next) => {
  try {
    const orderHeader = await OrderHeader.findById(req.params.id);

    if (!orderHeader) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: `No order found with id ${req.params.id}`
      });
    }

    // Delete all order items first
    await OrderItem.deleteMany({ order: req.params.id });

    // Then delete the order header
    await orderHeader.deleteOne();

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Order deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add an item to an order
// @route   POST /orders/:id/items
// @access  Public
exports.addOrderItem = async (req, res, next) => {
  try {
    const { product_id, quantity, status } = req.body;

    // Check if order exists
    const orderHeader = await OrderHeader.findById(req.params.id);
    if (!orderHeader) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: `No order found with id ${req.params.id}`
      });
    }

    // Create new order item
    const orderItem = await OrderItem.create({
      order: req.params.id,
      product: product_id,
      quantity,
      status: status || 'Pending'
    });

    const populatedItem = await OrderItem.findById(orderItem._id).populate('product');

    res.status(StatusCodes.CREATED).json({
      success: true,
      data: populatedItem
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update an order item
// @route   PUT /orders/:id/items/:itemId
// @access  Public
exports.updateOrderItem = async (req, res, next) => {
  try {
    const { quantity, status } = req.body;

    const updateData = {};
    if (quantity) updateData.quantity = quantity;
    if (status) updateData.status = status;

    // Find and update the order item
    const orderItem = await OrderItem.findOneAndUpdate(
      { _id: req.params.itemId, order: req.params.id },
      updateData,
      { new: true, runValidators: true }
    ).populate('product');

    if (!orderItem) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: `No order item found with id ${req.params.itemId} for order ${req.params.id}`
      });
    }

    res.status(StatusCodes.OK).json({
      success: true,
      data: orderItem
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete an order item
// @route   DELETE /orders/:id/items/:itemId
// @access  Public
exports.deleteOrderItem = async (req, res, next) => {
  try {
    // Find and delete the order item
    const orderItem = await OrderItem.findOneAndDelete({
      _id: req.params.itemId,
      order: req.params.id
    });

    if (!orderItem) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: `No order item found with id ${req.params.itemId} for order ${req.params.id}`
      });
    }

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Order item deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
