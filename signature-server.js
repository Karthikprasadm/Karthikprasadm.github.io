const express = require('express');
const ImageKit = require('imagekit');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
});

const { v4: uuidv4 } = require('uuid');

app.get('/signature', (req, res) => {
  const signature = imagekit.getAuthenticationParameters();
  // Generate a unique token for every request
  signature.token = uuidv4();
  res.json(signature);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Signature server running on port ${PORT}`));
