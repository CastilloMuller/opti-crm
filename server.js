import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// Log environment info
console.log('Starting server with:');
console.log('- __dirname:', __dirname);
console.log('- PORT:', port);
console.log('- NODE_ENV:', process.env.NODE_ENV);

// Check if dist directory exists
const distPath = path.join(__dirname, 'dist');
console.log('- Checking dist directory:', distPath);
if (fs.existsSync(distPath)) {
  console.log('  ✓ dist directory exists');
  const files = fs.readdirSync(distPath);
  console.log('  ✓ dist contents:', files);
} else {
  console.error('  ✗ dist directory not found!');
}

// Serve static files from the dist directory with caching disabled
app.use(express.static(distPath, {
  etag: false,
  lastModified: false,
  setHeaders: (res, path) => {
    res.setHeader('Cache-Control', 'no-store');
  }
}));

// Log all requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Handle SPA routing
app.get('*', (req, res) => {
  console.log('Serving index.html for:', req.url);
  res.sendFile(path.join(distPath, 'index.html'));
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).send('Something broke!');
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${port}`);
});
