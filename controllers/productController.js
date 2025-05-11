// controllers/productController.js
import Product from '../models/Product.js';

// @desc    Get all products
export const getProducts = async (req, res) => {
  const products = await Product.find({});
  res.json(products);
};

// @desc    Get single product
export const getProductById = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ message: 'Product not found' });
  }
};

// @desc    Create product
export const createProduct = async (req, res) => {
  const {
    name, description, price, category,
    countInStock, brand, featured, numReviews, rating
  } = req.body;

  let image = req.body.image;
  if (req.file) {
    image = `/uploads/${req.file.filename}`;
  }

  const product = new Product({
    name,
    description,
    price,
    category,
    countInStock,
    image,
    brand,
    featured: featured === 'true' || featured === true, // handles FormData string bools
    numReviews,
    rating
  });

  const createdProduct = await product.save();
  res.status(201).json(createdProduct);
};

// @desc    Update product
export const updateProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    const {
      name, description, price, category,
      countInStock, brand, featured, numReviews, rating
    } = req.body;

    product.name = name;
    product.description = description;
    product.price = price;
    product.category = category;
    product.countInStock = countInStock;
    product.brand = brand;
    product.featured = featured === 'true' || featured === true;
    product.numReviews = numReviews;
    product.rating = rating;

    if (req.file) {
      product.image = `/uploads/${req.file.filename}`;
    }

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } else {
    res.status(404).json({ message: 'Product not found' });
  }
};

// @desc    Delete product
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      await product.deleteOne();
      res.json({ message: 'Product removed' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Server error while deleting product' });
  }
};
