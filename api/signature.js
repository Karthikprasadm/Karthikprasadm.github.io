const ImageKit = require("imagekit");

const allowedOrigins = [
  "https://karthikprasadm.github.io",
  "https://karthikprasadm-github-io.vercel.app"
];

module.exports = (req, res) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Vary", "Origin");
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