import Category from '../models/categoryModel.js';

// @desc   Get all categories
// @route  GET /api/categories
// @access Public
export const getCategories = async (req, res) => {
  const categories = await Category.find({});
  res.json(categories);
};

// @desc   Create a new category
// @route  POST /api/categories
// @access Public (or protect if needed)
export const createCategory = async (req, res) => {
  const { name } = req.body;

  const categoryExists = await Category.findOne({ name });
  if (categoryExists) {
    return res.status(400).json({ message: 'Category already exists' });
  }

  const category = new Category({ name });

  const createdCategory = await category.save();
  res.status(201).json(createdCategory);
};
