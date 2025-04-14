// Backend: Express.js Server with Multer for File Uploads
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const ImageKit = require("imagekit");

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

// Configure ImageKit
const imagekit = new ImageKit({
    publicKey: "public_QadH3cW1AFwIaqSz6iRkSiGl6PM=",
    privateKey: "private_82476YlmiHpRs9nrN6CAJIe0cfk=",
    urlEndpoint: "https://ik.imagekit.io/ijv7nmfqx/"
});

// Serve static files (e.g., HTML, CSS, JS)
app.use(express.static(__dirname));

// Explicitly serve the index.html file for the root path
app.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'index.html'));
});

// Endpoint to provide ImageKit authentication parameters
app.get("/auth", (req, res) => {
    const authenticationParameters = imagekit.getAuthenticationParameters();
    res.json(authenticationParameters);
});

// Update the /upload endpoint to upload files to ImageKit
app.post("/upload", upload.single("media"), async (req, res) => {
    console.log("File received:", req.file); // Debugging log
    if (!req.file) {
        return res.status(400).send("No file uploaded.");
    }

    try {
        // Read the uploaded file
        const fileBuffer = fs.readFileSync(req.file.path);

        // Upload to ImageKit
        const result = await imagekit.upload({
            file: fileBuffer, // File buffer
            fileName: req.file.originalname, // Original file name
            folder: "/Upload M-O-M" // Folder in ImageKit
        });

        // Delete the temporary file
        fs.unlinkSync(req.file.path);

        // Respond with the uploaded file URL
        res.json({
            success: true,
            url: result.url,
            fileId: result.fileId
        });
    } catch (error) {
        console.error("Error uploading to ImageKit:", error);
        res.status(500).send("Error uploading file.");
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
