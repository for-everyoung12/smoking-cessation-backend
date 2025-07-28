const Category = require("../models/category.model");
const { generateUniqueSlug } = require("../utils/slugHelper");

exports.createCategory = async (req, res) => {
  try {
    const { name, slug, description } = req.body;
    if (!name) return res.status(400).json({ message: "Name is required" });

    // Auto-generate slug if not provided
    const finalSlug =
      slug ||
      (await generateUniqueSlug(name, async (slug) => {
        const exists = await Category.findOne({ slug });
        return !!exists;
      }));

    const exists = await Category.findOne({
      $or: [{ name }, { slug: finalSlug }],
    });
    if (exists)
      return res.status(409).json({ message: "Category already exists" });

    const category = await Category.create({
      name,
      slug: finalSlug,
      description,
    });
    res.status(201).json({ message: "Category created", category });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json({ categories });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category)
      return res.status(404).json({ message: "Category not found" });
    res.json({ category });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { name, slug, description } = req.body;
    const category = await Category.findById(req.params.id);
    if (!category)
      return res.status(404).json({ message: "Category not found" });
    if (name) category.name = name;
    if (slug) category.slug = slug;
    if (description !== undefined) category.description = description;
    await category.save();
    res.json({ message: "Category updated", category });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category)
      return res.status(404).json({ message: "Category not found" });
    await category.deleteOne();
    res.json({ message: "Category deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
