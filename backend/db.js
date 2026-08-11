// db.js — handles the MongoDB connection.
// We create ONE connection when the server starts, and reuse it everywhere
// instead of opening a new connection for every request (which would be slow).

const { MongoClient, ServerApiVersion } = require('mongodb');

const uri = process.env.MONGO_URI; 

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});

let db; // will hold our connected database once connectDB() runs

async function connectDB() {
    try {
        await client.connect();
        db = client.db('chatbot'); // matches the database name in our MONGO_URI
        console.log('MongoDB connected successfully.');
    } catch (err) {
        console.error('MongoDB connection failed:', err.message);
        process.exit(1); // stop the server if we can't reach the database
    }
}

function getDB() {
    if (!db) {
        throw new Error('Database not connected yet. Call connectDB() first.');
    }
    return db;
}

module.exports = { connectDB, getDB };