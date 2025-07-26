/**
 * Utility function to generate URL-friendly slugs
 * @param {string} text - The text to convert to slug
 * @returns {string} - The generated slug
 */
function generateSlug(text) {
  return (
    text
      .toLowerCase()
      .trim()
      // Replace Vietnamese characters
      .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, "a")
      .replace(/[èéẹẻẽêềếệểễ]/g, "e")
      .replace(/[ìíịỉĩ]/g, "i")
      .replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, "o")
      .replace(/[ùúụủũưừứựửữ]/g, "u")
      .replace(/[ỳýỵỷỹ]/g, "y")
      .replace(/đ/g, "d")
      // Replace spaces and special characters with hyphens
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
  );
}

/**
 * Generate unique slug by appending number if exists
 * @param {string} text - The text to convert
 * @param {Function} checkExists - Function to check if slug exists
 * @returns {Promise<string>} - Unique slug
 */
async function generateUniqueSlug(text, checkExists) {
  let slug = generateSlug(text);
  let counter = 1;
  let uniqueSlug = slug;

  while (await checkExists(uniqueSlug)) {
    uniqueSlug = `${slug}-${counter}`;
    counter++;
  }

  return uniqueSlug;
}

module.exports = {
  generateSlug,
  generateUniqueSlug,
};
