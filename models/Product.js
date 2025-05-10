// models/Product.js
import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    category: { type: String },
    countInStock: { type: Number, required: true, default: 0 },
    image: { type: String },
    brand: { type: String },
    featured: { type: Boolean, default: false },
    numReviews: { type: Number, default: 0 },
    rating: { type: Number, default: 0 }
  },
  { timestamps: true }
);

const Product = mongoose.model('Product', productSchema);
export default Product;
