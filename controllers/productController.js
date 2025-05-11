// controllers/productController.js
import Product from '../models/Product.js';

// @desc    Get all products with optional filters (featured, sort, limit)
// @desc    Get all products with optional filters (category, price range, sort, limit)
export const getProducts = async (req, res) => {
  try {
    const { featured, sort, limit, category, priceMin, priceMax } = req.query;

    const query = {};

    // Featured filter
    if (featured === 'true') {
      query.featured = true;
    }

    // Category filter
    if (category) {
      query.category = category;
    }

    // Price Range filter
    if (priceMin || priceMax) {
      query.price = {};
      if (priceMin) {
        query.price.$gte = Number(priceMin);
      }
      if (priceMax) {
        query.price.$lte = Number(priceMax);
      }
    }

    // Build the Mongoose query
    let productQuery = Product.find(query);

    // Sorting
    if (sort) {
      productQuery = productQuery.sort(sort);
    }

    // Limit
    const limitNum = limit ? parseInt(limit) : 0;
    if (limitNum > 0) {
      productQuery = productQuery.limit(limitNum);
    }

    const products = await productQuery.exec();

    res.json({ products }); // Wrap as { products } to match frontend
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Server error while fetching products' });
  }
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
