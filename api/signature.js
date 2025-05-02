const ImageKit = require("imagekit");

function isAllowedOrigin(origin) {
  // Allow GitHub Pages
  if (origin === "https://karthikprasadm.github.io") return true;
  // Allow ANY .vercel.app domain (for debugging)
  if (/\.vercel\.app$/.test(origin)) return true;
  return false;
}

module.exports = (req, res) => {
  res.status(200).json({ message: "Hello from Vercel!" });
};