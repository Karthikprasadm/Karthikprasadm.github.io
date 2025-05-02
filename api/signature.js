const ImageKit = require("imagekit");

function isAllowedOrigin(origin) {
  // Allow GitHub Pages
  if (origin === "https://karthikprasadm.github.io") return true;
  // Allow ANY .vercel.app domain (for debugging)
  if (/\.vercel\.app$/.test(origin)) return true;
  return false;
}

module.exports = (req, res) => {
  try {
    const origin = req.headers.origin;
    // Debug log to check what origin is being received
    console.log("Request origin:", origin);
    if (isAllowedOrigin(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin);
    }
    res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.setHeader("Vary", "Origin");
    if (req.method === "OPTIONS") {
      res.status(200).end();
      return;
    }

    // Validate environment variables
    if (
      !process.env.IMAGEKIT_PUBLIC_KEY ||
      !process.env.IMAGEKIT_PRIVATE_KEY ||
      !process.env.IMAGEKIT_URL_ENDPOINT
    ) {
      res.status(500).json({ error: "Missing ImageKit environment variables" });
      return;
    }

    const imagekit = new ImageKit({
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
      urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
    });

    const signature = imagekit.getAuthenticationParameters();
    res.status(200).json(signature);
  } catch (err) {
    // Always set CORS headers for errors too!
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    const origin = req.headers.origin;
    if (isAllowedOrigin(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin);
    }
    res.status(500).json({ error: "Internal server error", details: err.message });
  }
};