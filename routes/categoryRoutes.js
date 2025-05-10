import express from 'express';
const router = express.Router();
import { getCategories, createCategory } from '../controllers/categoryController.js';

// GET all categories
router.get('/', getCategories);

// POST a new category (optional, for adding categories manually)
router.post('/', createCategory);

export default router;
