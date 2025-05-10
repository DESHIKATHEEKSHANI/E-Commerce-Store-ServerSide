// routes/productRoutes.js
import express from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} from '../controllers/productController.js';
import upload from '../middleware/upload.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getProducts);
router.get('/:id', getProductById);

// Protected admin routes
router.post('/', protect, admin, upload.single('productImage'), createProduct);
router.put('/:id', protect, admin, upload.single('productImage'), updateProduct);
router.delete('/:id', protect, admin, deleteProduct);

export default router;
