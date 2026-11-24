const Product = require("../models/Product");
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

// GET tất cả sản phẩm
const getProducts = async (req, res) => {
  try {
    const products = await Product.find({
      isActive: true,
    })
      .populate("category", "name slug")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET một sản phẩm
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "category",
      "name slug"
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sản phẩm",
      });
    }

    return res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "ID sản phẩm không hợp lệ",
    });
  }
};

// POST thêm sản phẩm - Admin
const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      stock,
      category,
      image,
      isFeatured,
    } = req.body;

    if (!name || price === undefined || !category) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập tên, giá và danh mục sản phẩm",
      });
    }

    const categoryExists = await Category.findById(category);

    if (!categoryExists) {
      return res.status(404).json({
        success: false,
        message: "Danh mục không tồn tại",
      });
    }

    const slug = createSlug(name);

    const existingProduct = await Product.findOne({ slug });

    if (existingProduct) {
      return res.status(400).json({
        success: false,
        message: "Sản phẩm đã tồn tại",
      });
    }

    const product = await Product.create({
      name: name.trim(),
      slug,
      description: description?.trim() || "",
      price,
      stock: stock ?? 0,
      category,
      image: image || "",
      isFeatured: Boolean(isFeatured),
    });

    return res.status(201).json({
      success: true,
      message: "Thêm sản phẩm thành công",
      product,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// PUT sửa sản phẩm - Admin
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sản phẩm",
      });
    }

    const {
      name,
      description,
      price,
      stock,
      category,
      image,
      isFeatured,
      isActive,
    } = req.body;

    if (category) {
      const categoryExists = await Category.findById(category);

      if (!categoryExists) {
        return res.status(404).json({
          success: false,
          message: "Danh mục không tồn tại",
        });
      }

      product.category = category;
    }

    if (name && name.trim()) {
      const newSlug = createSlug(name);

      const duplicated = await Product.findOne({
        _id: { $ne: product._id },
        slug: newSlug,
      });

      if (duplicated) {
        return res.status(400).json({
          success: false,
          message: "Tên sản phẩm đã tồn tại",
        });
      }

      product.name = name.trim();
      product.slug = newSlug;
    }

    if (description !== undefined) {
      product.description = description.trim();
    }

    if (price !== undefined) {
      product.price = price;
    }

    if (stock !== undefined) {
      product.stock = stock;
    }

    if (image !== undefined) {
      product.image = image;
    }

    if (isFeatured !== undefined) {
      product.isFeatured = Boolean(isFeatured);
    }

    if (isActive !== undefined) {
      product.isActive = Boolean(isActive);
    }

    await product.save();

    return res.status(200).json({
      success: true,
      message: "Cập nhật sản phẩm thành công",
      product,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// DELETE sản phẩm - Admin
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sản phẩm",
      });
    }

    await product.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Xóa sản phẩm thành công",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};