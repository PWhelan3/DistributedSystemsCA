const express = require('express');
const app = express();

app.use(express.json());

app.get('/ping', (req, res) => {
  console.log('📡 Received GET /ping');
  res.json({ message: 'pong' });
});

app.listen(3001, () => {
  console.log('✅ Minimal server running on http://localhost:3001');
});
