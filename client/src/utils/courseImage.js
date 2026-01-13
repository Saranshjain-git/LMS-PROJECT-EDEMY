export const getCourseImage = (imagePath) => {
  if (!imagePath) return null;

  // backend base url
  return `http://localhost:5000${imagePath}`;
};
