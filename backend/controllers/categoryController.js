const Category = require("../models/Category");

const createSlug = (text) => {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};

// Lấy toàn bộ danh mục
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({
      isActive: true,
    }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: categories.length,
      categories,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Lấy một danh mục theo ID
const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy danh mục",
      });
    }

    return res.status(200).json({
      success: true,
      category,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "ID danh mục không hợp lệ",
    });
  }
};

// Admin thêm danh mục
const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập tên danh mục",
      });
    }

    const normalizedName = name.trim();
    const slug = createSlug(normalizedName);

    const existingCategory = await Category.findOne({
      $or: [
        { name: normalizedName },
        { slug },
      ],
    });

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: "Danh mục đã tồn tại",
      });
    }

    const category = await Category.create({
      name: normalizedName,
      slug,
      description: description?.trim() || "",
    });

    return res.status(201).json({
      success: true,
      message: "Thêm danh mục thành công",
      category,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Admin sửa danh mục
const updateCategory = async (req, res) => {
  try {
    const { name, description, isActive } = req.body;

    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy danh mục",
      });
    }

    if (name && name.trim()) {
      const normalizedName = name.trim();
      const slug = createSlug(normalizedName);

      const duplicatedCategory = await Category.findOne({
        _id: {
          $ne: category._id,
        },
        $or: [
          { name: normalizedName },
          { slug },
        ],
      });

      if (duplicatedCategory) {
        return res.status(400).json({
          success: false,
          message: "Tên danh mục đã tồn tại",
        });
      }

      category.name = normalizedName;
      category.slug = slug;
    }

    if (description !== undefined) {
      category.description = description.trim();
    }

    if (isActive !== undefined) {
      category.isActive = Boolean(isActive);
    }

    await category.save();

    return res.status(200).json({
      success: true,
      message: "Cập nhật danh mục thành công",
      category,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Admin xóa danh mục
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy danh mục",
      });
    }

    await category.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Xóa danh mục thành công",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};