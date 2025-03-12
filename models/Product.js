const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  product_name: {
    type: String,
    required: true
  },
  color: {
    type: String,
    default: null
  },
  size: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', ProductSchema);
