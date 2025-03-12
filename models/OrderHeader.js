const mongoose = require('mongoose');

const OrderHeaderSchema = new mongoose.Schema({
  order_date: {
    type: Date,
    required: true,
    default: Date.now
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  shipping_contact_mech: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ContactMech',
    required: true
  },
  billing_contact_mech: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ContactMech',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('OrderHeader', OrderHeaderSchema);
