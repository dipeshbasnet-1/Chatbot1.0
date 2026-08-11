// routes/adminRoutes.js
// Handles the admin dashboard's login check and stats.

const express = require('express');
const { getDB } = require('../db');

const router = express.Router();

// Simple middleware: checks a password sent in the request header
// against the one stored in .env. Runs before any admin route below.
function requireAdminPassword(req, res, next) {

    const providedPassword = req.headers['x-admin-password'];
    if (!providedPassword || providedPassword !== process.env.ADMIN_PASSWORD) {
        return res.status(401).json({ error: 'Incorrect password.' });
    }
    next(); // password correct — allow the request to continue
}

// POST /api/admin/login
// The frontend calls this once, when you type the password into the login form.
router.post('/login', requireAdminPassword, (req, res) => {
    res.json({ success: true });
});

// GET /api/admin/stats
// Returns dashboard numbers. Protected by the same password check.
router.get('/stats', requireAdminPassword, async (req, res) => {
    try {
        const db = getDB();
        const messages = db.collection('messages');
        const totalMessages = await messages.countDocuments();
        const distinctSessions = await messages.aggregate([
            { $group: { _id: '$sessionId' } },
        ]).toArray();
        const totalConversations = distinctSessions.length;
        // Messages sent in the last 24 hours — a simple "activity" signal

        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const messagesLast24h = await messages.countDocuments({ createdAt: { $gte: oneDayAgo } });
        res.json({ totalMessages, totalConversations, messagesLast24h });
    } catch (err) {
        console.error('Admin stats error:', err.message);
        res.status(500).json({ error: 'Could not fetch stats.' });
    }
});

module.exports = router;