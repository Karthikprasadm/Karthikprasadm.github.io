// Backend: Express.js Server with Multer for File Uploads
require('dotenv').config();
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const ImageKit = require('imagekit');

// Configure ImageKit
const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
});

const app = express();
const port = 3000;

// Ensure the "uploads" directory exists
const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Function to sanitize filenames
const sanitizeFilename = (filename) => {
    return filename.replace(/[^a-zA-Z0-9._-]/g, "");
};

// Set up Multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir); // Save files in the "uploads" folder
    },
    filename: (req, file, cb) => {
        // Sanitize the filename and add a timestamp to avoid conflicts
        const sanitizedFilename = sanitizeFilename(file.originalname);
        cb(null, Date.now() + "-" + sanitizedFilename);
    },
});

// Allow only images and videos to be uploaded
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/") || file.mimetype.startsWith("video/")) {
        cb(null, true); // Accept the file
    } else {
        cb(new Error("Only images and videos are allowed!"), false); // Reject the file
    }
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 150 * 1024 * 1024 } }); // 150MB limit

// Serve static files (e.g., HTML, CSS, JS) from the project root
app.use(express.static(__dirname));

// Serve index.html on root request
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// ImageKit upload handler for /upload endpoint
app.post('/upload', upload.array('media'), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).send('No files uploaded.');
    }
    const uploadResults = [];
    for (const file of req.files) {
      try {
        // Log file info
        console.log('Uploading file:', file.originalname);
        // Upload to ImageKit
        const result = await imagekit.upload({
          file: fs.readFileSync(file.path),
          fileName: file.originalname,
          folder: '/Upload_M-O-M' // Try removing this if files don't show up
        });
        console.log('ImageKit upload result:', result);
        if (!result.url || !result.fileId) {
          throw new Error('ImageKit did not return a valid URL or fileId');
        }
        uploadResults.push({
          originalname: file.originalname,
          url: result.url,
          fileId: result.fileId,
          type: result.type
        });
      } catch (ikErr) {
        console.error('Failed to upload to ImageKit:', ikErr);
        // Optionally, you can return here to stop on first failure
        return res.status(500).send(`Failed to upload file ${file.originalname} to ImageKit: ${ikErr.message}`);
      } finally {
        // Always delete the local file
        fs.unlinkSync(file.path);
      }
    }
    res.status(200).json({ message: 'Files uploaded to ImageKit!', files: uploadResults });
  } catch (err) {
    console.error('ImageKit upload error:', err);
    res.status(500).send(`Failed to upload files to ImageKit: ${err.message}`);
  }
});

// Error handling for file uploads
app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        // Handle Multer errors (e.g., file size limit exceeded)
        return res.status(400).send(`Multer error: ${err.message}`);
    } else if (err) {
        // Handle other errors (e.g., invalid file type)
        return res.status(400).send(`Error: ${err.message}`);
    }
    next();
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
