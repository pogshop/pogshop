const express = require('express');
const path = require('path');
const app = express();

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, 'dist', 'pogshop', 'browser')));

// Handle SPA routing - serve index.html for all routes that don't match files
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'pogshop', 'browser', 'index.html'));
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📁 Serving files from: ${path.join(__dirname, 'dist', 'pogshop', 'browser')}`);
  console.log(`🌐 Compatible with Chrome 103+ and other modern browsers`);
}); 