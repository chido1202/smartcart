const uploadImage = (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "Vui lòng chọn ảnh",
    });
  }

  const imageUrl =
    `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;

  return res.status(200).json({
    success: true,
    message: "Upload ảnh thành công",
    image: imageUrl,
  });
};

module.exports = {
  uploadImage,
};