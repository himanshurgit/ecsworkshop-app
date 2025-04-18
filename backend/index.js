// Node.js/Express backend
const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

// Enable CORS for frontend
app.use(cors({ origin: '*' })); // Adjust for production

// Health endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Start server
app.listen(port, () => {
    console.log(`Backend running on port ${port}`);
});