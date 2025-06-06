const express = require('express');
const path = require('path');
const app = express();
const PORT = 8000;

// Serve static files from the current directory
app.use(express.static(__dirname));

// Custom 404 handler
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, '404.html'));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
}); 