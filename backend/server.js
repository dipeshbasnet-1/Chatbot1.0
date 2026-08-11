require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { connectDB } = require('./db');
const chatRoutes = require('./routes/chatRoutes');   // ← new

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Chatbot backend is running.');
});

app.use('/api/chat', chatRoutes);   // ← new — mounts all chat routes under /api/chat
app.use('/api/admin', require('./routes/adminRoutes'));

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
});