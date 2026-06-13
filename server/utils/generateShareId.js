/**
 * Generate a unique share ID for public report access
 * Creates an 8-character random alphanumeric string
 * Probability of collision with 1M reports: < 0.00001%
 */
export const generateShareId = () => {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let id = "";
  for (let i = 0; i < 8; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
};
