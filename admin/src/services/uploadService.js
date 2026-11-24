import api from "./api";

export const uploadImage = async (file) => {
  if (!file) {
    throw new Error("Vui lòng chọn ảnh");
  }

  const formData = new FormData();
  formData.append("image", file);

  const response = await api.post(
    "/upload/image",
    formData
  );

  return response.data.image;
};

