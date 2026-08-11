// routes/chatRoutes.js
const express = require('express');
const Groq = require('groq-sdk');
const { getDB } = require('../db');

const router = express.Router();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM_PROMPT = 'You are a friendly, helpful chatbot assistant. Keep replies concise.';
const HISTORY_LIMIT = 10;

router.post('/message', async (req, res) => {

    const { message, sessionId } = req.body;


    if (!message || typeof message !== 'string' || !message.trim()) {

        return res.status(400).json({ error: 'Message is required.' });

    }

    if (!sessionId || typeof sessionId !== 'string') {

        return res.status(400).json({ error: 'sessionId is required.' });
    }


    try {

        const db = getDB();


        const history = await db.collection('messages')

        .find({ sessionId })

        .sort({ createdAt: -1 })

        .limit(HISTORY_LIMIT)

        .toArray();

        history.reverse();

    // If there's no history yet, this is the FIRST message of a brand-new conversation.

    const isNewConversation = history.length === 0;


    const historyMessages = history.flatMap(entry => [

        { role: 'user', content: entry.userMessage },

        { role: 'assistant', content: entry.botReply },

    ]);


    const completion = await groq.chat.completions.create({

        model: 'llama-3.3-70b-versatile',

        messages: [

            { role: 'system', content: SYSTEM_PROMPT },

            ...historyMessages,

            { role: 'user', content: message },

        ],

    });

    const reply = completion.choices[0].message.content;

    // Only on the FIRST message of a conversation, ask the AI for a short title.
    // This is what the sidebar will show instead of raw message text.
    let title = null;
    if (isNewConversation) {

        try {

            const titleCompletion = await groq.chat.completions.create({

                model: 'llama-3.3-70b-versatile',

                messages: [


                    {


                        role: 'system',

                        content: "Summarize the user's message into a short chat title, 3-6 words, no quotes, no ending punctuation.",

                    },

                    { role: 'user', content: message },

                ],

            });

            title = titleCompletion.choices[0].message.content.trim();

        } catch (titleErr) {

            console.error('Title generation failed:', titleErr.message);

            title = message.slice(0, 40); // fallback if title generation fails

        }

    }


    await db.collection('messages').insertOne({

        sessionId,

        userMessage: message,

        botReply: reply,

        ...(title && { title }), // only attach a title field on the first message of a session

        createdAt: new Date(),

    });


    res.json({ reply });



} catch (err) {

    console.error('Chat error:', err.message);

    res.status(500).json({ error: 'Something went wrong generating a reply.' });

}
});

router.get('/sessions', async (req, res) => {

    try {

        const db = getDB();


        const sessions = await db.collection('messages').aggregate([

            { $sort: { createdAt: 1 } },

            {

                $group: {

                    _id: '$sessionId',

                    firstMessage: { $first: '$userMessage' },

                    generatedTitle: { $first: '$title' },

                    lastActivity: { $max: '$createdAt' },

                },

            },

            { $sort: { lastActivity: -1 } },

        ]).toArray();


        const formatted = sessions.map(s => {

        // Prefer the AI-generated title; fall back to raw text for old conversations

        // created before this feature existed.

        const rawTitle = s.generatedTitle || s.firstMessage || 'Untitled';

        return {


            sessionId: s._id,

            title: rawTitle.length > 40 ? rawTitle.slice(0, 40) + '…' : rawTitle,

            lastActivity: s.lastActivity,

        };

    });


    res.json(formatted);

} catch (err) {

    console.error('Sessions fetch error:', err.message);

    res.status(500).json({ error: 'Could not fetch sessions.' });

}
});


router.get('/sessions/:sessionId', async (req, res) => {

    try {

        const db = getDB();

        const { sessionId } = req.params;



        const history = await db.collection('messages')

        .find({ sessionId })

        .sort({ createdAt: 1 })

        .toArray();


        const messages = history.flatMap(entry => [

            { sender: 'user', text: entry.userMessage },

            { sender: 'bot', text: entry.botReply },

        ]);


        res.json({ messages });

    } catch (err) {

        console.error('Session history fetch error:', err.message);

        res.status(500).json({ error: 'Could not fetch conversation.' });

    }

});


router.delete('/sessions/:sessionId', async (req, res) => {

    try {

        const db = getDB();


        const rawId = req.params.sessionId;

        const sessionId = rawId === 'null' ? null : rawId;


        await db.collection('messages').deleteMany({ sessionId });


        res.json({ success: true });

    } catch (err) {

        console.error('Session delete error:', err.message);

        res.status(500).json({ error: 'Could not delete conversation.' });

    }
});

module.exports = router;