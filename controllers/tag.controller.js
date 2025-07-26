const Tag = require("../models/tag.model");
const { generateUniqueSlug } = require("../utils/slugHelper");

exports.createTag = async (req, res) => {
  try {
    const { name, slug } = req.body;
    if (!name) return res.status(400).json({ message: "Name is required" });

    // Auto-generate slug if not provided
    const finalSlug =
      slug ||
      (await generateUniqueSlug(name, async (slug) => {
        const exists = await Tag.findOne({ slug });
        return !!exists;
      }));

    const exists = await Tag.findOne({ $or: [{ name }, { slug: finalSlug }] });
    if (exists) return res.status(409).json({ message: "Tag already exists" });

    const tag = await Tag.create({ name, slug: finalSlug });
    res.status(201).json({ message: "Tag created", tag });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getTags = async (req, res) => {
  try {
    const tags = await Tag.find().sort({ name: 1 });
    res.json({ tags });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getTagById = async (req, res) => {
  try {
    const tag = await Tag.findById(req.params.id);
    if (!tag) return res.status(404).json({ message: "Tag not found" });
    res.json({ tag });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateTag = async (req, res) => {
  try {
    const { name, slug } = req.body;
    const tag = await Tag.findById(req.params.id);
    if (!tag) return res.status(404).json({ message: "Tag not found" });
    if (name) tag.name = name;
    if (slug) tag.slug = slug;
    await tag.save();
    res.json({ message: "Tag updated", tag });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteTag = async (req, res) => {
  try {
    const tag = await Tag.findById(req.params.id);
    if (!tag) return res.status(404).json({ message: "Tag not found" });
    await tag.deleteOne();
    res.json({ message: "Tag deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
