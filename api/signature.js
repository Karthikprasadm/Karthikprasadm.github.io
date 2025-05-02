const ImageKit = require("imagekit");

module.exports = (req, res) => {
  // Allow CORS from your GitHub Pages static site
  res.setHeader("Access-Control-Allow-Origin", "https://karthikprasadm.github.io");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  const imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
  });

  const signature = imagekit.getAuthenticationParameters();
  res.status(200).json(signature);
};
